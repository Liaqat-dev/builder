/**
 * Toolbar Component
 * ==================
 * The main toolbar with actions and navigation.
 */

import { useState } from 'react';

export function Toolbar({
  templateName,
  onTemplateNameChange,
  onAddSection,
  onSave,
  onLoad,
  onExport,
  onExportJSON,
  activeView,
  onViewChange,
  selectedCount,
  atsScore
}) {
  const [isEditingName, setIsEditingName] = useState(false);

  const getScoreColor = (score) => {
    if (score >= 80) return '#10b981'; // green
    if (score >= 60) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Work';
  };

  return (
    <div className="toolbar">
      {/* Left Section - Brand & Name */}
      <div className="toolbar-left">
        <div className="brand">
          <span className="brand-icon">📄</span>
          <span className="brand-text">Resume Builder</span>
        </div>

        <div className="divider" />

        <div className="template-name-wrapper">
          {isEditingName ? (
            <input
              type="text"
              className="template-name-input"
              value={templateName}
              onChange={(e) => onTemplateNameChange(e.target.value)}
              onBlur={() => setIsEditingName(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') setIsEditingName(false);
              }}
              autoFocus
            />
          ) : (
            <button
              className="template-name-btn"
              onClick={() => setIsEditingName(true)}
            >
              {templateName}
              <span className="edit-icon">✏️</span>
            </button>
          )}
        </div>
      </div>

      {/* Center Section - View Tabs */}
      <div className="toolbar-center">
        <div className="view-tabs">
          <button
            className={`view-tab ${activeView === 'editor' ? 'active' : ''}`}
            onClick={() => onViewChange('editor')}
          >
            <span className="tab-icon">✏️</span>
            Editor
          </button>
          <button
            className={`view-tab ${activeView === 'preview' ? 'active' : ''}`}
            onClick={() => onViewChange('preview')}
          >
            <span className="tab-icon">👁️</span>
            Preview
          </button>
          <button
            className={`view-tab ${activeView === 'ats' ? 'active' : ''}`}
            onClick={() => onViewChange('ats')}
          >
            <span className="tab-icon">🎯</span>
            ATS Check
          </button>
        </div>
      </div>

      {/* Right Section - Actions */}
      <div className="toolbar-right">
        {/* ATS Score Indicator */}
        <div 
          className="ats-score-badge"
          style={{ '--score-color': getScoreColor(atsScore) }}
          title={`ATS Score: ${atsScore}% (${getScoreLabel(atsScore)})`}
        >
          <div className="score-ring">
            <svg viewBox="0 0 36 36" className="score-svg">
              <path
                className="score-bg"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="score-fill"
                strokeDasharray={`${atsScore}, 100`}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="score-text">{atsScore}</span>
          </div>
          <span className="score-label">ATS</span>
        </div>

        <div className="divider" />

        {/* Quick Actions */}
        <button className="toolbar-btn primary" onClick={onAddSection}>
          <span>➕</span>
          Section
        </button>

        <button className="toolbar-btn" onClick={onSave}>
          <span>💾</span>
          Save
        </button>

        <button className="toolbar-btn" onClick={onLoad}>
          <span>📂</span>
          Load
        </button>

        <div className="divider" />

        {/* Export Dropdown */}
        <div className="dropdown">
          <button className="toolbar-btn export" onClick={onExport}>
            <span>📥</span>
            Export
            <span className="dropdown-arrow">▼</span>
          </button>
        </div>

        {/* Selection Info */}
        {selectedCount > 0 && (
          <div className="selection-info">
            {selectedCount} selected
          </div>
        )}
      </div>

      <style>{`
        .toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 20px;
          background: white;
          border-bottom: 1px solid #e5e7eb;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .toolbar-left,
        .toolbar-center,
        .toolbar-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .brand-icon {
          font-size: 24px;
        }

        .brand-text {
          font-weight: 700;
          font-size: 16px;
          color: #1f2937;
          letter-spacing: -0.02em;
        }

        .divider {
          width: 1px;
          height: 24px;
          background: #e5e7eb;
        }

        .template-name-wrapper {
          min-width: 150px;
        }

        .template-name-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 10px;
          background: none;
          border: 1px solid transparent;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          color: #374151;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .template-name-btn:hover {
          background: #f3f4f6;
          border-color: #e5e7eb;
        }

        .edit-icon {
          font-size: 12px;
          opacity: 0;
          transition: opacity 0.15s ease;
        }

        .template-name-btn:hover .edit-icon {
          opacity: 1;
        }

        .template-name-input {
          padding: 6px 10px;
          border: 2px solid #3b82f6;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          outline: none;
          width: 100%;
        }

        .view-tabs {
          display: flex;
          background: #f3f4f6;
          border-radius: 8px;
          padding: 4px;
        }

        .view-tab {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          background: none;
          border: none;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
          color: #6b7280;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .view-tab:hover {
          color: #374151;
        }

        .view-tab.active {
          background: white;
          color: #1f2937;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }

        .tab-icon {
          font-size: 14px;
        }

        .ats-score-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 12px;
          background: #f9fafb;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }

        .score-ring {
          position: relative;
          width: 36px;
          height: 36px;
        }

        .score-svg {
          width: 100%;
          height: 100%;
          transform: rotate(-90deg);
        }

        .score-bg {
          fill: none;
          stroke: #e5e7eb;
          stroke-width: 3;
        }

        .score-fill {
          fill: none;
          stroke: var(--score-color);
          stroke-width: 3;
          stroke-linecap: round;
          transition: stroke-dasharray 0.6s ease;
        }

        .score-text {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 10px;
          font-weight: 700;
          color: var(--score-color);
        }

        .score-label {
          font-size: 11px;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .toolbar-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          background: #f3f4f6;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
          color: #374151;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .toolbar-btn:hover {
          background: #e5e7eb;
          border-color: #d1d5db;
        }

        .toolbar-btn.primary {
          background: #10b981;
          border-color: #10b981;
          color: white;
        }

        .toolbar-btn.primary:hover {
          background: #059669;
          border-color: #059669;
        }

        .toolbar-btn.export {
          background: #3b82f6;
          border-color: #3b82f6;
          color: white;
        }

        .toolbar-btn.export:hover {
          background: #2563eb;
          border-color: #2563eb;
        }

        .dropdown-arrow {
          font-size: 8px;
          margin-left: 4px;
        }

        .selection-info {
          padding: 6px 12px;
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          color: #1d4ed8;
        }

        @media (max-width: 1024px) {
          .toolbar {
            flex-wrap: wrap;
            gap: 12px;
          }

          .toolbar-center {
            order: 3;
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}
