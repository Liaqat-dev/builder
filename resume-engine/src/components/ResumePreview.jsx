/**
 * ResumePreview Component
 * ========================
 * Separate module for previewing and printing filled resumes.
 * This is where users view AI-filled resumes before printing.
 */

import { useState, useEffect, useRef } from 'react';
import { getResume, printResume, downloadPDF } from '../services/resumeAPI';

export function ResumePreview({ resumeId, filledResume: initialData, onClose }) {
  const [resumeData, setResumeData] = useState(initialData || null);
  const [isLoading, setIsLoading] = useState(!initialData);
  const [isPrinting, setIsPrinting] = useState(false);
  const [error, setError] = useState(null);
  const previewRef = useRef(null);

  // Load resume data if resumeId provided
  useEffect(() => {
    if (resumeId && !initialData) {
      loadResume();
    }
  }, [resumeId]);

  const loadResume = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getResume(resumeId);
      setResumeData(data.filledData);
    } catch (err) {
      setError(err.message || 'Failed to load resume');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = async () => {
    try {
      setIsPrinting(true);
      
      const pdfBlob = await printResume({
        resumeId,
        elements: resumeData?.elements,
        sections: resumeData?.sections,
        fileName: 'resume'
      });
      
      downloadPDF(pdfBlob, 'resume.pdf');
      
    } catch (err) {
      setError(err.message || 'Failed to generate PDF');
    } finally {
      setIsPrinting(false);
    }
  };

  const handleBrowserPrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="preview-container">
        <div className="preview-loading">
          <div className="loading-spinner" />
          <p>Loading resume...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="preview-container">
        <div className="preview-error">
          <span className="error-icon">❌</span>
          <p>{error}</p>
          <button onClick={loadResume}>Retry</button>
        </div>
      </div>
    );
  }

  if (!resumeData) {
    return (
      <div className="preview-container">
        <div className="preview-empty">
          <span className="empty-icon">📄</span>
          <p>No resume data available</p>
        </div>
      </div>
    );
  }

  const { elements, sections, atsScore } = resumeData;

  return (
    <div className="preview-container">
      {/* Header Controls */}
      <div className="preview-header">
        <div className="header-left">
          <h2>📄 Resume Preview</h2>
          {atsScore && (
            <div className="ats-badge" style={{ '--score-color': getScoreColor(atsScore) }}>
              <span className="ats-score">{atsScore}</span>
              <span className="ats-label">ATS Score</span>
            </div>
          )}
        </div>
        
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={handleBrowserPrint}>
            🖨️ Browser Print
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handlePrint}
            disabled={isPrinting}
          >
            {isPrinting ? '⏳ Generating...' : '📥 Download PDF'}
          </button>
          {onClose && (
            <button className="btn btn-close" onClick={onClose}>
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Resume Preview */}
      <div className="preview-wrapper">
        <div className="preview-paper" ref={previewRef}>
          {/* Header Section */}
          <div className="resume-header">
            {elements
              .filter(el => !el.parentSection)
              .sort((a, b) => a.y - b.y)
              .map(el => (
                <div
                  key={el.id}
                  className={`header-element ${el.atsField || ''}`}
                  style={{
                    fontSize: el.fontSize || 14,
                    fontWeight: el.fontWeight || 'normal',
                    fontFamily: el.fontFamily || 'Arial',
                    color: el.color || '#333',
                    textAlign: el.textAlign || 'left'
                  }}
                >
                  {el.content}
                </div>
              ))}
          </div>

          {/* Sections */}
          {sections
            .filter(s => !s.parentSection)
            .sort((a, b) => a.y - b.y)
            .map(section => (
              <div key={section.id} className="resume-section">
                <h2 className="section-title">{section.title}</h2>
                
                {/* Render filled content */}
                {section.filledContent?.map((content, idx) => {
                  if (content.type === 'entry') {
                    return (
                      <div key={idx} className="entry">
                        <div className="entry-header">
                          <span className="entry-title">{content.title}</span>
                          {content.subtitle && (
                            <span className="entry-date">{content.subtitle}</span>
                          )}
                        </div>
                        {content.bullets && content.bullets.length > 0 && (
                          <ul className="entry-bullets">
                            {content.bullets.map((bullet, bIdx) => (
                              <li key={bIdx}>{bullet}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    );
                  }
                  
                  if (content.type === 'list') {
                    return (
                      <div key={idx} className="skills-list">
                        {content.items?.map((item, iIdx) => (
                          <span key={iIdx} className="skill-tag">{item}</span>
                        ))}
                      </div>
                    );
                  }
                  
                  if (content.type === 'text') {
                    return (
                      <p key={idx} className="text-content">{content.content}</p>
                    );
                  }
                  
                  return null;
                })}

                {/* Fallback: render section elements if no filledContent */}
                {(!section.filledContent || section.filledContent.length === 0) && (
                  elements
                    .filter(el => el.parentSection === section.id)
                    .sort((a, b) => a.y - b.y)
                    .map(el => (
                      <p key={el.id} className="element-content">{el.content}</p>
                    ))
                )}
              </div>
            ))}
        </div>
      </div>

      {/* Suggestions Panel */}
      {resumeData.suggestions && resumeData.suggestions.length > 0 && (
        <div className="suggestions-panel">
          <h3>💡 AI Suggestions</h3>
          <ul>
            {resumeData.suggestions.map((suggestion, idx) => (
              <li key={idx}>{suggestion}</li>
            ))}
          </ul>
        </div>
      )}

      <style>{`
        .preview-container {
          display: flex;
          flex-direction: column;
          height: 100vh;
          background: #f3f4f6;
        }

        .preview-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 24px;
          background: white;
          border-bottom: 1px solid #e5e7eb;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .header-left h2 {
          margin: 0;
          font-size: 20px;
          color: #1f2937;
        }

        .ats-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: #f9fafb;
          border-radius: 20px;
          border: 1px solid #e5e7eb;
        }

        .ats-score {
          font-size: 18px;
          font-weight: 700;
          color: var(--score-color);
        }

        .ats-label {
          font-size: 11px;
          color: #6b7280;
          text-transform: uppercase;
        }

        .header-actions {
          display: flex;
          gap: 10px;
        }

        .btn {
          padding: 10px 18px;
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
          border: 1px solid #e5e7eb;
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

        .btn-primary:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }

        .btn-close {
          background: none;
          color: #9ca3af;
          font-size: 18px;
          padding: 8px 12px;
        }

        .btn-close:hover {
          color: #ef4444;
          background: #fee2e2;
        }

        .preview-wrapper {
          flex: 1;
          overflow: auto;
          padding: 40px;
          display: flex;
          justify-content: center;
        }

        .preview-paper {
          width: 210mm;
          min-height: 297mm;
          background: white;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
          padding: 40px 50px;
          font-family: Arial, sans-serif;
        }

        /* Resume Styles */
        .resume-header {
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 2px solid #333;
        }

        .header-element {
          margin-bottom: 4px;
        }

        .header-element.name {
          font-size: 28px !important;
          font-weight: bold !important;
          margin-bottom: 8px;
        }

        .header-element.contact {
          font-size: 11px !important;
          color: #555 !important;
        }

        .resume-section {
          margin-bottom: 20px;
        }

        .section-title {
          font-size: 14px;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 1.5px solid #333;
          padding-bottom: 4px;
          margin: 0 0 12px 0;
          color: #111;
        }

        .entry {
          margin-bottom: 14px;
        }

        .entry-header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 4px;
        }

        .entry-title {
          font-size: 12px;
          font-weight: bold;
          color: #222;
        }

        .entry-date {
          font-size: 11px;
          color: #666;
          font-style: italic;
        }

        .entry-bullets {
          margin: 6px 0 0 0;
          padding-left: 18px;
        }

        .entry-bullets li {
          font-size: 11px;
          margin-bottom: 3px;
          color: #333;
        }

        .skills-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .skill-tag {
          font-size: 10px;
          padding: 4px 10px;
          background: #f3f4f6;
          border-radius: 4px;
          color: #374151;
        }

        .text-content {
          font-size: 11px;
          line-height: 1.5;
          color: #444;
          margin: 0;
        }

        .element-content {
          font-size: 11px;
          margin: 4px 0;
        }

        /* Suggestions */
        .suggestions-panel {
          padding: 16px 24px;
          background: #fef3c7;
          border-top: 1px solid #fcd34d;
        }

        .suggestions-panel h3 {
          margin: 0 0 8px 0;
          font-size: 14px;
          color: #92400e;
        }

        .suggestions-panel ul {
          margin: 0;
          padding-left: 20px;
        }

        .suggestions-panel li {
          font-size: 12px;
          color: #92400e;
          margin-bottom: 4px;
        }

        /* Loading & Error States */
        .preview-loading,
        .preview-error,
        .preview-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          gap: 16px;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #e5e7eb;
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .error-icon,
        .empty-icon {
          font-size: 48px;
        }

        /* Print Styles */
        @media print {
          .preview-header,
          .suggestions-panel {
            display: none !important;
          }

          .preview-container {
            background: white;
          }

          .preview-wrapper {
            padding: 0;
          }

          .preview-paper {
            box-shadow: none;
            width: 100%;
            min-height: auto;
          }
        }
      `}</style>
    </div>
  );
}

function getScoreColor(score) {
  if (score >= 80) return '#10b981';
  if (score >= 60) return '#f59e0b';
  return '#ef4444';
}

export default ResumePreview;
