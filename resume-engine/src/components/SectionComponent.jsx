/**
 * SectionComponent
 * =================
 * Renders a single section on the canvas with controls.
 */

import { ResizeHandle } from './ResizeHandle';

export function SectionComponent({
  section,
  isSelected,
  isSingleSelected,
  isDragging,
  childCount,
  showControls = true,
  onMouseDown,
  onUpdateSection,
  onAddContent,
  onResizeStart
}) {
  const contentTypeLabels = {
    'text': '📝 Text',
    'list-items': '📋 List',
    'list-sections': '📦 Entries'
  };

  const directionLabels = {
    'vertical': '↓',
    'horizontal': '→'
  };

  const placeholderText = {
    'text': '✨ Double-click or use + to add text',
    'list-items': '✨ Double-click or use + to add list item',
    'list-sections': '✨ Double-click or use + to add entry'
  };

  return (
    <div
      className={`section ${isSelected ? 'selected' : ''}`}
      onMouseDown={onMouseDown}
      style={{
        position: 'absolute',
        left: section.x,
        top: section.y,
        width: section.width,
        height: section.height,
        backgroundColor: section.backgroundColor || '#ffffff',
        borderColor: isSelected ? 'var(--accent-color, #3b82f6)' : (section.borderColor || '#e5e7eb'),
        cursor: isDragging ? 'grabbing' : 'move'
      }}
    >
      {/* Section Header */}
      {showControls && (
        <div className="section-header">
          <div
            className="section-title"
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => onUpdateSection(section.id, { title: e.target.innerText })}
            onMouseDown={(e) => e.stopPropagation()}
          >
            {section.title}
          </div>

          <div className="section-controls">
            {/* Content Type Selector */}
            <select
              value={section.contentType}
              onChange={(e) => {
                e.stopPropagation();
                onUpdateSection(section.id, { contentType: e.target.value });
              }}
              onMouseDown={(e) => e.stopPropagation()}
              className="section-select"
            >
              <option value="text">📝 Text</option>
              <option value="list-items">📋 List</option>
              <option value="list-sections">📦 Entries</option>
            </select>

            {/* Direction Selector */}
            <select
              value={section.direction}
              onChange={(e) => {
                e.stopPropagation();
                onUpdateSection(section.id, { direction: e.target.value });
              }}
              onMouseDown={(e) => e.stopPropagation()}
              className="section-select direction"
            >
              <option value="vertical">↓</option>
              <option value="horizontal">→</option>
            </select>

            {/* Add Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddContent();
              }}
              onMouseDown={(e) => e.stopPropagation()}
              className="section-add-btn"
              title="Add content to section"
            >
              +
            </button>

            {/* Child Count */}
            <span className="section-count" title="Items in section">
              {childCount}
            </span>
          </div>
        </div>
      )}

      {/* Empty State Placeholder */}
      {childCount === 0 && showControls && (
        <div className="section-placeholder">
          {placeholderText[section.contentType] || '✨ Add content'}
        </div>
      )}

      {/* Resize Handles */}
      {isSingleSelected && showControls && (
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
        .section {
          box-sizing: border-box;
          border: 2px solid;
          border-radius: 8px;
          padding: 12px;
          transition: 
            border-color 0.15s ease,
            box-shadow 0.15s ease;
        }

        .section.selected {
          border-width: 3px;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 8px;
          margin-bottom: 8px;
          border-bottom: 1px solid var(--border-color, #e5e7eb);
          gap: 8px;
          flex-wrap: wrap;
        }

        .section-title {
          font-size: 16px;
          font-weight: bold;
          color: var(--text-primary, #1f2937);
          outline: none;
          cursor: text;
          min-width: 100px;
          flex: 1;
          padding: 2px 4px;
          border-radius: 4px;
          transition: background 0.15s ease;
        }

        .section-title:hover {
          background: rgba(0, 0, 0, 0.03);
        }

        .section-title:focus {
          background: rgba(59, 130, 246, 0.08);
        }

        .section-controls {
          display: flex;
          gap: 6px;
          align-items: center;
        }

        .section-select {
          padding: 4px 8px;
          font-size: 11px;
          border: 1px solid var(--border-color, #d1d5db);
          border-radius: 4px;
          background: white;
          cursor: pointer;
          outline: none;
          transition: border-color 0.15s ease;
        }

        .section-select:hover {
          border-color: var(--accent-color, #3b82f6);
        }

        .section-select.direction {
          width: 40px;
          text-align: center;
        }

        .section-add-btn {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          font-weight: bold;
          border: none;
          border-radius: 6px;
          background: var(--success-color, #10b981);
          color: white;
          cursor: pointer;
          transition: 
            transform 0.15s ease,
            background 0.15s ease;
        }

        .section-add-btn:hover {
          background: #059669;
          transform: scale(1.05);
        }

        .section-add-btn:active {
          transform: scale(0.95);
        }

        .section-count {
          font-size: 11px;
          color: var(--text-muted, #6b7280);
          font-weight: 500;
          min-width: 24px;
          text-align: right;
        }

        .section-placeholder {
          color: var(--text-muted, #9ca3af);
          font-size: 12px;
          font-style: italic;
          text-align: center;
          padding: 40px 20px;
        }
      `}</style>
    </div>
  );
}
