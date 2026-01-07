// Plant species definitions
export interface PlantSpecies {
  id: string;
  commonName: string;
  scientificName: string;
  description: string;
  category: 'tree' | 'shrub' | 'perennial' | 'ground-cover';
  nativeToCA: boolean;
  droughtTolerant: boolean;
  growthData: GrowthData;
  care: PlantCare;
  color: string; // For visual identification in UI
}

export interface GrowthData {
  baseHeightGrowth: number[]; // height by year index
  baseWidthGrowth: number[]; // width by year index
  maxHeight: number; // feet
  maxWidth: number; // feet
  growthRate: 'slow' | 'moderate' | 'fast';
  lifespan: number; // years
  shapeType: 'rounded' | 'pyramidal' | 'weeping' | 'vase' | 'columnar';
}

export interface PlantCare {
  waterNeeds: 'low' | 'moderate' | 'high';
  sunExposure: 'full-sun' | 'partial-shade' | 'full-shade';
  soilType: string;
  hardiness: string; // USDA zones
  maintenanceLevel: 'low' | 'moderate' | 'high';
}

// Placed plant instance
export interface PlacedPlant {
  id: string;
  speciesId: string;
  position: { x: number; y: number; z: number };
  rotation: number; // radians
  scale: number; // multiplier
  age: number; // years
  variant: number; // which model variation (0-2)
  selected?: boolean;
}

// Initial plant library
export const PLANT_LIBRARY: PlantSpecies[] = [
  {
    id: 'acer-palmatum',
    commonName: 'Japanese Maple',
    scientificName: 'Acer Palmatum',
    description: 'Elegant deciduous tree with delicate foliage and stunning fall colors. Perfect for accent planting.',
    category: 'tree',
    nativeToCA: false,
    droughtTolerant: false,
    color: '#8B0000', // Deep red
    growthData: {
      baseHeightGrowth: [
        2, 3, 4, 5, 6, 7, 8, 9, 10, 11, // Years 1-10
        12, 13, 14, 15, 16, 17, 18, 19, 20, 21, // Years 11-20
        22, 23, 24, 25, 25, 25, 25, 25, 25, 25  // Years 21-30 (mature)
      ],
      baseWidthGrowth: [
        2, 3, 4, 5, 6, 7, 8, 9, 10, 11,
        12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
        22, 23, 24, 25, 25, 25, 25, 25, 25, 25
      ],
      maxHeight: 25,
      maxWidth: 25,
      growthRate: 'slow',
      lifespan: 100,
      shapeType: 'rounded',
    },
    care: {
      waterNeeds: 'moderate',
      sunExposure: 'partial-shade',
      soilType: 'Well-drained, slightly acidic',
      hardiness: 'USDA Zones 5-8',
      maintenanceLevel: 'moderate',
    },
  },
  {
    id: 'chamaecyparis-pisifera',
    commonName: 'Sawara Cypress',
    scientificName: 'Chamaecyparis pisifera',
    description: 'Graceful evergreen conifer with soft, feathery foliage. Excellent for screening and vertical interest.',
    category: 'tree',
    nativeToCA: false,
    droughtTolerant: false,
    color: '#228B22', // Forest green
    growthData: {
      baseHeightGrowth: [
        3, 5, 7, 9, 11, 13, 15, 17, 19, 21,
        24, 27, 30, 33, 36, 39, 42, 45, 48, 51,
        54, 57, 60, 63, 66, 68, 70, 70, 70, 70
      ],
      baseWidthGrowth: [
        2, 3, 4, 5, 6, 7, 8, 9, 10, 11,
        12, 13, 14, 15, 16, 17, 18, 19, 20, 20,
        20, 20, 20, 20, 20, 20, 20, 20, 20, 20
      ],
      maxHeight: 70,
      maxWidth: 20,
      growthRate: 'moderate',
      lifespan: 100,
      shapeType: 'pyramidal',
    },
    care: {
      waterNeeds: 'moderate',
      sunExposure: 'full-sun',
      soilType: 'Well-drained, adaptable',
      hardiness: 'USDA Zones 4-8',
      maintenanceLevel: 'low',
    },
  },
  {
    id: 'cedrus-atlantica-glauca-pendula',
    commonName: 'Weeping Blue Atlas Cedar',
    scientificName: "Cedrus atlantica 'Glauca Pendula'",
    description: 'Dramatic weeping evergreen with stunning blue-silver needles. A true specimen plant for focal points.',
    category: 'tree',
    nativeToCA: false,
    droughtTolerant: true,
    color: '#4682B4', // Steel blue
    growthData: {
      baseHeightGrowth: [
        2, 3, 4, 5, 6, 7, 8, 9, 10, 11,
        12, 13, 14, 14, 15, 15, 15, 15, 15, 15,
        15, 15, 15, 15, 15, 15, 15, 15, 15, 15
      ],
      baseWidthGrowth: [
        2, 4, 6, 8, 10, 12, 14, 16, 18, 20,
        22, 24, 26, 28, 29, 30, 30, 30, 30, 30,
        30, 30, 30, 30, 30, 30, 30, 30, 30, 30
      ],
      maxHeight: 15,
      maxWidth: 30,
      growthRate: 'moderate',
      lifespan: 100,
      shapeType: 'weeping',
    },
    care: {
      waterNeeds: 'low',
      sunExposure: 'full-sun',
      soilType: 'Well-drained, tolerates poor soil',
      hardiness: 'USDA Zones 6-9',
      maintenanceLevel: 'low',
    },
  },
];

// Helper to get species by ID
export function getPlantSpecies(id: string): PlantSpecies | undefined {
  return PLANT_LIBRARY.find(plant => plant.id === id);
}

// Helper to calculate plant size at given age
export function calculatePlantSize(
  speciesId: string,
  age: number,
  scale: number = 1
): { height: number; width: number } {
  const species = getPlantSpecies(speciesId);
  if (!species) return { height: 5, width: 5 };

  const { growthData } = species;
  const yearIndex = Math.min(Math.floor(age), growthData.baseHeightGrowth.length - 1);

  const height = (growthData.baseHeightGrowth[yearIndex] || growthData.maxHeight) * scale;
  const width = (growthData.baseWidthGrowth[yearIndex] || growthData.maxWidth) * scale;

  return { height, width };
}
