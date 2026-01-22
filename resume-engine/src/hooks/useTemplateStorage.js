/**
 * useTemplateStorage Hook (WITH BACKEND API)
 * ============================================
 * Handles template persistence using BOTH backend API and localStorage fallback.
 * This replaces the current useTemplateStorage.js
 */

import { useState, useCallback, useEffect } from 'react';
import {
  saveTemplate as apiSaveTemplate,
  getTemplates as apiGetTemplates,
  getTemplate as apiGetTemplate
} from '../services/resumeAPI';

const STORAGE_KEY = 'resume-builder-templates';
const HISTORY_KEY = 'resume-builder-history';
const USE_BACKEND = true; // Set to true to use backend API

export function useTemplateStorage({
                                     elements,
                                     sections,
                                     templateName,
                                     setElements,
                                     setSections,
                                     setTemplateName
                                   }) {
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [templateHistory, setTemplateHistory] = useState([]);
  const [backendAvailable, setBackendAvailable] = useState(false);

  /**
   * Check if backend is available
   */
  useEffect(() => {
    checkBackend();
  }, []);

  const checkBackend = async () => {
    try {
      const response = await fetch('http://localhost:3001/health');
      setBackendAvailable(response.ok);
      console.log('✅ Backend server connected');
    } catch (error) {
      setBackendAvailable(false);
      console.log('⚠️ Backend server not available, using localStorage fallback');
    }
  };

  /**
   * Build template data object
   */
  const buildTemplateData = useCallback((name = templateName) => ({
    elements,
    sections,
    canvasSettings: {
      width: '210mm',
      height: '297mm',
      backgroundColor: 'white',
      margins: { top: 40, right: 40, bottom: 40, left: 40 }
    }
  }), [elements, sections, templateName]);

  /**
   * Save template (Backend API or localStorage fallback)
   */
  const saveTemplate = useCallback(async (customName) => {
    setIsSaving(true);

    try {
      const name = customName || templateName;
      const templateData = buildTemplateData(name);

      // Try backend API first
      if (USE_BACKEND && backendAvailable) {
        try {
          const result = await apiSaveTemplate(templateData, name);
          console.log('✅ Template saved to backend:', result.templateId);

          // Also save to localStorage as backup
          localStorage.setItem(result.templateId, JSON.stringify({
            name,
            data: templateData,
            metadata: {
              createdAt: new Date().toISOString(),
              backendId: result.templateId
            }
          }));

          await loadTemplateList(); // Refresh list

          return {
            success: true,
            templateId: result.templateId,
            name,
            source: 'backend'
          };
        } catch (apiError) {
          console.warn('Backend save failed, falling back to localStorage:', apiError);
        }
      }

      // Fallback to localStorage
      const templateId = `template-${Date.now()}`;
      localStorage.setItem(templateId, JSON.stringify({
        name,
        version: '2.0',
        data: templateData,
        metadata: {
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          elementCount: elements.length,
          sectionCount: sections.length
        }
      }));
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

      console.log('✅ Template saved to localStorage:', templateId);
      return { success: true, templateId, name, source: 'localStorage' };

    } catch (error) {
      console.error('❌ Save error:', error);
      return { success: false, error: error.message };
    } finally {
      setIsSaving(false);
    }
  }, [templateName, buildTemplateData, elements, sections, backendAvailable]);

  /**
   * Load template from backend or localStorage
   */
  const loadTemplate = useCallback(async (templateId) => {
    setIsLoading(true);

    try {
      // Try backend first
      if (USE_BACKEND && backendAvailable && templateId && !templateId.startsWith('template-')) {
        try {
          const result = await apiGetTemplate(templateId);

          if (result.success && result.template) {
            const template = result.template.template;
            setElements(template.elements || []);
            setSections(template.sections || []);
            setTemplateName(result.template.name);

            console.log('✅ Template loaded from backend:', templateId);
            return {
              success: true,
              templateData: result.template,
              name: result.template.name,
              source: 'backend'
            };
          }
        } catch (apiError) {
          console.warn('Backend load failed, trying localStorage:', apiError);
        }
      }

      // Fallback to localStorage
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

      console.log('✅ Template loaded from localStorage:', id);
      return {
        success: true,
        templateData,
        name: loadedName,
        source: 'localStorage'
      };

    } catch (error) {
      console.error('❌ Load error:', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  }, [setElements, setSections, setTemplateName, backendAvailable]);

  /**
   * Get all saved templates (from both backend and localStorage)
   */
  const loadTemplateList = useCallback(async () => {
    setIsLoading(true);
    const templates = [];

    try {
      // Try to get from backend
      if (USE_BACKEND && backendAvailable) {
        try {
          const result = await apiGetTemplates();
          if (result.success && result.templates) {
            templates.push(...result.templates.map(t => ({
              ...t,
              source: 'backend'
            })));
            console.log(`✅ Loaded ${result.templates.length} templates from backend`);
          }
        } catch (apiError) {
          console.warn('Failed to load templates from backend:', apiError);
        }
      }

      // Also get from localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('template-')) {
          try {
            const data = JSON.parse(localStorage.getItem(key));
            // Don't duplicate if already loaded from backend
            if (!templates.find(t => t.id === key)) {
              templates.push({
                id: key,
                name: data.name || 'Unnamed Template',
                createdAt: data.metadata?.createdAt || new Date().toISOString(),
                elementCount: data.metadata?.elementCount || 0,
                sectionCount: data.metadata?.sectionCount || 0,
                source: 'localStorage'
              });
            }
          } catch (error) {
            console.warn(`Failed to parse template ${key}:`, error);
          }
        }
      }

      setTemplateHistory(templates);
      return templates;

    } catch (error) {
      console.error('❌ Error loading template list:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [backendAvailable]);

  /**
   * Export template as JSON
   */
  const exportJSON = useCallback(() => {
    const templateData = buildTemplateData(templateName);
    const dataStr = JSON.stringify(templateData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${templateName}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [buildTemplateData, templateName]);

  /**
   * Import template from JSON
   */
  const importJSON = useCallback((jsonString) => {
    try {
      const data = JSON.parse(jsonString);

      if (data.elements && data.sections) {
        setElements(data.elements);
        setSections(data.sections);
        setTemplateName(data.name || 'Imported Template');
        return { success: true };
      }

      return { success: false, error: 'Invalid template format' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [setElements, setSections, setTemplateName]);

  return {
    saveTemplate,
    loadTemplate,
    loadTemplateList,
    exportJSON,
    importJSON,
    templateHistory,
    isSaving,
    isLoading,
    backendAvailable
  };
}