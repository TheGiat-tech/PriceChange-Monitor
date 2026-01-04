'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center">
            <Link href="/dashboard" className="text-blue-600 hover:text-blue-700 mr-4">
              ← Back
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Add New Monitor</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="url" className="block text-sm font-medium text-gray-700">
                URL <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                id="url"
                required
                maxLength={2048}
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://example.com/product"
              />
            </div>

            <div>
              <label htmlFor="label" className="block text-sm font-medium text-gray-700">
                Label (optional)
              </label>
              <input
                type="text"
                id="label"
                maxLength={100}
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="My Product"
              />
            </div>

            <div>
              <label htmlFor="selector" className="block text-sm font-medium text-gray-700">
                CSS Selector <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="selector"
                required
                maxLength={200}
                value={formData.selector}
                onChange={(e) => setFormData({ ...formData, selector: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder=".price-value"
              />
              <p className="mt-1 text-sm text-gray-500">
                Use browser DevTools to find the CSS selector for the element you want to monitor
              </p>
            </div>

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={handleTest}
                disabled={!formData.url || !formData.selector || testing}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                {testing ? 'Testing...' : 'Test Selector'}
              </button>
            </div>

            {testResult && (
              <div className={`p-4 rounded ${testResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                {testResult.success ? (
                  <div>
                    <p className="text-green-800 font-medium mb-2">✓ Selector found!</p>
                    <p className="text-green-700">Extracted value: <span className="font-mono">{testResult.value}</span></p>
                  </div>
                ) : (
                  <p className="text-red-800">✗ {testResult.error}</p>
                )}
              </div>
            )}

            <div>
              <label htmlFor="value_type" className="block text-sm font-medium text-gray-700">
                Value Type
              </label>
              <select
                id="value_type"
                value={formData.value_type}
                onChange={(e) => setFormData({ ...formData, value_type: e.target.value as 'text' | 'price' })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="text">Text</option>
                <option value="price">Price</option>
              </select>
            </div>

            <div>
              <label htmlFor="interval_minutes" className="block text-sm font-medium text-gray-700">
                Check Interval <span className="text-red-500">*</span>
              </label>
              <select
                id="interval_minutes"
                value={formData.interval_minutes}
                onChange={(e) => setFormData({ ...formData, interval_minutes: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="60">Every hour</option>
                <option value="240">Every 4 hours</option>
                <option value="1440">Once daily</option>
              </select>
            </div>

            <div>
              <label htmlFor="notification_email" className="block text-sm font-medium text-gray-700">
                Notification Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="notification_email"
                required
                value={formData.notification_email}
                onChange={(e) => setFormData({ ...formData, notification_email: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="you@example.com"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                Monitor is active
              </label>
            </div>

            <div className="flex justify-end space-x-4">
              <Link
                href="/dashboard"
                className="px-6 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Monitor'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
