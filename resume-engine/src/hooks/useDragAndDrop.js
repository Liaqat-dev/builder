/**
 * useDragAndDrop Hook
 * ====================
 * Handles all drag and drop operations including:
 * - Element/section dragging
 * - Multi-select dragging
 * - Selection box (marquee selection)
 * - Snap-to-grid functionality
 */

import { useState, useCallback, useRef } from 'react';

export function useDragAndDrop({
  elements,
  sections,
  selectedIds,
  setSelectedIds,
  updateElement,
  updateSection,
  canvasRef,
  snapToGrid = false,
  gridSize = 10
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectionBox, setSelectionBox] = useState(null);
  const dragStateRef = useRef(null);

  /**
   * Snap value to grid
   */
  const snap = useCallback((value) => {
    if (!snapToGrid) return value;
    return Math.round(value / gridSize) * gridSize;
  }, [snapToGrid, gridSize]);

  /**
   * Start dragging an item
   */
  const handleDragStart = useCallback((e, id) => {
    e.stopPropagation();

    // Don't drag if editing text
    if (e.target.getAttribute('contenteditable') === 'true') {
      return;
    }

    setIsDragging(true);

    const startX = e.clientX;
    const startY = e.clientY;

    // Collect all items that need to move
    let itemsToMove = new Set(selectedIds.includes(id) ? selectedIds : [id]);

    // Include children of selected sections
    selectedIds.forEach(selectedId => {
      if (selectedId.startsWith('section-')) {
        // Add child elements
        elements.forEach(el => {
          if (el.parentSection === selectedId) {
            itemsToMove.add(el.id);
          }
        });
        // Add child sections
        sections.forEach(sec => {
          if (sec.parentSection === selectedId) {
            itemsToMove.add(sec.id);
          }
        });
      }
    });

    // Store initial positions
    const initialPositions = new Map();
    
    itemsToMove.forEach(itemId => {
      const isSection = itemId.startsWith('section-');
      const item = isSection
        ? sections.find(s => s.id === itemId)
        : elements.find(el => el.id === itemId);
      
      if (item) {
        initialPositions.set(itemId, { x: item.x, y: item.y });
      }
    });

    dragStateRef.current = {
      startX,
      startY,
      itemsToMove,
      initialPositions
    };

    const handleMouseMove = (moveEvent) => {
      if (!dragStateRef.current) return;

      const { startX, startY, itemsToMove, initialPositions } = dragStateRef.current;
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      itemsToMove.forEach(itemId => {
        const initialPos = initialPositions.get(itemId);
        if (!initialPos) return;

        const newX = snap(initialPos.x + deltaX);
        const newY = snap(initialPos.y + deltaY);
        const isSection = itemId.startsWith('section-');

        if (isSection) {
          updateSection(itemId, { x: newX, y: newY });
        } else {
          updateElement(itemId, { x: newX, y: newY });
        }
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      dragStateRef.current = null;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [selectedIds, elements, sections, updateElement, updateSection, snap]);

  /**
   * Handle canvas click for selection box
   */
  const handleCanvasMouseDown = useCallback((e) => {
    if (!canvasRef.current) return;
    if (e.target !== canvasRef.current) return;

    // Clear selection on canvas click
    setSelectedIds([]);

    const rect = canvasRef.current.getBoundingClientRect();
    const startX = e.clientX - rect.left;
    const startY = e.clientY - rect.top;

    let currentBox = { startX, startY, endX: startX, endY: startY };
    setSelectionBox(currentBox);

    const handleMouseMove = (moveEvent) => {
      const endX = moveEvent.clientX - rect.left;
      const endY = moveEvent.clientY - rect.top;
      currentBox = { startX, startY, endX, endY };
      setSelectionBox(currentBox);
    };

    const handleMouseUp = () => {
      // Calculate selection bounds
      const minX = Math.min(currentBox.startX, currentBox.endX);
      const maxX = Math.max(currentBox.startX, currentBox.endX);
      const minY = Math.min(currentBox.startY, currentBox.endY);
      const maxY = Math.max(currentBox.startY, currentBox.endY);

      const selected = [];

      // Check sections
      sections.forEach(sec => {
        const centerX = sec.x + sec.width / 2;
        const centerY = sec.y + sec.height / 2;
        if (centerX >= minX && centerX <= maxX &&
            centerY >= minY && centerY <= maxY) {
          selected.push(sec.id);
        }
      });

      // Check elements
      elements.forEach(el => {
        const centerX = el.x + el.width / 2;
        const centerY = el.y + el.height / 2;
        if (centerX >= minX && centerX <= maxX &&
            centerY >= minY && centerY <= maxY) {
          selected.push(el.id);
        }
      });

      if (selected.length > 0) {
        setSelectedIds(selected);
      }

      setSelectionBox(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [canvasRef, sections, elements, setSelectedIds]);

  /**
   * Handle resize of an item
   */
  const handleResizeStart = useCallback((e, id, handle, isSection = false) => {
    e.stopPropagation();

    const item = isSection
      ? sections.find(s => s.id === id)
      : elements.find(el => el.id === id);

    if (!item) return;

    const startX = e.clientX;
    const startY = e.clientY;
    const { width: startWidth, height: startHeight, x: startPosX, y: startPosY } = item;

    const handleMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      let updates = {};

      switch (handle) {
        case 'se':
          updates = {
            width: snap(Math.max(50, startWidth + deltaX)),
            height: snap(Math.max(30, startHeight + deltaY))
          };
          break;
        case 'sw':
          updates = {
            x: snap(startPosX + deltaX),
            width: snap(Math.max(50, startWidth - deltaX)),
            height: snap(Math.max(30, startHeight + deltaY))
          };
          break;
        case 'ne':
          updates = {
            y: snap(startPosY + deltaY),
            width: snap(Math.max(50, startWidth + deltaX)),
            height: snap(Math.max(30, startHeight - deltaY))
          };
          break;
        case 'nw':
          updates = {
            x: snap(startPosX + deltaX),
            y: snap(startPosY + deltaY),
            width: snap(Math.max(50, startWidth - deltaX)),
            height: snap(Math.max(30, startHeight - deltaY))
          };
          break;
        case 'e':
          updates = { width: snap(Math.max(50, startWidth + deltaX)) };
          break;
        case 'w':
          updates = {
            x: snap(startPosX + deltaX),
            width: snap(Math.max(50, startWidth - deltaX))
          };
          break;
        case 'n':
          updates = {
            y: snap(startPosY + deltaY),
            height: snap(Math.max(30, startHeight - deltaY))
          };
          break;
        case 's':
          updates = { height: snap(Math.max(30, startHeight + deltaY)) };
          break;
      }

      if (isSection) {
        updateSection(id, updates);
      } else {
        updateElement(id, updates);
      }
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [elements, sections, updateElement, updateSection, snap]);

  return {
    isDragging,
    selectionBox,
    handleDragStart,
    handleCanvasMouseDown,
    handleResizeStart
  };
}
