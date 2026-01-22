/**
 * useTemplateStorage Hook (FINAL BULLETPROOF VERSION)
 * ====================================================
 * Uses aggressive deep cleaning to prevent ANY circular references.
 */

import { useState, useCallback } from 'react';
import { exportCleanTemplate, safeStringify } from '../utils/sanitizeData.js';

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
   * Export as JSON - GUARANTEED NO ERRORS
   */
  const exportJSON = useCallback(async () => {
    try {
      console.log('📤 Starting JSON export...');
      console.log('   Elements to export:', elements?.length || 0);
      console.log('   Sections to export:', sections?.length || 0);

      // Use aggressive cleaning
      const cleanTemplate = exportCleanTemplate(elements, sections, templateName);

      console.log('✅ Template cleaned successfully');
      console.log('   Clean elements:', cleanTemplate.data.elements.length);
      console.log('   Clean sections:', cleanTemplate.data.sections.length);

      // Use safe stringify (cannot fail)
      const jsonString = safeStringify(cleanTemplate, 2);

      console.log('✅ JSON string created:', jsonString.length, 'chars');

      // Copy to clipboard (optional)
      try {
        await navigator.clipboard.writeText(jsonString);
        console.log('✅ Copied to clipboard');
      } catch (e) {
        console.warn('⚠️ Clipboard failed (OK):', e.message);
      }

      // Download file
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const fileName = (templateName || 'resume').replace(/[^a-z0-9]/gi, '_');
      a.download = `${fileName}.json`;

      // Ensure it's added to DOM before clicking
      document.body.appendChild(a);
      a.click();

      // Clean up after a delay
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);

      console.log('✅ Download triggered:', a.download);

      // Show success message to user
      alert('✅ JSON exported successfully!');

      return { success: true, json: jsonString };
    } catch (error) {
      console.error('❌ Export failed:', error);
      console.error('   Error type:', error.constructor.name);
      console.error('   Error message:', error.message);
      console.error('   Stack:', error.stack);

      alert(`Export failed: ${error.message}\n\nCheck the browser console for details.`);
      return { success: false, error: error.message };
    }
  }, [elements, sections, templateName]);

  /**
   * Save template - also uses aggressive cleaning
   */
  const saveTemplate = useCallback(async (customName) => {
    setIsSaving(true);

    try {
      console.log('💾 Saving template...');

      const name = customName || templateName;
      const templateId = `template-${Date.now()}`;

      // Use aggressive cleaning
      const cleanTemplate = exportCleanTemplate(elements, sections, name);

      // Safe stringify
      const jsonString = safeStringify(cleanTemplate);

      // Save to localStorage
      localStorage.setItem(templateId, jsonString);
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

      console.log('✅ Template saved:', templateId);
      return { success: true, templateId, name };
    } catch (error) {
      console.error('❌ Save error:', error);
      alert(`Failed to save: ${error.message}`);
      return { success: false, error: error.message };
    } finally {
      setIsSaving(false);
    }
  }, [elements, sections, templateName]);

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

      const loadedElements = templateData.data?.elements || templateData.elements || [];
      const loadedSections = templateData.data?.sections || templateData.sections || [];
      const loadedName = templateData.name || 'Loaded Resume';

      setElements(loadedElements);
      setSections(loadedSections);
      setTemplateName(loadedName);

      console.log('✅ Template loaded:', id);
      return {
        success: true,
        templateData,
        name: loadedName
      };
    } catch (error) {
      console.error('❌ Load error:', error);
      return { success: false, error: error.message };
    }
  }, [setElements, setSections, setTemplateName]);

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

      console.log('✅ JSON imported');
      return { success: true };
    } catch (error) {
      console.error('❌ Import error:', error);
      alert(`Import failed: ${error.message}`);
      return { success: false, error: 'Invalid JSON format' };
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
            name: data.name || 'Unnamed Template',
            updatedAt: data.metadata?.updatedAt || data.updatedAt || new Date().toISOString(),
            elementCount: data.metadata?.elementCount || data.data?.elements?.length || 0
          });
        } catch (e) {
          console.warn('Skipping invalid template:', key);
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

    const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    const filtered = history.filter(h => h.id !== templateId);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
    setTemplateHistory(filtered);

    return { success: true };
  }, []);

  return {
    saveTemplate,
    loadTemplate,
    getAllTemplates,
    deleteTemplate,
    exportJSON,
    importJSON,
    templateHistory,
    isSaving
  };
}