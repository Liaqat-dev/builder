/**
 * ExportModal Component (WITH BACKEND API)
 * =========================================
 * Modal for exporting the resume using backend PDF generation.
 * Replace the current ExportModal.jsx with this file.
 */

import { useState } from 'react';
import { printResume, downloadPDF } from '../services/resumeAPI';

export function ExportModal({
                              elements,
                              sections,
                              templateName,
                              onClose
                            }) {
  const [selectedFormat, setSelectedFormat] = useState('pdf');
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState(null);
  const [exportOptions, setExportOptions] = useState({
    format: 'A4', // or 'Letter'
    includeColors: true,
    atsOptimized: true
  });

  const formats = [
    {
      id: 'pdf',
      name: 'PDF Document',
      icon: '📄',
      description: 'Professional PDF using backend API',
      atsScore: 95,
      recommended: true
    },
    {
      id: 'browser-print',
      name: 'Browser Print',
      icon: '🖨️',
      description: 'Quick print using browser',
      atsScore: 85,
      recommended: false
    },
    {
      id: 'json',
      name: 'JSON Data',
      icon: '🔧',
      description: 'Backup and restore',
      atsScore: null,
      recommended: false
    }
  ];

  /**
   * Export PDF using backend API
   */
  const handleBackendPDFExport = async () => {
    try {
      setError(null);
      console.log('🖨️ Generating PDF via backend API...');

      const pdfBlob = await printResume({
        elements,
        sections,
        fileName: templateName,
        options: {
          format: exportOptions.format,
          margins: {
            top: '10mm',
            right: '10mm',
            bottom: '10mm',
            left: '10mm'
          }
        }
      });

      // Download the PDF
      downloadPDF(pdfBlob, `${templateName}.pdf`);
      console.log('✅ PDF downloaded successfully');

      // Close modal after successful download
      setTimeout(() => {
        onClose();
      }, 500);

    } catch (error) {
      console.error('❌ PDF generation failed:', error);
      setError(error.message || 'Failed to generate PDF. Make sure the backend server is running on http://localhost:3001');
    }
  };

  /**
   * Fallback: Browser print
   */
  const handleBrowserPrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      setError('Please allow popups to use browser print');
      return;
    }

    const sortedElements = [...elements].sort((a, b) => {
      if (Math.abs(a.y - b.y) < 20) return a.x - b.x;
      return a.y - b.y;
    });

    const html = generatePrintHTML(sortedElements, sections, templateName, exportOptions);

    printWindow.document.write(html);
    printWindow.document.close();

    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  /**
   * Export as JSON
   */
  const handleJSONExport = () => {
    const data = {
      name: templateName,
      elements,
      sections,
      exportedAt: new Date().toISOString()
    };

    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${templateName}.json`;
    link.click();
    URL.revokeObjectURL(url);

    onClose();
  };

  /**
   * Main export handler
   */
  const handleExport = async () => {
    setIsExporting(true);
    setError(null);

    try {
      switch (selectedFormat) {
        case 'pdf':
          await handleBackendPDFExport();
          break;
        case 'browser-print':
          handleBrowserPrint();
          break;
        case 'json':
          handleJSONExport();
          break;
        default:
          setError('Invalid export format');
      }
    } catch (error) {
      console.error('Export error:', error);
      setError(error.message);
    } finally {
      setIsExporting(false);
    }
  };

  return (
      <>
        <div className="modal-backdrop" onClick={onClose} />

        <div className="modal export-modal">
          <div className="modal-header">
            <h2 className="modal-title">📥 Export Resume</h2>
            <button className="modal-close" onClick={onClose}>×</button>
          </div>

          <div className="modal-body">
            {/* Error Display */}
            {error && (
                <div className="error-banner">
                  <span className="error-icon">⚠️</span>
                  <div className="error-content">
                    <strong>Export Failed</strong>
                    <p>{error}</p>
                    {error.includes('backend') && (
                        <small>
                          Make sure the backend server is running: <code>cd resume-egnine-server && npm start</code>
                        </small>
                    )}
                  </div>
                </div>
            )}

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

            {/* PDF Options */}
            {selectedFormat === 'pdf' && (
                <div className="options-section">
                  <h3 className="section-label">PDF Options</h3>

                  <div className="option-row">
                    <span className="option-label">📐 Paper Size</span>
                    <select
                        value={exportOptions.format}
                        onChange={(e) => setExportOptions(prev => ({
                          ...prev,
                          format: e.target.value
                        }))}
                        className="option-select"
                    >
                      <option value="Letter">Letter (US)</option>
                      <option value="A4">A4 (International)</option>
                    </select>
                  </div>

                  <label className="option-row checkbox-row">
                    <input
                        type="checkbox"
                        checked={exportOptions.atsOptimized}
                        onChange={(e) => setExportOptions(prev => ({
                          ...prev,
                          atsOptimized: e.target.checked
                        }))}
                    />
                    <span className="option-label">
                  🎯 ATS-Optimized
                  <span className="option-hint">Clean structure for better parsing</span>
                </span>
                  </label>
                </div>
            )}

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
                <span className="info-value">{templateName}.{selectedFormat === 'browser-print' ? 'pdf' : selectedFormat}</span>
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
        .export-modal {
          width: 90%;
          max-width: 600px;
        }

        .error-banner {
          display: flex;
          gap: 12px;
          padding: 16px;
          background: #fee2e2;
          border: 1px solid #fca5a5;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        .error-icon {
          font-size: 24px;
          flex-shrink: 0;
        }

        .error-content {
          flex: 1;
        }

        .error-content strong {
          display: block;
          color: #991b1b;
          margin-bottom: 4px;
        }

        .error-content p {
          color: #b91c1c;
          margin: 0 0 8px 0;
          font-size: 14px;
        }

        .error-content small {
          display: block;
          color: #dc2626;
          font-size: 12px;
        }

        .error-content code {
          background: #fef2f2;
          padding: 2px 6px;
          border-radius: 4px;
          font-family: monospace;
          font-size: 11px;
        }

        .modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          z-index: 1000;
        }

        .modal {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: white;
          border-radius: 16px;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
          z-index: 1001;
          max-height: 90vh;
          overflow-y: auto;
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
        }

        .modal-close:hover {
          background: #e5e7eb;
        }

        .modal-body {
          padding: 24px;
        }

        .format-section {
          margin-bottom: 24px;
        }

        .section-label {
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 12px;
          color: #374151;
        }

        .format-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 12px;
        }

        .format-card {
          position: relative;
          padding: 16px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          background: white;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          flex-direction: column;
          gap: 8px;
          text-align: left;
        }

        .format-card:hover {
          border-color: #3b82f6;
          background: #f0f9ff;
        }

        .format-card.selected {
          border-color: #3b82f6;
          background: #eff6ff;
        }

        .format-badge {
          position: absolute;
          top: 8px;
          right: 8px;
          padding: 2px 8px;
          background: #10b981;
          color: white;
          font-size: 10px;
          font-weight: 600;
          border-radius: 4px;
        }

        .format-icon {
          font-size: 32px;
        }

        .format-name {
          font-weight: 600;
          color: #1f2937;
        }

        .format-desc {
          font-size: 12px;
          color: #6b7280;
        }

        .format-ats {
          font-size: 11px;
          color: #059669;
          font-weight: 600;
        }

        .options-section {
          margin-bottom: 24px;
          padding: 16px;
          background: #f9fafb;
          border-radius: 8px;
        }

        .option-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
        }

        .checkbox-row {
          gap: 12px;
        }

        .option-label {
          font-size: 14px;
          font-weight: 500;
          color: #374151;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .option-hint {
          font-size: 12px;
          font-weight: 400;
          color: #9ca3af;
        }

        .option-select {
          padding: 6px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
          cursor: pointer;
        }

        .preview-info {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          padding: 16px;
          background: #f9fafb;
          border-radius: 8px;
        }

        .info-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .info-label {
          font-size: 11px;
          color: #9ca3af;
          text-transform: uppercase;
        }

        .info-value {
          font-size: 14px;
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

        .btn-primary:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }
      `}</style>
      </>
  );
}

/**
 * Fallback: Generate print-optimized HTML for browser print
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
    @page { size: ${options.format}; margin: 0.5in; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: Arial, sans-serif;
      font-size: 11pt;
      line-height: 1.4;
      color: #333;
    }
    .element { margin-bottom: 8px; }
    .section { margin-bottom: 20px; }
    .section-title {
      font-size: 14pt;
      font-weight: bold;
      border-bottom: 2px solid #333;
      margin-bottom: 10px;
      padding-bottom: 4px;
    }
  </style>
</head>
<body>
  ${headerElements.map(el => `<div class="element">${el.content || ''}</div>`).join('')}
  ${rootSections.map(s => `
    <div class="section">
      <div class="section-title">${s.title || ''}</div>
    </div>
  `).join('')}
</body>
</html>`;
}