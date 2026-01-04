import * as cheerio from 'cheerio'

/**
 * Sanitize HTML for safe rendering in the picker iframe.
 * Removes scripts, event handlers, forms, and other dangerous content.
 * Rewrites relative URLs to absolute URLs.
 */

const DANGEROUS_TAGS = [
  'script',
  'noscript',
  'iframe',
  'frame',
  'frameset',
  'object',
  'embed',
  'applet',
  'form',
  'input',
  'textarea',
  'select',
  'button',
  'link[rel="import"]',
  'meta[http-equiv]',
  'base',
]

const EVENT_HANDLER_PATTERN = /^on[a-z]+$/i

// Max HTML size (2MB)
const MAX_HTML_SIZE = 2 * 1024 * 1024

export interface SanitizeOptions {
  baseUrl: string
  maxSize?: number
}

export interface SanitizeResult {
  success: boolean
  html?: string
  error?: string
}

export function sanitizeHtml(
  rawHtml: string,
  options: SanitizeOptions
): SanitizeResult {
  const { baseUrl, maxSize = MAX_HTML_SIZE } = options

  // Check size limit
  if (rawHtml.length > maxSize) {
    return {
      success: false,
      error: 'Page too large to preview',
    }
  }

  try {
    const $ = cheerio.load(rawHtml)

    // Remove dangerous tags
    for (const selector of DANGEROUS_TAGS) {
      $(selector).remove()
    }

    // Remove all event handlers from all elements
    $('*').each((_, el) => {
      const element = $(el)
      const elWithAttribs = el as { attribs?: Record<string, string> }
      const attribs = elWithAttribs.attribs || {}
      
      for (const attr of Object.keys(attribs)) {
        if (EVENT_HANDLER_PATTERN.test(attr)) {
          element.removeAttr(attr)
        }
        // Remove dangerous URL schemes (javascript:, vbscript:, data: for scripts)
        const value = attribs[attr]?.toLowerCase() || ''
        if (value.startsWith('javascript:') || 
            value.startsWith('vbscript:') ||
            (value.startsWith('data:') && (value.includes('text/html') || value.includes('text/javascript')))) {
          element.removeAttr(attr)
        }
      }
    })

    // Remove style tags with @import (could load external resources)
    $('style').each((_, el) => {
      const content = $(el).html() || ''
      if (content.includes('@import')) {
        $(el).remove()
      }
    })

    // Rewrite relative URLs to absolute
    const urlAttributes = [
      { tag: 'a', attr: 'href' },
      { tag: 'img', attr: 'src' },
      { tag: 'link', attr: 'href' },
      { tag: 'source', attr: 'src' },
      { tag: 'video', attr: 'src' },
      { tag: 'audio', attr: 'src' },
      { tag: 'picture source', attr: 'srcset' },
      { tag: 'img', attr: 'srcset' },
    ]

    for (const { tag, attr } of urlAttributes) {
      $(tag).each((_, el) => {
        const element = $(el)
        const value = element.attr(attr)
        
        if (value && !value.startsWith('data:') && !value.startsWith('#')) {
          if (attr === 'srcset') {
            // Handle srcset with multiple URLs
            const newSrcset = value
              .split(',')
              .map(part => {
                const [url, descriptor] = part.trim().split(/\s+/)
                const absoluteUrl = resolveUrl(url, baseUrl)
                return descriptor ? `${absoluteUrl} ${descriptor}` : absoluteUrl
              })
              .join(', ')
            element.attr(attr, newSrcset)
          } else {
            element.attr(attr, resolveUrl(value, baseUrl))
          }
        }
      })
    }

    // Handle inline styles with url() - remove them entirely to prevent potential bypasses
    // This is safer than trying to rewrite URLs in CSS which has many edge cases
    $('[style]').each((_, el) => {
      const element = $(el)
      const style = element.attr('style') || ''
      
      if (style.includes('url(')) {
        // Remove url() references from inline styles for security
        const safeStyle = style.replace(/url\([^)]*\)/gi, 'none')
        element.attr('style', safeStyle)
      }
    })

    // Disable all links (prevent navigation)
    $('a').each((_, el) => {
      $(el).attr('href', '#')
      $(el).attr('target', '_self')
    })

    // Add base tag for any remaining relative resources
    $('head').prepend(`<base href="${baseUrl}">`)

    return {
      success: true,
      html: $.html(),
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to sanitize HTML',
    }
  }
}

function resolveUrl(url: string, baseUrl: string): string {
  try {
    return new URL(url, baseUrl).href
  } catch {
    return url
  }
}
