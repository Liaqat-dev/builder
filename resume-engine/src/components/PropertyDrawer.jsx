/**
 * PropertyDrawer Component (FIXED)
 * ==================================
 * A slide-out panel for editing element/section properties.
 *
 * FIXES:
 * - Removed backdrop blur that was obscuring the canvas
 * - Drawer now appears as a side panel without blocking the view
 * - Can still see and interact with canvas while drawer is open
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
            {/* Drawer - NO BACKDROP, just the panel */}
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
        /* REMOVED .drawer-backdrop - no more screen blur! */

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
          border-left: 1px solid #e5e7eb;
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
          border-color: #3b82f6;
          background: #f0f9ff;
        }

        .alignment-btn.active {
          border-color: #3b82f6;
          background: #eff6ff;
          color: #3b82f6;
        }

        .btn {
          flex: 1;
          padding: 10px 16px;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .btn-secondary {
          background: #f3f4f6;
          color: #374151;
        }

        .btn-secondary:hover {
          background: #e5e7eb;
        }

        .btn-danger {
          background: #fee2e2;
          color: #dc2626;
        }

        .btn-danger:hover {
          background: #fecaca;
        }

        .ats-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 8px;
          background: #d1fae5;
          color: #065f46;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
        }

        .ats-badge.warning {
          background: #fef3c7;
          color: #92400e;
        }

        .divider {
          height: 1px;
          background: #e5e7eb;
          margin: 20px 0;
        }
      `}</style>
        </>
    );
}

/**
 * Element Properties
 */
function ElementProperties({ item, onChange }) {
    const fontWarning = !isATSFriendlyFont(item.fontFamily);

    return (
        <>
            {/* Content */}
            <div className="field-group">
                <label className="field-label">Content</label>
                <textarea
                    className="field-textarea"
                    value={item.content || ''}
                    onChange={(e) => onChange({ content: e.target.value })}
                    placeholder="Enter text content..."
                />
            </div>

            {/* Typography */}
            <div className="field-group">
                <label className="field-label">Font Family</label>
                <select
                    className="field-select"
                    value={item.fontFamily || 'Arial'}
                    onChange={(e) => onChange({ fontFamily: e.target.value })}
                >
                    {ATS_FRIENDLY_FONTS.map(font => (
                        <option key={font} value={font}>{font}</option>
                    ))}
                </select>
                {fontWarning && (
                    <span className="ats-badge warning" style={{ marginTop: '8px', display: 'inline-flex' }}>
            ⚠️ Not ATS-friendly
          </span>
                )}
            </div>

            <div className="field-row">
                <div className="field-group" style={{ flex: 1 }}>
                    <label className="field-label">Font Size</label>
                    <input
                        className="field-input"
                        type="number"
                        min="8"
                        max="72"
                        value={item.fontSize || 12}
                        onChange={(e) => onChange({ fontSize: parseInt(e.target.value) })}
                    />
                </div>

                <div className="field-group" style={{ flex: 1 }}>
                    <label className="field-label">Line Height</label>
                    <input
                        className="field-input"
                        type="number"
                        min="1"
                        max="3"
                        step="0.1"
                        value={item.lineHeight || 1.4}
                        onChange={(e) => onChange({ lineHeight: parseFloat(e.target.value) })}
                    />
                </div>
            </div>

            {/* Font Weight */}
            <div className="field-group">
                <label className="field-label">Font Weight</label>
                <select
                    className="field-select"
                    value={item.fontWeight || 'normal'}
                    onChange={(e) => onChange({ fontWeight: e.target.value })}
                >
                    <option value="normal">Normal</option>
                    <option value="bold">Bold</option>
                    <option value="300">Light</option>
                    <option value="600">Semi-Bold</option>
                </select>
            </div>

            {/* Text Alignment */}
            <div className="field-group">
                <label className="field-label">Text Alignment</label>
                <div className="alignment-buttons">
                    {['left', 'center', 'right', 'justify'].map(align => (
                        <button
                            key={align}
                            className={`alignment-btn ${item.textAlign === align ? 'active' : ''}`}
                            onClick={() => onChange({ textAlign: align })}
                            title={align}
                        >
                            {align === 'left' && '⬅️'}
                            {align === 'center' && '↔️'}
                            {align === 'right' && '➡️'}
                            {align === 'justify' && '⬌'}
                        </button>
                    ))}
                </div>
            </div>

            <div className="divider" />

            {/* Color */}
            <div className="field-group">
                <label className="field-label">Text Color</label>
                <div className="field-row">
                    <input
                        className="color-picker"
                        type="color"
                        value={item.color || '#000000'}
                        onChange={(e) => onChange({ color: e.target.value })}
                    />
                    <input
                        className="field-input"
                        type="text"
                        value={item.color || '#000000'}
                        onChange={(e) => onChange({ color: e.target.value })}
                        placeholder="#000000"
                    />
                </div>
            </div>

            {/* Position & Size */}
            <div className="divider" />

            <div className="field-row">
                <div className="field-group" style={{ flex: 1 }}>
                    <label className="field-label">X Position</label>
                    <input
                        className="field-input"
                        type="number"
                        value={Math.round(item.x || 0)}
                        onChange={(e) => onChange({ x: parseInt(e.target.value) })}
                    />
                </div>

                <div className="field-group" style={{ flex: 1 }}>
                    <label className="field-label">Y Position</label>
                    <input
                        className="field-input"
                        type="number"
                        value={Math.round(item.y || 0)}
                        onChange={(e) => onChange({ y: parseInt(e.target.value) })}
                    />
                </div>
            </div>

            <div className="field-row">
                <div className="field-group" style={{ flex: 1 }}>
                    <label className="field-label">Width</label>
                    <input
                        className="field-input"
                        type="number"
                        min="50"
                        value={Math.round(item.width || 200)}
                        onChange={(e) => onChange({ width: parseInt(e.target.value) })}
                    />
                </div>

                <div className="field-group" style={{ flex: 1 }}>
                    <label className="field-label">Height</label>
                    <input
                        className="field-input"
                        type="number"
                        min="20"
                        value={Math.round(item.height || 40)}
                        onChange={(e) => onChange({ height: parseInt(e.target.value) })}
                    />
                </div>
            </div>
        </>
    );
}

/**
 * Section Properties
 */
function SectionProperties({ item, onChange }) {
    const sectionHeaders = Object.keys(ATS_SECTION_HEADERS);

    return (
        <>
            {/* Title */}
            <div className="field-group">
                <label className="field-label">
                    Section Title
                    <span className="field-hint"> - Critical for ATS parsing</span>
                </label>
                <input
                    className="field-input"
                    type="text"
                    value={item.title || ''}
                    onChange={(e) => onChange({ title: e.target.value })}
                    placeholder="e.g., Experience, Education, Skills"
                />
            </div>

            {/* ATS-Friendly Titles */}
            <div className="field-group">
                <label className="field-label">Common ATS Titles</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {sectionHeaders.map(key => (
                        <button
                            key={key}
                            className="ats-badge"
                            style={{ cursor: 'pointer', border: 'none' }}
                            onClick={() => onChange({ title: ATS_SECTION_HEADERS[key].title })}
                        >
                            {ATS_SECTION_HEADERS[key].title}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Type */}
            <div className="field-group">
                <label className="field-label">Content Type</label>
                <select
                    className="field-select"
                    value={item.contentType || 'text'}
                    onChange={(e) => onChange({ contentType: e.target.value })}
                >
                    <option value="text">📝 Text Block</option>
                    <option value="list-items">📋 List Items (bullets)</option>
                    <option value="list-sections">📦 Sub-sections (entries)</option>
                </select>
            </div>

            {/* Layout Direction */}
            <div className="field-group">
                <label className="field-label">Layout Direction</label>
                <div className="alignment-buttons">
                    <button
                        className={`alignment-btn ${item.direction === 'vertical' ? 'active' : ''}`}
                        onClick={() => onChange({ direction: 'vertical' })}
                    >
                        ↓ Vertical
                    </button>
                    <button
                        className={`alignment-btn ${item.direction === 'horizontal' ? 'active' : ''}`}
                        onClick={() => onChange({ direction: 'horizontal' })}
                    >
                        → Horizontal
                    </button>
                </div>
            </div>

            <div className="divider" />

            {/* Background Color */}
            <div className="field-group">
                <label className="field-label">Background Color</label>
                <div className="field-row">
                    <input
                        className="color-picker"
                        type="color"
                        value={item.backgroundColor || '#ffffff'}
                        onChange={(e) => onChange({ backgroundColor: e.target.value })}
                    />
                    <input
                        className="field-input"
                        type="text"
                        value={item.backgroundColor || '#ffffff'}
                        onChange={(e) => onChange({ backgroundColor: e.target.value })}
                        placeholder="#ffffff"
                    />
                </div>
            </div>

            {/* Border Color */}
            <div className="field-group">
                <label className="field-label">Border Color</label>
                <div className="field-row">
                    <input
                        className="color-picker"
                        type="color"
                        value={item.borderColor || '#e5e7eb'}
                        onChange={(e) => onChange({ borderColor: e.target.value })}
                    />
                    <input
                        className="field-input"
                        type="text"
                        value={item.borderColor || '#e5e7eb'}
                        onChange={(e) => onChange({ borderColor: e.target.value })}
                        placeholder="#e5e7eb"
                    />
                </div>
            </div>

            {/* Position & Size */}
            <div className="divider" />

            <div className="field-row">
                <div className="field-group" style={{ flex: 1 }}>
                    <label className="field-label">X Position</label>
                    <input
                        className="field-input"
                        type="number"
                        value={Math.round(item.x || 0)}
                        onChange={(e) => onChange({ x: parseInt(e.target.value) })}
                    />
                </div>

                <div className="field-group" style={{ flex: 1 }}>
                    <label className="field-label">Y Position</label>
                    <input
                        className="field-input"
                        type="number"
                        value={Math.round(item.y || 0)}
                        onChange={(e) => onChange({ y: parseInt(e.target.value) })}
                    />
                </div>
            </div>

            <div className="field-row">
                <div className="field-group" style={{ flex: 1 }}>
                    <label className="field-label">Width</label>
                    <input
                        className="field-input"
                        type="number"
                        min="100"
                        value={Math.round(item.width || 400)}
                        onChange={(e) => onChange({ width: parseInt(e.target.value) })}
                    />
                </div>

                <div className="field-group" style={{ flex: 1 }}>
                    <label className="field-label">Height</label>
                    <input
                        className="field-input"
                        type="number"
                        min="50"
                        value={Math.round(item.height || 200)}
                        onChange={(e) => onChange({ height: parseInt(e.target.value) })}
                    />
                </div>
            </div>
        </>
    );
}