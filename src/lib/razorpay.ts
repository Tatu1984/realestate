import Razorpay from 'razorpay'
import crypto from 'crypto'
import { logger } from './logger'

// Initialize Razorpay with sandbox/test keys
const razorpayKeyId = process.env.RAZORPAY_KEY_ID
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET

if ((!razorpayKeyId || !razorpayKeySecret) && process.env.NODE_ENV === 'production') {
  logger.warn('Razorpay credentials not configured')
}

export const razorpay = razorpayKeyId && razorpayKeySecret
  ? new Razorpay({
      key_id: razorpayKeyId,
      key_secret: razorpayKeySecret,
    })
  : null

// Plan amounts in paise (1 INR = 100 paise)
export const RAZORPAY_PLAN_AMOUNTS = {
  BASIC: 99900, // ₹999
  STANDARD: 199900, // ₹1999
  PREMIUM: 499900, // ₹4999
} as const

interface CreateOrderOptions {
  amount: number // in paise
  currency?: string
  receipt: string
  notes?: Record<string, string>
}

interface RazorpayOrder {
  id: string
  entity: string
  amount: number
  amount_paid: number
  amount_due: number
  currency: string
  receipt: string
  status: string
  notes: Record<string, string>
  created_at: number
}

// Create a Razorpay order
export async function createOrder({
  amount,
  currency = 'INR',
  receipt,
  notes = {},
}: CreateOrderOptions): Promise<RazorpayOrder | null> {
  if (!razorpay) {
    logger.warn('Razorpay not configured, cannot create order')
    return null
  }

  try {
    const order = await razorpay.orders.create({
      amount,
      currency,
      receipt,
      notes,
    }) as RazorpayOrder

    logger.info('Razorpay order created', {
      orderId: order.id,
      amount,
      receipt,
    })

    return order
  } catch (error) {
    logger.error('Failed to create Razorpay order', error)
    return null
  }
}

// Verify payment signature
export function verifyPaymentSignature({
  orderId,
  paymentId,
  signature,
}: {
  orderId: string
  paymentId: string
  signature: string
}): boolean {
  if (!razorpayKeySecret) {
    logger.warn('Razorpay key secret not configured')
    return false
  }

  try {
    const body = orderId + '|' + paymentId
    const expectedSignature = crypto
      .createHmac('sha256', razorpayKeySecret)
      .update(body)
      .digest('hex')

    const isValid = expectedSignature === signature

    if (isValid) {
      logger.info('Razorpay payment signature verified', { orderId, paymentId })
    } else {
      logger.warn('Razorpay payment signature mismatch', { orderId, paymentId })
    }

    return isValid
  } catch (error) {
    logger.error('Failed to verify payment signature', error)
    return false
  }
}

// Fetch payment details
export async function getPayment(paymentId: string): Promise<unknown | null> {
  if (!razorpay) return null

  try {
    const payment = await razorpay.payments.fetch(paymentId)
    return payment
  } catch (error) {
    logger.error('Failed to fetch payment', error)
    return null
  }
}

// Fetch order details
export async function getOrder(orderId: string): Promise<unknown | null> {
  if (!razorpay) return null

  try {
    const order = await razorpay.orders.fetch(orderId)
    return order
  } catch (error) {
    logger.error('Failed to fetch order', error)
    return null
  }
}

// Create a subscription
export async function createSubscription({
  planId,
  customerId,
  totalCount,
  notes = {},
}: {
  planId: string
  customerId?: string
  totalCount?: number
  notes?: Record<string, string>
}): Promise<unknown | null> {
  if (!razorpay) return null

  try {
    const subscriptionOptions = {
      plan_id: planId,
      total_count: totalCount || 12, // Default to 12 billing cycles
      customer_id: customerId,
      notes,
    }

    const subscription = await razorpay.subscriptions.create(subscriptionOptions as Parameters<typeof razorpay.subscriptions.create>[0])

    logger.info('Razorpay subscription created', { planId })

    return subscription
  } catch (error) {
    logger.error('Failed to create subscription', error)
    return null
  }
}

// Cancel a subscription
export async function cancelSubscription(subscriptionId: string): Promise<boolean> {
  if (!razorpay) return false

  try {
    await razorpay.subscriptions.cancel(subscriptionId)
    logger.info('Razorpay subscription cancelled', { subscriptionId })
    return true
  } catch (error) {
    logger.error('Failed to cancel subscription', error)
    return false
  }
}

// Initiate a refund
export async function initiateRefund({
  paymentId,
  amount,
  notes = {},
}: {
  paymentId: string
  amount?: number // in paise, if not provided full refund
  notes?: Record<string, string>
}): Promise<unknown | null> {
  if (!razorpay) return null

  try {
    const refundOptions: Record<string, unknown> = { notes }
    if (amount) {
      refundOptions.amount = amount
    }

    const refund = await razorpay.payments.refund(paymentId, refundOptions)

    logger.info('Razorpay refund initiated', { paymentId, amount })

    return refund
  } catch (error) {
    logger.error('Failed to initiate refund', error)
    return null
  }
}

// Verify webhook signature
export function verifyWebhookSignature(
  body: string,
  signature: string
): boolean {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET
  if (!webhookSecret) {
    logger.warn('Razorpay webhook secret not configured')
    return false
  }

  try {
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(body)
      .digest('hex')

    return expectedSignature === signature
  } catch (error) {
    logger.error('Failed to verify webhook signature', error)
    return false
  }
}

// Get public key for client-side
export function getPublicKey(): string | null {
  return razorpayKeyId || null
}
