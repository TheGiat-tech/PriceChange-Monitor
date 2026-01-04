import { URL } from 'url'

const BLOCKED_CIDRS = [
  // IPv4 private ranges
  /^10\./,
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
  /^192\.168\./,
  /^127\./,
  /^0\./,
  /^169\.254\./, // Link-local
  /^224\./, // Multicast
  
  // IPv6 private/special ranges
  /^::1$/, // Loopback
  /^fe80:/i, // Link-local
  /^fc00:/i, // Unique local
  /^fd00:/i, // Unique local
]

const BLOCKED_HOSTS = [
  'localhost',
  'metadata.google.internal',
  '169.254.169.254', // AWS/GCP metadata
]

export function isBlockedUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString)
    
    // Only allow http and https
    if (!['http:', 'https:'].includes(url.protocol)) {
      return true
    }
    
    const hostname = url.hostname.toLowerCase()
    
    // Check blocked hostnames
    if (BLOCKED_HOSTS.includes(hostname)) {
      return true
    }
    
    // Check IP address patterns
    for (const pattern of BLOCKED_CIDRS) {
      if (pattern.test(hostname)) {
        return true
      }
    }
    
    return false
  } catch (error) {
    return true // Invalid URL = blocked
  }
}
