/**
 * CommandPalette Component
 * =========================
 * A keyboard-accessible command menu (Cmd+K).
 */

import { useState, useEffect, useRef } from 'react';

export function CommandPalette({
  onClose,
  onAddSection,
  onExport,
  onSave,
  onLoad
}) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  const commands = [
    { id: 'add-section', label: 'Add Section', icon: '➕', shortcut: null, action: onAddSection },
    { id: 'add-experience', label: 'Add Experience Section', icon: '💼', action: () => onAddSection?.({ type: 'experience', title: 'Experience' }) },
    { id: 'add-education', label: 'Add Education Section', icon: '🎓', action: () => onAddSection?.({ type: 'education', title: 'Education' }) },
    { id: 'add-skills', label: 'Add Skills Section', icon: '🛠️', action: () => onAddSection?.({ type: 'skills', title: 'Skills' }) },
    { id: 'add-summary', label: 'Add Summary Section', icon: '📝', action: () => onAddSection?.({ type: 'summary', title: 'Professional Summary' }) },
    { id: 'save', label: 'Save Template', icon: '💾', shortcut: '⌘S', action: onSave },
    { id: 'load', label: 'Load Template', icon: '📂', shortcut: '⌘O', action: onLoad },
    { id: 'export', label: 'Export Resume', icon: '📥', shortcut: '⌘E', action: onExport },
  ];

  const filteredCommands = commands.filter(cmd =>
    cmd.label.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, filteredCommands.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && filteredCommands[selectedIndex]) {
      e.preventDefault();
      filteredCommands[selectedIndex].action?.();
      onClose();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <>
      <div className="palette-backdrop" onClick={onClose} />
      
      <div className="palette" onKeyDown={handleKeyDown}>
        <div className="palette-input-wrapper">
          <span className="palette-icon">🔍</span>
          <input
            ref={inputRef}
            type="text"
            className="palette-input"
            placeholder="Type a command..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <kbd className="palette-kbd">ESC</kbd>
        </div>

        <div className="palette-commands">
          {filteredCommands.length === 0 ? (
            <div className="palette-empty">No commands found</div>
          ) : (
            filteredCommands.map((cmd, index) => (
              <button
                key={cmd.id}
                className={`palette-command ${index === selectedIndex ? 'selected' : ''}`}
                onClick={() => {
                  cmd.action?.();
                  onClose();
                }}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <span className="command-icon">{cmd.icon}</span>
                <span className="command-label">{cmd.label}</span>
                {cmd.shortcut && <kbd className="command-shortcut">{cmd.shortcut}</kbd>}
              </button>
            ))
          )}
        </div>
      </div>

      <style>{`
        .palette-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          z-index: 2000;
        }

        .palette {
          position: fixed;
          top: 20%;
          left: 50%;
          transform: translateX(-50%);
          width: 90%;
          max-width: 500px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
          z-index: 2001;
          overflow: hidden;
          animation: paletteIn 0.2s ease;
        }

        @keyframes paletteIn {
          from {
            opacity: 0;
            transform: translateX(-50%) scale(0.95);
          }
        }

        .palette-input-wrapper {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          border-bottom: 1px solid #e5e7eb;
        }

        .palette-icon {
          font-size: 18px;
        }

        .palette-input {
          flex: 1;
          border: none;
          outline: none;
          font-size: 16px;
          color: #1f2937;
        }

        .palette-input::placeholder {
          color: #9ca3af;
        }

        .palette-kbd {
          padding: 4px 8px;
          background: #f3f4f6;
          border-radius: 4px;
          font-size: 11px;
          font-family: inherit;
          color: #6b7280;
        }

        .palette-commands {
          max-height: 300px;
          overflow-y: auto;
          padding: 8px;
        }

        .palette-empty {
          padding: 24px;
          text-align: center;
          color: #9ca3af;
        }

        .palette-command {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 12px;
          background: none;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          text-align: left;
          transition: background 0.1s ease;
        }

        .palette-command:hover,
        .palette-command.selected {
          background: #f3f4f6;
        }

        .command-icon {
          font-size: 18px;
        }

        .command-label {
          flex: 1;
          font-size: 14px;
          color: #374151;
        }

        .command-shortcut {
          padding: 4px 8px;
          background: #e5e7eb;
          border-radius: 4px;
          font-size: 11px;
          color: #6b7280;
        }
      `}</style>
    </>
  );
}
