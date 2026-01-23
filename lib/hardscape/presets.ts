/**
 * Hardscape Presets - Common layouts for quick placement
 * Provides pre-configured hardscape arrangements around houses
 */

import { PlacedStructure } from '@/lib/structureData';

// Simple ID generator
const generateId = () => `structure-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export interface HardscapePreset {
  id: string;
  name: string;
  description: string;
  category: 'entrance' | 'perimeter' | 'backyard' | 'custom';
  structures: Array<{
    structureId: string;
    relativePosition: { x: number; y: number; z: number };
    rotation: number;
    scale: number;
  }>;
}

export const HARDSCAPE_PRESETS: HardscapePreset[] = [
  // Entrance Presets
  {
    id: 'front-entry-patio',
    name: 'Front Entry Patio',
    description: 'Welcoming patio at front entrance with walkway',
    category: 'entrance',
    structures: [
      {
        structureId: 'flagstone-patio',
        relativePosition: { x: 0, y: 0, z: -12 }, // Front of house
        rotation: 0,
        scale: 0.8,
      },
      {
        structureId: 'stone-paver-path',
        relativePosition: { x: 0, y: 0, z: -20 }, // Leading to patio
        rotation: 0,
        scale: 1,
      },
    ],
  },
  {
    id: 'modern-entry-concrete',
    name: 'Modern Concrete Entry',
    description: 'Contemporary concrete slab with clean lines',
    category: 'entrance',
    structures: [
      {
        structureId: 'concrete-patio',
        relativePosition: { x: 0, y: 0, z: -10 },
        rotation: 0,
        scale: 0.7,
      },
      {
        structureId: 'concrete-paver-path',
        relativePosition: { x: 0, y: 0, z: -18 },
        rotation: 0,
        scale: 1,
      },
    ],
  },
  {
    id: 'traditional-brick-entry',
    name: 'Traditional Brick Entry',
    description: 'Classic brick patio and walkway',
    category: 'entrance',
    structures: [
      {
        structureId: 'brick-patio',
        relativePosition: { x: 0, y: 0, z: -11 },
        rotation: 0,
        scale: 0.75,
      },
      {
        structureId: 'brick-path',
        relativePosition: { x: 0, y: 0, z: -19 },
        rotation: 0,
        scale: 1,
      },
    ],
  },

  // Backyard Presets
  {
    id: 'backyard-patio-deck',
    name: 'Backyard Patio & Deck',
    description: 'Large entertaining area behind house',
    category: 'backyard',
    structures: [
      {
        structureId: 'composite-deck',
        relativePosition: { x: 0, y: 0, z: 12 }, // Back of house
        rotation: 0,
        scale: 1,
      },
      {
        structureId: 'flagstone-patio',
        relativePosition: { x: 8, y: 0, z: 18 }, // Adjacent to deck
        rotation: Math.PI / 4,
        scale: 0.9,
      },
    ],
  },
  {
    id: 'simple-back-patio',
    name: 'Simple Back Patio',
    description: 'Basic patio directly behind house',
    category: 'backyard',
    structures: [
      {
        structureId: 'flagstone-patio',
        relativePosition: { x: 0, y: 0, z: 11 },
        rotation: 0,
        scale: 1,
      },
    ],
  },
  {
    id: 'backyard-with-paths',
    name: 'Backyard with Paths',
    description: 'Patio with connecting garden paths',
    category: 'backyard',
    structures: [
      {
        structureId: 'gravel-courtyard',
        relativePosition: { x: 0, y: 0, z: 13 },
        rotation: 0,
        scale: 1,
      },
      {
        structureId: 'decomposed-granite-path',
        relativePosition: { x: -8, y: 0, z: 18 },
        rotation: -Math.PI / 4,
        scale: 1,
      },
      {
        structureId: 'decomposed-granite-path',
        relativePosition: { x: 8, y: 0, z: 18 },
        rotation: Math.PI / 4,
        scale: 1,
      },
    ],
  },

  // Perimeter Presets
  {
    id: 'full-privacy-fence',
    name: 'Full Privacy Fence',
    description: 'Complete fence around property perimeter',
    category: 'perimeter',
    structures: [
      // Front sides
      {
        structureId: 'wood-fence',
        relativePosition: { x: -15, y: 0, z: -10 },
        rotation: 0,
        scale: 2,
      },
      {
        structureId: 'wood-fence',
        relativePosition: { x: 15, y: 0, z: -10 },
        rotation: 0,
        scale: 2,
      },
      // Back
      {
        structureId: 'wood-fence',
        relativePosition: { x: 0, y: 0, z: 20 },
        rotation: Math.PI / 2,
        scale: 4,
      },
      // Sides
      {
        structureId: 'wood-fence',
        relativePosition: { x: -15, y: 0, z: 5 },
        rotation: Math.PI / 2,
        scale: 2,
      },
      {
        structureId: 'wood-fence',
        relativePosition: { x: 15, y: 0, z: 5 },
        rotation: Math.PI / 2,
        scale: 2,
      },
    ],
  },
  {
    id: 'backyard-fence-only',
    name: 'Backyard Fence Only',
    description: 'Fence enclosing backyard area',
    category: 'perimeter',
    structures: [
      // Back fence
      {
        structureId: 'wood-fence',
        relativePosition: { x: 0, y: 0, z: 20 },
        rotation: Math.PI / 2,
        scale: 4,
      },
      // Side fences
      {
        structureId: 'wood-fence',
        relativePosition: { x: -15, y: 0, z: 10 },
        rotation: Math.PI / 2,
        scale: 2,
      },
      {
        structureId: 'wood-fence',
        relativePosition: { x: 15, y: 0, z: 10 },
        rotation: Math.PI / 2,
        scale: 2,
      },
    ],
  },
  {
    id: 'decorative-front-fence',
    name: 'Decorative Front Fence',
    description: 'Low picket fence for front yard',
    category: 'perimeter',
    structures: [
      {
        structureId: 'picket-fence',
        relativePosition: { x: -12, y: 0, z: -15 },
        rotation: 0,
        scale: 1.5,
      },
      {
        structureId: 'picket-fence',
        relativePosition: { x: 12, y: 0, z: -15 },
        rotation: 0,
        scale: 1.5,
      },
      {
        structureId: 'picket-fence',
        relativePosition: { x: 0, y: 0, z: -20 },
        rotation: Math.PI / 2,
        scale: 3,
      },
    ],
  },

  // Custom Combinations
  {
    id: 'complete-hardscape-package',
    name: 'Complete Hardscape Package',
    description: 'Full setup with entry, patio, and fencing',
    category: 'custom',
    structures: [
      // Entry
      {
        structureId: 'flagstone-patio',
        relativePosition: { x: 0, y: 0, z: -11 },
        rotation: 0,
        scale: 0.75,
      },
      {
        structureId: 'stone-paver-path',
        relativePosition: { x: 0, y: 0, z: -19 },
        rotation: 0,
        scale: 1,
      },
      // Backyard patio
      {
        structureId: 'composite-deck',
        relativePosition: { x: 0, y: 0, z: 12 },
        rotation: 0,
        scale: 1.1,
      },
      // Fencing
      {
        structureId: 'wood-fence',
        relativePosition: { x: 0, y: 0, z: 20 },
        rotation: Math.PI / 2,
        scale: 4,
      },
      {
        structureId: 'wood-fence',
        relativePosition: { x: -15, y: 0, z: 8 },
        rotation: Math.PI / 2,
        scale: 2,
      },
      {
        structureId: 'wood-fence',
        relativePosition: { x: 15, y: 0, z: 8 },
        rotation: Math.PI / 2,
        scale: 2,
      },
    ],
  },
];

/**
 * Apply a preset around a house position
 */
export function applyPresetToHouse(
  preset: HardscapePreset,
  housePosition: { x: number; y: number; z: number },
  houseRotation: number = 0
): PlacedStructure[] {
  const structures: PlacedStructure[] = [];

  preset.structures.forEach((item) => {
    // Rotate relative position based on house rotation
    const cos = Math.cos(houseRotation);
    const sin = Math.sin(houseRotation);
    const rotatedX = item.relativePosition.x * cos - item.relativePosition.z * sin;
    const rotatedZ = item.relativePosition.x * sin + item.relativePosition.z * cos;

    structures.push({
      id: generateId(),
      structureId: item.structureId,
      position: {
        x: housePosition.x + rotatedX,
        y: item.relativePosition.y,
        z: housePosition.z + rotatedZ,
      },
      rotation: item.rotation + houseRotation,
      scale: item.scale,
    });
  });

  return structures;
}

/**
 * Get presets by category
 */
export function getPresetsByCategory(category: HardscapePreset['category']): HardscapePreset[] {
  return HARDSCAPE_PRESETS.filter((preset) => preset.category === category);
}

/**
 * Get preset by ID
 */
export function getPresetById(id: string): HardscapePreset | undefined {
  return HARDSCAPE_PRESETS.find((preset) => preset.id === id);
}
