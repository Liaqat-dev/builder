/**
 * useSelection Hook
 * ==================
 * Manages selection state for elements and sections.
 * Supports multi-select, toggle, and range selection.
 */

import { useState, useCallback } from 'react';

export function useSelection(initialSelection = []) {
  const [selectedIds, setSelectedIds] = useState(initialSelection);

  /**
   * Check if an item is selected
   */
  const isSelected = useCallback((id) => {
    return selectedIds.includes(id);
  }, [selectedIds]);

  /**
   * Clear all selections
   */
  const clearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  /**
   * Select a single item (clears previous selection)
   */
  const selectSingle = useCallback((id) => {
    setSelectedIds([id]);
  }, []);

  /**
   * Toggle selection of an item
   */
  const toggleSelection = useCallback((id) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(selectedId => selectedId !== id);
      }
      return [...prev, id];
    });
  }, []);

  /**
   * Add items to selection
   */
  const addToSelection = useCallback((ids) => {
    const idsArray = Array.isArray(ids) ? ids : [ids];
    setSelectedIds(prev => {
      const newSet = new Set([...prev, ...idsArray]);
      return Array.from(newSet);
    });
  }, []);

  /**
   * Remove items from selection
   */
  const removeFromSelection = useCallback((ids) => {
    const idsArray = Array.isArray(ids) ? ids : [ids];
    const idsSet = new Set(idsArray);
    setSelectedIds(prev => prev.filter(id => !idsSet.has(id)));
  }, []);

  /**
   * Select all provided items
   */
  const selectAll = useCallback((allIds) => {
    setSelectedIds(allIds);
  }, []);

  /**
   * Handle click with modifier keys
   */
  const handleSelectionClick = useCallback((id, event) => {
    if (event.shiftKey || event.ctrlKey || event.metaKey) {
      toggleSelection(id);
    } else {
      selectSingle(id);
    }
  }, [toggleSelection, selectSingle]);

  /**
   * Select items within a bounding box
   */
  const selectInBox = useCallback((items, box) => {
    const { minX, maxX, minY, maxY } = box;
    
    const selected = items.filter(item => {
      const centerX = item.x + item.width / 2;
      const centerY = item.y + item.height / 2;
      return (
        centerX >= minX &&
        centerX <= maxX &&
        centerY >= minY &&
        centerY <= maxY
      );
    });

    setSelectedIds(selected.map(item => item.id));
    return selected;
  }, []);

  /**
   * Get selection bounds (for multi-selection bounding box)
   */
  const getSelectionBounds = useCallback((items) => {
    const selectedItems = items.filter(item => selectedIds.includes(item.id));
    
    if (selectedItems.length === 0) return null;

    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;

    selectedItems.forEach(item => {
      minX = Math.min(minX, item.x);
      minY = Math.min(minY, item.y);
      maxX = Math.max(maxX, item.x + item.width);
      maxY = Math.max(maxY, item.y + item.height);
    });

    return { minX, minY, maxX, maxY };
  }, [selectedIds]);

  return {
    selectedIds,
    setSelectedIds,
    isSelected,
    clearSelection,
    selectSingle,
    toggleSelection,
    addToSelection,
    removeFromSelection,
    selectAll,
    handleSelectionClick,
    selectInBox,
    getSelectionBounds
  };
}
