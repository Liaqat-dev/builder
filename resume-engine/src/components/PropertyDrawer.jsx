/**
 * PropertyDrawer Component
 * =========================
 * A slide-out panel for editing element/section properties.
 */

import { ATS_FRIENDLY_FONTS, ATS_SECTION_HEADERS } from '../utils/constants';
import { isATSFriendlyFont } from '../utils/helpers';

export function PropertyDrawer({
  item,
  onChange,
  onDelete,
  onClose
}) {
  const isSection = item.isSection;

  return (
    <>
      {/* Backdrop */}
      <div className="drawer-backdrop" onClick={onClose} />

      {/* Drawer */}
      <div className="drawer">
        {/* Header */}
        <div className="drawer-header">
          <h3 className="drawer-title">
            {isSection ? '📦 Edit Section' : '✏️ Edit Element'}
          </h3>
          <button className="drawer-close" onClick={onClose}>×</button>
        </div>

        {/* Content */}
        <div className="drawer-content">
          {isSection ? (
            <SectionProperties item={item} onChange={onChange} />
          ) : (
            <ElementProperties item={item} onChange={onChange} />
          )}
        </div>

        {/* Footer */}
        <div className="drawer-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          <button className="btn btn-danger" onClick={onDelete}>
            🗑️ Delete
          </button>
        </div>
      </div>

      <style>{`
        .drawer-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.3);
          backdrop-filter: blur(2px);
          z-index: 999;
          animation: fadeIn 0.2s ease;
        }

        .drawer {
          position: fixed;
          top: 0;
          right: 0;
          width: 380px;
          height: 100vh;
          background: white;
          box-shadow: -4px 0 24px rgba(0, 0, 0, 0.15);
          z-index: 1000;
          display: flex;
          flex-direction: column;
          animation: slideIn 0.3s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }

        .drawer-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          border-bottom: 1px solid #e5e7eb;
          background: #f9fafb;
        }

        .drawer-title {
          font-size: 18px;
          font-weight: 700;
          color: #1f2937;
          margin: 0;
        }

        .drawer-close {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: none;
          border: none;
          font-size: 24px;
          color: #9ca3af;
          cursor: pointer;
          border-radius: 6px;
          transition: all 0.15s ease;
        }

        .drawer-close:hover {
          background: #fee2e2;
          color: #ef4444;
        }

        .drawer-content {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
        }

        .drawer-footer {
          display: flex;
          gap: 10px;
          padding: 16px 20px;
          border-top: 1px solid #e5e7eb;
          background: #f9fafb;
        }

        .field-group {
          margin-bottom: 20px;
        }

        .field-label {
          display: block;
          margin-bottom: 8px;
          font-size: 13px;
          font-weight: 600;
          color: #374151;
        }

        .field-hint {
          color: #9ca3af;
          font-weight: 400;
        }

        .field-input,
        .field-textarea,
        .field-select {
          width: 100%;
          padding: 10px 12px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 14px;
          outline: none;
          transition: border-color 0.15s ease;
        }

        .field-input:focus,
        .field-textarea:focus,
        .field-select:focus {
          border-color: #3b82f6;
        }

        .field-textarea {
          font-family: inherit;
          resize: vertical;
          min-height: 80px;
        }

        .field-row {
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
          overflow: hidden;
        }

        .color-picker::-webkit-color-swatch-wrapper {
          padding: 0;
        }

        .color-picker::-webkit-color-swatch {
          border: none;
        }

        .alignment-buttons {
          display: flex;
          gap: 6px;
        }

        .alignment-btn {
          flex: 1;
          padding: 10px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          background: white;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .alignment-btn:hover {
          border-color: #d1d5db;
        }

        .alignment-btn.active {
          border-color: #3b82f6;
          background: #eff6ff;
        }

        .range-slider {
          width: 100%;
          height: 6px;
          cursor: pointer;
        }

        .range-labels {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          color: #9ca3af;
          margin-top: 6px;
        }

        .divider {
          height: 1px;
          background: #e5e7eb;
          margin: 16px 0;
        }

        .ats-warning {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 12px;
          background: #fef3c7;
          border: 1px solid #fcd34d;
          border-radius: 8px;
          font-size: 12px;
          color: #92400e;
          margin-top: 8px;
        }

        .btn {
          flex: 1;
          padding: 12px;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .btn-secondary {
          background: white;
          border: 2px solid #e5e7eb;
          color: #374151;
        }

        .btn-secondary:hover {
          background: #f3f4f6;
        }

        .btn-danger {
          background: #ef4444;
          color: white;
        }

        .btn-danger:hover {
          background: #dc2626;
        }
      `}</style>
    </>
  );
}

