/**
 * 🎯 ATS-FRIENDLY RESUME BUILDER
 * ================================
 * A modern, modular resume builder designed for both visual appeal
 * and ATS (Applicant Tracking System) compatibility.
 *
 * Architecture:
 * - ResumeBuilder.jsx (Main orchestrator)
 * - /hooks (Custom hooks for state & logic)
 * - /components (UI components)
 * - /utils (Helpers & constants)
 * - /context (Global state management)
 */



import { useState, useRef, useCallback } from 'react';

// Hooks
import { useElements } from './hooks/useElements';
import { useSections } from './hooks/useSections';
import { useSelection } from './hooks/useSelection';
import { useDragAndDrop } from './hooks/useDragAndDrop';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useTemplateStorage } from './hooks/useTemplateStorage';
import { useATSScore } from './hooks/useATSScore';

// Components
import { Canvas } from './components/Canvas';
import { Toolbar } from './components/Toolbar';
import { PropertyDrawer } from './components/PropertyDrawer';
import { ATSScorePanel } from './components/ATSScorePanel';
import { TemplateGallery } from './components/TemplateGallery';
import { ExportModal } from './components/ExportModal';
import { KeywordAnalyzer } from './components/KeywordAnalyzer';
import { CommandPalette } from './components/CommandPalette';

// Context
import { ResumeProvider } from './context/ResumeContext';

// Styles
import './styles/global.css';

