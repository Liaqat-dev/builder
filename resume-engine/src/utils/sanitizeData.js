/**
 * deepCleanForJSON.js
 * ===================
 * AGGRESSIVE data cleaning for JSON serialization.
 * Deep clones objects and strips ALL non-serializable properties.
 */

/**
 * Deep clean any value for JSON serialization
 */
function deepClean(value, seen = new WeakSet()) {
  // Handle null/undefined
  if (value === null || value === undefined) {
    return value;
  }

  // Handle primitives (string, number, boolean)
  const type = typeof value;
  if (type === 'string' || type === 'number' || type === 'boolean') {
    return value;
  }

  // Skip functions
  if (type === 'function') {
    return undefined;
  }

  // Handle Date
  if (value instanceof Date) {
    return value.toISOString();
  }

  // Detect circular references
  if (type === 'object' && seen.has(value)) {
    return undefined;
  }

  // Handle arrays
  if (Array.isArray(value)) {
    seen.add(value);
    return value
        .map(item => deepClean(item, seen))
        .filter(item => item !== undefined);
  }

  // Skip DOM elements and React nodes
  if (value instanceof Element ||
      value instanceof Node ||
      (value.$$typeof && typeof value.$$typeof === 'symbol')) {
    return undefined;
  }

  // Handle plain objects
  if (type === 'object') {
    seen.add(value);
    const cleaned = {};

    for (const key in value) {
      // Skip inherited properties
      if (!value.hasOwnProperty(key)) continue;

      // Skip React/DOM internal properties
      if (
          key.startsWith('__react') ||
          key.startsWith('_react') ||
          key.startsWith('$$') ||
          key === 'ref' ||
          key === 'key' ||
          key === '_owner' ||
          key === '_store'
      ) {
        continue;
      }

      // Skip symbols
      if (typeof key === 'symbol') {
        continue;
      }

      const cleanedValue = deepClean(value[key], seen);
      if (cleanedValue !== undefined) {
        cleaned[key] = cleanedValue;
      }
    }

    return cleaned;
  }

  return undefined;
}

/**
 * Create a completely clean copy safe for JSON.stringify
 */
export function safeJSONClone(data) {
  try {
    // First pass: deep clean
    const cleaned = deepClean(data);

    // Second pass: verify it's serializable by actually stringifying
    const jsonString = JSON.stringify(cleaned);

    // Third pass: parse it back to ensure no data corruption
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Failed to create safe JSON clone:', error);
    // Fallback: return minimal structure
    return Array.isArray(data) ? [] : {};
  }
}

/**
 * Export template with guaranteed no circular references
 */
export function exportCleanTemplate(elements, sections, templateName) {
  // Use safeJSONClone on the entire structure
  const template = {
    name: templateName || 'Untitled Resume',
    version: '2.0',
    exportedAt: new Date().toISOString(),
    data: {
      elements: elements || [],
      sections: sections || [],
      canvasSettings: {
        width: '210mm',
        height: '297mm',
        backgroundColor: 'white',
        margins: { top: 40, right: 40, bottom: 40, left: 40 }
      }
    },
    metadata: {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      elementCount: (elements || []).length,
      sectionCount: (sections || []).length
    }
  };

  // Deep clean the entire template
  return safeJSONClone(template);
}

/**
 * Safely stringify with fallback
 */
export function safeStringify(data, indent = 2) {
  try {
    const cleaned = safeJSONClone(data);
    return JSON.stringify(cleaned, null, indent);
  } catch (error) {
    console.error('Safe stringify failed:', error);
    // Ultimate fallback
    return JSON.stringify({ error: 'Failed to serialize data' }, null, indent);
  }
}