/**
 * Element Properties Editor
 */
function ElementProperties({ item, onChange }) {
  const fontWarning = item.fontFamily && !isATSFriendlyFont(item.fontFamily);

  return (
    <>
      {/* Name */}
      <div className="field-group">
        <label className="field-label">
          📌 Element Name <span className="field-hint">(for reference)</span>
        </label>
        <input
          type="text"
          className="field-input"
          value={item.name || ''}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="e.g., Job Title, Company Name"
        />
      </div>

      {/* Content */}
      <div className="field-group">
        <label className="field-label">📝 Content</label>
        <textarea
          className="field-textarea"
          value={item.content || ''}
          onChange={(e) => onChange({ content: e.target.value })}
          rows={3}
        />
      </div>

      {/* ATS Field */}
      <div className="field-group">
        <label className="field-label">
          🎯 ATS Field <span className="field-hint">(helps ATS parsing)</span>
        </label>
        <select
          className="field-select"
          value={item.atsField || ''}
          onChange={(e) => onChange({ atsField: e.target.value || null })}
        >
          <option value="">None</option>
          <option value="name">Full Name</option>
          <option value="email">Email</option>
          <option value="phone">Phone</option>
          <option value="location">Location</option>
          <option value="linkedin">LinkedIn</option>
          <option value="website">Website</option>
          <option value="job-title">Job Title</option>
          <option value="company">Company Name</option>
          <option value="date">Date/Duration</option>
          <option value="degree">Degree</option>
          <option value="school">School Name</option>
          <option value="skill">Skill</option>
        </select>
      </div>

      <div className="divider" />

      {/* Text Alignment */}
      <div className="field-group">
        <label className="field-label">⬅️ Text Alignment</label>
        <div className="alignment-buttons">
          {[
            { value: 'left', icon: '⬅️' },
            { value: 'center', icon: '↔️' },
            { value: 'right', icon: '➡️' },
            { value: 'justify', icon: '⬌' }
          ].map(({ value, icon }) => (
            <button
              key={value}
              className={`alignment-btn ${(item.textAlign || 'left') === value ? 'active' : ''}`}
              onClick={() => onChange({ textAlign: value })}
            >
              {icon}
            </button>
          ))}
        </div>
      </div>

      {/* Font Family */}
      <div className="field-group">
        <label className="field-label">🔤 Font Family</label>
        <select
          className="field-select"
          value={item.fontFamily || 'Arial'}
          onChange={(e) => onChange({ fontFamily: e.target.value })}
        >
          <optgroup label="ATS-Friendly Fonts">
            {ATS_FRIENDLY_FONTS.map(font => (
              <option key={font} value={font}>{font}</option>
            ))}
          </optgroup>
        </select>
        {fontWarning && (
          <div className="ats-warning">
            ⚠️ This font may not be ATS-friendly
          </div>
        )}
      </div>

      {/* Font Size */}
      <div className="field-group">
        <label className="field-label">
          📏 Font Size: <span style={{ color: '#3b82f6' }}>{item.fontSize || 14}px</span>
        </label>
        <input
          type="range"
          className="range-slider"
          min="8"
          max="48"
          value={item.fontSize || 14}
          onChange={(e) => onChange({ fontSize: parseInt(e.target.value) })}
        />
        <div className="range-labels">
          <span>8px</span>
          <span>48px</span>
        </div>
      </div>

      {/* Font Weight */}
      <div className="field-group">
        <label className="field-label">💪 Font Weight</label>
        <select
          className="field-select"
          value={item.fontWeight || 'normal'}
          onChange={(e) => onChange({ fontWeight: e.target.value })}
        >
          <option value="300">Light (300)</option>
          <option value="normal">Normal (400)</option>
          <option value="500">Medium (500)</option>
          <option value="600">Semi-Bold (600)</option>
          <option value="bold">Bold (700)</option>
          <option value="800">Extra Bold (800)</option>
        </select>
      </div>

      {/* Text Color */}
      <div className="field-group">
        <label className="field-label">🎨 Text Color</label>
        <div className="field-row">
          <input
            type="color"
            className="color-picker"
            value={item.color || '#000000'}
            onChange={(e) => onChange({ color: e.target.value })}
          />
          <input
            type="text"
            className="field-input"
            value={item.color || '#000000'}
            onChange={(e) => {
              if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
                onChange({ color: e.target.value });
              }
            }}
            style={{ fontFamily: 'monospace' }}
          />
        </div>
      </div>
    </>
  );
}