function ResumeBuilder() {
  // Core state
  const canvasRef = useRef(null);
  const [templateName, setTemplateName] = useState('Untitled Resume');
  const [activeView, setActiveView] = useState('editor'); // editor | preview | ats
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showTemplateGallery, setShowTemplateGallery] = useState(false);

  // Custom hooks for modular state management
  const {
    elements,
    addElement,
    updateElement,
    deleteElements,
    duplicateElements,
    setElements
  } = useElements();

  const {
    sections,
    addSection,
    updateSection,
    deleteSections,
    addContentToSection,
    setSections
  } = useSections();

  const {
    selectedIds,
    setSelectedIds,
    selectAll,
    clearSelection,
    toggleSelection,
    isSelected
  } = useSelection();

  const {
    isDragging,
    selectionBox,
    handleDragStart,
    handleCanvasMouseDown
  } = useDragAndDrop({
    elements,
    sections,
    selectedIds,
    setSelectedIds,
    updateElement,
    updateSection,
    canvasRef
  });

  const {
    saveTemplate,
    loadTemplate,
    exportJSON,
    importJSON,
    templateHistory
  } = useTemplateStorage({
    elements,
    sections,
    templateName,
    setElements,
    setSections,
    setTemplateName
  });

  const {
    atsScore,
    suggestions,
    analyzeResume
  } = useATSScore({ elements, sections });

  // Keyboard shortcuts
  useKeyboardShortcuts({
    selectedIds,
    deleteElements: () => {
      deleteElements(selectedIds);
      deleteSections(selectedIds);
      clearSelection();
    },
    duplicateElements: () => duplicateElements(selectedIds),
    selectAll,
    clearSelection,
    setShowCommandPalette
  });

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Handle selection change to open drawer
  const handleSelectionChange = useCallback((ids) => {
    setSelectedIds(ids);
    if (ids.length === 1) {
      const element = elements.find(el => el.id === ids[0]);
      const section = sections.find(sec => sec.id === ids[0]);
      if (element) {
        setEditingItem({ ...element, isSection: false });
        setDrawerOpen(true);
      } else if (section) {
        setEditingItem({ ...section, isSection: true });
        setDrawerOpen(true);
      }
    } else {
      setDrawerOpen(false);
      setEditingItem(null);
    }
  }, [elements, sections, setSelectedIds]);

  // Handle property changes from drawer
  const handlePropertyChange = useCallback((updates) => {
    if (!editingItem) return;

    if (editingItem.isSection) {
      updateSection(editingItem.id, updates);
      setEditingItem(prev => ({ ...prev, ...updates }));
    } else {
      updateElement(editingItem.id, updates);
      setEditingItem(prev => ({ ...prev, ...updates }));
    }
  }, [editingItem, updateElement, updateSection]);

  // Delete selected items
  const handleDelete = useCallback(() => {
    deleteElements(selectedIds);
    deleteSections(selectedIds);
    clearSelection();
    setDrawerOpen(false);
    setEditingItem(null);
  }, [selectedIds, deleteElements, deleteSections, clearSelection]);

  // Close drawer
  const handleCloseDrawer = useCallback(() => {
    setDrawerOpen(false);
    setEditingItem(null);
    clearSelection();
  }, [clearSelection]);

  return (
    <ResumeProvider value={{
      elements,
      sections,
      selectedIds,
      templateName,
      atsScore
    }}>
      <div className="resume-builder">
        {/* Command Palette (Cmd+K) */}
        {showCommandPalette && (
          <CommandPalette
            onClose={() => setShowCommandPalette(false)}
            onAddSection={addSection}
            onExport={() => setShowExportModal(true)}
            onSave={saveTemplate}
            onLoad={() => setShowTemplateGallery(true)}
          />
        )}

        {/* Export Modal */}
        {showExportModal && (
          <ExportModal
            elements={elements}
            sections={sections}
            templateName={templateName}
            onClose={() => setShowExportModal(false)}
          />
        )}

        {/* Template Gallery */}
        {showTemplateGallery && (
          <TemplateGallery
            onSelect={(template) => {
              setElements(template.elements);
              setSections(template.sections);
              setTemplateName(template.name);
              setShowTemplateGallery(false);
            }}
            onClose={() => setShowTemplateGallery(false)}
          />
        )}

        {/* Main Toolbar */}
        <Toolbar
          templateName={templateName}
          onTemplateNameChange={setTemplateName}
          onAddSection={addSection}
          onSave={saveTemplate}
          onLoad={() => setShowTemplateGallery(true)}
          onExport={() => setShowExportModal(true)}
          onExportJSON={exportJSON}
          activeView={activeView}
          onViewChange={setActiveView}
          selectedCount={selectedIds.length}
          atsScore={atsScore}
        />

        {/* Main Content Area */}
        <div className="builder-content">
          {/* Left Panel - ATS Analysis */}
          {activeView === 'ats' && (
            <ATSScorePanel
              score={atsScore}
              suggestions={suggestions}
              onAnalyze={analyzeResume}
            />
          )}

          {activeView === 'editor' && (
            <KeywordAnalyzer
              elements={elements}
              onSuggestion={(keyword, elementId) => {
                // Handle keyword suggestions
              }}
            />
          )}

          {/* Canvas */}
          <Canvas
            ref={canvasRef}
            elements={elements}
            sections={sections}
            selectedIds={selectedIds}
            isDragging={isDragging}
            selectionBox={selectionBox}
            activeView={activeView}
            onElementMouseDown={(e, id) => {
              handleSelectionChange([id]);
              handleDragStart(e, id);
            }}
            onCanvasMouseDown={handleCanvasMouseDown}
            onDoubleClick={(e, parentSection) => {
              const rect = canvasRef.current.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const y = e.clientY - rect.top;

              if (parentSection) {
                addContentToSection(parentSection, { x, y });
              } else {
                addElement({
                  type: 'text',
                  content: 'New Text',
                  x: x - 50,
                  y: y - 15
                });
              }
            }}
            onUpdateElement={updateElement}
            onUpdateSection={updateSection}
            onAddContentToSection={addContentToSection}
          />

          {/* Property Drawer */}
          {drawerOpen && editingItem && (
            <PropertyDrawer
              item={editingItem}
              onChange={handlePropertyChange}
              onDelete={handleDelete}
              onClose={handleCloseDrawer}
            />
          )}
        </div>

        {/* Status Bar */}
        <div className="status-bar">
          <span className="status-item">
            {elements.length} elements • {sections.length} sections
          </span>
          {selectedIds.length > 0 && (
            <span className="status-item status-selected">
              {selectedIds.length} selected
            </span>
          )}
          <span className="status-item status-ats">
            ATS Score: {atsScore}%
          </span>
          <span className="status-item status-hint">
            Press ⌘K for commands
          </span>
        </div>
      </div>
    </ResumeProvider>
  );
}

export default ResumeBuilder;