import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createOrder, getPublicKey, RAZORPAY_PLAN_AMOUNTS } from '@/lib/razorpay'
import { checkRateLimit } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'
import prisma from '@/lib/prisma'
import { z } from 'zod'

const orderSchema = z.object({
  planId: z.string().cuid().optional(),
  amount: z.number().positive().optional(),
  type: z.enum(['membership', 'listing_upgrade', 'featured', 'premium']),
  propertyId: z.string().cuid().optional(),
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
    const validation = orderSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      )
    }

    const { planId, amount, type, propertyId } = validation.data

    let orderAmount: number
    let description: string

    // Calculate amount based on type
    if (type === 'membership' && planId) {
      const plan = await prisma.membershipPlan.findUnique({
        where: { id: planId },
      })

      if (!plan || !plan.isActive) {
        return NextResponse.json(
          { error: 'Plan not found or inactive' },
          { status: 404 }
        )
      }

      orderAmount = Math.round(plan.price * 100) // Convert to paise
      description = `${plan.name} Membership`
    } else if (amount) {
      orderAmount = Math.round(amount * 100) // Convert to paise
      description = type === 'featured' ? 'Featured Listing Upgrade' : 'Premium Listing Upgrade'
    } else {
      return NextResponse.json(
        { error: 'Amount or planId is required' },
        { status: 400 }
      )
    }

    // Generate unique receipt ID
    const receipt = `rcpt_${session.user.id}_${Date.now()}`

    // Create Razorpay order
    const order = await createOrder({
      amount: orderAmount,
      currency: 'INR',
      receipt,
      notes: {
        userId: session.user.id,
        type,
        planId: planId || '',
        propertyId: propertyId || '',
        description,
      },
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Failed to create order' },
        { status: 500 }
      )
    }

    // Get user details for prefill
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, email: true, phone: true },
    })

    logger.info('Razorpay order created', {
      orderId: order.id,
      userId: session.user.id,
      amount: orderAmount,
      type,
    })

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: getPublicKey(),
      prefill: {
        name: user?.name || '',
        email: user?.email || session.user.email || '',
        contact: user?.phone || '',
      },
      notes: {
        userId: session.user.id,
        type,
        planId: planId || '',
        propertyId: propertyId || '',
      },
    })
  } catch (error) {
    logger.error('Razorpay order creation error', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}
