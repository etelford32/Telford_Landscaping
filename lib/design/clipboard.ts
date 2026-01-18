/**
 * Clipboard Manager - Enhanced copy/paste system
 * Handles cut, copy, paste, and duplicate operations for design objects
 */

import { PlacedPlant } from '@/lib/plantData';
import { PlacedStructure } from '@/lib/structureData';

export type ClipboardObject = PlacedPlant | PlacedStructure;
export type ClipboardOperation = 'copy' | 'cut';

interface ClipboardData {
  objects: ClipboardObject[];
  operation: ClipboardOperation;
  timestamp: number;
}

class ClipboardManager {
  private clipboard: ClipboardData | null = null;

  /**
   * Copy objects to clipboard
   */
  copy(objects: ClipboardObject[]): void {
    if (objects.length === 0) return;

    this.clipboard = {
      objects: objects.map(obj => ({ ...obj })), // Deep copy
      operation: 'copy',
      timestamp: Date.now()
    };
  }

  /**
   * Cut objects to clipboard (marks for deletion)
   */
  cut(objects: ClipboardObject[]): void {
    if (objects.length === 0) return;

    this.clipboard = {
      objects: objects.map(obj => ({ ...obj })),
      operation: 'cut',
      timestamp: Date.now()
    };
  }

  /**
   * Get clipboard contents
   */
  paste(): { objects: ClipboardObject[]; wasCut: boolean } | null {
    if (!this.clipboard) return null;

    const wasCut = this.clipboard.operation === 'cut';

    // Generate new IDs for pasted objects
    const pastedObjects = this.clipboard.objects.map(obj => ({
      ...obj,
      id: this.generateNewId(obj),
      selected: true // Auto-select pasted objects
    }));

    // Clear clipboard if it was a cut operation
    if (wasCut) {
      this.clipboard = null;
    }

    return { objects: pastedObjects, wasCut };
  }

  /**
   * Duplicate objects (copy + paste in one operation)
   */
  duplicate(objects: ClipboardObject[], offset: { x: number; z: number } = { x: 1, z: 1 }): ClipboardObject[] {
    return objects.map(obj => ({
      ...obj,
      id: this.generateNewId(obj),
      position: {
        x: obj.position.x + offset.x,
        y: obj.position.y || 0,
        z: obj.position.z + offset.z
      },
      selected: true
    }));
  }

  /**
   * Check if clipboard has content
   */
  hasContent(): boolean {
    return this.clipboard !== null && this.clipboard.objects.length > 0;
  }

  /**
   * Get clipboard info without consuming it
   */
  getInfo(): { count: number; operation: ClipboardOperation } | null {
    if (!this.clipboard) return null;

    return {
      count: this.clipboard.objects.length,
      operation: this.clipboard.operation
    };
  }

  /**
   * Clear clipboard
   */
  clear(): void {
    this.clipboard = null;
  }

  /**
   * Generate new ID for copied/pasted object
   */
  private generateNewId(obj: ClipboardObject): string {
    const type = 'speciesId' in obj ? 'plant' : 'structure';
    return `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Singleton instance
export const clipboardManager = new ClipboardManager();

/**
 * Paste with offset based on current cursor/camera position
 */
export function pasteWithOffset(
  objects: ClipboardObject[],
  targetPosition?: { x: number; z: number }
): ClipboardObject[] {
  if (objects.length === 0) return [];

  // Calculate centroid of pasted objects
  const centroid = {
    x: objects.reduce((sum, obj) => sum + obj.position.x, 0) / objects.length,
    z: objects.reduce((sum, obj) => sum + obj.position.z, 0) / objects.length
  };

  // If target position provided, paste centered at that position
  if (targetPosition) {
    const offsetX = targetPosition.x - centroid.x;
    const offsetZ = targetPosition.z - centroid.z;

    return objects.map(obj => ({
      ...obj,
      position: {
        x: obj.position.x + offsetX,
        y: obj.position.y || 0,
        z: obj.position.z + offsetZ
      }
    }));
  }

  // Otherwise, paste with default offset
  return objects.map(obj => ({
    ...obj,
    position: {
      x: obj.position.x + 2,
      y: obj.position.y || 0,
      z: obj.position.z + 2
    }
  }));
}

/**
 * Copy objects to system clipboard (for cross-application paste)
 */
export async function copyToSystemClipboard(objects: ClipboardObject[]): Promise<boolean> {
  try {
    const json = JSON.stringify({
      type: 'telford-landscape-design',
      version: '1.0',
      objects
    }, null, 2);

    await navigator.clipboard.writeText(json);
    return true;
  } catch (error) {
    console.error('Failed to copy to system clipboard:', error);
    return false;
  }
}

/**
 * Paste from system clipboard
 */
export async function pasteFromSystemClipboard(): Promise<ClipboardObject[] | null> {
  try {
    const text = await navigator.clipboard.readText();
    const data = JSON.parse(text);

    // Verify it's our format
    if (data.type === 'telford-landscape-design' && Array.isArray(data.objects)) {
      return data.objects;
    }

    return null;
  } catch (error) {
    console.error('Failed to paste from system clipboard:', error);
    return null;
  }
}

/**
 * Smart paste - tries system clipboard first, falls back to internal
 */
export async function smartPaste(): Promise<ClipboardObject[] | null> {
  // Try system clipboard first
  const systemPaste = await pasteFromSystemClipboard();
  if (systemPaste) {
    return systemPaste.map(obj => ({
      ...obj,
      id: `${('speciesId' in obj ? 'plant' : 'structure')}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      selected: true
    }));
  }

  // Fall back to internal clipboard
  const internalPaste = clipboardManager.paste();
  return internalPaste ? internalPaste.objects : null;
}
