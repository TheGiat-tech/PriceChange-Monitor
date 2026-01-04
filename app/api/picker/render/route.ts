import { NextRequest, NextResponse } from 'next/server'
import { isBlockedUrl } from '@/lib/monitoring/ssrf'
import { sanitizeHtml } from '@/lib/picker/sanitizeHtml'
import { getElementInfoScript } from '@/lib/picker/selectorBuilder'

export const runtime = 'nodejs'

// Timeout for fetching external pages (10 seconds)
const FETCH_TIMEOUT_MS = 10000

// Max HTML size (2MB)
const MAX_HTML_SIZE = 2 * 1024 * 1024

function getPickerScript(): string {
  const cssStyles = 'position: fixed; pointer-events: none; border: 2px solid #007AFF; background: rgba(0, 122, 255, 0.1); border-radius: 4px; z-index: 999999; display: none; transition: all 0.1s ease;'
  
  return '<script>' +
    getElementInfoScript() +
    'let highlightedElement = null;' +
    'let pickerOverlay = null;' +
    'function createOverlay() {' +
    '  const overlay = document.createElement("div");' +
    '  overlay.id = "picker-highlight";' +
    '  overlay.style.cssText = "' + cssStyles + '";' +
    '  document.body.appendChild(overlay);' +
    '  return overlay;' +
    '}' +
    'function positionOverlay(element) {' +
    '  if (!pickerOverlay) pickerOverlay = createOverlay();' +
    '  const rect = element.getBoundingClientRect();' +
    '  pickerOverlay.style.top = rect.top + "px";' +
    '  pickerOverlay.style.left = rect.left + "px";' +
    '  pickerOverlay.style.width = rect.width + "px";' +
    '  pickerOverlay.style.height = rect.height + "px";' +
    '  pickerOverlay.style.display = "block";' +
    '}' +
    'function hideOverlay() {' +
    '  if (pickerOverlay) { pickerOverlay.style.display = "none"; }' +
    '}' +
    'document.addEventListener("mousemove", function(e) {' +
    '  const element = document.elementFromPoint(e.clientX, e.clientY);' +
    '  if (element && element !== highlightedElement && element.id !== "picker-highlight") {' +
    '    highlightedElement = element;' +
    '    positionOverlay(element);' +
    '  }' +
    '});' +
    'document.addEventListener("click", function(e) {' +
    '  e.preventDefault();' +
    '  e.stopPropagation();' +
    '  const element = document.elementFromPoint(e.clientX, e.clientY);' +
    '  if (element && element.id !== "picker-highlight") {' +
    '    const elementInfo = getElementInfo(element);' +
    '    const textContent = element.innerText || element.textContent || "";' +
    '    window.parent.postMessage({' +
    '      type: "picker-select",' +
    '      elementInfo: elementInfo,' +
    '      textContent: textContent.trim().replace(/\\s+/g, " ").substring(0, 500)' +
    '    }, "*");' +
    '  }' +
    '}, true);' +
    'document.addEventListener("keydown", function(e) {' +
    '  if (e.key === "Escape") {' +
    '    window.parent.postMessage({ type: "picker-cancel" }, "*");' +
    '  }' +
    '});' +
    'window.parent.postMessage({ type: "picker-ready" }, "*");' +
    '</script>'
}

