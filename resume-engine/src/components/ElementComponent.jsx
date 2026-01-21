/**
 * ElementComponent
 * ==================
 * Renders a single text/content element on the canvas.
 */

import { ResizeHandle } from './ResizeHandle';

export function ElementComponent({
  element,
  isSelected,
  isSingleSelected,
  isDragging,
  isPreview,
  onMouseDown,
  onUpdate,
  onResizeStart
}) {
  return (
    <div
      className={`element ${isSelected ? 'selected' : ''} ${isPreview ? 'preview' : ''}`}
      onMouseDown={onMouseDown}
      style={{
        position: 'absolute',
        left: element.x,
        top: element.y,
        width: element.width,
        height: element.height,
        fontSize: element.fontSize || 14,
        fontWeight: element.fontWeight || 'normal',
        fontFamily: element.fontFamily || 'Arial',
        color: element.color || '#000000',
        textAlign: element.textAlign || 'left',
        lineHeight: element.lineHeight || 1.4,
        cursor: isPreview ? 'default' : (isDragging ? 'grabbing' : 'move'),
        zIndex: isSelected ? 20 : 10
      }}
    >
      {/* Editable Content */}
      <div
        className="element-content"
        contentEditable={!isPreview}
        suppressContentEditableWarning
        onFocus={() => {
          if (!isSelected && !isPreview) {
            // Will trigger selection through parent
          }
        }}
        onBlur={(e) => {
          if (!isPreview) {
            onUpdate({ content: e.target.innerText });
          }
        }}
        style={{
          cursor: isPreview ? 'default' : 'text',
          outline: 'none',
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          wordWrap: 'break-word'
        }}
      >
        {element.content}
      </div>

      {/* ATS Field Indicator (editor only) */}
      {!isPreview && element.atsField && (
        <span className="ats-indicator" title={`ATS Field: ${element.atsField}`}>
          🎯
        </span>
      )}

      {/* Resize Handles */}
      {isSingleSelected && !isPreview && (
        <>
          {['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'].map(pos => (
            <ResizeHandle
              key={pos}
              position={pos}
              onMouseDown={(e) => onResizeStart(e, pos)}
            />
          ))}
        </>
      )}

      <style>{`
        .element {
          box-sizing: border-box;
          padding: 4px;
          border: 2px solid transparent;
          user-select: none;
          transition: 
            border-color 0.15s ease,
            background-color 0.15s ease;
        }

        .element:not(.preview):hover {
          border-color: rgba(59, 130, 246, 0.3);
          background-color: rgba(59, 130, 246, 0.02);
        }

        .element.selected {
          border-color: var(--accent-color, #3b82f6);
          background-color: rgba(59, 130, 246, 0.05);
        }

        .element.preview {
          border: none;
          padding: 0;
        }

        .element-content {
          width: 100%;
          height: 100%;
        }

        .element-content:focus {
          background-color: rgba(59, 130, 246, 0.03);
        }

        .ats-indicator {
          position: absolute;
          top: -8px;
          right: -8px;
          font-size: 12px;
          background: white;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}
