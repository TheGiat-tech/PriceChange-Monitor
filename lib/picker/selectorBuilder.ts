/**
 * Generate a stable CSS selector for an element.
 * Prioritizes stable attributes over fragile positional selectors.
 */

// Class name length constraints for semantic detection
const MIN_CLASS_NAME_LENGTH = 3
const MAX_CLASS_NAME_LENGTH = 20

// Common data-* attributes used for testing (most stable)
const DATA_ATTRIBUTES = [
  'data-testid',
  'data-test',
  'data-qa',
  'data-cy',
  'data-id',
  'data-product-id',
  'data-price',
  'data-value',
]

// Patterns that suggest a random/dynamic ID
const RANDOM_ID_PATTERNS = [
  /^[a-f0-9]{8,}$/i, // Hex strings
  /^[a-z0-9]{20,}$/i, // Long alphanumeric
  /^:r[0-9]+:$/, // React generated
  /^ember\d+$/, // Ember generated
  /^__[a-z]+\d+$/i, // Framework generated
  /_[a-f0-9]{4,}$/i, // Suffix with random hex
  /\d{10,}/, // Contains long numbers (timestamps, etc.)
]

// Class names that are likely stable (semantic)
const STABLE_CLASS_PATTERNS = [
  /^price/i,
  /^product/i,
  /^item/i,
  /^title/i,
  /^name/i,
  /^cost/i,
  /^value/i,
  /^amount/i,
  /^total/i,
  /^discount/i,
  /^sale/i,
  /^btn/i,
  /^button/i,
  /^card/i,
  /^header/i,
  /^footer/i,
  /^nav/i,
  /^main/i,
  /^content/i,
  /^text/i,
  /^label/i,
]

// Class names that are likely random/generated
const RANDOM_CLASS_PATTERNS = [
  /^[a-z]{1,2}[A-Z][a-z]+[A-Z]/, // CSS-in-JS style (aButton, bWrapper)
  /^_[a-z0-9]+$/i, // Underscore prefix with random
  /^[a-z]{1,3}[0-9]+[a-z]*$/i, // Short prefix with numbers
  /^css-[a-z0-9]+$/i, // Emotion/styled-components
  /^sc-[a-zA-Z]+$/i, // Styled-components
  /^[a-f0-9]{6,}$/i, // Hex class names
]

function isRandomId(id: string): boolean {
  return RANDOM_ID_PATTERNS.some(pattern => pattern.test(id))
}

function isStableClass(className: string): boolean {
  // Reject obviously random classes
  if (RANDOM_CLASS_PATTERNS.some(pattern => pattern.test(className))) {
    return false
  }
  // Prefer semantic class names
  if (STABLE_CLASS_PATTERNS.some(pattern => pattern.test(className))) {
    return true
  }
  // Accept short, simple class names (likely semantic)
  if (className.length >= MIN_CLASS_NAME_LENGTH && className.length <= MAX_CLASS_NAME_LENGTH && /^[a-z][a-z0-9-_]*$/i.test(className)) {
    return true
  }
  return false
}