/**
 * Section Properties Editor
 */
function SectionProperties({ item, onChange }) {
  return (
    <>
      {/* Title */}
      <div className="field-group">
        <label className="field-label">📌 Section Title</label>
        <input
          type="text"
          className="field-input"
          value={item.title || ''}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="e.g., Experience, Education"
        />
      </div>

      {/* ATS Header Type */}
      <div className="field-group">
        <label className="field-label">
          🎯 ATS Section Type <span className="field-hint">(standard headers)</span>
        </label>
        <select
          className="field-select"
          value={item.atsHeader || ''}
          onChange={(e) => {
            const type = e.target.value;
            const config = ATS_SECTION_HEADERS[type];
            onChange({
              atsHeader: type || null,
              title: config?.title || item.title,
              contentType: config?.contentType || item.contentType
            });
          }}
        >
          <option value="">Custom Section</option>
          {Object.entries(ATS_SECTION_HEADERS).map(([key, config]) => (
            <option key={key} value={key}>{config.title}</option>
          ))}
        </select>
      </div>

      {/* Content Type */}
      <div className="field-group">
        <label className="field-label">📋 Content Type</label>
        <select
          className="field-select"
          value={item.contentType || 'text'}
          onChange={(e) => onChange({ contentType: e.target.value })}
        >
          <option value="text">📝 Text - Free form paragraphs</option>
          <option value="list-items">📋 List - Bullet points</option>
          <option value="list-sections">📦 Entries - Job/Education entries</option>
        </select>
      </div>

      {/* Layout Direction */}
      <div className="field-group">
        <label className="field-label">↕️ Layout Direction</label>
        <select
          className="field-select"
          value={item.direction || 'vertical'}
          onChange={(e) => onChange({ direction: e.target.value })}
        >
          <option value="vertical">↓ Vertical - Stack items</option>
          <option value="horizontal">→ Horizontal - Side by side</option>
        </select>
        {item.direction === 'horizontal' && (
          <div className="ats-warning">
            ⚠️ Horizontal layouts may affect ATS parsing
          </div>
        )}
      </div>

      <div className="divider" />

      {/* Background Color */}
      <div className="field-group">
        <label className="field-label">🎨 Background Color</label>
        <div className="field-row">
          <input
            type="color"
            className="color-picker"
            value={item.backgroundColor || '#ffffff'}
            onChange={(e) => onChange({ backgroundColor: e.target.value })}
          />
          <input
            type="text"
            className="field-input"
            value={item.backgroundColor || '#ffffff'}
            onChange={(e) => {
              if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
                onChange({ backgroundColor: e.target.value });
              }
            }}
            style={{ fontFamily: 'monospace' }}
          />
        </div>
      </div>

      {/* Border Color */}
      <div className="field-group">
        <label className="field-label">🖌️ Border Color</label>
        <div className="field-row">
          <input
            type="color"
            className="color-picker"
            value={item.borderColor || '#e5e7eb'}
            onChange={(e) => onChange({ borderColor: e.target.value })}
          />
          <input
            type="text"
            className="field-input"
            value={item.borderColor || '#e5e7eb'}
            onChange={(e) => {
              if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
                onChange({ borderColor: e.target.value });
              }
            }}
            style={{ fontFamily: 'monospace' }}
          />
        </div>
      </div>
    </>
  );
}
