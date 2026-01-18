/**
 * ContextMenu - Right-click context menu for quick actions
 * Provides context-sensitive commands for canvas and objects
 */

"use client";

import { useEffect, useRef } from 'react';
import {
  Copy,
  Scissors,
  Clipboard,
  Trash2,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Group,
  Ungroup,
  ArrowUp,
  ArrowDown,
  Settings
} from 'lucide-react';

export type ContextMenuType = 'canvas' | 'object' | 'multi-object';

interface ContextMenuItem {
  icon?: React.ReactNode;
  label: string;
  shortcut?: string;
  action: () => void;
  divider?: boolean;
  disabled?: boolean;
}

interface ContextMenuProps {
  type: ContextMenuType;
  position: { x: number; y: number };
  onClose: () => void;
  items?: ContextMenuItem[];
}

export default function ContextMenu({ type, position, onClose, items }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  // Adjust position to stay within viewport
  useEffect(() => {
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let adjustedX = position.x;
      let adjustedY = position.y;

      if (rect.right > viewportWidth) {
        adjustedX = viewportWidth - rect.width - 10;
      }
      if (rect.bottom > viewportHeight) {
        adjustedY = viewportHeight - rect.height - 10;
      }

      menuRef.current.style.left = `${adjustedX}px`;
      menuRef.current.style.top = `${adjustedY}px`;
    }
  }, [position]);

  const renderItem = (item: ContextMenuItem, index: number) => {
    if (item.divider) {
      return <div key={index} className="h-px bg-gray-700 my-1" />;
    }

    return (
      <button
        key={index}
        onClick={() => {
          if (!item.disabled) {
            item.action();
            onClose();
          }
        }}
        disabled={item.disabled}
        className={`w-full flex items-center justify-between px-3 py-2 text-sm transition-colors ${
          item.disabled
            ? 'text-gray-500 cursor-not-allowed'
            : 'text-gray-200 hover:bg-gray-700 cursor-pointer'
        }`}
      >
        <div className="flex items-center gap-3">
          {item.icon && <span className="w-4 h-4">{item.icon}</span>}
          <span>{item.label}</span>
        </div>
        {item.shortcut && (
          <span className="text-xs text-gray-500 font-mono ml-4">{item.shortcut}</span>
        )}
      </button>
    );
  };

  return (
    <div
      ref={menuRef}
      className="fixed bg-gray-800 rounded-lg shadow-2xl border border-gray-700 py-1 min-w-[200px] z-[9999]"
      style={{ left: position.x, top: position.y }}
    >
      {items && items.map((item, index) => renderItem(item, index))}
    </div>
  );
}

// Default menu items generators
export function getCanvasMenuItems(options: {
  onPaste?: () => void;
  onSelectAll?: () => void;
  onGridSettings?: () => void;
  canPaste?: boolean;
}): ContextMenuItem[] {
  return [
    {
      icon: <Clipboard className="w-4 h-4" />,
      label: 'Paste',
      shortcut: 'Ctrl+V',
      action: options.onPaste || (() => {}),
      disabled: !options.canPaste
    },
    { divider: true },
    {
      label: 'Select All',
      shortcut: 'Ctrl+A',
      action: options.onSelectAll || (() => {})
    },
    { divider: true },
    {
      icon: <Settings className="w-4 h-4" />,
      label: 'Grid Settings',
      action: options.onGridSettings || (() => {})
    }
  ];
}

export function getObjectMenuItems(options: {
  onCut?: () => void;
  onCopy?: () => void;
  onPaste?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  onGroup?: () => void;
  onLock?: () => void;
  onHide?: () => void;
  onBringToFront?: () => void;
  onSendToBack?: () => void;
  onProperties?: () => void;
  isLocked?: boolean;
  isHidden?: boolean;
  canGroup?: boolean;
}): ContextMenuItem[] {
  return [
    {
      icon: <Scissors className="w-4 h-4" />,
      label: 'Cut',
      shortcut: 'Ctrl+X',
      action: options.onCut || (() => {})
    },
    {
      icon: <Copy className="w-4 h-4" />,
      label: 'Copy',
      shortcut: 'Ctrl+C',
      action: options.onCopy || (() => {})
    },
    {
      icon: <Clipboard className="w-4 h-4" />,
      label: 'Paste',
      shortcut: 'Ctrl+V',
      action: options.onPaste || (() => {})
    },
    {
      label: 'Duplicate',
      shortcut: 'Ctrl+D',
      action: options.onDuplicate || (() => {})
    },
    { divider: true },
    {
      icon: <Trash2 className="w-4 h-4" />,
      label: 'Delete',
      shortcut: 'Del',
      action: options.onDelete || (() => {})
    },
    { divider: true },
    {
      icon: options.canGroup ? <Group className="w-4 h-4" /> : <Ungroup className="w-4 h-4" />,
      label: options.canGroup ? 'Group' : 'Ungroup',
      shortcut: 'Ctrl+G',
      action: options.onGroup || (() => {}),
      disabled: !options.canGroup
    },
    { divider: true },
    {
      icon: <ArrowUp className="w-4 h-4" />,
      label: 'Bring to Front',
      action: options.onBringToFront || (() => {})
    },
    {
      icon: <ArrowDown className="w-4 h-4" />,
      label: 'Send to Back',
      action: options.onSendToBack || (() => {})
    },
    { divider: true },
    {
      icon: options.isLocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />,
      label: options.isLocked ? 'Unlock' : 'Lock',
      shortcut: 'Ctrl+L',
      action: options.onLock || (() => {})
    },
    {
      icon: options.isHidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />,
      label: options.isHidden ? 'Show' : 'Hide',
      shortcut: 'H',
      action: options.onHide || (() => {})
    },
    { divider: true },
    {
      icon: <Settings className="w-4 h-4" />,
      label: 'Properties',
      action: options.onProperties || (() => {})
    }
  ];
}
