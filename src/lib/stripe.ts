import Stripe from 'stripe'
import { logger } from './logger'

// Initialize Stripe with sandbox/test key
const stripeSecretKey = process.env.STRIPE_SECRET_KEY

if (!stripeSecretKey && process.env.NODE_ENV === 'production') {
  logger.warn('Stripe secret key not configured')
}

export const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, {
      apiVersion: '2025-11-17.clover',
      typescript: true,
    })
  : null

// Price IDs for membership plans (created in Stripe Dashboard)
export const STRIPE_PRICE_IDS = {
  BASIC: process.env.STRIPE_PRICE_BASIC || 'price_basic_placeholder',
  STANDARD: process.env.STRIPE_PRICE_STANDARD || 'price_standard_placeholder',
  PREMIUM: process.env.STRIPE_PRICE_PREMIUM || 'price_premium_placeholder',
} as const

// Create a checkout session for membership purchase
export async function createCheckoutSession({
  userId,
  userEmail,
  planId,
  planName,
  priceId,
  successUrl,
  cancelUrl,
}: {
  userId: string
  userEmail: string
  planId: string
  planName: string
  priceId: string
  successUrl: string
  cancelUrl: string
}): Promise<{ sessionId: string; url: string } | null> {
  if (!stripe) {
    logger.warn('Stripe not configured, cannot create checkout session')
    return null
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: userEmail,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: {
        userId,
        planId,
        planName,
      },
      success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
    })

    logger.info('Stripe checkout session created', {
      sessionId: session.id,
      userId,
      planId,
    })

    return {
      sessionId: session.id,
      url: session.url || '',
    }
  } catch (error) {
    logger.error('Failed to create Stripe checkout session', error)
    return null
  }
}

// Create a one-time payment session for listing upgrades
export async function createPaymentSession({
  userId,
  userEmail,
  amount,
  currency = 'usd',
  description,
  metadata,
  successUrl,
  cancelUrl,
}: {
  userId: string
  userEmail: string
  amount: number // in cents
  currency?: string
  description: string
  metadata?: Record<string, string>
  successUrl: string
  cancelUrl: string
}): Promise<{ sessionId: string; url: string } | null> {
  if (!stripe) {
    logger.warn('Stripe not configured, cannot create payment session')
    return null
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: userEmail,
      line_items: [
        {
          price_data: {
            currency,
            product_data: {
              name: description,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId,
        ...metadata,
      },
      success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
    })

    logger.info('Stripe payment session created', {
      sessionId: session.id,
      userId,
      amount,
    })

    return {
      sessionId: session.id,
      url: session.url || '',
    }
  } catch (error) {
    logger.error('Failed to create Stripe payment session', error)
    return null
  }
}

// Retrieve a checkout session
export async function getCheckoutSession(sessionId: string): Promise<Stripe.Checkout.Session | null> {
  if (!stripe) return null

  try {
    return await stripe.checkout.sessions.retrieve(sessionId)
  } catch (error) {
    logger.error('Failed to retrieve checkout session', error)
    return null
  }
}

// Cancel a subscription
export async function cancelSubscription(subscriptionId: string): Promise<boolean> {
  if (!stripe) return false

  try {
    await stripe.subscriptions.cancel(subscriptionId)
    logger.info('Stripe subscription cancelled', { subscriptionId })
    return true
  } catch (error) {
    logger.error('Failed to cancel subscription', error)
    return false
  }
}

// Create a customer portal session for subscription management
export async function createPortalSession({
  customerId,
  returnUrl,
}: {
  customerId: string
  returnUrl: string
}): Promise<{ url: string } | null> {
  if (!stripe) return null

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    })

    return { url: session.url }
  } catch (error) {
    logger.error('Failed to create portal session', error)
    return null
  }
}

// Verify webhook signature
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string
): Stripe.Event | null {
  if (!stripe) return null

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    logger.warn('Stripe webhook secret not configured')
    return null
  }

  try {
    return stripe.webhooks.constructEvent(payload, signature, webhookSecret)
  } catch (error) {
    logger.error('Webhook signature verification failed', error)
    return null
  }
}

// Get subscription details
export async function getSubscription(subscriptionId: string): Promise<Stripe.Subscription | null> {
  if (!stripe) return null

  try {
    return await stripe.subscriptions.retrieve(subscriptionId)
  } catch (error) {
    logger.error('Failed to retrieve subscription', error)
    return null
  }
}

// List all prices (for displaying plans)
export async function listPrices(): Promise<Stripe.Price[]> {
  if (!stripe) return []

  try {
    const prices = await stripe.prices.list({
      active: true,
      expand: ['data.product'],
    })
    return prices.data
  } catch (error) {
    logger.error('Failed to list prices', error)
    return []
  }
}
