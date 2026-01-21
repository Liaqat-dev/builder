/**
 * Canvas Component
 * =================
 * The main editing canvas for the resume builder.
 * Renders sections, elements, and handles interactions.
 */

import { forwardRef, useCallback } from 'react';
import { ResizeHandle,SelectionBox } from './ResizeHandle';
import { SectionComponent } from './SectionComponent';
import { ElementComponent } from './ElementComponent';
// import { SelectionBox } from './';
import { CANVAS_CONFIG } from '../utils/constants';

export const Canvas = forwardRef(function Canvas({
  elements,
  sections,
  selectedIds,
  isDragging,
  selectionBox,
  activeView,
  onElementMouseDown,
  onCanvasMouseDown,
  onDoubleClick,
  onUpdateElement,
  onUpdateSection,
  onAddContentToSection,
  onResizeStart
}, ref) {

  /**
   * Find section at a click point
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

  /**
   * Handle double click on canvas
   */
  const handleDoubleClick = useCallback((e) => {
    if (!ref.current) return;
    
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const section = findSectionAtPoint(x, y);
    onDoubleClick?.(e, section);
  }, [ref, findSectionAtPoint, onDoubleClick]);

  return (
    <div className="canvas-wrapper">
      {/* View mode indicator */}
      {activeView === 'preview' && (
        <div className="preview-banner">
          Preview Mode — How your resume will look when exported
        </div>
      )}

      {/* Main Canvas */}
      <div
        ref={ref}
        className={`canvas ${activeView === 'preview' ? 'preview-mode' : ''}`}
        onDoubleClick={handleDoubleClick}
        onMouseDown={onCanvasMouseDown}
        style={{
          width: CANVAS_CONFIG.width,
          minHeight: CANVAS_CONFIG.height,
          padding: `${CANVAS_CONFIG.margins.top}px ${CANVAS_CONFIG.margins.right}px`,
          cursor: isDragging ? 'grabbing' : 'crosshair'
        }}
      >
        {/* Render Sections */}
        {sections.map((section) => {
          const isSelected = selectedIds.includes(section.id);
          const childElements = elements.filter(el => el.parentSection === section.id);
          const childSections = sections.filter(s => s.parentSection === section.id);

          return (
            <SectionComponent
              key={section.id}
              section={section}
              isSelected={isSelected}
              isSingleSelected={isSelected && selectedIds.length === 1}
              isDragging={isDragging}
              childCount={childElements.length + childSections.length}
              showControls={activeView !== 'preview'}
              onMouseDown={(e) => onElementMouseDown(e, section.id)}
              onUpdateSection={onUpdateSection}
              onAddContent={() => onAddContentToSection(section)}
              onResizeStart={(e, handle) => onResizeStart?.(e, section.id, handle, true)}
            />
          );
        })}

        {/* Render Elements */}
        {elements.map((element) => {
          const isSelected = selectedIds.includes(element.id);

          return (
            <ElementComponent
              key={element.id}
              element={element}
              isSelected={isSelected}
              isSingleSelected={isSelected && selectedIds.length === 1}
              isDragging={isDragging}
              isPreview={activeView === 'preview'}
              onMouseDown={(e) => onElementMouseDown(e, element.id)}
              onUpdate={(updates) => onUpdateElement(element.id, updates)}
              onResizeStart={(e, handle) => onResizeStart?.(e, element.id, handle, false)}
            />
          );
        })}

        {/* Selection Box */}
        {selectionBox && <SelectionBox box={selectionBox} />}

        {/* Grid overlay (only in editor mode) */}
        {activeView === 'editor' && (
          <div className="grid-overlay" aria-hidden="true" />
        )}
      </div>

      <style>{`
        .canvas-wrapper {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 40px;
          background: var(--canvas-bg, #e5e7eb);
          overflow: auto;
        }

        .preview-banner {
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          color: white;
          padding: 12px 24px;
          border-radius: 8px;
          margin-bottom: 20px;
          font-weight: 600;
          font-size: 14px;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .canvas {
          position: relative;
          background: white;
          box-shadow: 
            0 4px 6px -1px rgba(0, 0, 0, 0.1),
            0 2px 4px -1px rgba(0, 0, 0, 0.06),
            0 0 0 1px rgba(0, 0, 0, 0.05);
          border-radius: 4px;
          transition: box-shadow 0.3s ease;
        }

        .canvas:hover {
          box-shadow: 
            0 10px 15px -3px rgba(0, 0, 0, 0.1),
            0 4px 6px -2px rgba(0, 0, 0, 0.05),
            0 0 0 1px rgba(0, 0, 0, 0.05);
        }

        .canvas.preview-mode {
          cursor: default;
          box-shadow: 
            0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }

        .grid-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: 
            linear-gradient(rgba(0, 0, 0, 0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 0, 0, 0.02) 1px, transparent 1px);
          background-size: 10px 10px;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.2s ease;
        }

        .canvas:hover .grid-overlay {
          opacity: 1;
        }
      `}</style>
    </div>
  );
});
