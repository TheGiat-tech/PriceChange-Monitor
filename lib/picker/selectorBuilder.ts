/**
 * Generate a stable CSS selector for an element.
 * Prioritizes stable attributes over fragile positional selectors.
 */

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
  if (className.length >= 3 && className.length <= 20 && /^[a-z][a-z0-9-_]*$/i.test(className)) {
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
 */
export function buildSelector(element: ElementInfo): string {
  // 1. Check for stable data-* attributes
  for (const attr of DATA_ATTRIBUTES) {
    const value = element.attributes[attr]
    if (value) {
      return `[${attr}="${escapeSelector(value)}"]`
    }
  }

  // 2. Check for a stable ID
  if (element.id && !isRandomId(element.id)) {
    return `#${escapeSelector(element.id)}`
  }

  // 3. Try to build with stable classes
  const stableClasses = element.classList.filter(isStableClass)
  if (stableClasses.length > 0) {
    const classSelector = stableClasses.slice(0, 2).map(c => `.${escapeSelector(c)}`).join('')
    const baseSelector = element.tagName.toLowerCase() + classSelector

    // If we have a unique-looking selector, return it
    if (stableClasses.length >= 1) {
      return baseSelector
    }
  }

  // 4. Build a path-based selector using parent elements
  const pathParts: string[] = []
  
  // Include up to 3 parents for context
  const ancestors = [...element.parentPath].slice(-3)
  
  for (const ancestor of ancestors) {
    const part = buildSimpleSelector(ancestor)
    if (part) {
      pathParts.push(part)
    }
  }

  // Add the target element
  const targetPart = buildSimpleSelector(element) || 
    `${element.tagName.toLowerCase()}:nth-of-type(${element.nthOfType})`
  pathParts.push(targetPart)

  return pathParts.join(' > ')
}

function buildSimpleSelector(element: ElementInfo): string | null {
  // Check for data attributes
  for (const attr of DATA_ATTRIBUTES) {
    const value = element.attributes[attr]
    if (value) {
      return `[${attr}="${escapeSelector(value)}"]`
    }
  }

  // Check for stable ID
  if (element.id && !isRandomId(element.id)) {
    return `#${escapeSelector(element.id)}`
  }

  // Check for stable classes
  const stableClasses = element.classList.filter(isStableClass)
  if (stableClasses.length > 0) {
    return element.tagName.toLowerCase() + 
      stableClasses.slice(0, 2).map(c => `.${escapeSelector(c)}`).join('')
  }

  return null
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
