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
      error: 'URL is blocked for security reasons',
    }
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; PricePing/1.0; +https://priceping.app)',
      },
    })

    clearTimeout(timeout)

    if (!response.ok) {
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
        error: 'Selector not found',
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
          error: 'Request timeout',
        }
      }
      return {
        success: false,
        error: error.message,
      }
    }
    
    return {
      success: false,
      error: 'Unknown error occurred',
    }
  }
}
