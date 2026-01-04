'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { IOSContainer, IOSCard, IOSInput, PrimaryButton, SecondaryButton } from '@/components/ios'

export default function NewMonitorPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; value?: string; error?: string } | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    url: '',
    label: '',
    selector: '',
    value_type: 'text' as 'text' | 'price',
    interval_minutes: '1440',
    notification_email: '',
    is_active: true,
  })

  const handleTest = async () => {
    setTesting(true)
    setTestResult(null)
    setError(null)

    try {
      const response = await fetch('/api/monitors/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: formData.url,
          selector: formData.selector,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Test failed')
      }

      setTestResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Test failed')
    } finally {
      setTesting(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/monitors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          interval_minutes: parseInt(formData.interval_minutes),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create monitor')
      }

      router.push('/dashboard')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create monitor')
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
        <h1 className="text-[28px] font-semibold text-ios-label mt-2">Create Monitor</h1>
      </div>

      <IOSCard>
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-ios text-sm">
                {error}
              </div>
            )}

            <IOSInput
              label="URL"
              type="url"
              id="url"
              required
              maxLength={2048}
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              placeholder="https://example.com/product"
            />

            <IOSInput
              label="Label"
              type="text"
              id="label"
              maxLength={100}
              value={formData.label}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              placeholder="Optional"
            />

            <IOSInput
              label="CSS Selector"
              type="text"
              id="selector"
              required
              maxLength={200}
              value={formData.selector}
              onChange={(e) => setFormData({ ...formData, selector: e.target.value })}
              placeholder=".price-value"
              helperText="Right-click → Inspect → Copy selector"
            />

            <button
              type="button"
              onClick={handleTest}
              disabled={!formData.url || !formData.selector || testing}
              className="text-ios-tint text-[15px] disabled:opacity-40"
            >
              {testing ? 'Testing...' : 'Test selector'}
            </button>

            {testResult && (
              <div className={`p-4 rounded-ios text-sm ${testResult.success ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-600'}`}>
                {testResult.success ? (
                  <div>
                    <p className="font-medium mb-1">✓ Found</p>
                    <p className="text-xs">Value: <span className="font-mono">{testResult.value}</span></p>
                  </div>
                ) : (
                  <p>✗ {testResult.error}</p>
                )}
              </div>
            )}

            <div>
              <label htmlFor="value_type" className="block text-[13px] font-medium text-ios-label mb-2">
                Value Type
              </label>
              <select
                id="value_type"
                value={formData.value_type}
                onChange={(e) => setFormData({ ...formData, value_type: e.target.value as 'text' | 'price' })}
                className="w-full px-4 py-3 bg-white border border-ios-separator rounded-ios text-ios-label text-[15px] focus:outline-none focus:ring-2 focus:ring-ios-tint focus:border-transparent"
              >
                <option value="text">Text</option>
                <option value="price">Price</option>
              </select>
            </div>

            <div>
              <label htmlFor="interval_minutes" className="block text-[13px] font-medium text-ios-label mb-2">
                Check Interval
              </label>
              <select
                id="interval_minutes"
                value={formData.interval_minutes}
                onChange={(e) => setFormData({ ...formData, interval_minutes: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-ios-separator rounded-ios text-ios-label text-[15px] focus:outline-none focus:ring-2 focus:ring-ios-tint focus:border-transparent"
              >
                <option value="60">Every hour</option>
                <option value="240">Every 4 hours</option>
                <option value="1440">Once daily</option>
              </select>
            </div>

            <IOSInput
              label="Notification Email"
              type="email"
              id="notification_email"
              required
              value={formData.notification_email}
              onChange={(e) => setFormData({ ...formData, notification_email: e.target.value })}
              placeholder="you@example.com"
            />

            <div className="flex items-center pt-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="h-5 w-5 text-ios-tint focus:ring-ios-tint border-gray-300 rounded"
              />
              <label htmlFor="is_active" className="ml-3 text-[15px] text-ios-label">
                Active
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <Link href="/dashboard" className="flex-1">
                <SecondaryButton>Cancel</SecondaryButton>
              </Link>
              <div className="flex-1">
                <PrimaryButton type="submit" disabled={loading}>
                  {loading ? 'Creating...' : 'Create'}
                </PrimaryButton>
              </div>
            </div>
          </form>
        </div>
      </IOSCard>
    </IOSContainer>
  )
}
