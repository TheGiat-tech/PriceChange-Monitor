'use client'

import { useEffect, useState, useCallback, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { PrimaryButton, SecondaryButton } from '@/components/ios'
import { buildSelector, type ElementInfo } from '@/lib/picker/selectorBuilder'
import { normalizeText } from '@/lib/picker/normalizeText'

// Time to wait for picker script to initialize in iframe (ms)
const PICKER_INITIALIZATION_TIMEOUT = 5000

type PickerState = 'loading' | 'ready' | 'error' | 'selected'

interface SelectedElement {
  selector: string
  value: string
}

function PickerContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const url = searchParams.get('url') || ''
  
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [state, setState] = useState<PickerState>('loading')
  const [error, setError] = useState<string | null>(null)
  const [selectedElement, setSelectedElement] = useState<SelectedElement | null>(null)

  const handleCancel = useCallback(() => {
    // Navigate back with cancel
    router.push('/monitors/new')
  }, [router])

  // Handle messages from iframe
  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      // Only accept messages from our iframe
      if (event.source !== iframeRef.current?.contentWindow) return

      // Validate event data exists
      if (!event.data || typeof event.data !== 'object') return

      const { type, elementInfo, textContent } = event.data

      switch (type) {
        case 'picker-ready':
          setState('ready')
          break
        
        case 'picker-select':
          if (elementInfo && textContent) {
            try {
              const selector = buildSelector(elementInfo as ElementInfo)
              const value = normalizeText(textContent)
              
              if (value) {
                setSelectedElement({ selector, value })
                setState('selected')
              }
            } catch (selectorError) {
              console.error('Error building selector:', selectorError)
              setState('error')
              setError('Failed to process selected element')
            }
          }
          break
        
        case 'picker-cancel':
          handleCancel()
          break
      }
    } catch (error) {
      console.error('Error handling picker message:', error)
      // Don't set error state for message handling errors
      // as they might be benign
    }
  }, [handleCancel])

  useEffect(() => {
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [handleMessage])

  // Handle iframe load error
  const handleIframeError = () => {
    setState('error')
    setError("This page can't be previewed")
  }

  const handleUseSelected = () => {
    if (selectedElement) {
      // Navigate back to new monitor page with selected data
      const params = new URLSearchParams({
        url: url,
        selector: selectedElement.selector,
        value: selectedElement.value,
      })
      router.push(`/monitors/new?${params.toString()}`)
    }
  }

  const handleAdvanced = () => {
    // Navigate to new monitor page with just the URL (advanced mode)
    router.push(`/monitors/new?url=${encodeURIComponent(url)}&advanced=true`)
  }

  const handleRetry = () => {
    setState('loading')
    setError(null)
    setSelectedElement(null)
    // Force iframe reload
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src
    }
  }

  // Pre-check if URL is fetchable before loading iframe
  useEffect(() => {
    if (!url) {
      setState('error')
      setError('No URL provided')
      return
    }

    // Validate URL format
    try {
      new URL(url)
    } catch {
      setState('error')
      setError('Invalid URL format')
      return
    }

    setState('loading')
  }, [url])

  // Construct iframe URL
  const iframeSrc = `/api/picker/render?url=${encodeURIComponent(url)}`

  return (
    <div className="fixed inset-0 bg-ios-bg flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-ios-separator px-4 py-3 flex items-center justify-between z-10">
        <button 
          onClick={handleCancel}
          className="text-ios-tint text-[17px] font-normal"
        >
          Cancel
        </button>
        <h1 className="text-[17px] font-semibold text-ios-label">Pick value</h1>
        <button 
          onClick={handleUseSelected}
          disabled={state !== 'selected'}
          className="text-ios-tint text-[17px] font-semibold disabled:opacity-40"
        >
          Done
        </button>
      </div>

      {/* Instructions */}
      {state === 'ready' && (
        <div className="bg-ios-tint/10 px-4 py-2 text-center">
          <p className="text-[13px] text-ios-tint font-medium">
            Tap the value you want to track
          </p>
        </div>
      )}

      {/* Selected preview */}
      {state === 'selected' && selectedElement && (
        <div className="bg-green-50 border-b border-green-200 px-4 py-3">
          <p className="text-[13px] text-green-700 font-medium mb-1">Selected</p>
          <p className="text-[15px] text-green-900 font-mono truncate">
            {selectedElement.value}
          </p>
        </div>
      )}

      {/* Main content area */}
      <div className="flex-1 relative">
        {/* Loading state */}
        {state === 'loading' && (
          <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-ios-tint border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-[15px] text-ios-secondary">Loading preview...</p>
            </div>
          </div>
        )}

        {/* Error state */}
        {state === 'error' && (
          <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
            <div className="text-center px-6 max-w-sm">
              <div className="w-16 h-16 bg-ios-bg rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-ios-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-[17px] font-semibold text-ios-label mb-2">
                Can&apos;t preview this page
              </h2>
              <p className="text-[15px] text-ios-secondary mb-6">
                {error || 'Some websites block external previews. You can still monitor it using Advanced mode.'}
              </p>
              <div className="space-y-3">
                <PrimaryButton onClick={handleAdvanced}>
                  Use Advanced mode
                </PrimaryButton>
                <SecondaryButton onClick={handleRetry}>
                  Try again
                </SecondaryButton>
              </div>
            </div>
          </div>
        )}

        {/* Iframe */}
        <iframe
          ref={iframeRef}
          src={iframeSrc}
          className="w-full h-full border-0"
          sandbox="allow-same-origin allow-scripts"
          onError={handleIframeError}
          onLoad={() => {
            // If still loading after iframe loads, give it a moment for the script to initialize
            if (state === 'loading') {
              setTimeout(() => {
                // Check state again before updating
                setState((currentState) => {
                  if (currentState === 'loading') {
                    return 'error'
                  }
                  return currentState
                })
                // Set error message separately to avoid state update conflicts
                setError("This page can't be previewed")
              }, PICKER_INITIALIZATION_TIMEOUT)
            }
          }}
        />
      </div>

      {/* Bottom bar for selection */}
      {state === 'selected' && (
        <div className="bg-white border-t border-ios-separator px-4 py-4 pb-safe">
          <PrimaryButton onClick={handleUseSelected}>
            Use this value
          </PrimaryButton>
        </div>
      )}
    </div>
  )
}

export default function PickerPage() {
  return (
    <Suspense fallback={
      <div className="fixed inset-0 bg-ios-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-ios-tint border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <PickerContent />
    </Suspense>
  )
}
