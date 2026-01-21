/**
 * useTemplateStorage Hook
 * ========================
 * Handles template persistence, import/export, and version history.
 */

import { useState, useCallback } from 'react';

const STORAGE_KEY = 'resume-builder-templates';
const HISTORY_KEY = 'resume-builder-history';

export function useTemplateStorage({
  elements,
  sections,
  templateName,
  setElements,
  setSections,
  setTemplateName
}) {
  const [isSaving, setIsSaving] = useState(false);
  const [templateHistory, setTemplateHistory] = useState([]);

  /**
   * Build template data object
   */
  const buildTemplateData = useCallback((name = templateName) => ({
    name,
    version: '2.0',
    data: {
      elements,
      sections,
      canvasSettings: {
        width: '210mm',
        height: '297mm',
        backgroundColor: 'white',
        margins: { top: 40, right: 40, bottom: 40, left: 40 }
      }
    },
    metadata: {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      elementCount: elements.length,
      sectionCount: sections.length
    }
  }), [elements, sections, templateName]);

  /**
   * Save template to localStorage
   */
  const saveTemplate = useCallback(async (customName) => {
    setIsSaving(true);
    
    try {
      const name = customName || templateName;
      const templateData = buildTemplateData(name);
      const templateId = `template-${Date.now()}`;
      
      // Save to localStorage
      localStorage.setItem(templateId, JSON.stringify(templateData));
      localStorage.setItem('lastTemplateId', templateId);

      // Update history
      const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
      history.unshift({
        id: templateId,
        name,
        savedAt: new Date().toISOString()
      });
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 20)));
      setTemplateHistory(history.slice(0, 20));

      return { success: true, templateId, name };
    } catch (error) {
      console.error('Save error:', error);
      return { success: false, error: error.message };
    } finally {
      setIsSaving(false);
    }
  }, [templateName, buildTemplateData]);

  /**
   * Load template from localStorage
   */
  const loadTemplate = useCallback(async (templateId) => {
    try {
      const id = templateId || localStorage.getItem('lastTemplateId');
      
      if (!id) {
        return { success: false, error: 'No template found' };
      }

      const data = localStorage.getItem(id);
      if (!data) {
        return { success: false, error: 'Template not found' };
      }

      const templateData = JSON.parse(data);
      
      // Handle both old and new format
      const loadedElements = templateData.data?.elements || templateData.elements || [];
      const loadedSections = templateData.data?.sections || templateData.sections || [];
      const loadedName = templateData.name || 'Loaded Resume';

      setElements(loadedElements);
      setSections(loadedSections);
      setTemplateName(loadedName);

      return { 
        success: true, 
        templateData,
        name: loadedName 
      };
    } catch (error) {
      console.error('Load error:', error);
      return { success: false, error: error.message };
    }
  }, [setElements, setSections, setTemplateName]);

  /**
   * Get all saved templates
   */
  const getAllTemplates = useCallback(() => {
    const templates = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('template-')) {
        try {
          const data = JSON.parse(localStorage.getItem(key));
          templates.push({
            id: key,
            name: data.name,
            updatedAt: data.metadata?.updatedAt || data.updatedAt,
            elementCount: data.metadata?.elementCount || data.data?.elements?.length || 0
          });
        } catch (e) {
          // Skip invalid entries
        }
      }
    }

    return templates.sort((a, b) => 
      new Date(b.updatedAt) - new Date(a.updatedAt)
    );
  }, []);

  /**
   * Delete a template
   */
  const deleteTemplate = useCallback((templateId) => {
    localStorage.removeItem(templateId);
    
    // Update history
    const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    const filtered = history.filter(h => h.id !== templateId);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
    setTemplateHistory(filtered);

    return { success: true };
  }, []);

  /**
   * Export as JSON (copy to clipboard & download)
   */
  const exportJSON = useCallback(async () => {
    const templateData = buildTemplateData();
    const jsonString = JSON.stringify(templateData, null, 2);

    // Try to copy to clipboard
    try {
      await navigator.clipboard.writeText(jsonString);
    } catch (e) {
      console.warn('Clipboard copy failed:', e);
    }

    // Create download link
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${templateName.replace(/[^a-z0-9]/gi, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);

    return { success: true, json: jsonString };
  }, [buildTemplateData, templateName]);

  /**
   * Import from JSON
   */
  const importJSON = useCallback(async (jsonString) => {
    try {
      const templateData = JSON.parse(jsonString);
      
      const loadedElements = templateData.data?.elements || templateData.elements || [];
      const loadedSections = templateData.data?.sections || templateData.sections || [];
      const loadedName = templateData.name || 'Imported Resume';

      setElements(loadedElements);
      setSections(loadedSections);
      setTemplateName(loadedName);

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Invalid JSON format' };
    }
  }, [setElements, setSections, setTemplateName]);

  /**
   * Export as ATS-optimized HTML
   */
  const exportATSHTML = useCallback(() => {
    // Sort elements by reading order
    const sortedElements = [...elements].sort((a, b) => {
      if (Math.abs(a.y - b.y) < 20) return a.x - b.x;
      return a.y - b.y;
    });

    // Build semantic HTML
    let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${templateName}</title>
  <style>
    body {
      font-family: Arial, Helvetica, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px;
      line-height: 1.6;
      color: #333;
    }
    h1 { font-size: 24px; margin-bottom: 8px; }
    h2 { font-size: 18px; margin-top: 24px; border-bottom: 1px solid #ccc; padding-bottom: 4px; }
    h3 { font-size: 16px; margin-bottom: 4px; }
    .contact { font-size: 14px; color: #666; margin-bottom: 16px; }
    .section { margin-bottom: 24px; }
    .entry { margin-bottom: 16px; }
    ul { margin: 8px 0; padding-left: 20px; }
    li { margin-bottom: 4px; }
  </style>
</head>
<body>
`;

    // Header elements
    sortedElements
      .filter(el => !el.parentSection)
      .forEach(el => {
        const tag = el.semanticTag || (el.fontSize > 20 ? 'h1' : 'p');
        const className = el.atsField === 'contact' ? ' class="contact"' : '';
        html += `  <${tag}${className}>${escapeHtml(el.content)}</${tag}>\n`;
      });

    // Sections
    const rootSections = sections
      .filter(s => !s.parentSection)
      .sort((a, b) => a.y - b.y);

    rootSections.forEach(section => {
      html += `\n  <section class="section">\n`;
      html += `    <h2>${escapeHtml(section.title)}</h2>\n`;

      // Section content
      const sectionElements = sortedElements
        .filter(el => el.parentSection === section.id)
        .sort((a, b) => a.y - b.y);

      // Check for subsections
      const subSections = sections
        .filter(s => s.parentSection === section.id)
        .sort((a, b) => a.y - b.y);

      if (subSections.length > 0) {
        subSections.forEach(sub => {
          html += `    <div class="entry">\n`;
          html += `      <h3>${escapeHtml(sub.title)}</h3>\n`;
          
          const subElements = sortedElements
            .filter(el => el.parentSection === sub.id);
          
          subElements.forEach(el => {
            if (el.type === 'list-item' || el.content?.startsWith('•')) {
              html += `      <ul><li>${escapeHtml(el.content.replace(/^[•\-]\s*/, ''))}</li></ul>\n`;
            } else {
              html += `      <p>${escapeHtml(el.content)}</p>\n`;
            }
          });
          
          html += `    </div>\n`;
        });
      } else if (section.contentType === 'list-items') {
        html += `    <ul>\n`;
        sectionElements.forEach(el => {
          html += `      <li>${escapeHtml(el.content.replace(/^[•\-]\s*/, ''))}</li>\n`;
        });
        html += `    </ul>\n`;
      } else {
        sectionElements.forEach(el => {
          html += `    <p>${escapeHtml(el.content)}</p>\n`;
        });
      }

      html += `  </section>\n`;
    });

    html += `</body>\n</html>`;

    // Download
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${templateName.replace(/[^a-z0-9]/gi, '_')}_ATS.html`;
    a.click();
    URL.revokeObjectURL(url);

    return { success: true, html };
  }, [elements, sections, templateName]);

  /**
   * Export as plain text (most ATS-friendly)
   */
  const exportPlainText = useCallback(() => {
    const sortedElements = [...elements].sort((a, b) => {
      if (Math.abs(a.y - b.y) < 20) return a.x - b.x;
      return a.y - b.y;
    });

    let text = '';

    // Header
    sortedElements
      .filter(el => !el.parentSection)
      .forEach(el => {
        text += el.content + '\n';
      });

    text += '\n';

    // Sections
    const rootSections = sections
      .filter(s => !s.parentSection)
      .sort((a, b) => a.y - b.y);

    rootSections.forEach(section => {
      text += `${section.title.toUpperCase()}\n`;
      text += '─'.repeat(40) + '\n';

      const sectionElements = sortedElements
        .filter(el => el.parentSection === section.id);

      const subSections = sections
        .filter(s => s.parentSection === section.id)
        .sort((a, b) => a.y - b.y);

      if (subSections.length > 0) {
        subSections.forEach(sub => {
          text += `\n${sub.title}\n`;
          
          const subElements = sortedElements
            .filter(el => el.parentSection === sub.id);
          
          subElements.forEach(el => {
            text += `${el.content}\n`;
          });
        });
      } else {
        sectionElements.forEach(el => {
          text += `${el.content}\n`;
        });
      }

      text += '\n';
    });

    // Download
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${templateName.replace(/[^a-z0-9]/gi, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    return { success: true, text };
  }, [elements, sections, templateName]);

  return {
    isSaving,
    templateHistory,
    saveTemplate,
    loadTemplate,
    getAllTemplates,
    deleteTemplate,
    exportJSON,
    importJSON,
    exportATSHTML,
    exportPlainText,
    buildTemplateData
  };
}

// Helper to escape HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
