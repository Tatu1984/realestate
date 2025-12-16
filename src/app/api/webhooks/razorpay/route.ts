import { NextRequest, NextResponse } from 'next/server'
import { verifyWebhookSignature } from '@/lib/razorpay'
import { logger } from '@/lib/logger'
import prisma from '@/lib/prisma'
import { sendEmail } from '@/lib/email'

interface RazorpayWebhookEvent {
  event: string
  payload: {
    payment?: {
      entity: {
        id: string
        amount: number
        currency: string
        status: string
        order_id: string
        method: string
        notes: Record<string, string>
      }
    }
    subscription?: {
      entity: {
        id: string
        plan_id: string
        status: string
        current_start: number
        current_end: number
        notes: Record<string, string>
      }
    }
    order?: {
      entity: {
        id: string
        amount: number
        status: string
        notes: Record<string, string>
      }
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-razorpay-signature')

    if (!signature) {
      logger.warn('Razorpay webhook missing signature')
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    const isValid = verifyWebhookSignature(body, signature)

    if (!isValid) {
      logger.warn('Razorpay webhook signature verification failed')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const event: RazorpayWebhookEvent = JSON.parse(body)

    logger.info('Razorpay webhook received', { event: event.event })

    switch (event.event) {
      case 'payment.captured':
        if (event.payload.payment) {
          await handlePaymentCaptured(event.payload.payment)
        }
        break

      case 'payment.failed':
        if (event.payload.payment) {
          await handlePaymentFailed(event.payload.payment)
        }
        break

      case 'subscription.activated':
        if (event.payload.subscription) {
          await handleSubscriptionActivated(event.payload.subscription)
        }
        break

      case 'subscription.charged':
        if (event.payload.subscription) {
          await handleSubscriptionCharged(event.payload.subscription)
        }
        break

      case 'subscription.cancelled':
        if (event.payload.subscription) {
          await handleSubscriptionCancelled(event.payload.subscription)
        }
        break

      case 'subscription.halted':
        if (event.payload.subscription) {
          await handleSubscriptionHalted(event.payload.subscription)
        }
        break

      case 'order.paid':
        if (event.payload.order) {
          await handleOrderPaid(event.payload.order)
        }
        break

      default:
        logger.debug('Unhandled Razorpay webhook event', { event: event.event })
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    logger.error('Razorpay webhook error', error)
    return NextResponse.json({ error: 'Webhook error' }, { status: 500 })
  }
}

async function handlePaymentCaptured(payment: RazorpayWebhookEvent['payload']['payment']) {
  if (!payment) return

  const entity = payment.entity
  const userId = entity.notes?.userId

  logger.info('Razorpay payment captured', {
    paymentId: entity.id,
    amount: entity.amount / 100,
    userId,
  })

  if (userId) {
    // Update transaction status if exists
    await prisma.transaction.updateMany({
      where: {
        transactionId: entity.id,
        userId,
      },
      data: {
        status: 'COMPLETED',
      },
    })
  }
}

async function handlePaymentFailed(payment: RazorpayWebhookEvent['payload']['payment']) {
  if (!payment) return

  const entity = payment.entity
  const userId = entity.notes?.userId

  logger.warn('Razorpay payment failed', {
    paymentId: entity.id,
    orderId: entity.order_id,
    userId,
  })

  if (userId) {
    // Create failed transaction record
    await prisma.transaction.create({
      data: {
        userId,
        type: entity.notes?.type as 'MEMBERSHIP' | 'LISTING_UPGRADE' || 'MEMBERSHIP',
        amount: entity.amount / 100,
        currency: entity.currency.toUpperCase(),
        status: 'FAILED',
        paymentMethod: 'razorpay',
        transactionId: entity.id,
        description: `Failed payment - Order: ${entity.order_id}`,
      },
    })

    // Notify user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true },
    })

    if (user) {
      await sendEmail({
        to: user.email,
        subject: 'Payment Failed - PropEstate',
        html: `
          <h2>Payment Failed</h2>
          <p>Hi ${user.name},</p>
          <p>Your payment of ₹${entity.amount / 100} could not be processed.</p>
          <p>Please try again or contact support if the issue persists.</p>
        `,
      })
    }
  }
}

async function handleSubscriptionActivated(subscription: RazorpayWebhookEvent['payload']['subscription']) {
  if (!subscription) return

  const entity = subscription.entity
  const userId = entity.notes?.userId
  const planId = entity.notes?.planId

  logger.info('Razorpay subscription activated', {
    subscriptionId: entity.id,
    userId,
    planId,
  })

  if (userId && planId) {
    const endDate = new Date(entity.current_end * 1000)

    await prisma.membership.upsert({
      where: { userId },
      update: {
        planId,
        startDate: new Date(),
        endDate,
        status: 'ACTIVE',
      },
      create: {
        userId,
        planId,
        startDate: new Date(),
        endDate,
        status: 'ACTIVE',
      },
    })
  }
}

async function handleSubscriptionCharged(subscription: RazorpayWebhookEvent['payload']['subscription']) {
  if (!subscription) return

  const entity = subscription.entity
  const userId = entity.notes?.userId

  logger.info('Razorpay subscription charged', {
    subscriptionId: entity.id,
    userId,
  })

  // Extend membership
  if (userId) {
    const endDate = new Date(entity.current_end * 1000)

    await prisma.membership.update({
      where: { userId },
      data: {
        endDate,
        status: 'ACTIVE',
      },
    })
  }
}

async function handleSubscriptionCancelled(subscription: RazorpayWebhookEvent['payload']['subscription']) {
  if (!subscription) return

  const entity = subscription.entity
  const userId = entity.notes?.userId

  logger.info('Razorpay subscription cancelled', {
    subscriptionId: entity.id,
    userId,
  })

  if (userId) {
    await prisma.membership.update({
      where: { userId },
      data: {
        status: 'CANCELLED',
      },
    })

    // Notify user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true },
    })

    if (user) {
      await sendEmail({
        to: user.email,
        subject: 'Subscription Cancelled - PropEstate',
        html: `
          <h2>Subscription Cancelled</h2>
          <p>Hi ${user.name},</p>
          <p>Your subscription has been cancelled. You will continue to have access until the end of your current billing period.</p>
          <p>We hope to see you again soon!</p>
        `,
      })
    }
  }
}

async function handleSubscriptionHalted(subscription: RazorpayWebhookEvent['payload']['subscription']) {
  if (!subscription) return

  const entity = subscription.entity
  const userId = entity.notes?.userId

  logger.warn('Razorpay subscription halted', {
    subscriptionId: entity.id,
    userId,
  })

  if (userId) {
    await prisma.membership.update({
      where: { userId },
      data: {
        status: 'EXPIRED',
      },
    })

    // Notify user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true },
    })

    if (user) {
      await sendEmail({
        to: user.email,
        subject: 'Subscription Payment Issue - PropEstate',
        html: `
          <h2>Subscription Payment Issue</h2>
          <p>Hi ${user.name},</p>
          <p>We were unable to process your subscription payment and your subscription has been halted.</p>
          <p>Please update your payment method to continue your membership.</p>
        `,
      })
    }
  }
}

async function handleOrderPaid(order: RazorpayWebhookEvent['payload']['order']) {
  if (!order) return

  const entity = order.entity
  logger.info('Razorpay order paid', {
    orderId: entity.id,
    amount: entity.amount / 100,
  })
}
