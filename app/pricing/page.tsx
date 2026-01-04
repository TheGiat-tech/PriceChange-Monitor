'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { IOSContainer, IOSCard, IOSRow, TintButton } from '@/components/ios'

export default function PricingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleUpgrade = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Failed to start checkout. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <IOSContainer>
      <div className="mb-4">
        <Link href="/dashboard" className="text-ios-tint text-sm font-medium">
          ← Back
        </Link>
        <h1 className="text-[28px] font-semibold text-ios-label mt-2">Pricing</h1>
        <p className="text-[14px] text-ios-secondary mt-1">Choose the plan that works for you</p>
      </div>

      {/* Free Plan */}
      <IOSCard title="FREE" className="mb-4">
        <div className="p-6">
          <div className="mb-4">
            <span className="text-[32px] font-semibold text-ios-label">$0</span>
            <span className="text-ios-secondary">/month</span>
          </div>
          <div className="space-y-2 mb-4">
            <IOSRow label="1 active monitor" />
            <IOSRow label="Email alerts" />
            <IOSRow label="Daily checks" />
            <IOSRow label="Change history" />
          </div>
          <Link href="/login">
            <TintButton>Get Started</TintButton>
          </Link>
        </div>
      </IOSCard>

      {/* Pro Plan */}
      <IOSCard title="PRO" className="mb-4">
        <div className="p-6">
          <div className="mb-4">
            <span className="text-[32px] font-semibold text-ios-label">$9</span>
            <span className="text-ios-secondary">/month</span>
          </div>
          <div className="space-y-2 mb-4">
            <IOSRow label="Up to 20 monitors" className="font-semibold" />
            <IOSRow label="Email alerts" />
            <IOSRow label="Hourly checks" className="font-semibold" />
            <IOSRow label="Change history" />
            <IOSRow label="Priority support" />
          </div>
          <TintButton onClick={handleUpgrade} disabled={loading}>
            {loading ? 'Processing...' : 'Upgrade to Pro'}
          </TintButton>
        </div>
      </IOSCard>

      {/* FAQ */}
      <IOSCard title="FAQ" className="mb-4">
        <div className="p-6 space-y-4">
          <div>
            <h4 className="font-semibold text-ios-label text-[15px] mb-1">How does monitoring work?</h4>
            <p className="text-[14px] text-ios-secondary">
              We check your pages at your chosen interval and alert you via email when changes are detected.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-ios-label text-[15px] mb-1">Can I cancel anytime?</h4>
            <p className="text-[14px] text-ios-secondary">
              Yes! Cancel anytime. Your monitors continue until the end of your billing period.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-ios-label text-[15px] mb-1">What can I monitor?</h4>
            <p className="text-[14px] text-ios-secondary">
              Any text content - prices, stock status, availability, articles, and more.
            </p>
          </div>
        </div>
      </IOSCard>
    </IOSContainer>
  )
}
