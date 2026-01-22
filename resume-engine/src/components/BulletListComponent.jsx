/**
 * BulletListComponent
 * ===================
 * Renders a customizable bullet list with multiple styles and columns.
 */

import { useState } from 'react';
import { ResizeHandle } from './ResizeHandle';

export function BulletListComponent({
  bulletList,
  isSelected,
  isSingleSelected,
  isDragging,
  isPreview,
  onMouseDown,
  onUpdate,
  onResizeStart
}) {
  const [editingIndex, setEditingIndex] = useState(null);

  const listTypeStyles = {
    'disc': { listStyleType: 'disc', marker: '•' },
    'circle': { listStyleType: 'circle', marker: '○' },
    'square': { listStyleType: 'square', marker: '■' },
    'decimal': { listStyleType: 'decimal', marker: '1.' },
    'lower-alpha': { listStyleType: 'lower-alpha', marker: 'a.' },
    'lower-roman': { listStyleType: 'lower-roman', marker: 'i.' }
  };

  const handleItemEdit = (index, newContent) => {
    const updatedItems = [...bulletList.items];
    updatedItems[index] = { ...updatedItems[index], content: newContent };
    onUpdate({ items: updatedItems });
  };

  const handleAddItem = () => {
    const newItem = {
      id: `bullet-${Date.now()}`,
      content: 'New bullet point'
    };
    onUpdate({ items: [...bulletList.items, newItem] });
  };

  const handleRemoveItem = (index) => {
    const updatedItems = bulletList.items.filter((_, i) => i !== index);
    onUpdate({ items: updatedItems });
  };

  const columns = bulletList.itemsPerRow || 1;
  const itemsPerColumn = Math.ceil(bulletList.items.length / columns);

  return (
    <div
      className={`bullet-list ${isSelected ? 'selected' : ''}`}
      onMouseDown={onMouseDown}
      style={{
        position: 'absolute',
        left: bulletList.x,
        top: bulletList.y,
        width: bulletList.width,
        height: bulletList.height,
        cursor: isDragging ? 'grabbing' : 'move'
      }}
    >
      <div className="bullet-container" style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: '8px 16px',
        color: bulletList.bulletColor || '#000000'
      }}>
        {bulletList.items.map((item, index) => (
          <div
            key={item.id}
            className="bullet-item"
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px'
            }}
          >
            <span
              className="bullet-marker"
              style={{
                color: bulletList.bulletColor || '#000000',
                fontWeight: 'bold',
                flexShrink: 0,
                marginTop: '2px'
              }}
            >
              {listTypeStyles[bulletList.listType]?.marker || '•'}
            </span>
            <div
              className="bullet-content"
              contentEditable={!isPreview}
              suppressContentEditableWarning
              onBlur={(e) => handleItemEdit(index, e.target.innerText)}
              onMouseDown={(e) => e.stopPropagation()}
              onFocus={() => setEditingIndex(index)}
              style={{
                flex: 1,
                outline: 'none',
                cursor: isPreview ? 'default' : 'text',
                fontSize: '11pt',
                lineHeight: '1.4',
                minHeight: '20px'
              }}
            >
              {item.content}
            </div>
            {!isPreview && editingIndex === index && (
              <button
                className="remove-bullet-btn"
                onClick={() => handleRemoveItem(index)}
                onMouseDown={(e) => e.stopPropagation()}
                title="Remove this bullet"
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Add Button */}
      {!isPreview && isSelected && (
        <button
          className="add-bullet-btn"
          onClick={handleAddItem}
          onMouseDown={(e) => e.stopPropagation()}
        >
          + Add Bullet
        </button>
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
        .bullet-list {
          box-sizing: border-box;
          padding: 12px 16px;
          border: 2px solid transparent;
          border-radius: 8px;
          background: white;
          transition: border-color 0.15s ease;
        }

        .bullet-list.selected {
          border-color: var(--accent-color, #3b82f6);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .bullet-item {
          position: relative;
        }

        .bullet-content:focus {
          background: rgba(59, 130, 246, 0.05);
          border-radius: 4px;
          padding: 2px 4px;
          margin: -2px -4px;
        }

        .remove-bullet-btn {
          width: 20px;
          height: 20px;
          border: none;
          background: #fee2e2;
          color: #dc2626;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
          line-height: 1;
          opacity: 0.6;
          transition: all 0.15s;
        }

        .remove-bullet-btn:hover {
          opacity: 1;
          background: #fecaca;
        }

        .add-bullet-btn {
          margin-top: 8px;
          padding: 6px 12px;
          border: 1px dashed var(--accent-color, #3b82f6);
          background: rgba(59, 130, 246, 0.05);
          color: var(--accent-color, #3b82f6);
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s;
          width: 100%;
        }

        .add-bullet-btn:hover {
          background: rgba(59, 130, 246, 0.1);
          border-color: #2563eb;
        }
      `}</style>
    </div>
  );
}
