import * as cheerio from 'cheerio'
import { isBlockedUrl } from './ssrf'

export interface FetchResult {
  success: boolean
  value?: string
  error?: string
}

export async function fetchAndExtract(
  url: string,
  selector: string,
  timeoutMs: number = 10000
): Promise<FetchResult> {
  // SSRF protection
  if (isBlockedUrl(url)) {
    return {
      success: false,
      error: 'blocked_by_site',
    }
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'PricePingBot/1.0 (+https://priceping.app)',
      },
    })

    clearTimeout(timeout)

    if (!response.ok) {
      // Check if we're being blocked
      if (response.status === 403 || response.status === 429) {
        return {
          success: false,
          error: 'blocked_by_site',
        }
      }
      return {
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
      }
    }

    const html = await response.text()
    const $ = cheerio.load(html)
    const element = $(selector)

    if (element.length === 0) {
      return {
        success: false,
        error: 'selector_not_found',
      }
    }

    const value = element.first().text()

    return {
      success: true,
      value,
    }
  } catch (error) {
    clearTimeout(timeout)
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return {
          success: false,
          error: 'fetch_timeout',
        }
      }
      return {
        success: false,
        error: 'parse_error',
      }
    }
    
    return {
      success: false,
      error: 'parse_error',
    }
  }
}
