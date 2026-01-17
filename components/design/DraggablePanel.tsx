/**
 * DraggablePanel - A minimal, utility-focused draggable and resizable panel
 * Embodying Kantian efficiency: maximum utility with minimum size
 */

"use client";

import { useState, useRef, useEffect, ReactNode } from 'react';
import { X, Minus, Maximize2, Minimize2, GripVertical } from 'lucide-react';

interface DraggablePanelProps {
  children: ReactNode;
  title: string;
  icon?: ReactNode;
  defaultPosition?: { x: number; y: number };
  defaultSize?: { width: number; height: number };
  minSize?: { width: number; height: number };
  maxSize?: { width: number; height: number };
  resizable?: boolean;
  minimizable?: boolean;
  maximizable?: boolean;
  closable?: boolean;
  onClose?: () => void;
  className?: string;
  headerColor?: string;
  zIndex?: number;
  id?: string;
}

export default function DraggablePanel({
  children,
  title,
  icon,
  defaultPosition = { x: 100, y: 100 },
  defaultSize = { width: 320, height: 400 },
  minSize = { width: 280, height: 200 },
  maxSize = { width: 800, height: 900 },
  resizable = true,
  minimizable = true,
  maximizable = true,
  closable = true,
  onClose,
  className = '',
  headerColor = 'from-primary-600 to-primary-700',
  zIndex = 30,
  id,
}: DraggablePanelProps) {
  const [position, setPosition] = useState(defaultPosition);
  const [size, setSize] = useState(defaultSize);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [resizeDirection, setResizeDirection] = useState<string>('');

  const panelRef = useRef<HTMLDivElement>(null);

  // Save/load state from localStorage
  useEffect(() => {
    if (!id) return;

    const saved = localStorage.getItem(`panel-state-${id}`);
    if (saved) {
      try {
        const state = JSON.parse(saved);
        if (state.position) setPosition(state.position);
        if (state.size) setSize(state.size);
        if (state.isMinimized !== undefined) setIsMinimized(state.isMinimized);
      } catch (e) {
        // Ignore parse errors
      }
    }
  }, [id]);

  useEffect(() => {
    if (!id) return;

    const state = { position, size, isMinimized };
    localStorage.setItem(`panel-state-${id}`, JSON.stringify(state));
  }, [id, position, size, isMinimized]);

  // Drag handlers
  const handleDragStart = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.no-drag')) return;

    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleDrag = (e: MouseEvent) => {
    if (!isDragging) return;

    const newX = Math.max(0, Math.min(window.innerWidth - size.width, e.clientX - dragStart.x));
    const newY = Math.max(0, Math.min(window.innerHeight - (isMinimized ? 60 : size.height), e.clientY - dragStart.y));

    setPosition({ x: newX, y: newY });
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  // Resize handlers
  const handleResizeStart = (e: React.MouseEvent, direction: string) => {
    if (!resizable) return;

    e.stopPropagation();
    setIsResizing(true);
    setResizeDirection(direction);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height,
    });
  };

  const handleResize = (e: MouseEvent) => {
    if (!isResizing) return;

    const deltaX = e.clientX - resizeStart.x;
    const deltaY = e.clientY - resizeStart.y;

    let newWidth = size.width;
    let newHeight = size.height;
    let newX = position.x;
    let newY = position.y;

    // Handle different resize directions
    if (resizeDirection.includes('e')) {
      newWidth = Math.max(minSize.width, Math.min(maxSize.width, resizeStart.width + deltaX));
    }
    if (resizeDirection.includes('w')) {
      const proposedWidth = resizeStart.width - deltaX;
      if (proposedWidth >= minSize.width && proposedWidth <= maxSize.width) {
        newWidth = proposedWidth;
        newX = position.x + deltaX;
      }
    }
    if (resizeDirection.includes('s')) {
      newHeight = Math.max(minSize.height, Math.min(maxSize.height, resizeStart.height + deltaY));
    }
    if (resizeDirection.includes('n')) {
      const proposedHeight = resizeStart.height - deltaY;
      if (proposedHeight >= minSize.height && proposedHeight <= maxSize.height) {
        newHeight = proposedHeight;
        newY = position.y + deltaY;
      }
    }

    setSize({ width: newWidth, height: newHeight });
    if (newX !== position.x || newY !== position.y) {
      setPosition({ x: newX, y: newY });
    }
  };

  const handleResizeEnd = () => {
    setIsResizing(false);
    setResizeDirection('');
  };

  // Mouse event listeners
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleDrag);
      window.addEventListener('mouseup', handleDragEnd);
      return () => {
        window.removeEventListener('mousemove', handleDrag);
        window.removeEventListener('mouseup', handleDragEnd);
      };
    }
  }, [isDragging, dragStart, position, size]);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleResize);
      window.addEventListener('mouseup', handleResizeEnd);
      return () => {
        window.removeEventListener('mousemove', handleResize);
        window.removeEventListener('mouseup', handleResizeEnd);
      };
    }
  }, [isResizing, resizeStart, resizeDirection]);

  // Handle minimize
  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
    if (isMaximized) setIsMaximized(false);
  };

  // Handle maximize
  const toggleMaximize = () => {
    if (isMaximized) {
      setIsMaximized(false);
    } else {
      setIsMaximized(true);
      setIsMinimized(false);
      setPosition({ x: 10, y: 10 });
      setSize({
        width: window.innerWidth - 20,
        height: window.innerHeight - 20,
      });
    }
  };

  // Handle close
  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closable) {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [closable]);

  const panelStyle: React.CSSProperties = {
    position: 'fixed',
    left: `${position.x}px`,
    top: `${position.y}px`,
    width: isMaximized ? `${size.width}px` : isMinimized ? 'auto' : `${size.width}px`,
    height: isMinimized ? 'auto' : `${size.height}px`,
    zIndex,
    transition: isMaximized || isMinimized ? 'all 0.2s ease-out' : 'none',
  };

  return (
    <div
      ref={panelRef}
      style={panelStyle}
      className={`bg-white/95 backdrop-blur-sm rounded-lg shadow-2xl overflow-hidden flex flex-col ${className}`}
    >
      {/* Header - Draggable */}
      <div
        className={`bg-gradient-to-r ${headerColor} text-white px-3 py-2 cursor-move select-none flex items-center justify-between`}
        onMouseDown={handleDragStart}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <GripVertical className="w-4 h-4 flex-shrink-0 opacity-60" />
          {icon && <span className="flex-shrink-0">{icon}</span>}
          <h3 className="text-sm font-bold truncate">{title}</h3>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1 no-drag flex-shrink-0">
          {minimizable && (
            <button
              onClick={toggleMinimize}
              className="p-1 hover:bg-white/20 rounded transition-colors"
              title={isMinimized ? "Restore" : "Minimize"}
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
          )}
          {maximizable && !isMinimized && (
            <button
              onClick={toggleMaximize}
              className="p-1 hover:bg-white/20 rounded transition-colors"
              title={isMaximized ? "Restore" : "Maximize"}
            >
              {isMaximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          )}
          {closable && (
            <button
              onClick={handleClose}
              className="p-1 hover:bg-white/20 rounded transition-colors"
              title="Close (Esc)"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {!isMinimized && (
        <div className="flex-1 overflow-hidden flex flex-col">
          {children}
        </div>
      )}

      {/* Resize Handles */}
      {resizable && !isMinimized && !isMaximized && (
        <>
          {/* Corners */}
          <div
            className="absolute top-0 left-0 w-3 h-3 cursor-nw-resize"
            onMouseDown={(e) => handleResizeStart(e, 'nw')}
          />
          <div
            className="absolute top-0 right-0 w-3 h-3 cursor-ne-resize"
            onMouseDown={(e) => handleResizeStart(e, 'ne')}
          />
          <div
            className="absolute bottom-0 left-0 w-3 h-3 cursor-sw-resize"
            onMouseDown={(e) => handleResizeStart(e, 'sw')}
          />
          <div
            className="absolute bottom-0 right-0 w-3 h-3 cursor-se-resize"
            onMouseDown={(e) => handleResizeStart(e, 'se')}
          />

          {/* Edges */}
          <div
            className="absolute top-0 left-3 right-3 h-1 cursor-n-resize"
            onMouseDown={(e) => handleResizeStart(e, 'n')}
          />
          <div
            className="absolute bottom-0 left-3 right-3 h-1 cursor-s-resize"
            onMouseDown={(e) => handleResizeStart(e, 's')}
          />
          <div
            className="absolute left-0 top-3 bottom-3 w-1 cursor-w-resize"
            onMouseDown={(e) => handleResizeStart(e, 'w')}
          />
          <div
            className="absolute right-0 top-3 bottom-3 w-1 cursor-e-resize"
            onMouseDown={(e) => handleResizeStart(e, 'e')}
          />
        </>
      )}
    </div>
  );
}
