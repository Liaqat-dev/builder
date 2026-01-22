/**
 * SubsectionComponent
 * ===================
 * Renders structured subsections (Experience, Education, Projects, etc.)
 * with template-based fields that can be edited inline.
 */

import { ResizeHandle } from './ResizeHandle';

export function SubsectionComponent({
  subsection,
  isSelected,
  isSingleSelected,
  isDragging,
  isPreview,
  onMouseDown,
  onUpdate,
  onResizeStart
}) {
  // Default field values if not set
  const fields = subsection.fieldValues || {};

  const handleFieldUpdate = (fieldName, value) => {
    const updatedFields = { ...fields, [fieldName]: value };
    onUpdate({ fieldValues: updatedFields });
  };

  // Template configurations
  const templates = {
    experience: {
      layout: 'header-bullets',
      headerFields: ['Company', 'Position', 'Date Range'],
      detailFields: ['Responsibilities']
    },
    education: {
      layout: 'header-details',
      headerFields: ['School', 'Degree', 'Graduation Date'],
      detailFields: ['Field of Study', 'GPA']
    },
    project: {
      layout: 'header-bullets',
      headerFields: ['Project Name', 'Role', 'Date'],
      detailFields: ['Technologies', 'Description']
    },
    certification: {
      layout: 'header-details',
      headerFields: ['Certification Name', 'Issuing Organization'],
      detailFields: ['Date', 'Credential ID']
    },
    custom: {
      layout: 'header-details',
      headerFields: ['Title', 'Subtitle'],
      detailFields: ['Details']
    }
  };

  const template = templates[subsection.templateType] || templates.custom;

  return (
    <div
      className={`subsection ${isSelected ? 'selected' : ''}`}
      onMouseDown={onMouseDown}
      style={{
        position: 'absolute',
        left: subsection.x,
        top: subsection.y,
        width: subsection.width,
        height: subsection.height,
        cursor: isDragging ? 'grabbing' : 'move'
      }}
    >
      {/* Header Row */}
      <div className="subsection-header">
        {template.headerFields.map((field, index) => (
          <div
            key={field}
            className={`header-field ${index === template.headerFields.length - 1 ? 'date-field' : ''}`}
          >
            <div
              className="field-content"
              contentEditable={!isPreview}
              suppressContentEditableWarning
              onBlur={(e) => handleFieldUpdate(field, e.target.innerText)}
              onMouseDown={(e) => e.stopPropagation()}
              data-placeholder={field}
            >
              {fields[field] || ''}
            </div>
          </div>
        ))}
      </div>

      {/* Detail Fields */}
      <div className="subsection-details">
        {template.detailFields.map(field => (
          <div key={field} className="detail-field">
            {field === 'Responsibilities' || field === 'Description' ? (
              <ul className="detail-bullets">
                {(fields[field] || '').split('\n').filter(Boolean).map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
                {!isPreview && (
                  <li
                    className="editable-bullet"
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => {
                      const currentValue = fields[field] || '';
                      const lines = currentValue.split('\n').filter(Boolean);
                      lines.push(e.target.innerText);
                      handleFieldUpdate(field, lines.join('\n'));
                      e.target.innerText = '';
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    data-placeholder="• Add bullet point"
                  />
                )}
              </ul>
            ) : (
              <div
                className="detail-content"
                contentEditable={!isPreview}
                suppressContentEditableWarning
                onBlur={(e) => handleFieldUpdate(field, e.target.innerText)}
                onMouseDown={(e) => e.stopPropagation()}
                data-placeholder={field}
              >
                {fields[field] || ''}
              </div>
            )}
          </div>
        ))}
      </div>

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
        .subsection {
          box-sizing: border-box;
          padding: 12px 16px;
          border: 2px solid transparent;
          border-radius: 8px;
          background: white;
          transition: border-color 0.15s ease;
          font-family: Arial, sans-serif;
        }

        .subsection.selected {
          border-color: var(--accent-color, #3b82f6);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .subsection-header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 8px;
          gap: 12px;
        }

        .header-field {
          flex: 1;
        }

        .header-field.date-field {
          flex: 0 0 auto;
          min-width: 120px;
          text-align: right;
        }

        .field-content {
          outline: none;
          cursor: text;
          min-height: 20px;
          padding: 2px 4px;
          border-radius: 4px;
          transition: background 0.15s;
        }

        .header-field:first-child .field-content {
          font-weight: bold;
          font-size: 12pt;
          color: #111;
        }

        .header-field:nth-child(2) .field-content {
          font-weight: 600;
          font-size: 11pt;
          color: #374151;
        }

        .date-field .field-content {
          font-size: 10pt;
          color: #6b7280;
          font-style: italic;
        }

        .field-content:focus {
          background: rgba(59, 130, 246, 0.05);
        }

        .field-content:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          font-weight: normal;
        }

        .subsection-details {
          margin-top: 8px;
        }

        .detail-field {
          margin-bottom: 8px;
        }

        .detail-content {
          font-size: 10.5pt;
          color: #374151;
          outline: none;
          cursor: text;
          min-height: 18px;
          padding: 2px 4px;
          border-radius: 4px;
          transition: background 0.15s;
        }

        .detail-content:focus {
          background: rgba(59, 130, 246, 0.05);
        }

        .detail-content:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
        }

        .detail-bullets {
          list-style-type: disc;
          padding-left: 20px;
          margin: 0;
        }

        .detail-bullets li {
          font-size: 10.5pt;
          color: #374151;
          line-height: 1.5;
          margin-bottom: 4px;
        }

        .editable-bullet {
          outline: none;
          cursor: text;
          min-height: 18px;
          color: #9ca3af;
        }

        .editable-bullet:focus {
          color: #374151;
        }

        .editable-bullet:empty:before {
          content: attr(data-placeholder);
        }
      `}</style>
    </div>
  );
}
