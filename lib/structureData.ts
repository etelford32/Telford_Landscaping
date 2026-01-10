// Outdoor structure definitions for Northern California landscaping

export interface OutdoorStructure {
  id: string;
  commonName: string;
  description: string;
  category: 'hardscape' | 'vertical' | 'overhead' | 'water-feature' | 'outdoor-living' | 'path';
  materials: string[];
  dimensions: StructureDimensions;
  color: string; // For visual identification in UI
  styles: string[]; // e.g., 'modern', 'traditional', 'rustic'
}

export interface StructureDimensions {
  baseWidth: number; // feet
  baseDepth: number; // feet
  height: number; // feet
  customizable: boolean; // Can dimensions be adjusted by user?
}

// Placed structure instance
export interface PlacedStructure {
  id: string;
  structureId: string;
  position: { x: number; y: number; z: number };
  rotation: number; // radians
  scale: number; // multiplier for dimensions
  customDimensions?: { width: number; depth: number; height: number };
  selected?: boolean;
  style?: string; // Selected style variant
}

// Comprehensive Northern California Outdoor Structures Library
export const STRUCTURE_LIBRARY: OutdoorStructure[] = [
  // ===== HARDSCAPE / PATIOS & DECKS =====
  {
    id: 'flagstone-patio',
    commonName: 'Flagstone Patio',
    description: 'Natural stone patio with irregular flagstone pavers. Classic California look with warm earth tones.',
    category: 'hardscape',
    materials: ['Flagstone', 'Sand', 'Gravel'],
    dimensions: {
      baseWidth: 16,
      baseDepth: 16,
      height: 0.5,
      customizable: true,
    },
    color: '#D2B48C', // Tan
    styles: ['natural', 'rustic', 'mediterranean'],
  },
  {
    id: 'concrete-patio',
    commonName: 'Stamped Concrete Patio',
    description: 'Modern stamped concrete patio with decorative patterns. Durable and low-maintenance.',
    category: 'hardscape',
    materials: ['Concrete', 'Sealer'],
    dimensions: {
      baseWidth: 20,
      baseDepth: 16,
      height: 0.3,
      customizable: true,
    },
    color: '#A9A9A9', // Dark gray
    styles: ['modern', 'contemporary', 'industrial'],
  },
  {
    id: 'brick-patio',
    commonName: 'Brick Paver Patio',
    description: 'Traditional brick paver patio in herringbone pattern. Timeless design with warm red tones.',
    category: 'hardscape',
    materials: ['Brick Pavers', 'Sand', 'Edging'],
    dimensions: {
      baseWidth: 18,
      baseDepth: 14,
      height: 0.3,
      customizable: true,
    },
    color: '#B22222', // Firebrick
    styles: ['traditional', 'cottage', 'classic'],
  },
  {
    id: 'wood-deck',
    commonName: 'Redwood Deck',
    description: 'California redwood deck with natural beauty and rot resistance. Perfect for outdoor entertaining.',
    category: 'hardscape',
    materials: ['Redwood', 'Joist Hardware', 'Stain'],
    dimensions: {
      baseWidth: 20,
      baseDepth: 16,
      height: 2,
      customizable: true,
    },
    color: '#8B4513', // Saddle brown
    styles: ['traditional', 'craftsman', 'natural'],
  },
  {
    id: 'composite-deck',
    commonName: 'Composite Deck',
    description: 'Low-maintenance composite decking in modern gray tones. Eco-friendly and long-lasting.',
    category: 'hardscape',
    materials: ['Composite Decking', 'Aluminum Framing'],
    dimensions: {
      baseWidth: 22,
      baseDepth: 18,
      height: 2,
      customizable: true,
    },
    color: '#696969', // Dim gray
    styles: ['modern', 'contemporary', 'minimalist'],
  },
  {
    id: 'gravel-courtyard',
    commonName: 'Decomposed Granite Courtyard',
    description: 'California favorite - DG courtyard with permeable surface. Perfect for drought-tolerant landscapes.',
    category: 'hardscape',
    materials: ['Decomposed Granite', 'Stabilizer', 'Edging'],
    dimensions: {
      baseWidth: 20,
      baseDepth: 20,
      height: 0.2,
      customizable: true,
    },
    color: '#D2B48C', // Tan
    styles: ['natural', 'xeriscape', 'mediterranean'],
  },

  // ===== VERTICAL STRUCTURES / FENCES & WALLS =====
  {
    id: 'wood-fence',
    commonName: 'Cedar Privacy Fence',
    description: 'Classic 6-foot cedar fence for privacy and security. Natural wood with warm tones.',
    category: 'vertical',
    materials: ['Cedar Boards', 'Posts', 'Hardware'],
    dimensions: {
      baseWidth: 8,
      baseDepth: 0.5,
      height: 6,
      customizable: true,
    },
    color: '#DEB887', // Burlywood
    styles: ['traditional', 'craftsman', 'natural'],
  },
  {
    id: 'horizontal-fence',
    commonName: 'Modern Horizontal Fence',
    description: 'Contemporary horizontal slat fence in dark stain. Clean lines and modern aesthetic.',
    category: 'vertical',
    materials: ['Hardwood', 'Steel Posts', 'Stain'],
    dimensions: {
      baseWidth: 8,
      baseDepth: 0.3,
      height: 6,
      customizable: true,
    },
    color: '#3E2723', // Dark brown
    styles: ['modern', 'contemporary', 'minimalist'],
  },
  {
    id: 'stone-retaining-wall',
    commonName: 'Natural Stone Retaining Wall',
    description: 'Stacked stone retaining wall for slopes and elevation changes. Durable and attractive.',
    category: 'vertical',
    materials: ['Natural Stone', 'Gravel', 'Capstones'],
    dimensions: {
      baseWidth: 12,
      baseDepth: 2,
      height: 4,
      customizable: true,
    },
    color: '#808080', // Gray
    styles: ['natural', 'rustic', 'craftsman'],
  },
  {
    id: 'gabion-wall',
    commonName: 'Gabion Wall',
    description: 'Modern wire cage filled with rocks. Industrial look perfect for contemporary landscapes.',
    category: 'vertical',
    materials: ['Steel Wire Mesh', 'River Rock', 'Posts'],
    dimensions: {
      baseWidth: 10,
      baseDepth: 2,
      height: 3,
      customizable: true,
    },
    color: '#708090', // Slate gray
    styles: ['modern', 'industrial', 'contemporary'],
  },
  {
    id: 'picket-fence',
    commonName: 'White Picket Fence',
    description: 'Classic white picket fence for cottage gardens. Charming and welcoming.',
    category: 'vertical',
    materials: ['Pine', 'White Paint', 'Hardware'],
    dimensions: {
      baseWidth: 8,
      baseDepth: 0.3,
      height: 3.5,
      customizable: true,
    },
    color: '#FFFFFF', // White
    styles: ['cottage', 'traditional', 'classic'],
  },

  // ===== OVERHEAD STRUCTURES / PERGOLAS & ARBORS =====
  {
    id: 'wood-pergola',
    commonName: 'Cedar Pergola',
    description: 'Classic timber-frame pergola with open roof. Perfect for climbing vines and partial shade.',
    category: 'overhead',
    materials: ['Cedar Beams', 'Posts', 'Hardware'],
    dimensions: {
      baseWidth: 14,
      baseDepth: 14,
      height: 10,
      customizable: true,
    },
    color: '#CD853F', // Peru
    styles: ['traditional', 'craftsman', 'natural'],
  },
  {
    id: 'modern-pergola',
    commonName: 'Steel & Wood Pergola',
    description: 'Contemporary pergola with steel posts and wood beams. Sleek and durable.',
    category: 'overhead',
    materials: ['Steel Posts', 'Hardwood Beams', 'Powder Coating'],
    dimensions: {
      baseWidth: 16,
      baseDepth: 12,
      height: 10,
      customizable: true,
    },
    color: '#2F4F4F', // Dark slate gray
    styles: ['modern', 'contemporary', 'industrial'],
  },
  {
    id: 'louvered-pergola',
    commonName: 'Adjustable Louvered Pergola',
    description: 'High-tech pergola with adjustable louvers for sun control. Maximum flexibility.',
    category: 'overhead',
    materials: ['Aluminum', 'Motors', 'Powder Coating'],
    dimensions: {
      baseWidth: 18,
      baseDepth: 14,
      height: 11,
      customizable: true,
    },
    color: '#F5F5F5', // White smoke
    styles: ['modern', 'contemporary', 'tech'],
  },
  {
    id: 'garden-arbor',
    commonName: 'Garden Arbor',
    description: 'Arched garden arbor for pathways and entries. Perfect for roses and climbing plants.',
    category: 'overhead',
    materials: ['Cedar', 'Lattice', 'Hardware'],
    dimensions: {
      baseWidth: 5,
      baseDepth: 3,
      height: 8,
      customizable: false,
    },
    color: '#DEB887', // Burlywood
    styles: ['cottage', 'traditional', 'romantic'],
  },
  {
    id: 'shade-sail',
    commonName: 'Tension Shade Sail',
    description: 'Modern tensioned fabric shade structure. Great for contemporary outdoor spaces.',
    category: 'overhead',
    materials: ['UV-Resistant Fabric', 'Steel Posts', 'Cables'],
    dimensions: {
      baseWidth: 18,
      baseDepth: 18,
      height: 12,
      customizable: true,
    },
    color: '#E0E0E0', // Light gray
    styles: ['modern', 'contemporary', 'minimalist'],
  },

  // ===== WATER FEATURES =====
  {
    id: 'natural-pond',
    commonName: 'Natural Koi Pond',
    description: 'Naturalistic pond with stone edging and water plants. Brings tranquility to the garden.',
    category: 'water-feature',
    materials: ['Pond Liner', 'Natural Stone', 'Pump', 'Filter'],
    dimensions: {
      baseWidth: 12,
      baseDepth: 10,
      height: 2,
      customizable: true,
    },
    color: '#4682B4', // Steel blue
    styles: ['natural', 'japanese', 'organic'],
  },
  {
    id: 'fountain-feature',
    commonName: 'Tiered Stone Fountain',
    description: 'Multi-tier fountain with flowing water. Classic focal point with soothing sounds.',
    category: 'water-feature',
    materials: ['Stone', 'Pump', 'Basin'],
    dimensions: {
      baseWidth: 4,
      baseDepth: 4,
      height: 5,
      customizable: false,
    },
    color: '#696969', // Dim gray
    styles: ['traditional', 'mediterranean', 'formal'],
  },
  {
    id: 'bubbling-rock',
    commonName: 'Bubbling Rock Feature',
    description: 'Natural boulder with water bubbling from center. Low-maintenance and naturalistic.',
    category: 'water-feature',
    materials: ['Boulder', 'Basin', 'Pump', 'River Rock'],
    dimensions: {
      baseWidth: 3,
      baseDepth: 3,
      height: 2.5,
      customizable: false,
    },
    color: '#8B7355', // Burlywood4
    styles: ['natural', 'zen', 'contemporary'],
  },
  {
    id: 'water-wall',
    commonName: 'Modern Water Wall',
    description: 'Contemporary water feature with sheet waterfall. Striking visual and acoustic element.',
    category: 'water-feature',
    materials: ['Stone Veneer', 'Stainless Steel', 'Pump', 'LED Lights'],
    dimensions: {
      baseWidth: 8,
      baseDepth: 2,
      height: 8,
      customizable: true,
    },
    color: '#2F4F4F', // Dark slate gray
    styles: ['modern', 'contemporary', 'luxury'],
  },

  // ===== OUTDOOR LIVING =====
  {
    id: 'outdoor-kitchen',
    commonName: 'Built-In Outdoor Kitchen',
    description: 'Complete outdoor kitchen with grill, counter space, and storage. Perfect for entertaining.',
    category: 'outdoor-living',
    materials: ['Stucco', 'Stone Counters', 'Stainless Steel Appliances'],
    dimensions: {
      baseWidth: 12,
      baseDepth: 4,
      height: 3.5,
      customizable: true,
    },
    color: '#D2B48C', // Tan
    styles: ['mediterranean', 'modern', 'luxury'],
  },
  {
    id: 'fire-pit',
    commonName: 'Stone Fire Pit',
    description: 'Built-in circular fire pit with stone surround. Gathering place for cool evenings.',
    category: 'outdoor-living',
    materials: ['Fire Brick', 'Stone Veneer', 'Steel Ring'],
    dimensions: {
      baseWidth: 5,
      baseDepth: 5,
      height: 1.5,
      customizable: false,
    },
    color: '#A0522D', // Sienna
    styles: ['rustic', 'traditional', 'craftsman'],
  },
  {
    id: 'modern-fire-feature',
    commonName: 'Linear Gas Fire Feature',
    description: 'Contemporary linear fire pit with glass media. Sleek and modern outdoor heating.',
    category: 'outdoor-living',
    materials: ['Steel', 'Glass Media', 'Gas Burner', 'Stone'],
    dimensions: {
      baseWidth: 8,
      baseDepth: 2,
      height: 1.5,
      customizable: true,
    },
    color: '#2F4F4F', // Dark slate gray
    styles: ['modern', 'contemporary', 'luxury'],
  },
  {
    id: 'pizza-oven',
    commonName: 'Wood-Fired Pizza Oven',
    description: 'Traditional dome-shaped pizza oven. Italian-style outdoor cooking experience.',
    category: 'outdoor-living',
    materials: ['Fire Brick', 'Stucco', 'Chimney Pipe'],
    dimensions: {
      baseWidth: 6,
      baseDepth: 6,
      height: 7,
      customizable: false,
    },
    color: '#CD853F', // Peru
    styles: ['mediterranean', 'tuscan', 'rustic'],
  },
  {
    id: 'outdoor-shower',
    commonName: 'Outdoor Shower',
    description: 'Luxury outdoor shower with stone flooring. Perfect for poolside or beach house.',
    category: 'outdoor-living',
    materials: ['Teak', 'Stone Pavers', 'Stainless Hardware'],
    dimensions: {
      baseWidth: 3,
      baseDepth: 3,
      height: 7,
      customizable: false,
    },
    color: '#D2691E', // Chocolate
    styles: ['coastal', 'tropical', 'luxury'],
  },
  {
    id: 'raised-planter',
    commonName: 'Raised Planter Bed',
    description: 'Elevated planter box for vegetables or ornamentals. Great for ergonomic gardening.',
    category: 'outdoor-living',
    materials: ['Cedar', 'Soil', 'Liner'],
    dimensions: {
      baseWidth: 8,
      baseDepth: 4,
      height: 2.5,
      customizable: true,
    },
    color: '#8B7355', // Burlywood4
    styles: ['farmhouse', 'modern', 'functional'],
  },

  // ===== PATHS & WALKWAYS =====
  {
    id: 'concrete-paver-path',
    commonName: 'Concrete Paver Path',
    description: 'Modern concrete paver walkway in clean geometric shapes. Durable and versatile.',
    category: 'path',
    materials: ['Concrete Pavers', 'Sand Base', 'Edging'],
    dimensions: {
      baseWidth: 4,
      baseDepth: 12,
      height: 0.25,
      customizable: true,
    },
    color: '#B0B0B0', // Light gray
    styles: ['modern', 'contemporary', 'minimalist'],
  },
  {
    id: 'stone-paver-path',
    commonName: 'Natural Stone Paver Path',
    description: 'Irregular natural stone pavers for an organic, flowing walkway. Classic California style.',
    category: 'path',
    materials: ['Flagstone', 'Sand', 'Gravel'],
    dimensions: {
      baseWidth: 3.5,
      baseDepth: 12,
      height: 0.3,
      customizable: true,
    },
    color: '#C9A87C', // Tan stone
    styles: ['natural', 'rustic', 'cottage'],
  },
  {
    id: 'rubble-path',
    commonName: 'Rubble Stone Path',
    description: 'Chunky natural stone rubble pathway. Rustic and natural with excellent drainage.',
    category: 'path',
    materials: ['Stone Rubble', 'Gravel Base'],
    dimensions: {
      baseWidth: 3,
      baseDepth: 10,
      height: 0.4,
      customizable: true,
    },
    color: '#8B7D6B', // Dark tan
    styles: ['rustic', 'natural', 'woodland'],
  },
  {
    id: 'decomposed-granite-path',
    commonName: 'Decomposed Granite Path',
    description: 'California favorite - permeable DG pathway that compacts naturally. Perfect for xeriscape.',
    category: 'path',
    materials: ['Decomposed Granite', 'Stabilizer', 'Edging'],
    dimensions: {
      baseWidth: 4,
      baseDepth: 12,
      height: 0.15,
      customizable: true,
    },
    color: '#D4A574', // Golden tan
    styles: ['xeriscape', 'natural', 'mediterranean'],
  },
  {
    id: 'crushed-rock-path',
    commonName: 'Crushed Rock Path',
    description: 'Angular crushed rock pathway that locks together. Great drainage and rustic appeal.',
    category: 'path',
    materials: ['Crushed Rock', 'Base Rock', 'Edging'],
    dimensions: {
      baseWidth: 3.5,
      baseDepth: 10,
      height: 0.2,
      customizable: true,
    },
    color: '#A0A0A0', // Gray rock
    styles: ['industrial', 'rustic', 'modern'],
  },
  {
    id: 'pea-gravel-path',
    commonName: 'Pea Gravel Path',
    description: 'Smooth rounded pea gravel for comfortable walking. Classic cottage garden material.',
    category: 'path',
    materials: ['Pea Gravel', 'Landscape Fabric', 'Edging'],
    dimensions: {
      baseWidth: 3,
      baseDepth: 10,
      height: 0.2,
      customizable: true,
    },
    color: '#C0B4A0', // Beige gravel
    styles: ['cottage', 'traditional', 'natural'],
  },
  {
    id: 'sand-path',
    commonName: 'Sand Path',
    description: 'Soft sand pathway for beach-inspired or zen gardens. Requires edging to contain.',
    category: 'path',
    materials: ['Play Sand', 'Edging', 'Base'],
    dimensions: {
      baseWidth: 3,
      baseDepth: 8,
      height: 0.15,
      customizable: true,
    },
    color: '#F4E4C1', // Sand color
    styles: ['coastal', 'zen', 'tropical'],
  },
  {
    id: 'stepping-stone-path',
    commonName: 'Stepping Stone Path',
    description: 'Individual stone pavers set in grass or groundcover. Informal and charming.',
    category: 'path',
    materials: ['Stone Pavers', 'Gravel'],
    dimensions: {
      baseWidth: 2,
      baseDepth: 12,
      height: 0.2,
      customizable: true,
    },
    color: '#A89968', // Stone tan
    styles: ['cottage', 'natural', 'informal'],
  },
  {
    id: 'brick-path',
    commonName: 'Brick Paver Path',
    description: 'Traditional red brick pathway in running bond or herringbone pattern.',
    category: 'path',
    materials: ['Clay Brick', 'Sand', 'Edging'],
    dimensions: {
      baseWidth: 3.5,
      baseDepth: 12,
      height: 0.25,
      customizable: true,
    },
    color: '#B85450', // Brick red
    styles: ['traditional', 'classic', 'colonial'],
  },

  // ===== ADDITIONAL WALLS =====
  {
    id: 'concrete-block-wall',
    commonName: 'Concrete Block Wall',
    description: 'Solid concrete masonry wall for privacy and security. Can be stuccoed or painted.',
    category: 'vertical',
    materials: ['CMU Blocks', 'Rebar', 'Mortar'],
    dimensions: {
      baseWidth: 10,
      baseDepth: 0.67,
      height: 6,
      customizable: true,
    },
    color: '#9E9E9E', // Gray concrete
    styles: ['modern', 'industrial', 'contemporary'],
  },
  {
    id: 'stucco-wall',
    commonName: 'Stucco Garden Wall',
    description: 'Mediterranean-style stucco wall with smooth finish. Classic California architecture.',
    category: 'vertical',
    materials: ['Stucco', 'Lath', 'Paint'],
    dimensions: {
      baseWidth: 12,
      baseDepth: 0.5,
      height: 5,
      customizable: true,
    },
    color: '#F5E6D3', // Cream stucco
    styles: ['mediterranean', 'spanish', 'tuscan'],
  },
  {
    id: 'dry-stack-stone-wall',
    commonName: 'Dry Stack Stone Wall',
    description: 'Mortarless stacked stone wall in traditional style. Beautiful natural texture.',
    category: 'vertical',
    materials: ['Natural Stone', 'Capstones'],
    dimensions: {
      baseWidth: 8,
      baseDepth: 2,
      height: 3,
      customizable: true,
    },
    color: '#7A6E5D', // Stone brown
    styles: ['rustic', 'traditional', 'farmhouse'],
  },
  {
    id: 'brick-garden-wall',
    commonName: 'Brick Garden Wall',
    description: 'Traditional red brick wall with mortar joints. Timeless and elegant.',
    category: 'vertical',
    materials: ['Clay Brick', 'Mortar', 'Capstones'],
    dimensions: {
      baseWidth: 10,
      baseDepth: 0.67,
      height: 4,
      customizable: true,
    },
    color: '#9B5448', // Red brick
    styles: ['traditional', 'colonial', 'classic'],
  },
  {
    id: 'boulder-wall',
    commonName: 'Boulder Retaining Wall',
    description: 'Large natural boulders for dramatic retaining walls. Natural and substantial.',
    category: 'vertical',
    materials: ['Large Boulders', 'Gravel Backfill'],
    dimensions: {
      baseWidth: 12,
      baseDepth: 3,
      height: 4,
      customizable: true,
    },
    color: '#696969', // Dim gray
    styles: ['natural', 'rustic', 'modern'],
  },
  {
    id: 'wood-retaining-wall',
    commonName: 'Timber Retaining Wall',
    description: 'Horizontal timber wall for gentle slopes. Natural wood with rustic charm.',
    category: 'vertical',
    materials: ['Pressure Treated Timber', 'Rebar', 'Gravel'],
    dimensions: {
      baseWidth: 10,
      baseDepth: 1.5,
      height: 3,
      customizable: true,
    },
    color: '#6D5C47', // Dark wood
    styles: ['rustic', 'natural', 'craftsman'],
  },
];

// Helper to get structure by ID
export function getStructure(id: string): OutdoorStructure | undefined {
  return STRUCTURE_LIBRARY.find(structure => structure.id === id);
}

// Helper to calculate structure footprint dimensions
export function calculateStructureSize(
  structureId: string,
  scale: number = 1,
  customDimensions?: { width: number; depth: number; height: number }
): { width: number; depth: number; height: number } {
  const structure = getStructure(structureId);
  if (!structure) return { width: 10, depth: 10, height: 5 };

  if (customDimensions && structure.dimensions.customizable) {
    return {
      width: customDimensions.width * scale,
      depth: customDimensions.depth * scale,
      height: customDimensions.height * scale,
    };
  }

  return {
    width: structure.dimensions.baseWidth * scale,
    depth: structure.dimensions.baseDepth * scale,
    height: structure.dimensions.height * scale,
  };
}

// Helper to filter structures by category
export function getStructuresByCategory(category: OutdoorStructure['category']): OutdoorStructure[] {
  return STRUCTURE_LIBRARY.filter(structure => structure.category === category);
}
