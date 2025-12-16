import { NextRequest, NextResponse } from 'next/server'
import { verifyWebhookSignature } from '@/lib/stripe'
import { logger } from '@/lib/logger'
import prisma from '@/lib/prisma'
import { sendEmail, emailTemplates } from '@/lib/email'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      logger.warn('Stripe webhook missing signature')
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    const event = verifyWebhookSignature(body, signature)

    if (!event) {
      logger.warn('Stripe webhook signature verification failed')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    logger.info('Stripe webhook received', { type: event.type, id: event.id })

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutCompleted(session)
        break
      }

      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionCreated(subscription)
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionUpdated(subscription)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionDeleted(subscription)
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        await handleInvoicePaymentSucceeded(invoice)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        await handleInvoicePaymentFailed(invoice)
        break
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        await handlePaymentSucceeded(paymentIntent)
        break
      }

      default:
        logger.debug('Unhandled Stripe webhook event', { type: event.type })
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    logger.error('Stripe webhook error', error)
    return NextResponse.json({ error: 'Webhook error' }, { status: 500 })
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId
  const planId = session.metadata?.planId

  if (!userId) {
    logger.warn('Checkout completed without userId', { sessionId: session.id })
    return
  }

  logger.info('Checkout completed', { userId, planId, sessionId: session.id })

  // Create transaction record
  await prisma.transaction.create({
    data: {
      userId,
      type: planId ? 'MEMBERSHIP' : 'LISTING_UPGRADE',
      amount: (session.amount_total || 0) / 100,
      currency: session.currency?.toUpperCase() || 'USD',
      status: 'COMPLETED',
      paymentMethod: 'stripe',
      transactionId: session.payment_intent as string,
      description: `Stripe payment - ${session.id}`,
    },
  })

  // If it's a membership purchase, activate it
  if (planId) {
    const plan = await prisma.membershipPlan.findUnique({
      where: { id: planId },
    })

    if (plan) {
      const endDate = new Date()
      endDate.setDate(endDate.getDate() + plan.duration)

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

      // Send confirmation email
      const user = await prisma.user.findUnique({
        where: { id: userId },
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
            <p>You now have access to:</p>
            <ul>
              <li>${plan.featuredListings} Featured Listings</li>
              <li>${plan.premiumListings} Premium Listings</li>
              <li>${plan.basicListings} Basic Listings</li>
            </ul>
            <p>Valid until: ${endDate.toLocaleDateString()}</p>
          `,
        })
      }
    }
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  logger.info('Subscription created', {
    subscriptionId: subscription.id,
    customerId: subscription.customer,
  })
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  logger.info('Subscription updated', {
    subscriptionId: subscription.id,
    status: subscription.status,
  })

  // Update membership status based on subscription status
  const customerId = subscription.customer as string

  // Find user by Stripe customer ID (you'd need to store this mapping)
  // For now, log the update
  if (subscription.status === 'active') {
    logger.info('Subscription is active', { subscriptionId: subscription.id })
  } else if (subscription.status === 'past_due') {
    logger.warn('Subscription is past due', { subscriptionId: subscription.id })
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  logger.info('Subscription deleted', {
    subscriptionId: subscription.id,
  })

  // Mark membership as cancelled
  // You'd need to find the user by customer ID
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  logger.info('Invoice payment succeeded', {
    invoiceId: invoice.id,
    amount: invoice.amount_paid,
  })
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  logger.warn('Invoice payment failed', {
    invoiceId: invoice.id,
    customerId: invoice.customer,
  })

  // Send payment failed notification
  // You'd need to find the user by customer ID
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const userId = paymentIntent.metadata?.userId
  const type = paymentIntent.metadata?.type
  const propertyId = paymentIntent.metadata?.propertyId

  logger.info('Payment succeeded', {
    paymentIntentId: paymentIntent.id,
    userId,
    type,
    amount: paymentIntent.amount,
  })

  if (!userId) return

  // Handle listing upgrades
  if (type && propertyId) {
    if (type === 'featured' || type === 'premium') {
      await prisma.property.update({
        where: { id: propertyId },
        data: {
          listingTier: type.toUpperCase(),
        },
      })

      logger.info('Property upgraded', { propertyId, tier: type })
    }
  }
}
