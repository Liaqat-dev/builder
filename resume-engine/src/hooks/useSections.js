/**
 * useSections Hook
 * =================
 * Manages resume sections (Experience, Education, Skills, etc.)
 * Supports nested sections and ATS-friendly structure.
 */

import { useState, useCallback } from 'react';
import { generateId, createDefaultSection } from '../utils/helpers';
import { SECTION_TYPES, ATS_SECTION_HEADERS } from '../utils/constants';

export function useSections(initialSections = []) {
  const [sections, setSections] = useState(initialSections);

  /**
   * Add a new section with ATS-friendly defaults
   */
  const addSection = useCallback((config = {}) => {
    const newSection = createDefaultSection({
      id: generateId('section'),
      title: config.title || 'New Section',
      type: config.type || SECTION_TYPES.CUSTOM,
      x: config.x || 50,
      y: config.y || 200,
      width: config.width || 500,
      height: config.height || 150,
      backgroundColor: '#ffffff',
      borderColor: '#e5e7eb',
      contentType: 'text',
      direction: 'vertical',
      atsHeader: config.atsHeader || null, // Maps to standard ATS headers
      readingOrder: sections.length + 1,    // For ATS reading order
      ...config
    });

    setSections(prev => [...prev, newSection]);
    return newSection;
  }, [sections.length]);

  /**
   * Add predefined ATS-friendly section
   */
  const addATSSection = useCallback((type) => {
    const atsConfig = ATS_SECTION_HEADERS[type];
    if (!atsConfig) return null;

    return addSection({
      title: atsConfig.title,
      type,
      atsHeader: type,
      contentType: atsConfig.contentType || 'text',
      suggestedKeywords: atsConfig.keywords || []
    });
  }, [addSection]);

  /**
   * Update a section
   */
  const updateSection = useCallback((id, updates) => {
    setSections(prev => prev.map(sec =>
      sec.id === id ? { ...sec, ...updates } : sec
    ));
  }, []);

  /**
   * Delete sections
   */
  const deleteSections = useCallback((ids) => {
    const idSet = new Set(ids);
    setSections(prev => prev.filter(sec => !idSet.has(sec.id)));
  }, []);

  /**
   * Add content to a section based on its type
   */
  const addContentToSection = useCallback((section, position = {}) => {
    if (!section) return null;

    const { x = section.x + 20, y = section.y + 50 } = position;
    
    // Calculate next position based on existing content
    const childElements = []; // Would be passed from parent
    const childSections = sections.filter(s => s.parentSection === section.id);

    let nextY = y;
    if (section.direction === 'vertical' && childSections.length > 0) {
      const lastChild = childSections[childSections.length - 1];
      nextY = lastChild.y + lastChild.height + 10;
    }

    // Return config for element/section to be created
    const contentConfig = {
      parentSection: section.id,
      x: section.direction === 'horizontal' ? x : section.x + 15,
      y: nextY
    };

    if (section.contentType === 'list-sections') {
      // Create a subsection
      return {
        type: 'section',
        config: {
          ...contentConfig,
          title: 'Entry',
          width: section.width - 30,
          height: 100,
          contentType: 'text'
        }
      };
    }

    // Create an element
    return {
      type: 'element',
      config: {
        ...contentConfig,
        type: section.contentType === 'list-items' ? 'list-item' : 'text',
        content: section.contentType === 'list-items' ? '• New item' : 'New text',
        width: Math.min(section.width - 30, 450),
        height: 30
      }
    };
  }, [sections]);

  /**
   * Reorder sections for ATS reading order
   */
  const reorderSections = useCallback((orderedIds) => {
    setSections(prev => {
      const sectionMap = new Map(prev.map(sec => [sec.id, sec]));
      return orderedIds
        .filter(id => sectionMap.has(id))
        .map((id, index) => ({
          ...sectionMap.get(id),
          readingOrder: index + 1
        }));
    });
  }, []);

  /**
   * Get section hierarchy for ATS export
   */
  const getSectionHierarchy = useCallback(() => {
    const rootSections = sections.filter(s => !s.parentSection);
    
    const buildHierarchy = (parentId = null) => {
      return sections
        .filter(s => s.parentSection === parentId)
        .sort((a, b) => (a.readingOrder || 0) - (b.readingOrder || 0))
        .map(section => ({
          ...section,
          children: buildHierarchy(section.id)
        }));
    };

    return buildHierarchy(null);
  }, [sections]);

  /**
   * Find section at a point (for drop targeting)
   */
  const findSectionAtPoint = useCallback((x, y) => {
    // Search from top (highest z-index) to bottom
    for (let i = sections.length - 1; i >= 0; i--) {
      const section = sections[i];
      if (
        x >= section.x &&
        x <= section.x + section.width &&
        y >= section.y &&
        y <= section.y + section.height
      ) {
        return section;
      }
    }
    return null;
  }, [sections]);

  /**
   * Get all child sections
   */
  const getChildSections = useCallback((parentId) => {
    return sections.filter(s => s.parentSection === parentId);
  }, [sections]);

  return {
    sections,
    setSections,
    addSection,
    addATSSection,
    updateSection,
    deleteSections,
    addContentToSection,
    reorderSections,
    getSectionHierarchy,
    findSectionAtPoint,
    getChildSections
  };
}
