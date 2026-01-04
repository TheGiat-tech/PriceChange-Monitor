import crypto from 'crypto'

export function normalizeText(text: string, valueType: 'text' | 'price' = 'text'): string {
  let normalized = text.trim().replace(/\s+/g, ' ')
  
  if (valueType === 'price') {
    // Remove common currency symbols and formatting
    normalized = normalized.replace(/[$€£¥,]/g, '')
  }
  
  return normalized
}

export function hashValue(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex')
}
