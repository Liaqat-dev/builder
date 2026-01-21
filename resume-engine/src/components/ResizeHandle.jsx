/**
 * ResizeHandle Component
 * =======================
 * A draggable handle for resizing elements and sections.
 */

export function ResizeHandle({ position, onMouseDown }) {
  const positionStyles = {
    nw: { top: -5, left: -5, cursor: 'nw-resize' },
    n: { top: -5, left: '50%', transform: 'translateX(-50%)', cursor: 'n-resize' },
    ne: { top: -5, right: -5, cursor: 'ne-resize' },
    e: { top: '50%', right: -5, transform: 'translateY(-50%)', cursor: 'e-resize' },
    se: { bottom: -5, right: -5, cursor: 'se-resize' },
    s: { bottom: -5, left: '50%', transform: 'translateX(-50%)', cursor: 's-resize' },
    sw: { bottom: -5, left: -5, cursor: 'sw-resize' },
    w: { top: '50%', left: -5, transform: 'translateY(-50%)', cursor: 'w-resize' }
  };

  return (
    <div
      className="resize-handle"
      style={positionStyles[position]}
      onMouseDown={onMouseDown}
    >
      <style>{`
        .resize-handle {
          position: absolute;
          width: 10px;
          height: 10px;
          background-color: var(--accent-color, #3b82f6);
          border: 2px solid white;
          border-radius: 50%;
          z-index: 1000;
          transition: 
            transform 0.1s ease,
            background-color 0.1s ease;
        }

        .resize-handle:hover {
          transform: scale(1.2);
          background-color: #2563eb;
        }
      `}</style>
    </div>
  );
}

/**
 * SelectionBox Component
 * =======================
 * The marquee selection rectangle drawn on the canvas.
 */

export function SelectionBox({ box }) {
  const left = Math.min(box.startX, box.endX);
  const top = Math.min(box.startY, box.endY);
  const width = Math.abs(box.endX - box.startX);
  const height = Math.abs(box.endY - box.startY);

  return (
    <div
      className="selection-box"
      style={{
        left,
        top,
        width,
        height
      }}
    >
      <style>{`
        .selection-box {
          position: absolute;
          border: 2px dashed var(--accent-color, #3b82f6);
          background-color: rgba(59, 130, 246, 0.1);
          pointer-events: none;
          z-index: 9999;
        }
      `}</style>
    </div>
  );
}