export async function GET(request: NextRequest) {
  const controller = new AbortController()
  let timeout: NodeJS.Timeout | null = null

  try {
    const url = request.nextUrl.searchParams.get('url')

    if (!url) {
      return NextResponse.json(
        { success: false, error: 'URL parameter is required' },
        { status: 400 }
      )
    }

    // Validate URL format
    let parsedUrl: URL
    try {
      parsedUrl = new URL(url)
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid URL' },
        { status: 400 }
      )
    }

    // SSRF protection
    if (isBlockedUrl(url)) {
      return NextResponse.json(
        { success: false, error: 'This URL cannot be accessed' },
        { status: 400 }
      )
    }

    // Only allow http/https
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return NextResponse.json(
        { success: false, error: 'Only HTTP/HTTPS URLs are supported' },
        { status: 400 }
      )
    }

    timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

    let response: Response
    try {
      response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; PricePingBot/1.0; +https://priceping.app)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
        },
      })
    } catch (fetchError) {
      if (timeout) clearTimeout(timeout)
      
      if (fetchError instanceof Error) {
        if (fetchError.name === 'AbortError') {
          return NextResponse.json(
            { success: false, error: 'Page took too long to load' },
            { status: 408 }
          )
        }
        // Network errors, DNS failures, etc.
        return NextResponse.json(
          { success: false, error: 'Unable to fetch page: Network error' },
          { status: 502 }
        )
      }
      
      return NextResponse.json(
        { success: false, error: 'Failed to fetch page' },
        { status: 502 }
      )
    }

    if (timeout) clearTimeout(timeout)

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch page: ' + response.status },
        { status: 400 }
      )
    }

    // Check content type
    const contentType = response.headers.get('content-type') || ''
    if (!contentType.includes('text/html') && !contentType.includes('application/xhtml+xml')) {
      return NextResponse.json(
        { success: false, error: 'Page is not HTML' },
        { status: 400 }
      )
    }

    // Check content length if available
    const contentLength = response.headers.get('content-length')
    if (contentLength && parseInt(contentLength) > MAX_HTML_SIZE) {
      return NextResponse.json(
        { success: false, error: 'Page is too large' },
        { status: 400 }
      )
    }

    let rawHtml: string
    try {
      rawHtml = await response.text()
    } catch (textError) {
      return NextResponse.json(
        { success: false, error: 'Failed to read page content' },
        { status: 502 }
      )
    }

    // Additional size check after receiving content
    if (rawHtml.length > MAX_HTML_SIZE) {
      return NextResponse.json(
        { success: false, error: 'Page is too large' },
        { status: 400 }
      )
    }

    // Sanitize the HTML
    const baseUrl = parsedUrl.protocol + '//' + parsedUrl.host
    let result
    try {
      result = sanitizeHtml(rawHtml, { baseUrl })
    } catch (sanitizeError) {
      return NextResponse.json(
        { success: false, error: 'Failed to process page HTML' },
        { status: 500 }
      )
    }

    if (!result.success || !result.html) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to process page' },
        { status: 400 }
      )
    }

    // Inject the picker script into the HTML
    let pickerScript: string
    try {
      pickerScript = getPickerScript()
    } catch (scriptError) {
      return NextResponse.json(
        { success: false, error: 'Failed to generate picker script' },
        { status: 500 }
      )
    }

    // Inject script before </body>
    let finalHtml = result.html
    try {
      if (finalHtml.includes('</body>')) {
        finalHtml = finalHtml.replace('</body>', pickerScript + '</body>')
      } else {
        finalHtml = finalHtml + pickerScript
      }
    } catch (injectionError) {
      return NextResponse.json(
        { success: false, error: 'Failed to inject picker script' },
        { status: 500 }
      )
    }

    // Return as HTML with security headers
    // Note: 'unsafe-inline' is required for our picker script to work.
    // This is mitigated by:
    // 1. HTML sanitization removes all original scripts and event handlers
    // 2. We only inject our trusted picker script
    // 3. frame-ancestors 'self' prevents embedding by external sites
    // 4. The rendered content is ephemeral and not stored
    return new NextResponse(finalHtml, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'X-Frame-Options': 'SAMEORIGIN',
        'Content-Security-Policy': "default-src 'self'; script-src 'unsafe-inline'; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: https:; font-src 'self' https:; frame-ancestors 'self';",
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'no-store, max-age=0',
      },
    })
  } catch (error) {
    // Catch-all for any unexpected errors
    if (timeout) clearTimeout(timeout)
    
    // Log error for debugging (in production, this would go to monitoring)
    console.error('Picker render error:', error)
    
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred while processing the page' },
      { status: 500 }
    )
  }
}
