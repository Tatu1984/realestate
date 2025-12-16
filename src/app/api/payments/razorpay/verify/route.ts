import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { verifyPaymentSignature, getPayment } from '@/lib/razorpay'
import { checkRateLimit } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'
import prisma from '@/lib/prisma'
import { sendEmail } from '@/lib/email'
import { z } from 'zod'

const verifySchema = z.object({
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
  type: z.enum(['membership', 'listing_upgrade', 'featured', 'premium']),
  planId: z.string().cuid().optional(),
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
    const validation = verifySchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      )
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      type,
      planId,
      propertyId,
    } = validation.data

    // Verify signature
    const isValid = verifyPaymentSignature({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
    })

    if (!isValid) {
      logger.warn('Razorpay payment verification failed', {
        orderId: razorpay_order_id,
        userId: session.user.id,
      })
      return NextResponse.json(
        { error: 'Payment verification failed' },
        { status: 400 }
      )
    }

    // Get payment details
    const payment = await getPayment(razorpay_payment_id) as {
      amount: number
      currency: string
      method: string
    } | null

    const amount = payment ? payment.amount / 100 : 0 // Convert from paise

    // Create transaction record
    await prisma.transaction.create({
      data: {
        userId: session.user.id,
        type: type === 'membership' ? 'MEMBERSHIP' : 'LISTING_UPGRADE',
        amount,
        currency: 'INR',
        status: 'COMPLETED',
        paymentMethod: 'razorpay',
        transactionId: razorpay_payment_id,
        description: `Razorpay payment - Order: ${razorpay_order_id}`,
      },
    })

    // Handle membership activation
    if (type === 'membership' && planId) {
      const plan = await prisma.membershipPlan.findUnique({
        where: { id: planId },
      })

      if (plan) {
        const endDate = new Date()
        endDate.setDate(endDate.getDate() + plan.duration)

        await prisma.membership.upsert({
          where: { userId: session.user.id },
          update: {
            planId,
            startDate: new Date(),
            endDate,
            status: 'ACTIVE',
          },
          create: {
            userId: session.user.id,
            planId,
            startDate: new Date(),
            endDate,
            status: 'ACTIVE',
          },
        })

        // Send confirmation email
        const user = await prisma.user.findUnique({
          where: { id: session.user.id },
          select: { email: true, name: true },
        })

        if (user) {
          await sendEmail({
            to: user.email,
            subject: `Your ${plan.name} Membership is Active - PropEstate`,
            html: `
              <h2>Membership Activated!</h2>
              <p>Hi ${user.name},</p>
              <p>Your ${plan.name} membership has been successfully activated.</p>
              <p>Transaction ID: ${razorpay_payment_id}</p>
              <p>Amount Paid: ₹${amount}</p>
              <p>Valid until: ${endDate.toLocaleDateString()}</p>
              <p>You now have access to:</p>
              <ul>
                <li>${plan.featuredListings} Featured Listings</li>
                <li>${plan.premiumListings} Premium Listings</li>
                <li>${plan.basicListings} Basic Listings</li>
              </ul>
            `,
          })
        }

        logger.info('Membership activated via Razorpay', {
          userId: session.user.id,
          planId,
          paymentId: razorpay_payment_id,
        })
      }
    }

    // Handle listing upgrade
    if ((type === 'featured' || type === 'premium') && propertyId) {
      await prisma.property.update({
        where: { id: propertyId },
        data: {
          listingTier: type.toUpperCase(),
        },
      })

      logger.info('Property upgraded via Razorpay', {
        propertyId,
        tier: type,
        paymentId: razorpay_payment_id,
      })
    }

    logger.info('Razorpay payment verified and processed', {
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      userId: session.user.id,
      type,
    })

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
      transactionId: razorpay_payment_id,
    })
  } catch (error) {
    logger.error('Razorpay verification error', error)
    return NextResponse.json(
      { error: 'Payment verification failed' },
      { status: 500 }
    )
  }
}
