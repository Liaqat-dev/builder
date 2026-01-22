/**
 * useSections Hook (ENHANCED)
 * ============================
 * Manages resume sections with:
 * - Auto-reordering when dragging sections
 * - Overlap prevention
 * - Dynamic reorganization
 * - Support for bullets and subsections
 */

import { useState, useCallback } from 'react';
import { generateId, createDefaultSection } from '../utils/helpers';
import { SECTION_TYPES, ATS_SECTION_HEADERS } from '../utils/constants';

export function useSections(initialSections = []) {
  const [sections, setSections] = useState(initialSections);
  const [bulletLists, setBulletLists] = useState([]);
  const [subsections, setSubsections] = useState([]);

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
      atsHeader: config.atsHeader || null,
      readingOrder: sections.length + 1,
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
    // Also remove associated bullets and subsections
    setBulletLists(prev => prev.filter(bl => !idSet.has(bl.parentSection)));
    setSubsections(prev => prev.filter(sub => !idSet.has(sub.parentSection)));
  }, []);

  /**
   * Add bullet list
   */
  const addBulletList = useCallback((config) => {
    const newBulletList = {
      id: generateId('bullets'),
      ...config
    };
    setBulletLists(prev => [...prev, newBulletList]);
    return newBulletList;
  }, []);

  /**
   * Update bullet list
   */
  const updateBulletList = useCallback((id, updates) => {
    setBulletLists(prev => prev.map(bl =>
        bl.id === id ? { ...bl, ...updates } : bl
    ));
  }, []);

  /**
   * Add subsection
   */
  const addSubsection = useCallback((config) => {
    const newSubsection = {
      id: generateId('subsection'),
      fieldValues: {},
      ...config
    };
    setSubsections(prev => [...prev, newSubsection]);
    return newSubsection;
  }, []);

  /**
   * Update subsection
   */
  const updateSubsection = useCallback((id, updates) => {
    setSubsections(prev => prev.map(sub =>
        sub.id === id ? { ...sub, ...updates } : sub
    ));
  }, []);

  /**
   * Auto-reorder sections when one is dragged
   * Prevents overlaps and reorganizes dynamically
   */
  const autoReorderSections = useCallback((draggedId, newY) => {
    setSections(prev => {
      const draggedSection = prev.find(s => s.id === draggedId);
      if (!draggedSection) return prev;

      // Filter out dragged section and sort remaining by Y position
      const otherSections = prev
          .filter(s => s.id !== draggedId && !s.parentSection)
          .sort((a, b) => a.y - b.y);

      // Find where to insert the dragged section
      let insertIndex = otherSections.findIndex(s => s.y > newY);
      if (insertIndex === -1) insertIndex = otherSections.length;

      // Insert dragged section at new position
      const reordered = [
        ...otherSections.slice(0, insertIndex),
        { ...draggedSection, y: newY },
        ...otherSections.slice(insertIndex)
      ];

      // Reorganize sections to prevent overlap
      let currentY = 50; // Starting Y position
      const spacing = 20; // Gap between sections

      return reordered.map(section => {
        const adjustedY = currentY;
        currentY += section.height + spacing;
        return {
          ...section,
          y: adjustedY,
          readingOrder: reordered.indexOf(section) + 1
        };
      });
    });
  }, []);

  /**
   * Check if section overlaps with others
   */
  const checkOverlap = useCallback((section, ignoredIds = []) => {
    const ignoreSet = new Set(ignoredIds);

    return sections.some(other => {
      if (other.id === section.id || ignoreSet.has(other.id)) return false;

      // Check bounding box overlap
      return !(
          section.x + section.width < other.x ||
          section.x > other.x + other.width ||
          section.y + section.height < other.y ||
          section.y > other.y + other.height
      );
    });
  }, [sections]);

  /**
   * Reposition section to avoid overlaps
   */
  const repositionToAvoidOverlap = useCallback((sectionId) => {
    setSections(prev => {
      const section = prev.find(s => s.id === sectionId);
      if (!section) return prev;

      const otherSections = prev
          .filter(s => s.id !== sectionId && !s.parentSection)
          .sort((a, b) => a.y - b.y);

      // Find a non-overlapping Y position
      let newY = section.y;
      let overlapping = true;
      const maxAttempts = 20;
      let attempts = 0;

      while (overlapping && attempts < maxAttempts) {
        overlapping = otherSections.some(other => {
          return !(
              newY + section.height < other.y ||
              newY > other.y + other.height
          );
        });

        if (overlapping) {
          // Find the next available spot
          const blockingSection = otherSections.find(other =>
              !(newY + section.height < other.y || newY > other.y + other.height)
          );
          if (blockingSection) {
            newY = blockingSection.y + blockingSection.height + 20;
          }
        }

        attempts++;
      }

      return prev.map(s => s.id === sectionId ? { ...s, y: newY } : s);
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

  return {
    sections,
    setSections,
    addSection,
    addATSSection,
    updateSection,
    deleteSections,

    // Bullet lists
    bulletLists,
    addBulletList,
    updateBulletList,

    // Subsections
    subsections,
    addSubsection,
    updateSubsection,

    // Reordering
    autoReorderSections,
    checkOverlap,
    repositionToAvoidOverlap,
    getSectionHierarchy,
    findSectionAtPoint
  };
}