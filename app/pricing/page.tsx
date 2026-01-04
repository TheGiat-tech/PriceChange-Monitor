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
      <div className="mb-6">
        <Link href="/dashboard" className="text-ios-tint text-[15px]">
          ← Back
        </Link>
        <h1 className="text-[28px] font-semibold text-ios-label mt-2">Pricing</h1>
      </div>

      {/* Plans Card */}
      <IOSCard className="mb-6">
        <div className="px-4 py-5">
          <div className="flex items-baseline gap-1 mb-1">
            <span className="text-[32px] font-semibold text-ios-label">$0</span>
            <span className="text-[15px] text-ios-secondary">/month</span>
          </div>
          <p className="text-[13px] text-ios-secondary mb-3">1 monitor, daily checks</p>
          <Link href="/login">
            <button className="text-ios-tint text-[17px] font-medium">Get Started</button>
          </Link>
        </div>
        
        <div className="h-px bg-ios-separator" />
        
        <div className="px-4 py-5">
          <div className="flex items-baseline gap-1 mb-1">
            <span className="text-[32px] font-semibold text-ios-label">$9</span>
            <span className="text-[15px] text-ios-secondary">/month</span>
          </div>
          <p className="text-[13px] text-ios-secondary mb-3">20 monitors, hourly checks</p>
          <button 
            onClick={handleUpgrade} 
            disabled={loading}
            className="text-ios-tint text-[17px] font-medium disabled:opacity-40"
          >
            {loading ? 'Processing...' : 'Upgrade to Pro'}
          </button>
        </div>
      </IOSCard>

      {/* FAQ */}
      <IOSCard className="mb-6">
        <div className="px-4 py-4">
          <h4 className="font-semibold text-ios-label text-[15px] mb-1">Can I cancel anytime?</h4>
          <p className="text-[13px] text-ios-secondary leading-relaxed">
            Yes. Monitors continue until billing period ends.
          </p>
        </div>
        <div className="h-px bg-ios-separator" />
        <div className="px-4 py-4">
          <h4 className="font-semibold text-ios-label text-[15px] mb-1">What can I monitor?</h4>
          <p className="text-[13px] text-ios-secondary leading-relaxed">
            Any text content—prices, stock, availability.
          </p>
        </div>
      </IOSCard>
    </IOSContainer>
  )
}
