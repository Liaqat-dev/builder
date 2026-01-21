/**
 * TemplateGallery Component
 * ==========================
 * Gallery for browsing and loading saved/preset templates.
 */

import { useState, useEffect } from 'react';
import { TEMPLATE_PRESETS, ATS_SECTION_HEADERS } from '../utils/constants';

export function TemplateGallery({ onSelect, onClose }) {
  const [activeTab, setActiveTab] = useState('saved');
  const [savedTemplates, setSavedTemplates] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  // Load saved templates from localStorage
  useEffect(() => {
    const templates = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('template-')) {
        try {
          const data = JSON.parse(localStorage.getItem(key));
          templates.push({
            id: key,
            name: data.name || 'Untitled',
            updatedAt: data.metadata?.updatedAt || data.updatedAt,
            elementCount: data.data?.elements?.length || 0,
            sectionCount: data.data?.sections?.length || 0
          });
        } catch (e) {}
      }
    }
    setSavedTemplates(templates.sort((a, b) => 
      new Date(b.updatedAt) - new Date(a.updatedAt)
    ));
  }, []);

  const handleLoadSaved = (templateId) => {
    try {
      const data = JSON.parse(localStorage.getItem(templateId));
      onSelect({
        name: data.name,
        elements: data.data?.elements || [],
        sections: data.data?.sections || []
      });
    } catch (e) {
      console.error('Failed to load template:', e);
    }
  };

  const handleLoadPreset = (presetKey) => {
    const preset = generatePresetTemplate(presetKey);
    onSelect(preset);
  };

  const handleDelete = (templateId, e) => {
    e.stopPropagation();
    if (confirm('Delete this template?')) {
      localStorage.removeItem(templateId);
      setSavedTemplates(prev => prev.filter(t => t.id !== templateId));
    }
  };

  return (
    <>
      <div className="gallery-backdrop" onClick={onClose} />
      
      <div className="gallery">
        <div className="gallery-header">
          <h2 className="gallery-title">📚 Template Gallery</h2>
          <button className="gallery-close" onClick={onClose}>×</button>
        </div>

        <div className="gallery-tabs">
          <button
            className={`gallery-tab ${activeTab === 'saved' ? 'active' : ''}`}
            onClick={() => setActiveTab('saved')}
          >
            💾 Saved ({savedTemplates.length})
          </button>
          <button
            className={`gallery-tab ${activeTab === 'presets' ? 'active' : ''}`}
            onClick={() => setActiveTab('presets')}
          >
            ✨ Starter Templates
          </button>
        </div>

        <div className="gallery-content">
          {activeTab === 'saved' && (
            <>
              {savedTemplates.length === 0 ? (
                <div className="gallery-empty">
                  <span className="empty-icon">📭</span>
                  <p>No saved templates yet</p>
                  <span className="empty-hint">Save your first template to see it here</span>
                </div>
              ) : (
                <div className="template-grid">
                  {savedTemplates.map(template => (
                    <div
                      key={template.id}
                      className={`template-card ${selectedId === template.id ? 'selected' : ''}`}
                      onClick={() => setSelectedId(template.id)}
                      onDoubleClick={() => handleLoadSaved(template.id)}
                    >
                      <div className="template-preview">
                        <div className="preview-line title" />
                        <div className="preview-line subtitle" />
                        <div className="preview-section" />
                        <div className="preview-section" />
                      </div>
                      <div className="template-info">
                        <h4 className="template-name">{template.name}</h4>
                        <span className="template-meta">
                          {template.elementCount} elements • {template.sectionCount} sections
                        </span>
                        <span className="template-date">
                          {new Date(template.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <button
                        className="template-delete"
                        onClick={(e) => handleDelete(template.id, e)}
                        title="Delete template"
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === 'presets' && (
            <div className="template-grid">
              {Object.entries(TEMPLATE_PRESETS).map(([key, preset]) => (
                <div
                  key={key}
                  className={`template-card preset ${selectedId === key ? 'selected' : ''}`}
                  onClick={() => setSelectedId(key)}
                  onDoubleClick={() => handleLoadPreset(key)}
                >
                  <div 
                    className="template-preview"
                    style={{ 
                      fontFamily: preset.style.fontFamily,
                      '--accent': preset.style.accentColor 
                    }}
                  >
                    <div className="preview-line title" />
                    <div className="preview-line subtitle" />
                    <div className="preview-section" style={{ borderColor: preset.style.accentColor }} />
                    <div className="preview-section" style={{ borderColor: preset.style.accentColor }} />
                  </div>
                  <div className="template-info">
                    <h4 className="template-name">{preset.name}</h4>
                    <span className="template-meta">{preset.description}</span>
                    <span className="template-badge">ATS-Optimized</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="gallery-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            disabled={!selectedId}
            onClick={() => {
              if (activeTab === 'saved') {
                handleLoadSaved(selectedId);
              } else {
                handleLoadPreset(selectedId);
              }
            }}
          >
            📂 Load Template
          </button>
        </div>
      </div>

      <style>{`
        .gallery-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          z-index: 1000;
        }

        .gallery {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 90%;
          max-width: 800px;
          max-height: 85vh;
          background: white;
          border-radius: 16px;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
          z-index: 1001;
          display: flex;
          flex-direction: column;
          animation: galleryIn 0.3s ease;
        }

        @keyframes galleryIn {
          from {
            opacity: 0;
            transform: translate(-50%, -48%);
          }
        }

        .gallery-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid #e5e7eb;
        }

        .gallery-title {
          font-size: 20px;
          font-weight: 700;
          color: #1f2937;
          margin: 0;
        }

        .gallery-close {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: none;
          border: none;
          font-size: 24px;
          color: #9ca3af;
          cursor: pointer;
          border-radius: 8px;
        }

        .gallery-close:hover {
          background: #f3f4f6;
          color: #374151;
        }

        .gallery-tabs {
          display: flex;
          gap: 4px;
          padding: 12px 24px;
          background: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
        }

        .gallery-tab {
          padding: 10px 20px;
          background: none;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          color: #6b7280;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .gallery-tab:hover {
          color: #374151;
          background: #e5e7eb;
        }

        .gallery-tab.active {
          color: #1f2937;
          background: white;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .gallery-content {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
        }

        .gallery-empty {
          text-align: center;
          padding: 60px 20px;
          color: #6b7280;
        }

        .empty-icon {
          font-size: 48px;
          display: block;
          margin-bottom: 16px;
        }

        .empty-hint {
          font-size: 13px;
          color: #9ca3af;
        }

        .template-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 16px;
        }

        .template-card {
          position: relative;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .template-card:hover {
          border-color: #d1d5db;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .template-card.selected {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
        }

        .template-preview {
          height: 120px;
          background: #f9fafb;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .preview-line {
          height: 8px;
          background: #d1d5db;
          border-radius: 4px;
        }

        .preview-line.title {
          width: 60%;
          background: #374151;
        }

        .preview-line.subtitle {
          width: 80%;
          height: 6px;
        }

        .preview-section {
          flex: 1;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          margin-top: 4px;
        }

        .template-info {
          padding: 12px;
          background: white;
        }

        .template-name {
          font-size: 14px;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .template-meta {
          display: block;
          font-size: 11px;
          color: #6b7280;
        }

        .template-date {
          display: block;
          font-size: 10px;
          color: #9ca3af;
          margin-top: 4px;
        }

        .template-badge {
          display: inline-block;
          margin-top: 8px;
          padding: 2px 8px;
          background: #dcfce7;
          color: #166534;
          font-size: 10px;
          font-weight: 600;
          border-radius: 10px;
        }

        .template-delete {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          opacity: 0;
          transition: opacity 0.15s ease;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .template-card:hover .template-delete {
          opacity: 1;
        }

        .template-delete:hover {
          background: #fee2e2;
        }

        .gallery-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
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
        }

        .btn-secondary {
          background: #f3f4f6;
          color: #374151;
        }

        .btn-primary {
          background: #3b82f6;
          color: white;
        }

        .btn-primary:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }
      `}</style>
    </>
  );
}

/**
 * Generate a preset template with ATS-optimized structure
 */
function generatePresetTemplate(presetKey) {
  const preset = TEMPLATE_PRESETS[presetKey];
  
  return {
    name: `${preset.name} Resume`,
    elements: [
      {
        id: '1',
        type: 'header',
        content: 'Your Name',
        x: 50,
        y: 40,
        width: 500,
        height: 40,
        fontSize: 28,
        fontWeight: 'bold',
        fontFamily: preset.style.fontFamily,
        color: preset.style.headingColor,
        textAlign: 'left',
        semanticTag: 'h1',
        atsField: 'name',
        parentSection: null
      },
      {
        id: '2',
        type: 'contact',
        content: 'email@example.com | (555) 123-4567 | City, State | linkedin.com/in/yourname',
        x: 50,
        y: 85,
        width: 500,
        height: 24,
        fontSize: 11,
        fontFamily: preset.style.fontFamily,
        color: '#666666',
        textAlign: 'left',
        semanticTag: 'address',
        atsField: 'contact',
        parentSection: null
      }
    ],
    sections: [
      {
        id: 'section-1',
        title: 'Professional Summary',
        x: 50,
        y: 130,
        width: 500,
        height: 80,
        backgroundColor: '#ffffff',
        borderColor: '#e5e7eb',
        contentType: 'text',
        direction: 'vertical',
        atsHeader: 'summary'
      },
      {
        id: 'section-2',
        title: 'Experience',
        x: 50,
        y: 230,
        width: 500,
        height: 200,
        backgroundColor: '#ffffff',
        borderColor: '#e5e7eb',
        contentType: 'list-sections',
        direction: 'vertical',
        atsHeader: 'experience'
      },
      {
        id: 'section-3',
        title: 'Education',
        x: 50,
        y: 450,
        width: 500,
        height: 120,
        backgroundColor: '#ffffff',
        borderColor: '#e5e7eb',
        contentType: 'list-sections',
        direction: 'vertical',
        atsHeader: 'education'
      },
      {
        id: 'section-4',
        title: 'Skills',
        x: 50,
        y: 590,
        width: 500,
        height: 80,
        backgroundColor: '#ffffff',
        borderColor: '#e5e7eb',
        contentType: 'list-items',
        direction: 'vertical',
        atsHeader: 'skills'
      }
    ]
  };
}
