import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createCheckoutSession, createPaymentSession } from '@/lib/stripe'
import { checkRateLimit } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'
import prisma from '@/lib/prisma'
import { z } from 'zod'

const checkoutSchema = z.object({
  planId: z.string().cuid(),
  type: z.enum(['subscription', 'one-time']).default('subscription'),
})

const paymentSchema = z.object({
  amount: z.number().positive(),
  description: z.string().min(1).max(200),
  propertyId: z.string().cuid().optional(),
  type: z.enum(['listing_upgrade', 'featured', 'premium']),
})

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResponse = checkRateLimit(request, 'api')
    if (rateLimitResponse) {
      return rateLimitResponse
    }

    // Require authentication
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'

    // Handle subscription checkout
    if (body.planId) {
      const validation = checkoutSchema.safeParse(body)
      if (!validation.success) {
        return NextResponse.json(
          { error: validation.error.issues[0].message },
          { status: 400 }
        )
      }

      const { planId } = validation.data

      // Get plan details
      const plan = await prisma.membershipPlan.findUnique({
        where: { id: planId },
      })

      if (!plan || !plan.isActive) {
        return NextResponse.json(
          { error: 'Plan not found or inactive' },
          { status: 404 }
        )
      }

      // Create Stripe checkout session
      const result = await createCheckoutSession({
        userId: session.user.id,
        userEmail: session.user.email || '',
        planId: plan.id,
        planName: plan.name,
        priceId: `price_${plan.id}`, // Map to Stripe price ID
        successUrl: `${baseUrl}/dashboard/membership/success`,
        cancelUrl: `${baseUrl}/dashboard/membership`,
      })

      if (!result) {
        return NextResponse.json(
          { error: 'Failed to create checkout session' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        sessionId: result.sessionId,
        url: result.url,
      })
    }

    // Handle one-time payment
    const validation = paymentSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      )
    }

    const { amount, description, propertyId, type } = validation.data

    const result = await createPaymentSession({
      userId: session.user.id,
      userEmail: session.user.email || '',
      amount: Math.round(amount * 100), // Convert to cents
      description,
      metadata: {
        type,
        propertyId: propertyId || '',
      },
      successUrl: `${baseUrl}/dashboard/payments/success`,
      cancelUrl: `${baseUrl}/dashboard/payments`,
    })

    if (!result) {
      return NextResponse.json(
        { error: 'Failed to create payment session' },
        { status: 500 }
      )
    }

    logger.info('Stripe payment session created', {
      userId: session.user.id,
      type,
      amount,
    })

    return NextResponse.json({
      sessionId: result.sessionId,
      url: result.url,
    })
  } catch (error) {
    logger.error('Stripe checkout error', error)
    return NextResponse.json(
      { error: 'Failed to process payment' },
      { status: 500 }
    )
  }
}
