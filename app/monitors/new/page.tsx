'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { IOSContainer, IOSCard, IOSInput, PrimaryButton, SecondaryButton } from '@/components/ios'

function NewMonitorForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [loading, setLoading] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; value?: string; error?: string } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [pickedValue, setPickedValue] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    url: '',
    label: '',
    selector: '',
    value_type: 'text' as 'text' | 'price',
    interval_minutes: '1440',
    notification_email: '',
    is_active: true,
  })

  // Handle returning from picker with selected data
  useEffect(() => {
    const urlParam = searchParams.get('url')
    const selectorParam = searchParams.get('selector')
    const valueParam = searchParams.get('value')
    const advancedParam = searchParams.get('advanced')

    if (urlParam) {
      setFormData(prev => ({ ...prev, url: urlParam }))
    }
    if (selectorParam) {
      setFormData(prev => ({ ...prev, selector: selectorParam }))
    }
    if (valueParam) {
      setPickedValue(valueParam)
    }
    if (advancedParam === 'true') {
      setShowAdvanced(true)
    }
  }, [searchParams])

  const handlePickValue = () => {
    if (!formData.url) return
    
    // Navigate to picker page
    router.push(`/monitors/pick?url=${encodeURIComponent(formData.url)}`)
  }

  const handleClearPicked = () => {
    setPickedValue(null)
    setFormData(prev => ({ ...prev, selector: '' }))
  }

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

  const canSubmit = formData.url && formData.selector && formData.notification_email

  return (
    <IOSContainer>
      <div className="mb-6">
        <Link href="/dashboard" className="text-ios-tint text-[15px]">
          ← Back
        </Link>
        <h1 className="text-[28px] font-semibold text-ios-label mt-2">New Monitor</h1>
        <p className="text-[15px] text-ios-secondary mt-1">Track changes on any webpage</p>
      </div>

      <IOSCard>
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-ios text-sm">
                {error}
              </div>
            )}

            {/* Step 1: URL */}
            <div>
              <IOSInput
                label="Page URL"
                type="url"
                id="url"
                required
                maxLength={2048}
                value={formData.url}
                onChange={(e) => {
                  setFormData({ ...formData, url: e.target.value })
                  // Clear picked value if URL changes
                  if (pickedValue) {
                    setPickedValue(null)
                    setFormData(prev => ({ ...prev, selector: '' }))
                  }
                }}
                placeholder="https://example.com/product"
              />
            </div>

            {/* Step 2: Pick value or show picked result */}
            {!pickedValue && !showAdvanced ? (
              <div>
                <button
                  type="button"
                  onClick={handlePickValue}
                  disabled={!formData.url}
                  className="w-full h-14 bg-ios-tint text-white font-semibold text-[17px] rounded-ios flex items-center justify-center gap-2 disabled:opacity-40 active:opacity-80 transition-opacity"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                  </svg>
                  Pick value
                </button>
                <p className="mt-2 text-[13px] text-ios-secondary text-center">
                  Tap the value you want to track on the page
                </p>
              </div>
            ) : pickedValue ? (
              /* Picked value preview */
              <div>
                <label className="block text-sm font-medium text-ios-label mb-2">
                  Tracking
                </label>
                <div className="bg-green-50 border border-green-200 rounded-ios p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-[15px] font-medium text-green-800 truncate">
                        {pickedValue}
                      </p>
                      <p className="text-[13px] text-green-600 mt-1">
                        Value selected
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleClearPicked}
                      className="text-green-600 text-[13px] font-medium shrink-0"
                    >
                      Change
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Advanced toggle */}
            {!pickedValue && (
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-ios-tint text-[15px] flex items-center gap-1"
              >
                <svg 
                  className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-90' : ''}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                Advanced
              </button>
            )}

            {/* Advanced mode: manual selector input */}
            {showAdvanced && !pickedValue && (
              <div className="space-y-4 pl-5 border-l-2 border-ios-separator">
                <IOSInput
                  label="CSS Selector"
                  type="text"
                  id="selector"
                  required={showAdvanced && !pickedValue}
                  maxLength={200}
                  value={formData.selector}
                  onChange={(e) => setFormData({ ...formData, selector: e.target.value })}
                  placeholder=".price-value"
                />

                <button
                  type="button"
                  onClick={handleTest}
                  disabled={!formData.url || !formData.selector || testing}
                  className="text-ios-tint text-[15px] disabled:opacity-40 focus:outline-none focus:underline"
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
              </div>
            )}

            {/* Divider */}
            <div className="border-t border-ios-separator" />

            {/* Optional label */}
            <IOSInput
              label="Label"
              type="text"
              id="label"
              maxLength={100}
              value={formData.label}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              placeholder="My price tracker (optional)"
            />

            {/* Value type */}
            <div>
              <label htmlFor="value_type" className="block text-sm font-medium text-ios-label mb-2">
                Value type
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

            {/* Check interval */}
            <div>
              <label htmlFor="interval_minutes" className="block text-sm font-medium text-ios-label mb-2">
                Check frequency
              </label>
              <select
                id="interval_minutes"
                value={formData.interval_minutes}
                onChange={(e) => setFormData({ ...formData, interval_minutes: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-ios-separator rounded-ios text-ios-label text-[15px] focus:outline-none focus:ring-2 focus:ring-ios-tint focus:border-transparent"
              >
                <option value="60">Every hour</option>
                <option value="240">Every 4 hours</option>
                <option value="1440">Daily</option>
              </select>
            </div>

            {/* Email */}
            <IOSInput
              label="Email for alerts"
              type="email"
              id="notification_email"
              required
              value={formData.notification_email}
              onChange={(e) => setFormData({ ...formData, notification_email: e.target.value })}
              placeholder="you@example.com"
            />

            {/* Active toggle */}
            <div className="flex items-center pt-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="h-5 w-5 text-ios-tint focus:ring-ios-tint border-gray-300 rounded"
              />
              <label htmlFor="is_active" className="ml-3 text-[15px] text-ios-label">
                Start monitoring immediately
              </label>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Link href="/dashboard" className="flex-1">
                <SecondaryButton>Cancel</SecondaryButton>
              </Link>
              <div className="flex-1">
                <PrimaryButton type="submit" disabled={loading || !canSubmit}>
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

export default function NewMonitorPage() {
  return (
    <Suspense fallback={
      <IOSContainer>
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="w-8 h-8 border-2 border-ios-tint border-t-transparent rounded-full animate-spin" />
        </div>
      </IOSContainer>
    }>
      <NewMonitorForm />
    </Suspense>
  )
}
