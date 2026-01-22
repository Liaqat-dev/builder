/**
 * AddContentModal Component
 * ==========================
 * Modal for selecting content type to add to a section.
 * Supports: Text, Bullets (with customization), and Subsections
 */

import { useState } from 'react';

export function AddContentModal({ section, onAdd, onClose }) {
  const [selectedType, setSelectedType] = useState('text');
  const [bulletOptions, setBulletOptions] = useState({
    listType: 'disc',      // disc, circle, square, decimal, lower-alpha, lower-roman
    itemsPerRow: 1,        // For multi-column bullets
    bulletColor: '#000000'
  });
  const [subsectionOptions, setSubsectionOptions] = useState({
    templateType: 'experience' // experience, education, custom
  });

  const contentTypes = [
    {
      id: 'text',
      name: 'Text Element',
      icon: '📝',
      description: 'Add a simple text block'
    },
    {
      id: 'bullets',
      name: 'Bullet List',
      icon: '📋',
      description: 'Add a list with customizable bullets'
    },
    {
      id: 'subsection',
      name: 'Subsection',
      icon: '📦',
      description: 'Add structured entry (Experience, Education, etc.)'
    }
  ];

  const bulletTypes = [
    { value: 'disc', label: '• Disc', preview: '•' },
    { value: 'circle', label: '○ Circle', preview: '○' },
    { value: 'square', label: '■ Square', preview: '■' },
    { value: 'decimal', label: '1. Numbers', preview: '1.' },
    { value: 'lower-alpha', label: 'a. Letters', preview: 'a.' },
    { value: 'lower-roman', label: 'i. Roman', preview: 'i.' }
  ];

  const subsectionTemplates = [
    {
      value: 'experience',
      label: 'Work Experience',
      fields: ['Company', 'Position', 'Date Range', 'Responsibilities']
    },
    {
      value: 'education',
      label: 'Education',
      fields: ['School', 'Degree', 'Field of Study', 'Graduation Date', 'GPA']
    },
    {
      value: 'project',
      label: 'Project',
      fields: ['Project Name', 'Role', 'Technologies', 'Description']
    },
    {
      value: 'certification',
      label: 'Certification',
      fields: ['Certification Name', 'Issuing Organization', 'Date']
    },
    {
      value: 'custom',
      label: 'Custom Entry',
      fields: ['Title', 'Subtitle', 'Details']
    }
  ];

  const handleAdd = () => {
    const config = {
      parentSection: section.id,
      x: section.x + 15,
      y: section.y + 60
    };

    switch (selectedType) {
      case 'text':
        onAdd({
          type: 'element',
          config: {
            ...config,
            type: 'text',
            content: 'New text element',
            width: Math.min(section.width - 30, 450),
            height: 40,
            fontSize: 11,
            fontFamily: 'Arial',
            color: '#000000'
          }
        });
        break;

      case 'bullets':
        onAdd({
          type: 'bullets',
          config: {
            ...config,
            listType: bulletOptions.listType,
            itemsPerRow: bulletOptions.itemsPerRow,
            bulletColor: bulletOptions.bulletColor,
            items: [
              { id: '1', content: 'Bullet point 1' },
              { id: '2', content: 'Bullet point 2' },
              { id: '3', content: 'Bullet point 3' }
            ],
            width: Math.min(section.width - 30, 500),
            height: 100
          }
        });
        break;

      case 'subsection':
        const template = subsectionTemplates.find(t => t.value === subsectionOptions.templateType);
        onAdd({
          type: 'subsection',
          config: {
            ...config,
            templateType: subsectionOptions.templateType,
            title: template.label,
            fields: template.fields,
            width: section.width - 30,
            height: 120
          }
        });
        break;
    }

    onClose();
  };

  return (
    <>
      <div className="modal-backdrop" onClick={onClose} />
      
      <div className="add-content-modal">
        <div className="modal-header">
          <h2 className="modal-title">➕ Add Content to "{section.title}"</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {/* Content Type Selection */}
          <div className="type-section">
            <h3 className="section-label">Select Content Type</h3>
            <div className="type-grid">
              {contentTypes.map(type => (
                <button
                  key={type.id}
                  className={`type-card ${selectedType === type.id ? 'selected' : ''}`}
                  onClick={() => setSelectedType(type.id)}
                >
                  <span className="type-icon">{type.icon}</span>
                  <span className="type-name">{type.name}</span>
                  <span className="type-desc">{type.description}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Bullet Options */}
          {selectedType === 'bullets' && (
            <div className="options-section">
              <h3 className="section-label">Bullet Options</h3>
              
              <div className="field-group">
                <label className="field-label">Bullet Style</label>
                <div className="bullet-type-grid">
                  {bulletTypes.map(bt => (
                    <button
                      key={bt.value}
                      className={`bullet-type-btn ${bulletOptions.listType === bt.value ? 'selected' : ''}`}
                      onClick={() => setBulletOptions(prev => ({ ...prev, listType: bt.value }))}
                    >
                      <span className="bullet-preview">{bt.preview}</span>
                      <span className="bullet-label">{bt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="field-group">
                <label className="field-label">Items Per Row (Columns)</label>
                <select
                  className="field-select"
                  value={bulletOptions.itemsPerRow}
                  onChange={(e) => setBulletOptions(prev => ({
                    ...prev,
                    itemsPerRow: parseInt(e.target.value)
                  }))}
                >
                  <option value="1">1 Column (Vertical List)</option>
                  <option value="2">2 Columns</option>
                  <option value="3">3 Columns</option>
                </select>
              </div>

              <div className="field-group">
                <label className="field-label">Bullet Color</label>
                <div className="color-row">
                  <input
                    type="color"
                    className="color-picker"
                    value={bulletOptions.bulletColor}
                    onChange={(e) => setBulletOptions(prev => ({
                      ...prev,
                      bulletColor: e.target.value
                    }))}
                  />
                  <input
                    type="text"
                    className="field-input"
                    value={bulletOptions.bulletColor}
                    onChange={(e) => setBulletOptions(prev => ({
                      ...prev,
                      bulletColor: e.target.value
                    }))}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Subsection Template Options */}
          {selectedType === 'subsection' && (
            <div className="options-section">
              <h3 className="section-label">Subsection Template</h3>
              
              <div className="template-grid">
                {subsectionTemplates.map(template => (
                  <button
                    key={template.value}
                    className={`template-card ${subsectionOptions.templateType === template.value ? 'selected' : ''}`}
                    onClick={() => setSubsectionOptions({ templateType: template.value })}
                  >
                    <div className="template-name">{template.label}</div>
                    <div className="template-fields">
                      Fields: {template.fields.join(', ')}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleAdd}>
            ➕ Add {contentTypes.find(t => t.id === selectedType)?.name}
          </button>
        </div>
      </div>

      <style>{`
        .modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 2000;
          animation: fadeIn 0.2s;
        }

        .add-content-modal {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 90%;
          max-width: 600px;
          max-height: 85vh;
          background: white;
          border-radius: 16px;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
          z-index: 2001;
          display: flex;
          flex-direction: column;
          animation: slideUp 0.3s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translate(-50%, -45%);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%);
          }
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid #e5e7eb;
        }

        .modal-title {
          font-size: 20px;
          font-weight: 700;
          margin: 0;
          color: #1f2937;
        }

        .modal-close {
          width: 36px;
          height: 36px;
          border: none;
          background: #f3f4f6;
          border-radius: 8px;
          font-size: 24px;
          cursor: pointer;
          color: #6b7280;
          transition: all 0.15s;
        }

        .modal-close:hover {
          background: #e5e7eb;
          color: #374151;
        }

        .modal-body {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
        }

        .type-section,
        .options-section {
          margin-bottom: 24px;
        }

        .section-label {
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 12px;
          color: #374151;
        }

        .type-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }

        .type-card {
          padding: 16px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          background: white;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          text-align: center;
        }

        .type-card:hover {
          border-color: #3b82f6;
          background: #f0f9ff;
        }

        .type-card.selected {
          border-color: #3b82f6;
          background: #eff6ff;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .type-icon {
          font-size: 32px;
        }

        .type-name {
          font-weight: 600;
          color: #1f2937;
          font-size: 14px;
        }

        .type-desc {
          font-size: 11px;
          color: #6b7280;
        }

        .bullet-type-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
        }

        .bullet-type-btn {
          padding: 12px 8px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          background: white;
          cursor: pointer;
          transition: all 0.15s;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }

        .bullet-type-btn:hover {
          border-color: #3b82f6;
          background: #f0f9ff;
        }

        .bullet-type-btn.selected {
          border-color: #3b82f6;
          background: #eff6ff;
        }

        .bullet-preview {
          font-size: 20px;
          font-weight: bold;
        }

        .bullet-label {
          font-size: 11px;
          color: #374151;
        }

        .template-grid {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .template-card {
          padding: 12px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          background: white;
          cursor: pointer;
          transition: all 0.15s;
          text-align: left;
        }

        .template-card:hover {
          border-color: #3b82f6;
          background: #f0f9ff;
        }

        .template-card.selected {
          border-color: #3b82f6;
          background: #eff6ff;
        }

        .template-name {
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 4px;
        }

        .template-fields {
          font-size: 11px;
          color: #6b7280;
        }

        .field-group {
          margin-bottom: 16px;
        }

        .field-label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 8px;
          color: #374151;
        }

        .field-select,
        .field-input {
          width: 100%;
          padding: 10px 12px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 14px;
          outline: none;
        }

        .field-select:focus,
        .field-input:focus {
          border-color: #3b82f6;
        }

        .color-row {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .color-picker {
          width: 48px;
          height: 44px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          cursor: pointer;
        }

        .modal-footer {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          padding: 16px 24px;
          border-top: 1px solid #e5e7eb;
        }

        .btn {
          padding: 10px 20px;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s;
        }

        .btn-secondary {
          background: #f3f4f6;
          color: #374151;
        }

        .btn-secondary:hover {
          background: #e5e7eb;
        }

        .btn-primary {
          background: #3b82f6;
          color: white;
        }

        .btn-primary:hover {
          background: #2563eb;
        }
      `}</style>
    </>
  );
}
