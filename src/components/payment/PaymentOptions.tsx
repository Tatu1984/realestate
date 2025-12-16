'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RazorpayButton } from './RazorpayButton'
import { StripeButton } from './StripeButton'
import { CheckCircle, CreditCard, IndianRupee } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface PaymentOptionsProps {
  planId?: string
  planName?: string
  amount: number
  currency?: 'INR' | 'USD'
  type: 'membership' | 'listing_upgrade' | 'featured' | 'premium'
  propertyId?: string
  onSuccess?: () => void
}

export function PaymentOptions({
  planId,
  planName,
  amount,
  currency = 'INR',
  type,
  propertyId,
  onSuccess,
}: PaymentOptionsProps) {
  const [paymentComplete, setPaymentComplete] = useState(false)
  const { toast } = useToast()

  const handleSuccess = (data?: { transactionId: string }) => {
    setPaymentComplete(true)
    toast({
      title: 'Payment Successful!',
      description: data?.transactionId
        ? `Transaction ID: ${data.transactionId}`
        : 'Your payment has been processed.',
      type: 'success',
    })
    onSuccess?.()
  }

  const handleError = (error: string) => {
    toast({
      title: 'Payment Failed',
      description: error,
      type: 'error',
    })
  }

  if (paymentComplete) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-green-600" />
            <h3 className="mt-4 text-lg font-semibold text-green-900">
              Payment Successful!
            </h3>
            <p className="mt-2 text-green-700">
              Thank you for your purchase. Your account has been updated.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Choose Payment Method</CardTitle>
        <CardDescription>
          {planName ? `Purchase ${planName}` : 'Complete your payment'} -{' '}
          {currency === 'INR' ? '₹' : '$'}
          {amount.toLocaleString()}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Razorpay - Primary for INR */}
        {currency === 'INR' && (
          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-blue-100 p-2">
                  <IndianRupee className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium">Razorpay</h4>
                  <p className="text-sm text-muted-foreground">
                    UPI, Cards, Net Banking, Wallets
                  </p>
                </div>
              </div>
              <RazorpayButton
                planId={planId}
                amount={amount}
                type={type}
                propertyId={propertyId}
                buttonText="Pay Now"
                onSuccess={handleSuccess}
                onError={handleError}
              />
            </div>
          </div>
        )}

        {/* Stripe - Available for all currencies */}
        <div className="rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-purple-100 p-2">
                <CreditCard className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h4 className="font-medium">Stripe</h4>
                <p className="text-sm text-muted-foreground">
                  Credit/Debit Cards, Apple Pay, Google Pay
                </p>
              </div>
            </div>
            <StripeButton
              planId={planId}
              amount={amount}
              type={type === 'membership' ? 'subscription' : 'one-time'}
              propertyId={propertyId}
              buttonText="Pay with Card"
              onSuccess={() => handleSuccess()}
              onError={handleError}
            />
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Your payment is secured with 256-bit encryption
        </p>
      </CardContent>
    </Card>
  )
}
