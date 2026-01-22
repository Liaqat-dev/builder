/**
 * ResumeBuilder.jsx - SECTION FIX
 * ================================
 *
 * FIXES:
 * 1. Proper implementation of addContentToSection
 * 2. Integration with AddContentModal
 * 3. Support for bullets and subsections
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
import { AddContentModal } from './components/AddContentModal';

// Context
import { ResumeProvider } from './context/ResumeContext';

// Styles
import './styles/global.css';

function ResumeBuilder() {
  // Core state
  const canvasRef = useRef(null);
  const [templateName, setTemplateName] = useState('Untitled Resume');
  const [activeView, setActiveView] = useState('editor');
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showTemplateGallery, setShowTemplateGallery] = useState(false);

  // Section content modal
  const [showAddContentModal, setShowAddContentModal] = useState(false);
  const [currentSection, setCurrentSection] = useState(null);

  // Custom hooks
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
    setSections
  } = useSections();

  const {
    selectedIds,
    setSelectedIds,
    selectAll,
    clearSelection
  } = useSelection();

  const {
    isDragging,
    selectionBox,
    handleDragStart,
    handleCanvasMouseDown,
    handleResizeStart
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

  // Handle selection change
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

  // Property change handler
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

  // Delete handler
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
  }, []);

  /**
   * FIXED: Handle adding content to section via + button
   */
  const handleAddContentToSection = useCallback((section) => {
    setCurrentSection(section);
    setShowAddContentModal(true);
  }, []);

  /**
   * FIXED: Handle content addition from modal
   */
  const handleAddContent = useCallback((contentConfig) => {
    if (!contentConfig || !currentSection) return;

    // Calculate position within section
    const baseX = currentSection.x + 15;
    const baseY = currentSection.y + 60;

    switch (contentConfig.type) {
      case 'element':
        // Add text element
        addElement({
          ...contentConfig.config,
          parentSection: currentSection.id,
          x: baseX,
          y: baseY
        });
        break;

      case 'bullets':
        // For now, add as text elements with bullet points
        // In full implementation, you'd use BulletListComponent
        const bulletText = contentConfig.config.items
            .map(item => `${contentConfig.config.listType === 'disc' ? '•' : '1.'} ${item.content}`)
            .join('\n');

        addElement({
          type: 'text',
          content: bulletText,
          parentSection: currentSection.id,
          x: baseX,
          y: baseY,
          width: contentConfig.config.width || 450,
          height: contentConfig.config.height || 100,
          fontSize: 11,
          fontFamily: 'Arial',
          color: contentConfig.config.bulletColor || '#000000'
        });
        break;

      case 'subsection':
        // Add subsection as nested section
        const template = contentConfig.config;
        addSection({
          title: template.title,
          parentSection: currentSection.id,
          x: baseX,
          y: baseY,
          width: template.width || currentSection.width - 30,
          height: template.height || 120,
          contentType: 'text',
          backgroundColor: '#f9fafb',
          borderColor: '#e5e7eb'
        });
        break;
    }

    setShowAddContentModal(false);
    setCurrentSection(null);
  }, [currentSection, addElement, addSection]);

  /**
   * Handle double-click to add content
   */
  const handleDoubleClick = useCallback((e, parentSection) => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (parentSection) {
      // Double-clicked inside a section - show modal
      setCurrentSection(parentSection);
      setShowAddContentModal(true);
    } else {
      // Double-clicked on canvas - add text element
      addElement({
        type: 'text',
        content: 'New Text',
        x: x - 50,
        y: y - 15,
        width: 200,
        height: 40,
        fontSize: 11,
        fontFamily: 'Arial',
        color: '#000000'
      });
    }
  }, [addElement]);

  return (
      <ResumeProvider value={{
        elements,
        sections,
        selectedIds,
        templateName,
        atsScore
      }}>
        <div className="resume-builder">
          {/* Command Palette */}
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

          {/* Add Content Modal */}
          {showAddContentModal && currentSection && (
              <AddContentModal
                  section={currentSection}
                  onAdd={handleAddContent}
                  onClose={() => {
                    setShowAddContentModal(false);
                    setCurrentSection(null);
                  }}
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
            {/* Left Panel */}
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
                onDoubleClick={handleDoubleClick}
                onUpdateElement={updateElement}
                onUpdateSection={updateSection}
                onAddContentToSection={handleAddContentToSection}
                onResizeStart={handleResizeStart}
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