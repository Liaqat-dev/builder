/**
 * cleanForJSON.js
 * ===============
 * Utility to clean React data for JSON serialization.
 * Removes circular references and non-serializable properties.
 */

/**
 * Clean an object for JSON serialization
 * Removes React internals, DOM references, and circular structures
 */
export function cleanForJSON(obj) {
  if (obj === null || obj === undefined) {
    return obj;
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(item => cleanForJSON(item));
  }

  // Handle primitives
  if (typeof obj !== 'object') {
    return obj;
  }

  // Handle Date objects
  if (obj instanceof Date) {
    return obj.toISOString();
  }

  // Create clean object
  const cleaned = {};

  // Keys to skip (React internals and DOM references)
  const skipKeys = [
    '__reactFiber$',
    '__reactProps$',
    '__reactEvents$',
    '__reactInternalInstance$',
    '_owner',
    '_store',
    'ref',
    'key'
  ];

  for (const key in obj) {
    // Skip React internals and private properties
    if (skipKeys.some(skip => key.includes(skip))) {
      continue;
    }

    // Skip functions
    if (typeof obj[key] === 'function') {
      continue;
    }

    // Skip DOM elements
    if (obj[key] instanceof HTMLElement) {
      continue;
    }

    // Skip symbols
    if (typeof key === 'symbol') {
      continue;
    }

    try {
      cleaned[key] = cleanForJSON(obj[key]);
    } catch (error) {
      // Skip properties that can't be serialized
      console.warn(`Skipping non-serializable property: ${key}`);
    }
  }

  return cleaned;
}

/**
 * Clean elements array for JSON export
 */
export function cleanElements(elements) {
  return elements.map(element => ({
    id: element.id,
    type: element.type,
    content: element.content,
    x: element.x,
    y: element.y,
    width: element.width,
    height: element.height,
    fontSize: element.fontSize,
    fontWeight: element.fontWeight,
    fontFamily: element.fontFamily,
    color: element.color,
    textAlign: element.textAlign,
    lineHeight: element.lineHeight,
    parentSection: element.parentSection,
    semanticTag: element.semanticTag,
    atsField: element.atsField
  }));
}

/**
 * Clean sections array for JSON export
 */
export function cleanSections(sections) {
  return sections.map(section => ({
    id: section.id,
    title: section.title,
    type: section.type,
    x: section.x,
    y: section.y,
    width: section.width,
    height: section.height,
    backgroundColor: section.backgroundColor,
    borderColor: section.borderColor,
    contentType: section.contentType,
    direction: section.direction,
    atsHeader: section.atsHeader,
    readingOrder: section.readingOrder,
    parentSection: section.parentSection,
    suggestedKeywords: section.suggestedKeywords
  }));
}

/**
 * Create a clean template object for JSON export
 */
export function createCleanTemplate(elements, sections, templateName) {
  return {
    name: templateName,
    version: '2.0',
    data: {
      elements: cleanElements(elements),
      sections: cleanSections(sections),
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
      elementCount: elements.length,
      sectionCount: sections.length
    }
  };
}
