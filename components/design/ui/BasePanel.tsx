/**
 * BasePanel - Reusable panel component with resize, minimize, drag capabilities
 * All UI panels should extend or use this component for consistency
 */

"use client";

import { useState, useRef, useEffect, ReactNode } from 'react';
import {
  Minimize2,
  Maximize2,
  X,
  Move,
  Lock,
  Unlock,
  Pin,
  PinOff,
} from 'lucide-react';
import { panelManager } from '@/lib/ui/PanelManager';

interface BasePanelProps {
  id: string;
  title: string;
  children: ReactNode;
  icon?: ReactNode;
  onClose?: () => void;
  closable?: boolean;
  minimizable?: boolean;
  resizable?: boolean;
  draggable?: boolean;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
}

export default function BasePanel({
  id,
  title,
  children,
  icon,
  onClose,
  closable = true,
  minimizable = true,
  resizable = true,
  draggable = true,
  minWidth = 280,
  minHeight = 200,
  maxWidth = 800,
  maxHeight = 1000,
  className = '',
  headerClassName = '',
  bodyClassName = '',
}: BasePanelProps) {
  const [panelState, setPanelState] = useState(() => panelManager.getPanel(id));
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<string>('');
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [isLocked, setIsLocked] = useState(false);
  const [isPinned, setIsPinned] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  // Subscribe to panel manager updates
  useEffect(() => {
    const unsubscribe = panelManager.subscribe((panels) => {
      const updated = panels.get(id);
      if (updated) {
        setPanelState(updated);
      }
    });
    return () => {
      unsubscribe();
    };
  }, [id]);

  if (!panelState || !panelState.isVisible) {
    return null;
  }

  const { position, size, isMinimized, zIndex, isDocked } = panelState;

  // Handle drag start
  const handleDragStart = (e: React.MouseEvent) => {
    if (!draggable || isLocked || isDocked) return;

    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
    panelManager.bringToFront(id);
  };

  // Handle drag move
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newX = Math.max(0, Math.min(window.innerWidth - 100, e.clientX - dragOffset.x));
      const newY = Math.max(0, Math.min(window.innerHeight - 40, e.clientY - dragOffset.y));

      panelManager.movePanel(id, { x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, id]);

  // Handle resize start
  const handleResizeStart = (e: React.MouseEvent, direction: string) => {
    if (!resizable || isLocked) return;

    e.stopPropagation();
    setIsResizing(true);
    setResizeDirection(direction);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height,
    });
    panelManager.bringToFront(id);
  };

  // Handle resize move
  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;

      let newWidth = resizeStart.width;
      let newHeight = resizeStart.height;
      let newX = position.x;
      let newY = position.y;

      if (resizeDirection.includes('e')) {
        newWidth = Math.max(minWidth, Math.min(maxWidth, resizeStart.width + deltaX));
      }
      if (resizeDirection.includes('w')) {
        const widthChange = Math.max(minWidth, Math.min(maxWidth, resizeStart.width - deltaX));
        if (widthChange !== size.width) {
          newWidth = widthChange;
          newX = position.x + (resizeStart.width - widthChange);
        }
      }
      if (resizeDirection.includes('s')) {
        newHeight = Math.max(minHeight, Math.min(maxHeight, resizeStart.height + deltaY));
      }
      if (resizeDirection.includes('n')) {
        const heightChange = Math.max(minHeight, Math.min(maxHeight, resizeStart.height - deltaY));
        if (heightChange !== size.height) {
          newHeight = heightChange;
          newY = position.y + (resizeStart.height - heightChange);
        }
      }

      panelManager.movePanel(id, { x: newX, y: newY });
      panelManager.resizePanel(id, { width: newWidth, height: newHeight });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      setResizeDirection('');
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, resizeDirection, resizeStart, id, position, size, minWidth, minHeight, maxWidth, maxHeight]);

  // Handle minimize toggle
  const handleMinimize = () => {
    if (!minimizable) return;
    panelManager.toggleMinimize(id);
  };

  // Handle close
  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      panelManager.toggleVisibility(id);
    }
  };

  // Handle double-click to toggle minimize
  const handleHeaderDoubleClick = () => {
    if (minimizable) {
      handleMinimize();
    }
  };

  // Handle click to bring to front
  const handlePanelClick = () => {
    panelManager.bringToFront(id);
  };

  const panelStyle: React.CSSProperties = {
    position: isDocked ? 'fixed' : 'fixed',
    left: position.x,
    top: position.y,
    width: size.width,
    height: isMinimized ? 'auto' : size.height,
    zIndex: isPinned ? zIndex + 1000 : zIndex,
    transition: isDragging || isResizing ? 'none' : 'box-shadow 0.2s',
  };

  return (
    <div
      ref={panelRef}
      style={panelStyle}
      className={`bg-white/95 backdrop-blur-sm rounded-lg shadow-2xl border border-gray-200 overflow-hidden ${className}`}
      onClick={handlePanelClick}
    >
      {/* Header */}
      <div
        ref={headerRef}
        className={`bg-gradient-to-r from-primary-600 to-primary-700 text-white px-4 py-3 flex items-center justify-between cursor-move select-none ${headerClassName}`}
        onMouseDown={handleDragStart}
        onDoubleClick={handleHeaderDoubleClick}
      >
        <div className="flex items-center gap-3">
          {icon && <div className="w-5 h-5">{icon}</div>}
          <h3 className="text-sm font-bold">{title}</h3>
          {isDragging && (
            <Move className="w-4 h-4 animate-pulse" />
          )}
        </div>

        <div className="flex items-center gap-1">
          {/* Lock/Unlock */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsLocked(!isLocked);
            }}
            className="p-1.5 hover:bg-white/20 rounded transition-colors"
            title={isLocked ? 'Unlock panel' : 'Lock panel'}
          >
            {isLocked ? (
              <Lock className="w-4 h-4" />
            ) : (
              <Unlock className="w-4 h-4" />
            )}
          </button>

          {/* Pin/Unpin */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsPinned(!isPinned);
            }}
            className="p-1.5 hover:bg-white/20 rounded transition-colors"
            title={isPinned ? 'Unpin panel' : 'Pin panel on top'}
          >
            {isPinned ? (
              <Pin className="w-4 h-4" />
            ) : (
              <PinOff className="w-4 h-4" />
            )}
          </button>

          {/* Minimize */}
          {minimizable && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleMinimize();
              }}
              className="p-1.5 hover:bg-white/20 rounded transition-colors"
              title={isMinimized ? 'Maximize' : 'Minimize'}
            >
              {isMinimized ? (
                <Maximize2 className="w-4 h-4" />
              ) : (
                <Minimize2 className="w-4 h-4" />
              )}
            </button>
          )}

          {/* Close */}
          {closable && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClose();
              }}
              className="p-1.5 hover:bg-red-500/30 rounded transition-colors"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      {!isMinimized && (
        <div className={`overflow-auto ${bodyClassName}`} style={{ height: size.height - 52 }}>
          {children}
        </div>
      )}

      {/* Resize Handles */}
      {resizable && !isMinimized && !isLocked && !isDocked && (
        <>
          {/* Corner Handles */}
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

          {/* Edge Handles */}
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