function escapeSelector(str: string): string {
  return str.replace(/([!"#$%&'()*+,./:;<=>?@[\\\]^`{|}~])/g, '\\$1')
}

export interface ElementInfo {
  tagName: string
  id?: string
  classList: string[]
  attributes: Record<string, string>
  nthOfType: number
  parentPath: ElementInfo[]
}

/**
 * Build a selector from element info, preferring stable selectors.
 * Returns a fallback selector if element info is invalid.
 */
export function buildSelector(element: ElementInfo): string {
  try {
    // Validate element info
    if (!element || typeof element !== 'object') {
      return 'body' // Fallback selector
    }

    if (!element.tagName || typeof element.tagName !== 'string') {
      return 'body' // Fallback selector
    }

    // Ensure arrays are initialized
    const classList = Array.isArray(element.classList) ? element.classList : []
    const attributes = element.attributes && typeof element.attributes === 'object' ? element.attributes : {}
    const parentPath = Array.isArray(element.parentPath) ? element.parentPath : []

    // 1. Check for stable data-* attributes
    for (const attr of DATA_ATTRIBUTES) {
      const value = attributes[attr]
      if (value && typeof value === 'string') {
        try {
          return `[${attr}="${escapeSelector(value)}"]`
        } catch {
          // Continue to next option if escaping fails
        }
      }
    }

    // 2. Check for a stable ID
    if (element.id && typeof element.id === 'string' && !isRandomId(element.id)) {
      try {
        return `#${escapeSelector(element.id)}`
      } catch {
        // Continue to next option
      }
    }

    // 3. Try to build with stable classes
    const stableClasses = classList.filter(isStableClass)
    if (stableClasses.length > 0) {
      try {
        const classSelector = stableClasses.slice(0, 2).map(c => `.${escapeSelector(c)}`).join('')
        const baseSelector = element.tagName.toLowerCase() + classSelector

        // If we have a unique-looking selector, return it
        if (stableClasses.length >= 1) {
          return baseSelector
        }
      } catch {
        // Continue to next option
      }
    }

    // 4. Build a path-based selector using parent elements
    const pathParts: string[] = []
    
    // Include up to 3 parents for context
    const ancestors = [...parentPath].slice(-3)
    
    for (const ancestor of ancestors) {
      try {
        const part = buildSimpleSelector(ancestor)
        if (part) {
          pathParts.push(part)
        }
      } catch {
        // Skip this ancestor if there's an error
      }
    }

    // Add the target element
    try {
      const nthOfType = typeof element.nthOfType === 'number' && element.nthOfType > 0 ? element.nthOfType : null
      const simpleSelector = buildSimpleSelector(element)
      
      if (simpleSelector) {
        pathParts.push(simpleSelector)
      } else if (nthOfType) {
        pathParts.push(`${element.tagName.toLowerCase()}:nth-of-type(${nthOfType})`)
      } else {
        // If no valid nth-of-type, just use the tag name
        pathParts.push(element.tagName.toLowerCase())
      }
    } catch {
      // Fallback to just the tag name
      pathParts.push(element.tagName.toLowerCase())
    }

    return pathParts.length > 0 ? pathParts.join(' > ') : 'body'
  } catch (error) {
    // Ultimate fallback
    console.error('Error building selector:', error)
    return 'body'
  }
}

function buildSimpleSelector(element: ElementInfo): string | null {
  try {
    // Validate element
    if (!element || typeof element !== 'object' || !element.tagName) {
      return null
    }

    const attributes = element.attributes && typeof element.attributes === 'object' ? element.attributes : {}
    const classList = Array.isArray(element.classList) ? element.classList : []

    // Check for data attributes
    for (const attr of DATA_ATTRIBUTES) {
      const value = attributes[attr]
      if (value && typeof value === 'string') {
        try {
          return `[${attr}="${escapeSelector(value)}"]`
        } catch {
          // Continue to next option
        }
      }
    }

    // Check for stable ID
    if (element.id && typeof element.id === 'string' && !isRandomId(element.id)) {
      try {
        return `#${escapeSelector(element.id)}`
      } catch {
        // Continue to next option
      }
    }

    // Check for stable classes
    const stableClasses = classList.filter(isStableClass)
    if (stableClasses.length > 0) {
      try {
        return element.tagName.toLowerCase() + 
          stableClasses.slice(0, 2).map(c => `.${escapeSelector(c)}`).join('')
      } catch {
        // Continue to next option
      }
    }

    return null
  } catch (error) {
    console.error('Error in buildSimpleSelector:', error)
    return null
  }
}

/**
 * Generate element info from a DOM element (for use in iframe script).
 * This function should be called from the browser context.
 */
export function getElementInfoScript(): string {
  return `
    function getElementInfo(element) {
      const tagName = element.tagName;
      const id = element.id || undefined;
      const classList = Array.from(element.classList);
      const attributes = {};
      
      // Collect data-* attributes
      for (const attr of element.attributes) {
        if (attr.name.startsWith('data-')) {
          attributes[attr.name] = attr.value;
        }
      }
      
      // Calculate nth-of-type
      let nthOfType = 1;
      let sibling = element.previousElementSibling;
      while (sibling) {
        if (sibling.tagName === tagName) {
          nthOfType++;
        }
        sibling = sibling.previousElementSibling;
      }
      
      // Build parent path
      const parentPath = [];
      let parent = element.parentElement;
      while (parent && parent.tagName !== 'HTML') {
        const pInfo = {
          tagName: parent.tagName,
          id: parent.id || undefined,
          classList: Array.from(parent.classList),
          attributes: {},
          nthOfType: 1
        };
        
        for (const attr of parent.attributes) {
          if (attr.name.startsWith('data-')) {
            pInfo.attributes[attr.name] = attr.value;
          }
        }
        
        let pSibling = parent.previousElementSibling;
        while (pSibling) {
          if (pSibling.tagName === parent.tagName) {
            pInfo.nthOfType++;
          }
          pSibling = pSibling.previousElementSibling;
        }
        
        parentPath.unshift(pInfo);
        parent = parent.parentElement;
      }
      
      return {
        tagName,
        id,
        classList,
        attributes,
        nthOfType,
        parentPath
      };
    }
  `
}
