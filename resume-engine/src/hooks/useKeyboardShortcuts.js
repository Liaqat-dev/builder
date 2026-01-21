/**
 * useKeyboardShortcuts Hook
 * ==========================
 * Handles keyboard shortcuts for the resume builder.
 */

import { useEffect, useCallback } from 'react';

export function useKeyboardShortcuts({
  selectedIds = [],
  deleteElements,
  duplicateElements,
  selectAll,
  clearSelection,
  setShowCommandPalette,
  undo,
  redo
}) {
  const handleKeyDown = useCallback((e) => {
    // Skip if typing in an input or editable element
    const target = e.target;
    const isEditing = 
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.contentEditable === 'true';

    // Command palette (works always)
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      setShowCommandPalette?.(prev => !prev);
      return;
    }

    // Skip other shortcuts if editing
    if (isEditing && !['Escape'].includes(e.key)) {
      return;
    }

    // Delete/Backspace - Delete selected
    if ((e.key === 'Delete' || e.key === 'Backspace') && selectedIds.length > 0) {
      e.preventDefault();
      deleteElements?.();
      return;
    }

    // Escape - Clear selection
    if (e.key === 'Escape') {
      e.preventDefault();
      clearSelection?.();
      return;
    }

    // Cmd/Ctrl + A - Select all
    if ((e.metaKey || e.ctrlKey) && e.key === 'a') {
      e.preventDefault();
      selectAll?.();
      return;
    }

    // Cmd/Ctrl + D - Duplicate
    if ((e.metaKey || e.ctrlKey) && e.key === 'd') {
      e.preventDefault();
      if (selectedIds.length > 0) {
        duplicateElements?.();
      }
      return;
    }

    // Cmd/Ctrl + Z - Undo
    if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      undo?.();
      return;
    }

    // Cmd/Ctrl + Shift + Z or Cmd/Ctrl + Y - Redo
    if (
      ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'z') ||
      ((e.metaKey || e.ctrlKey) && e.key === 'y')
    ) {
      e.preventDefault();
      redo?.();
      return;
    }

    // Arrow keys - Nudge selected elements
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      if (selectedIds.length === 0) return;
      
      e.preventDefault();
      const delta = e.shiftKey ? 10 : 1;
      let dx = 0, dy = 0;

      switch (e.key) {
        case 'ArrowUp': dy = -delta; break;
        case 'ArrowDown': dy = delta; break;
        case 'ArrowLeft': dx = -delta; break;
        case 'ArrowRight': dx = delta; break;
      }

      // Nudge would be handled by parent
      // This hook just detects the intent
      return;
    }
  }, [
    selectedIds,
    deleteElements,
    duplicateElements,
    selectAll,
    clearSelection,
    setShowCommandPalette,
    undo,
    redo
  ]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return { handleKeyDown };
}
