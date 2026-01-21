/**
 * useElements Hook
 * =================
 * Manages all text/content elements in the resume.
 * Provides CRUD operations and utilities for elements.
 */

import { useState, useCallback } from 'react';
import { generateId, createDefaultElement } from '../utils/helpers';
import { ATS_FRIENDLY_FONTS, ELEMENT_TYPES } from '../utils/constants';

export function useElements(initialElements = null) {
  const [elements, setElements] = useState(initialElements || [
    createDefaultElement({
      id: '1',
      type: ELEMENT_TYPES.HEADER,
      content: 'Your Name',
      x: 50,
      y: 40,
      width: 500,
      height: 50,
      fontSize: 28,
      fontWeight: 'bold',
      semanticTag: 'h1', // ATS: semantic HTML tag
      atsField: 'name'   // ATS: field mapping
    }),
    createDefaultElement({
      id: '2',
      type: ELEMENT_TYPES.CONTACT,
      content: 'email@example.com | (555) 123-4567 | LinkedIn: /in/yourname',
      x: 50,
      y: 95,
      width: 500,
      height: 30,
      fontSize: 11,
      semanticTag: 'address',
      atsField: 'contact'
    })
  ]);

  /**
   * Add a new element
   */
  const addElement = useCallback((config = {}) => {
    const newElement = createDefaultElement({
      id: generateId(),
      ...config
    });
    
    setElements(prev => [...prev, newElement]);
    return newElement;
  }, []);

  /**
   * Update an existing element
   */
  const updateElement = useCallback((id, updates) => {
    setElements(prev => prev.map(el => 
      el.id === id ? { ...el, ...updates } : el
    ));
  }, []);

  /**
   * Delete multiple elements
   */
  const deleteElements = useCallback((ids) => {
    const idSet = new Set(ids);
    setElements(prev => prev.filter(el => !idSet.has(el.id)));
  }, []);

  /**
   * Duplicate elements
   */
  const duplicateElements = useCallback((ids) => {
    const idSet = new Set(ids);
    const elementsToDuplicate = elements.filter(el => idSet.has(el.id));
    
    const duplicates = elementsToDuplicate.map(el => ({
      ...el,
      id: generateId(),
      x: el.x + 20,
      y: el.y + 20
    }));

    setElements(prev => [...prev, ...duplicates]);
    return duplicates.map(d => d.id);
  }, [elements]);

  /**
   * Get elements by parent section
   */
  const getElementsBySection = useCallback((sectionId) => {
    return elements.filter(el => el.parentSection === sectionId);
  }, [elements]);

  /**
   * Move elements to a section
   */
  const moveToSection = useCallback((elementIds, sectionId) => {
    setElements(prev => prev.map(el => 
      elementIds.includes(el.id) 
        ? { ...el, parentSection: sectionId }
        : el
    ));
  }, []);

  /**
   * Reorder elements (for accessibility/ATS reading order)
   */
  const reorderElements = useCallback((orderedIds) => {
    setElements(prev => {
      const elementMap = new Map(prev.map(el => [el.id, el]));
      const reordered = orderedIds
        .filter(id => elementMap.has(id))
        .map(id => elementMap.get(id));
      
      // Add any elements not in orderedIds
      prev.forEach(el => {
        if (!orderedIds.includes(el.id)) {
          reordered.push(el);
        }
      });
      
      return reordered;
    });
  }, []);

  /**
   * Bulk update elements (for applying styles to multiple)
   */
  const bulkUpdate = useCallback((ids, updates) => {
    const idSet = new Set(ids);
    setElements(prev => prev.map(el =>
      idSet.has(el.id) ? { ...el, ...updates } : el
    ));
  }, []);

  /**
   * Get ATS-optimized content
   */
  const getATSContent = useCallback(() => {
    // Sort elements by reading order (top to bottom, left to right)
    const sorted = [...elements].sort((a, b) => {
      if (Math.abs(a.y - b.y) < 20) {
        return a.x - b.x;
      }
      return a.y - b.y;
    });

    return sorted.map(el => ({
      field: el.atsField || 'text',
      content: el.content,
      tag: el.semanticTag || 'p'
    }));
  }, [elements]);

  return {
    elements,
    setElements,
    addElement,
    updateElement,
    deleteElements,
    duplicateElements,
    getElementsBySection,
    moveToSection,
    reorderElements,
    bulkUpdate,
    getATSContent
  };
}
