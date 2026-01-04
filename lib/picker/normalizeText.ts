/**
 * Normalize extracted text for display and comparison.
 * Removes excess whitespace, trims, and cleans up common issues.
 */
export function normalizeText(text: string): string {
  try {
    // Validate input
    if (!text || typeof text !== 'string') {
      return ''
    }

    return text
      // Replace multiple whitespace chars (including newlines) with single space
      .replace(/\s+/g, ' ')
      // Trim leading/trailing whitespace
      .trim()
      // Limit length for display
      .substring(0, 500)
  } catch (error) {
    console.error('Error normalizing text:', error)
    return ''
  }
}
