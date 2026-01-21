/**
 * ExportModal Component
 * ======================
 * Modal for exporting the resume in various formats.
 */

import { useState } from 'react';

export function ExportModal({
  elements,
  sections,
  templateName,
  onClose,
  onExportPDF,
  onExportHTML,
  onExportText,
  onExportJSON,
  onExportDOCX
}) {
  const [selectedFormat, setSelectedFormat] = useState('pdf');
  const [isExporting, setIsExporting] = useState(false);
  const [exportOptions, setExportOptions] = useState({
    includeColors: true,
    atsOptimized: true,
    paperSize: 'letter'
  });

  const formats = [
    {
      id: 'pdf',
      name: 'PDF Document',
      icon: '📄',
      description: 'Best for sharing and printing',
      atsScore: 85,
      recommended: true
    },
    {
      id: 'docx',
      name: 'Word Document',
      icon: '📝',
      description: 'Editable format, good ATS compatibility',
      atsScore: 90,
      recommended: true
    },
    {
      id: 'html',
      name: 'HTML (ATS-Optimized)',
      icon: '🌐',
      description: 'Semantic HTML with clean structure',
      atsScore: 95,
      recommended: true
    },
    {
      id: 'txt',
      name: 'Plain Text',
      icon: '📃',
      description: 'Maximum ATS compatibility',
      atsScore: 100,
      recommended: false
    },
    {
      id: 'json',
      name: 'JSON Data',
      icon: '🔧',
      description: 'For developers and backup',
      atsScore: null,
      recommended: false
    }
  ];

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      switch (selectedFormat) {
        case 'pdf':
          await handlePDFExport();
          break;
        case 'docx':
          await onExportDOCX?.();
          break;
        case 'html':
          await onExportHTML?.();
          break;
        case 'txt':
          await onExportText?.();
          break;
        case 'json':
          await onExportJSON?.();
          break;
      }
    } catch (error) {
      console.error('Export error:', error);
    }
    
    setIsExporting(false);
  };

  const handlePDFExport = async () => {
    // Create print-optimized HTML
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const sortedElements = [...elements].sort((a, b) => {
      if (Math.abs(a.y - b.y) < 20) return a.x - b.x;
      return a.y - b.y;
    });

    const html = generatePrintHTML(sortedElements, sections, templateName, exportOptions);
    
    printWindow.document.write(html);
    printWindow.document.close();
    
    // Trigger print dialog
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  return (
    <>
      <div className="modal-backdrop" onClick={onClose} />
      
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">📥 Export Resume</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {/* Format Selection */}
          <div className="format-section">
            <h3 className="section-label">Select Format</h3>
            <div className="format-grid">
              {formats.map(format => (
                <button
                  key={format.id}
                  className={`format-card ${selectedFormat === format.id ? 'selected' : ''}`}
                  onClick={() => setSelectedFormat(format.id)}
                >
                  {format.recommended && (
                    <span className="format-badge">Recommended</span>
                  )}
                  <span className="format-icon">{format.icon}</span>
                  <span className="format-name">{format.name}</span>
                  <span className="format-desc">{format.description}</span>
                  {format.atsScore !== null && (
                    <span className="format-ats">
                      ATS Score: {format.atsScore}%
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Export Options */}
          <div className="options-section">
            <h3 className="section-label">Options</h3>
            
            <label className="option-row">
              <input
                type="checkbox"
                checked={exportOptions.atsOptimized}
                onChange={(e) => setExportOptions(prev => ({
                  ...prev,
                  atsOptimized: e.target.checked
                }))}
              />
              <span className="option-label">
                🎯 ATS-Optimized Export
                <span className="option-hint">Clean structure for better parsing</span>
              </span>
            </label>

            <label className="option-row">
              <input
                type="checkbox"
                checked={exportOptions.includeColors}
                onChange={(e) => setExportOptions(prev => ({
                  ...prev,
                  includeColors: e.target.checked
                }))}
              />
              <span className="option-label">
                🎨 Include Colors
                <span className="option-hint">Keep styling in export</span>
              </span>
            </label>

            {(selectedFormat === 'pdf' || selectedFormat === 'docx') && (
              <div className="option-row">
                <span className="option-label">📐 Paper Size</span>
                <select
                  value={exportOptions.paperSize}
                  onChange={(e) => setExportOptions(prev => ({
                    ...prev,
                    paperSize: e.target.value
                  }))}
                  className="option-select"
                >
                  <option value="letter">Letter (US)</option>
                  <option value="a4">A4 (International)</option>
                </select>
              </div>
            )}
          </div>

          {/* Preview Info */}
          <div className="preview-info">
            <div className="info-item">
              <span className="info-label">Elements</span>
              <span className="info-value">{elements.length}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Sections</span>
              <span className="info-value">{sections.length}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Filename</span>
              <span className="info-value">{templateName}.{selectedFormat}</span>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleExport}
            disabled={isExporting}
          >
            {isExporting ? (
              <>⏳ Exporting...</>
            ) : (
              <>📥 Export {formats.find(f => f.id === selectedFormat)?.name}</>
            )}
          </button>
        </div>
      </div>

      <style>{`
        .modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          z-index: 1000;
          animation: fadeIn 0.2s ease;
        }

        .modal {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 90%;
          max-width: 600px;
          max-height: 90vh;
          background: white;
          border-radius: 16px;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
          z-index: 1001;
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
          color: #1f2937;
          margin: 0;
        }

        .modal-close {
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
          transition: all 0.15s ease;
        }

        .modal-close:hover {
          background: #f3f4f6;
          color: #374151;
        }

        .modal-body {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
        }

        .section-label {
          font-size: 14px;
          font-weight: 600;
          color: #374151;
          margin: 0 0 12px;
        }

        .format-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 12px;
          margin-bottom: 24px;
        }

        .format-card {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 16px 12px;
          background: #f9fafb;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.15s ease;
          text-align: center;
        }

        .format-card:hover {
          border-color: #d1d5db;
          background: #f3f4f6;
        }

        .format-card.selected {
          border-color: #3b82f6;
          background: #eff6ff;
        }

        .format-badge {
          position: absolute;
          top: -8px;
          right: -8px;
          padding: 2px 8px;
          background: #10b981;
          color: white;
          font-size: 9px;
          font-weight: 600;
          border-radius: 10px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .format-icon {
          font-size: 28px;
          margin-bottom: 8px;
        }

        .format-name {
          font-size: 13px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 4px;
        }

        .format-desc {
          font-size: 11px;
          color: #6b7280;
          line-height: 1.3;
        }

        .format-ats {
          margin-top: 8px;
          padding: 2px 8px;
          background: rgba(16, 185, 129, 0.1);
          color: #059669;
          font-size: 10px;
          font-weight: 600;
          border-radius: 4px;
        }

        .options-section {
          margin-bottom: 24px;
        }

        .option-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: #f9fafb;
          border-radius: 8px;
          margin-bottom: 8px;
          cursor: pointer;
        }

        .option-row input[type="checkbox"] {
          width: 18px;
          height: 18px;
          accent-color: #3b82f6;
        }

        .option-label {
          flex: 1;
          font-size: 13px;
          font-weight: 500;
          color: #374151;
        }

        .option-hint {
          display: block;
          font-size: 11px;
          font-weight: 400;
          color: #9ca3af;
          margin-top: 2px;
        }

        .option-select {
          padding: 6px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 13px;
          background: white;
        }

        .preview-info {
          display: flex;
          gap: 16px;
          padding: 12px 16px;
          background: #f3f4f6;
          border-radius: 8px;
        }

        .info-item {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .info-label {
          font-size: 10px;
          color: #9ca3af;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .info-value {
          font-size: 13px;
          font-weight: 600;
          color: #374151;
        }

        .modal-footer {
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
          transition: all 0.15s ease;
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

        .btn-primary:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }
      `}</style>
    </>
  );
}

/**
 * Generate print-optimized HTML
 */
function generatePrintHTML(elements, sections, title, options) {
  const headerElements = elements.filter(el => !el.parentSection);
  const rootSections = sections.filter(s => !s.parentSection).sort((a, b) => a.y - b.y);

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    @page {
      size: ${options.paperSize === 'a4' ? 'A4' : 'letter'};
      margin: 0.5in;
    }
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    body {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 11pt;
      line-height: 1.4;
      color: #333;
      max-width: 8.5in;
      margin: 0 auto;
      padding: 0.5in;
    }
    
    .header {
      margin-bottom: 16pt;
      ${options.atsOptimized ? '' : 'border-bottom: 2pt solid #333;'}
      padding-bottom: 12pt;
    }
    
    h1 {
      font-size: 24pt;
      font-weight: bold;
      margin-bottom: 4pt;
      color: #111;
    }
    
    .contact {
      font-size: 10pt;
      color: #555;
    }
    
    .section {
      margin-bottom: 14pt;
    }
    
    h2 {
      font-size: 12pt;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 0.5pt;
      border-bottom: 1pt solid #333;
      padding-bottom: 3pt;
      margin-bottom: 8pt;
      color: #111;
    }
    
    .entry {
      margin-bottom: 10pt;
    }
    
    h3 {
      font-size: 11pt;
      font-weight: bold;
      margin-bottom: 2pt;
    }
    
    .date {
      font-size: 10pt;
      color: #666;
      font-style: italic;
    }
    
    ul {
      padding-left: 18pt;
      margin: 4pt 0;
    }
    
    li {
      margin-bottom: 2pt;
    }
    
    p {
      margin-bottom: 6pt;
    }
    
    @media print {
      body {
        padding: 0;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    ${headerElements.map(el => {
      if (el.atsField === 'name' || el.fontSize > 20) {
        return `<h1>${escapeHTML(el.content)}</h1>`;
      }
      if (el.atsField === 'contact') {
        return `<div class="contact">${escapeHTML(el.content)}</div>`;
      }
      return `<p>${escapeHTML(el.content)}</p>`;
    }).join('\n    ')}
  </div>
  
  ${rootSections.map(section => {
    const sectionElements = elements
      .filter(el => el.parentSection === section.id)
      .sort((a, b) => a.y - b.y);
    const subSections = sections
      .filter(s => s.parentSection === section.id)
      .sort((a, b) => a.y - b.y);

    return `
  <div class="section">
    <h2>${escapeHTML(section.title)}</h2>
    ${subSections.length > 0 ? subSections.map(sub => {
      const subElements = elements.filter(el => el.parentSection === sub.id);
      return `
    <div class="entry">
      <h3>${escapeHTML(sub.title)}</h3>
      ${subElements.map(el => {
        if (el.type === 'list-item' || el.content?.startsWith('•')) {
          return `<ul><li>${escapeHTML(el.content.replace(/^[•\-]\s*/, ''))}</li></ul>`;
        }
        return `<p>${escapeHTML(el.content)}</p>`;
      }).join('\n      ')}
    </div>`;
    }).join('\n') : section.contentType === 'list-items' ? `
    <ul>
      ${sectionElements.map(el => 
        `<li>${escapeHTML(el.content.replace(/^[•\-]\s*/, ''))}</li>`
      ).join('\n      ')}
    </ul>` : sectionElements.map(el => 
        `<p>${escapeHTML(el.content)}</p>`
      ).join('\n    ')}
  </div>`;
  }).join('\n')}
</body>
</html>`;
}

function escapeHTML(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
