'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

interface StripeButtonProps {
  planId?: string
  amount?: number
  type: 'subscription' | 'one-time'
  description?: string
  propertyId?: string
  buttonText?: string
  onSuccess?: () => void
  onError?: (error: string) => void
  className?: string
  disabled?: boolean
}

export function StripeButton({
  planId,
  amount,
  type = 'subscription',
  description,
  propertyId,
  buttonText = 'Pay with Stripe',
  onSuccess,
  onError,
  className,
  disabled,
}: StripeButtonProps) {
  const [loading, setLoading] = useState(false)

  const handlePayment = async () => {
    setLoading(true)

    try {
      // Create checkout session
      const response = await fetch('/api/payments/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId,
          amount,
          type,
          description,
          propertyId,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create checkout session')
      }

      const { url } = await response.json()

      if (!url) {
        throw new Error('No checkout URL returned')
      }

      // Redirect to Stripe Checkout
      window.location.href = url
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'Payment failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={handlePayment}
      disabled={disabled || loading}
      className={className}
      variant="outline"
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        buttonText
      )}
    </Button>
  )
}
