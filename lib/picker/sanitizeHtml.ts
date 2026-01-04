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

  // Validate inputs
  if (!rawHtml || typeof rawHtml !== 'string') {
    return {
      success: false,
      error: 'Invalid HTML input',
    }
  }

  if (!baseUrl || typeof baseUrl !== 'string') {
    return {
      success: false,
      error: 'Invalid base URL',
    }
  }

  // Check size limit
  if (rawHtml.length > maxSize) {
    return {
      success: false,
      error: 'Page too large to preview',
    }
  }

  try {
    let $
    try {
      $ = cheerio.load(rawHtml)
    } catch (loadError) {
      return {
        success: false,
        error: 'Failed to parse HTML',
      }
    }

    // Remove dangerous tags
    try {
      for (const selector of DANGEROUS_TAGS) {
        $(selector).remove()
      }
    } catch (tagError) {
      // Continue with sanitization even if some tags fail to remove
      console.error('Error removing dangerous tags:', tagError)
    }

    // Remove all event handlers from all elements
    try {
      $('*').each((_, el) => {
        try {
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
        } catch (elemError) {
          // Skip this element if there's an error
          console.error('Error processing element:', elemError)
        }
      })
    } catch (handlerError) {
      // Continue with sanitization
      console.error('Error removing event handlers:', handlerError)
    }

    // Remove style tags with @import (could load external resources)
    try {
      $('style').each((_, el) => {
        try {
          const content = $(el).html() || ''
          if (content.includes('@import')) {
            $(el).remove()
          }
        } catch (styleError) {
          // Skip this style element
        }
      })
    } catch (styleTagError) {
      console.error('Error processing style tags:', styleTagError)
    }

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

    try {
      for (const { tag, attr } of urlAttributes) {
        $(tag).each((_, el) => {
          try {
            const element = $(el)
            const value = element.attr(attr)
            
            if (value && !value.startsWith('data:') && !value.startsWith('#')) {
              if (attr === 'srcset') {
                // Handle srcset with multiple URLs
                const newSrcset = value
                  .split(',')
                  .map(part => {
                    try {
                      const [url, descriptor] = part.trim().split(/\s+/)
                      const absoluteUrl = resolveUrl(url, baseUrl)
                      return descriptor ? `${absoluteUrl} ${descriptor}` : absoluteUrl
                    } catch {
                      return part // Keep original if parsing fails
                    }
                  })
                  .join(', ')
                element.attr(attr, newSrcset)
              } else {
                element.attr(attr, resolveUrl(value, baseUrl))
              }
            }
          } catch (urlError) {
            // Skip this element
          }
        })
      }
    } catch (urlRewriteError) {
      console.error('Error rewriting URLs:', urlRewriteError)
    }

    // Handle inline styles with url() - remove them entirely to prevent potential bypasses
    // This is safer than trying to rewrite URLs in CSS which has many edge cases
    try {
      $('[style]').each((_, el) => {
        try {
          const element = $(el)
          const style = element.attr('style') || ''
          
          if (style.includes('url(')) {
            // Remove url() references from inline styles for security
            const safeStyle = style.replace(/url\([^)]*\)/gi, 'none')
            element.attr('style', safeStyle)
          }
        } catch (inlineStyleError) {
          // Skip this element
        }
      })
    } catch (styleError) {
      console.error('Error processing inline styles:', styleError)
    }

    // Disable all links (prevent navigation)
    try {
      $('a').each((_, el) => {
        try {
          $(el).attr('href', '#')
          $(el).attr('target', '_self')
        } catch (linkError) {
          // Skip this link
        }
      })
    } catch (linkDisableError) {
      console.error('Error disabling links:', linkDisableError)
    }

    // Add base tag for any remaining relative resources
    try {
      if ($('head').length > 0) {
        $('head').prepend(`<base href="${baseUrl}">`)
      }
    } catch (baseTagError) {
      console.error('Error adding base tag:', baseTagError)
    }

    // Generate final HTML
    let finalHtml: string
    try {
      finalHtml = $.html()
    } catch (htmlError) {
      return {
        success: false,
        error: 'Failed to generate sanitized HTML',
      }
    }

    return {
      success: true,
      html: finalHtml,
    }
  } catch (error) {
    // Catch any unexpected errors
    console.error('Unexpected error in sanitizeHtml:', error)
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
