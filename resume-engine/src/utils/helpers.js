/**
 * Helper Utilities
 * =================
 * Common utility functions for the resume builder.
 */

import { 
  DEFAULT_ELEMENT_STYLE, 
  DEFAULT_SECTION_STYLE,
  ATS_FRIENDLY_FONTS 
} from './constants';

// ============================================
// ID Generation
// ============================================

let idCounter = 0;

/**
 * Generate a unique ID
 */
export function generateId(prefix = 'el') {
  return `${prefix}-${Date.now()}-${++idCounter}`;
}

/**
 * Generate a UUID v4
 */
export function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// ============================================
// Element/Section Creation
// ============================================

/**
 * Create a default element with merged overrides
 */
export function createDefaultElement(overrides = {}) {
  return {
    id: generateId(),
    type: 'text',
    content: 'New Text',
    x: 50,
    y: 100,
    width: 200,
    height: 30,
    ...DEFAULT_ELEMENT_STYLE,
    parentSection: null,
    semanticTag: 'p',
    atsField: null,
    ...overrides
  };
}

/**
 * Create a default section with merged overrides
 */
export function createDefaultSection(overrides = {}) {
  return {
    id: generateId('section'),
    type: 'section',
    title: 'New Section',
    x: 50,
    y: 200,
    width: 500,
    height: 150,
    ...DEFAULT_SECTION_STYLE,
    contentType: 'text',
    direction: 'vertical',
    parentSection: null,
    atsHeader: null,
    readingOrder: 0,
    ...overrides
  };
}

// ============================================
// Geometry Utilities
// ============================================

/**
 * Check if a point is inside a rectangle
 */
export function pointInRect(x, y, rect) {
  return (
    x >= rect.x &&
    x <= rect.x + rect.width &&
    y >= rect.y &&
    y <= rect.y + rect.height
  );
}

/**
 * Check if two rectangles overlap
 */
export function rectsOverlap(rect1, rect2) {
  return !(
    rect1.x + rect1.width < rect2.x ||
    rect2.x + rect2.width < rect1.x ||
    rect1.y + rect1.height < rect2.y ||
    rect2.y + rect2.height < rect1.y
  );
}

/**
 * Get bounding box for multiple items
 */
export function getBoundingBox(items) {
  if (items.length === 0) return null;

  let minX = Infinity, minY = Infinity;
  let maxX = -Infinity, maxY = -Infinity;

  items.forEach(item => {
    minX = Math.min(minX, item.x);
    minY = Math.min(minY, item.y);
    maxX = Math.max(maxX, item.x + item.width);
    maxY = Math.max(maxY, item.y + item.height);
  });

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY
  };
}

/**
 * Calculate center of a rectangle
 */
export function getCenter(rect) {
  return {
    x: rect.x + rect.width / 2,
    y: rect.y + rect.height / 2
  };
}

/**
 * Snap value to grid
 */
export function snapToGrid(value, gridSize = 10) {
  return Math.round(value / gridSize) * gridSize;
}

// ============================================
// Text Utilities
// ============================================

/**
 * Escape HTML entities
 */
export function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

/**
 * Strip HTML tags
 */
export function stripHtml(html) {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

/**
 * Count words in text
 */
export function countWords(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text, maxLength) {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

// ============================================
// Color Utilities
// ============================================

/**
 * Validate hex color
 */
export function isValidHex(color) {
  return /^#[0-9A-F]{6}$/i.test(color);
}

/**
 * Convert hex to RGB
 */
export function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * Get contrasting text color (black or white)
 */
export function getContrastColor(hexColor) {
  const rgb = hexToRgb(hexColor);
  if (!rgb) return '#000000';
  
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.5 ? '#000000' : '#ffffff';
}

// ============================================
// Font Utilities
// ============================================

/**
 * Check if font is ATS-friendly
 */
export function isATSFriendlyFont(fontFamily) {
  return ATS_FRIENDLY_FONTS.some(
    font => font.toLowerCase() === fontFamily.toLowerCase()
  );
}

/**
 * Get closest ATS-friendly font
 */
export function getATSFriendlyAlternative(fontFamily) {
  const lower = fontFamily.toLowerCase();
  
  // Map common non-ATS fonts to alternatives
  const alternatives = {
    'inter': 'Arial',
    'roboto': 'Arial',
    'open sans': 'Arial',
    'lato': 'Arial',
    'montserrat': 'Verdana',
    'poppins': 'Trebuchet MS',
    'playfair display': 'Georgia',
    'merriweather': 'Georgia',
    'source sans pro': 'Arial'
  };

  return alternatives[lower] || 'Arial';
}

// ============================================
// Date Utilities
// ============================================

/**
 * Format date for resume (Month Year)
 */
export function formatResumeDate(date) {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

/**
 * Format date range
 */
export function formatDateRange(startDate, endDate, isCurrent = false) {
  const start = formatResumeDate(startDate);
  const end = isCurrent ? 'Present' : formatResumeDate(endDate);
  return `${start} – ${end}`;
}

// ============================================
// Sorting Utilities
// ============================================

/**
 * Sort items by reading order (top to bottom, left to right)
 */
export function sortByReadingOrder(items) {
  return [...items].sort((a, b) => {
    // If items are roughly on same line (within 20px), sort by x
    if (Math.abs(a.y - b.y) < 20) {
      return a.x - b.x;
    }
    return a.y - b.y;
  });
}

/**
 * Sort sections by hierarchy
 */
export function buildSectionTree(sections) {
  const map = new Map();
  const roots = [];

  // First pass: create map
  sections.forEach(sec => {
    map.set(sec.id, { ...sec, children: [] });
  });

  // Second pass: build tree
  sections.forEach(sec => {
    const node = map.get(sec.id);
    if (sec.parentSection && map.has(sec.parentSection)) {
      map.get(sec.parentSection).children.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots.sort((a, b) => a.y - b.y);
}

// ============================================
// Debounce/Throttle
// ============================================

/**
 * Debounce function
 */
export function debounce(fn, delay) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Throttle function
 */
export function throttle(fn, limit) {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// ============================================
// Deep Clone
// ============================================

/**
 * Deep clone an object
 */
export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(deepClone);
  
  const cloned = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  return cloned;
}

// ============================================
// Export Helpers
// ============================================

/**
 * Download blob as file
 */
export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Clipboard copy failed:', err);
    
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    
    try {
      document.execCommand('copy');
      return true;
    } catch (e) {
      return false;
    } finally {
      document.body.removeChild(textarea);
    }
  }
}
