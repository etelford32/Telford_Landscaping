/**
 * KeyboardShortcutOverlay - Visual overlay showing all keyboard shortcuts
 * Press ? or F1 to display
 */

"use client";

import { useState, useEffect } from 'react';
import { X, Keyboard, Search } from 'lucide-react';

export interface ShortcutGroup {
  category: string;
  shortcuts: Array<{
    keys: string[];
    description: string;
    action?: () => void;
  }>;
}

const SHORTCUT_GROUPS: ShortcutGroup[] = [
  {
    category: 'Mode Switching',
    shortcuts: [
      { keys: ['1'], description: 'Switch to Design Mode' },
      { keys: ['2'], description: 'Switch to Terrain Mode' },
      { keys: ['3'], description: 'Switch to Hardscape Mode' },
      { keys: ['4'], description: 'Switch to Camera Mode' },
      { keys: ['5'], description: 'Switch to View Mode' },
      { keys: ['Tab'], description: 'Cycle through modes' },
    ],
  },
  {
    category: 'Camera Navigation',
    shortcuts: [
      { keys: ['↑', 'W'], description: 'Move camera forward' },
      { keys: ['↓', 'S'], description: 'Move camera backward' },
      { keys: ['←', 'A'], description: 'Move camera left' },
      { keys: ['→', 'D'], description: 'Move camera right' },
      { keys: ['Q'], description: 'Move camera up' },
      { keys: ['E'], description: 'Move camera down' },
      { keys: ['+', '='], description: 'Zoom in' },
      { keys: ['-', '_'], description: 'Zoom out' },
    ],
  },
  {
    category: 'Editing',
    shortcuts: [
      { keys: ['Ctrl', 'Z'], description: 'Undo' },
      { keys: ['Ctrl', 'Y'], description: 'Redo' },
      { keys: ['Ctrl', 'C'], description: 'Copy selected object' },
      { keys: ['Ctrl', 'X'], description: 'Cut selected object' },
      { keys: ['Ctrl', 'V'], description: 'Paste object' },
      { keys: ['Ctrl', 'D'], description: 'Duplicate selected object' },
      { keys: ['Delete'], description: 'Delete selected object' },
      { keys: ['Backspace'], description: 'Delete selected object' },
    ],
  },
  {
    category: 'Selection',
    shortcuts: [
      { keys: ['Ctrl', 'A'], description: 'Select all objects' },
      { keys: ['Esc'], description: 'Deselect all / Close dialogs' },
      { keys: ['Shift', 'Click'], description: 'Multi-select objects' },
    ],
  },
  {
    category: 'Workspace',
    shortcuts: [
      { keys: ['Ctrl', 'L'], description: 'Toggle workspace layouts' },
      { keys: ['Ctrl', 'K'], description: 'Toggle camera panel' },
      { keys: ['Ctrl', 'S'], description: 'Save design' },
      { keys: ['?'], description: 'Show keyboard shortcuts' },
      { keys: ['F1'], description: 'Show keyboard shortcuts' },
    ],
  },
  {
    category: 'Accessibility',
    shortcuts: [
      { keys: ['Tab'], description: 'Navigate to next element' },
      { keys: ['Shift', 'Tab'], description: 'Navigate to previous element' },
      { keys: ['Enter'], description: 'Activate focused element' },
      { keys: ['Space'], description: 'Activate focused button' },
    ],
  },
];

interface KeyboardShortcutOverlayProps {
  visible: boolean;
  onClose: () => void;
}

export default function KeyboardShortcutOverlay({
  visible,
  onClose,
}: KeyboardShortcutOverlayProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredGroups, setFilteredGroups] = useState(SHORTCUT_GROUPS);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredGroups(SHORTCUT_GROUPS);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = SHORTCUT_GROUPS.map((group) => ({
      ...group,
      shortcuts: group.shortcuts.filter(
        (shortcut) =>
          shortcut.description.toLowerCase().includes(query) ||
          shortcut.keys.some((key) => key.toLowerCase().includes(query))
      ),
    })).filter((group) => group.shortcuts.length > 0);

    setFilteredGroups(filtered);
  }, [searchQuery]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && visible) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [visible, onClose]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="keyboard-shortcuts-title"
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Keyboard className="w-6 h-6" />
            <h2 id="keyboard-shortcuts-title" className="text-xl font-bold">
              Keyboard Shortcuts
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded transition-colors"
            aria-label="Close keyboard shortcuts"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search shortcuts..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              aria-label="Search keyboard shortcuts"
            />
          </div>
        </div>

        {/* Shortcuts Grid */}
        <div className="p-6 overflow-y-auto max-h-[calc(85vh-180px)] grid grid-cols-2 gap-6">
          {filteredGroups.length === 0 ? (
            <div className="col-span-2 text-center py-8 text-gray-500">
              No shortcuts found matching "{searchQuery}"
            </div>
          ) : (
            filteredGroups.map((group) => (
              <div key={group.category} className="space-y-3">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                  <div className="w-1 h-4 bg-primary-600 rounded" />
                  {group.category}
                </h3>
                <div className="space-y-2">
                  {group.shortcuts.map((shortcut, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between gap-3 p-2 hover:bg-gray-50 rounded transition-colors"
                    >
                      <span className="text-sm text-gray-700 flex-1">
                        {shortcut.description}
                      </span>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {shortcut.keys.map((key, keyIndex) => (
                          <span key={keyIndex} className="flex items-center gap-1">
                            {keyIndex > 0 && (
                              <span className="text-gray-400 text-xs">+</span>
                            )}
                            <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs font-mono font-semibold text-gray-800 shadow-sm min-w-[2rem] text-center">
                              {key}
                            </kbd>
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <div className="text-xs text-gray-600">
            <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-xs font-mono mr-1">
              Esc
            </kbd>
            to close
          </div>
          <div className="text-xs text-gray-600">
            Total: {filteredGroups.reduce((acc, g) => acc + g.shortcuts.length, 0)}{' '}
            shortcuts
          </div>
        </div>
      </div>
    </div>
  );
}
