/**
 * Selection Component - UI interaction state
 *
 * Tracks whether an entity is selected, hovered, etc.
 * Used by UI systems to provide visual feedback.
 */

import { Component } from '../core/Component';

export interface SelectionComponent extends Component {
  readonly type: 'Selection';

  // Selection state
  selected: boolean;

  // Hover state (for mouse-over effects)
  hovered: boolean;

  // Focus state (for keyboard navigation)
  focused: boolean;

  // Locked (prevents selection/modification)
  locked: boolean;

  // Visibility
  visible: boolean;

  // Layer (for grouping/filtering)
  layer: string;
}

/**
 * Create a new Selection component with default values
 */
export function createSelectionComponent(
  options: Partial<SelectionComponent> = {}
): SelectionComponent {
  return {
    type: 'Selection',
    selected: options.selected ?? false,
    hovered: options.hovered ?? false,
    focused: options.focused ?? false,
    locked: options.locked ?? false,
    visible: options.visible ?? true,
    layer: options.layer ?? 'default'
  };
}

/**
 * Update selection state (immutable)
 */
export function updateSelection(
  selection: SelectionComponent,
  updates: Partial<Omit<SelectionComponent, 'type'>>
): SelectionComponent {
  return {
    ...selection,
    ...updates
  };
}

/**
 * Select an entity
 */
export function select(selection: SelectionComponent): SelectionComponent {
  return { ...selection, selected: true };
}

/**
 * Deselect an entity
 */
export function deselect(selection: SelectionComponent): SelectionComponent {
  return { ...selection, selected: false };
}

/**
 * Toggle selection
 */
export function toggleSelection(selection: SelectionComponent): SelectionComponent {
  return { ...selection, selected: !selection.selected };
}

/**
 * Set hover state
 */
export function setHovered(selection: SelectionComponent, hovered: boolean): SelectionComponent {
  return { ...selection, hovered };
}

/**
 * Lock entity (prevent selection/modification)
 */
export function lock(selection: SelectionComponent): SelectionComponent {
  return { ...selection, locked: true };
}

/**
 * Unlock entity
 */
export function unlock(selection: SelectionComponent): SelectionComponent {
  return { ...selection, locked: false };
}

/**
 * Hide entity
 */
export function hide(selection: SelectionComponent): SelectionComponent {
  return { ...selection, visible: false };
}

/**
 * Show entity
 */
export function show(selection: SelectionComponent): SelectionComponent {
  return { ...selection, visible: true };
}
