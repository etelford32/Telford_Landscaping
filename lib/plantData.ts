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

// Comprehensive Northern California Plant Library
export const PLANT_LIBRARY: PlantSpecies[] = [
  // ===== NATIVE CALIFORNIA TREES =====
  {
    id: 'quercus-agrifolia',
    commonName: 'Coast Live Oak',
    scientificName: 'Quercus agrifolia',
    description: 'Iconic California native evergreen oak with broad, spreading crown. Perfect for large landscapes and wildlife habitat.',
    category: 'tree',
    nativeToCA: true,
    droughtTolerant: true,
    color: '#2F4F2F', // Dark green
    growthData: {
      // 30-year trajectory from the USDA Urban Tree Database allometric
      // equations (McPherson, van Doorn & Peper 2016, GTR-PSW-253; Q. agrifolia,
      // NoCalC region). maxHeight/maxWidth are the ultimate (150+ yr) open-grown
      // size. See lib/growth/oakGrowth.ts.
      baseHeightGrowth: [
        10, 11, 13, 14, 15, 17, 18, 19, 20, 21,
        23, 24, 25, 26, 27, 27, 28, 29, 30, 31,
        31, 32, 33, 33, 34, 34, 35, 36, 36, 36
      ],
      baseWidthGrowth: [
        4, 5, 6, 8, 9, 10, 12, 13, 14, 15,
        16, 18, 19, 20, 21, 22, 23, 25, 26, 27,
        28, 29, 30, 31, 32, 33, 34, 35, 36, 37
      ],
      maxHeight: 75,
      maxWidth: 120,
      growthRate: 'moderate',
      lifespan: 250,
      shapeType: 'rounded',
    },
    care: {
      waterNeeds: 'low',
      sunExposure: 'full-sun',
      soilType: 'Well-drained, adaptable',
      hardiness: 'USDA Zones 9-10',
      maintenanceLevel: 'low',
    },
  },
  {
    id: 'quercus-lobata',
    commonName: 'Valley Oak',
    scientificName: 'Quercus lobata',
    description: 'Majestic California native deciduous oak. The largest North American oak with deeply lobed leaves and wide-spreading canopy.',
    category: 'tree',
    nativeToCA: true,
    droughtTolerant: true,
    color: '#556B2F', // Olive green
    growthData: {
      baseHeightGrowth: [
        4, 7, 10, 14, 18, 22, 26, 30, 34, 38,
        42, 46, 50, 54, 58, 62, 66, 70, 74, 78,
        82, 86, 90, 94, 98, 100, 100, 100, 100, 100
      ],
      baseWidthGrowth: [
        4, 8, 13, 18, 24, 30, 37, 44, 51, 58,
        65, 72, 79, 86, 93, 100, 107, 114, 121, 128,
        135, 142, 149, 155, 160, 165, 165, 165, 165, 165
      ],
      maxHeight: 100,
      maxWidth: 165,
      growthRate: 'fast',
      lifespan: 600,
      shapeType: 'rounded',
    },
    care: {
      waterNeeds: 'low',
      sunExposure: 'full-sun',
      soilType: 'Deep, well-drained',
      hardiness: 'USDA Zones 7-10',
      maintenanceLevel: 'low',
    },
  },
  {
    id: 'umbellularia-californica',
    commonName: 'California Bay Laurel',
    scientificName: 'Umbellularia californica',
    description: 'Aromatic California native evergreen with fragrant leaves used in cooking. Dense canopy provides excellent shade.',
    category: 'tree',
    nativeToCA: true,
    droughtTolerant: true,
    color: '#228B22', // Forest green
    growthData: {
      baseHeightGrowth: [
        3, 5, 8, 11, 14, 17, 20, 23, 26, 29,
        32, 35, 38, 41, 44, 47, 50, 53, 56, 59,
        62, 65, 68, 71, 74, 77, 79, 80, 80, 80
      ],
      baseWidthGrowth: [
        2, 4, 6, 9, 12, 15, 18, 22, 26, 30,
        34, 38, 42, 46, 50, 54, 58, 62, 66, 70,
        74, 78, 82, 86, 90, 93, 95, 95, 95, 95
      ],
      maxHeight: 80,
      maxWidth: 95,
      growthRate: 'moderate',
      lifespan: 200,
      shapeType: 'rounded',
    },
    care: {
      waterNeeds: 'low',
      sunExposure: 'full-sun',
      soilType: 'Adaptable, prefers moist',
      hardiness: 'USDA Zones 7-10',
      maintenanceLevel: 'low',
    },
  },
  {
    id: 'arbutus-menziesii',
    commonName: 'Pacific Madrone',
    scientificName: 'Arbutus menziesii',
    description: 'Stunning evergreen with smooth red-orange bark that peels to reveal greenish underbark. White flowers and red berries.',
    category: 'tree',
    nativeToCA: true,
    droughtTolerant: true,
    color: '#DC143C', // Crimson (for bark)
    growthData: {
      baseHeightGrowth: [
        2, 4, 6, 9, 12, 15, 18, 21, 24, 27,
        30, 33, 36, 39, 42, 45, 48, 51, 54, 57,
        60, 63, 66, 69, 72, 75, 78, 80, 80, 80
      ],
      baseWidthGrowth: [
        2, 3, 5, 7, 10, 13, 16, 19, 22, 25,
        28, 31, 34, 37, 40, 43, 46, 49, 52, 55,
        58, 61, 64, 67, 70, 73, 75, 75, 75, 75
      ],
      maxHeight: 80,
      maxWidth: 75,
      growthRate: 'slow',
      lifespan: 200,
      shapeType: 'rounded',
    },
    care: {
      waterNeeds: 'low',
      sunExposure: 'full-sun',
      soilType: 'Well-drained, acidic',
      hardiness: 'USDA Zones 7-9',
      maintenanceLevel: 'low',
    },
  },
  {
    id: 'aesculus-californica',
    commonName: 'California Buckeye',
    scientificName: 'Aesculus californica',
    description: 'Deciduous California native with spectacular white-pink flower spikes in spring. Goes summer dormant in hot weather.',
    category: 'tree',
    nativeToCA: true,
    droughtTolerant: true,
    color: '#F0E68C', // Khaki (for flowers)
    growthData: {
      baseHeightGrowth: [
        2, 4, 6, 8, 10, 12, 14, 16, 18, 20,
        22, 24, 26, 28, 30, 32, 34, 36, 38, 40,
        40, 40, 40, 40, 40, 40, 40, 40, 40, 40
      ],
      baseWidthGrowth: [
        3, 5, 8, 11, 14, 17, 20, 23, 26, 29,
        32, 35, 38, 41, 44, 47, 50, 53, 56, 60,
        60, 60, 60, 60, 60, 60, 60, 60, 60, 60
      ],
      maxHeight: 40,
      maxWidth: 60,
      growthRate: 'moderate',
      lifespan: 100,
      shapeType: 'rounded',
    },
    care: {
      waterNeeds: 'low',
      sunExposure: 'full-sun',
      soilType: 'Well-drained',
      hardiness: 'USDA Zones 7-10',
      maintenanceLevel: 'low',
    },
  },
  {
    id: 'cercis-occidentalis',
    commonName: 'Western Redbud',
    scientificName: 'Cercis occidentalis',
    description: 'Multi-trunked California native with stunning magenta flowers covering bare branches in spring. Heart-shaped leaves.',
    category: 'tree',
    nativeToCA: true,
    droughtTolerant: true,
    color: '#C71585', // Medium violet red
    growthData: {
      baseHeightGrowth: [
        2, 3, 5, 7, 9, 11, 13, 15, 17, 19,
        21, 23, 25, 26, 27, 28, 29, 30, 30, 30,
        30, 30, 30, 30, 30, 30, 30, 30, 30, 30
      ],
      baseWidthGrowth: [
        2, 4, 6, 8, 10, 12, 14, 16, 18, 20,
        22, 24, 26, 28, 30, 32, 34, 35, 35, 35,
        35, 35, 35, 35, 35, 35, 35, 35, 35, 35
      ],
      maxHeight: 30,
      maxWidth: 35,
      growthRate: 'moderate',
      lifespan: 75,
      shapeType: 'vase',
    },
    care: {
      waterNeeds: 'low',
      sunExposure: 'full-sun',
      soilType: 'Well-drained',
      hardiness: 'USDA Zones 7-9',
      maintenanceLevel: 'low',
    },
  },
  {
    id: 'platanus-racemosa',
    commonName: 'California Sycamore',
    scientificName: 'Platanus racemosa',
    description: 'Large deciduous native tree with distinctive mottled white bark. Spreading crown provides excellent shade.',
    category: 'tree',
    nativeToCA: true,
    droughtTolerant: false,
    color: '#F5F5DC', // Beige (for bark)
    growthData: {
      baseHeightGrowth: [
        5, 10, 15, 20, 25, 30, 35, 40, 45, 50,
        55, 60, 65, 70, 75, 80, 85, 90, 95, 100,
        100, 100, 100, 100, 100, 100, 100, 100, 100, 100
      ],
      baseWidthGrowth: [
        4, 9, 14, 20, 26, 32, 38, 44, 50, 56,
        62, 68, 74, 80, 86, 92, 98, 104, 110, 120,
        120, 120, 120, 120, 120, 120, 120, 120, 120, 120
      ],
      maxHeight: 100,
      maxWidth: 120,
      growthRate: 'fast',
      lifespan: 250,
      shapeType: 'rounded',
    },
    care: {
      waterNeeds: 'moderate',
      sunExposure: 'full-sun',
      soilType: 'Moist, deep',
      hardiness: 'USDA Zones 7-10',
      maintenanceLevel: 'moderate',
    },
  },
  {
    id: 'sequoia-sempervirens',
    commonName: 'Coast Redwood',
    scientificName: 'Sequoia sempervirens',
    description: 'Iconic California native evergreen. The tallest tree species on Earth. Majestic columnar form with soft foliage.',
    category: 'tree',
    nativeToCA: true,
    droughtTolerant: false,
    color: '#2E8B57', // Sea green
    growthData: {
      baseHeightGrowth: [
        5, 12, 19, 26, 33, 40, 47, 54, 61, 68,
        75, 82, 89, 96, 103, 110, 117, 124, 131, 138,
        145, 152, 159, 166, 173, 180, 187, 194, 200, 200
      ],
      baseWidthGrowth: [
        2, 4, 6, 8, 10, 12, 14, 16, 18, 20,
        22, 24, 26, 28, 30, 32, 34, 36, 38, 40,
        42, 44, 46, 48, 50, 52, 54, 56, 58, 60
      ],
      maxHeight: 200,
      maxWidth: 60,
      growthRate: 'fast',
      lifespan: 2000,
      shapeType: 'columnar',
    },
    care: {
      waterNeeds: 'moderate',
      sunExposure: 'full-sun',
      soilType: 'Moist, well-drained',
      hardiness: 'USDA Zones 7-9',
      maintenanceLevel: 'low',
    },
  },
  {
    id: 'pinus-radiata',
    commonName: 'Monterey Pine',
    scientificName: 'Pinus radiata',
    description: 'Fast-growing California native evergreen conifer with bright green needles. Excellent for windbreaks and screens.',
    category: 'tree',
    nativeToCA: true,
    droughtTolerant: true,
    color: '#32CD32', // Lime green
    growthData: {
      baseHeightGrowth: [
        4, 10, 16, 22, 28, 34, 40, 46, 52, 58,
        64, 70, 76, 82, 88, 94, 100, 106, 112, 118,
        124, 130, 136, 142, 148, 154, 160, 160, 160, 160
      ],
      baseWidthGrowth: [
        3, 6, 9, 12, 15, 18, 21, 24, 27, 30,
        33, 36, 39, 42, 45, 48, 51, 54, 57, 60,
        63, 66, 69, 72, 75, 78, 80, 80, 80, 80
      ],
      maxHeight: 160,
      maxWidth: 80,
      growthRate: 'fast',
      lifespan: 150,
      shapeType: 'pyramidal',
    },
    care: {
      waterNeeds: 'low',
      sunExposure: 'full-sun',
      soilType: 'Well-drained',
      hardiness: 'USDA Zones 7-10',
      maintenanceLevel: 'low',
    },
  },
  {
    id: 'quercus-douglasii',
    commonName: 'Blue Oak',
    scientificName: 'Quercus douglasii',
    description: 'Deciduous California native with distinctive blue-green foliage. Picturesque form perfect for naturalistic landscapes.',
    category: 'tree',
    nativeToCA: true,
    droughtTolerant: true,
    color: '#4682B4', // Steel blue
    growthData: {
      baseHeightGrowth: [
        2, 4, 6, 9, 12, 15, 18, 21, 24, 27,
        30, 33, 36, 39, 42, 45, 48, 51, 54, 57,
        60, 60, 60, 60, 60, 60, 60, 60, 60, 60
      ],
      baseWidthGrowth: [
        2, 5, 8, 12, 16, 20, 24, 28, 32, 36,
        40, 44, 48, 52, 56, 60, 64, 68, 72, 76,
        80, 80, 80, 80, 80, 80, 80, 80, 80, 80
      ],
      maxHeight: 60,
      maxWidth: 80,
      growthRate: 'slow',
      lifespan: 400,
      shapeType: 'rounded',
    },
    care: {
      waterNeeds: 'low',
      sunExposure: 'full-sun',
      soilType: 'Well-drained',
      hardiness: 'USDA Zones 6-9',
      maintenanceLevel: 'low',
    },
  },

  // ===== NATIVE CALIFORNIA SHRUBS =====
  {
    id: 'arctostaphylos-densiflora',
    commonName: 'Vine Hill Manzanita',
    scientificName: 'Arctostaphylos densiflora',
    description: 'Low-growing California native evergreen groundcover with smooth red bark and pink urn-shaped flowers. Excellent for slopes.',
    category: 'shrub',
    nativeToCA: true,
    droughtTolerant: true,
    color: '#8B4513', // Saddle brown (for bark)
    growthData: {
      baseHeightGrowth: [
        0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5,
        5.5, 6, 6, 6, 6, 6, 6, 6, 6, 6,
        6, 6, 6, 6, 6, 6, 6, 6, 6, 6
      ],
      baseWidthGrowth: [
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
        11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
        20, 20, 20, 20, 20, 20, 20, 20, 20, 20
      ],
      maxHeight: 6,
      maxWidth: 20,
      growthRate: 'moderate',
      lifespan: 50,
      shapeType: 'rounded',
    },
    care: {
      waterNeeds: 'low',
      sunExposure: 'full-sun',
      soilType: 'Well-drained, acidic',
      hardiness: 'USDA Zones 7-9',
      maintenanceLevel: 'low',
    },
  },
  {
    id: 'ceanothus-thyrsiflorus',
    commonName: 'Blue Blossom Ceanothus',
    scientificName: 'Ceanothus thyrsiflorus',
    description: 'Fast-growing California native shrub covered in clusters of bright blue flowers in spring. Excellent for slopes and screens.',
    category: 'shrub',
    nativeToCA: true,
    droughtTolerant: true,
    color: '#0000CD', // Medium blue
    growthData: {
      baseHeightGrowth: [
        2, 4, 6, 8, 10, 12, 14, 16, 18, 20,
        22, 24, 26, 28, 30, 30, 30, 30, 30, 30,
        30, 30, 30, 30, 30, 30, 30, 30, 30, 30
      ],
      baseWidthGrowth: [
        2, 4, 6, 8, 10, 12, 14, 16, 18, 20,
        22, 24, 26, 28, 30, 30, 30, 30, 30, 30,
        30, 30, 30, 30, 30, 30, 30, 30, 30, 30
      ],
      maxHeight: 30,
      maxWidth: 30,
      growthRate: 'fast',
      lifespan: 25,
      shapeType: 'rounded',
    },
    care: {
      waterNeeds: 'low',
      sunExposure: 'full-sun',
      soilType: 'Well-drained',
      hardiness: 'USDA Zones 8-10',
      maintenanceLevel: 'low',
    },
  },
  {
    id: 'heteromeles-arbutifolia',
    commonName: 'Toyon',
    scientificName: 'Heteromeles arbutifolia',
    description: 'California native evergreen shrub with white flowers and bright red berries. The original "Hollywood" plant.',
    category: 'shrub',
    nativeToCA: true,
    droughtTolerant: true,
    color: '#FF0000', // Red (for berries)
    growthData: {
      baseHeightGrowth: [
        2, 3, 5, 7, 9, 11, 13, 15, 17, 19,
        21, 23, 25, 27, 29, 30, 30, 30, 30, 30,
        30, 30, 30, 30, 30, 30, 30, 30, 30, 30
      ],
      baseWidthGrowth: [
        2, 3, 5, 7, 9, 11, 13, 15, 17, 19,
        21, 23, 25, 27, 29, 30, 30, 30, 30, 30,
        30, 30, 30, 30, 30, 30, 30, 30, 30, 30
      ],
      maxHeight: 30,
      maxWidth: 30,
      growthRate: 'moderate',
      lifespan: 100,
      shapeType: 'rounded',
    },
    care: {
      waterNeeds: 'low',
      sunExposure: 'full-sun',
      soilType: 'Well-drained, adaptable',
      hardiness: 'USDA Zones 8-10',
      maintenanceLevel: 'low',
    },
  },
  {
    id: 'rhamnus-californica',
    commonName: 'California Coffeeberry',
    scientificName: 'Frangula californica',
    description: 'Versatile California native evergreen shrub with glossy leaves and colorful berries that ripen from green to red to black.',
    category: 'shrub',
    nativeToCA: true,
    droughtTolerant: true,
    color: '#006400', // Dark green
    growthData: {
      baseHeightGrowth: [
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
        11, 12, 13, 14, 15, 15, 15, 15, 15, 15,
        15, 15, 15, 15, 15, 15, 15, 15, 15, 15
      ],
      baseWidthGrowth: [
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
        11, 12, 13, 14, 15, 15, 15, 15, 15, 15,
        15, 15, 15, 15, 15, 15, 15, 15, 15, 15
      ],
      maxHeight: 15,
      maxWidth: 15,
      growthRate: 'moderate',
      lifespan: 50,
      shapeType: 'rounded',
    },
    care: {
      waterNeeds: 'low',
      sunExposure: 'full-sun',
      soilType: 'Well-drained, adaptable',
      hardiness: 'USDA Zones 7-10',
      maintenanceLevel: 'low',
    },
  },
  {
    id: 'epilobium-canum',
    commonName: 'California Fuchsia',
    scientificName: 'Epilobium canum',
    description: 'Low-growing California native perennial with vibrant red-orange tubular flowers. Hummingbird magnet blooming late summer.',
    category: 'perennial',
    nativeToCA: true,
    droughtTolerant: true,
    color: '#FF4500', // Orange red
    growthData: {
      baseHeightGrowth: [
        1, 1.5, 2, 2.5, 3, 3, 3, 3, 3, 3,
        3, 3, 3, 3, 3, 3, 3, 3, 3, 3,
        3, 3, 3, 3, 3, 3, 3, 3, 3, 3
      ],
      baseWidthGrowth: [
        1, 2, 3, 4, 5, 6, 6, 6, 6, 6,
        6, 6, 6, 6, 6, 6, 6, 6, 6, 6,
        6, 6, 6, 6, 6, 6, 6, 6, 6, 6
      ],
      maxHeight: 3,
      maxWidth: 6,
      growthRate: 'fast',
      lifespan: 20,
      shapeType: 'rounded',
    },
    care: {
      waterNeeds: 'low',
      sunExposure: 'full-sun',
      soilType: 'Well-drained',
      hardiness: 'USDA Zones 6-10',
      maintenanceLevel: 'low',
    },
  },
  {
    id: 'mimulus-aurantiacus',
    commonName: 'Sticky Monkey Flower',
    scientificName: 'Diplacus aurantiacus',
    description: 'California native evergreen shrub with cheerful orange tubular flowers. Blooms spring through fall, attracts hummingbirds.',
    category: 'shrub',
    nativeToCA: true,
    droughtTolerant: true,
    color: '#FF8C00', // Dark orange
    growthData: {
      baseHeightGrowth: [
        1, 2, 3, 4, 5, 5, 5, 5, 5, 5,
        5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
        5, 5, 5, 5, 5, 5, 5, 5, 5, 5
      ],
      baseWidthGrowth: [
        1, 2, 3, 4, 5, 6, 7, 8, 8, 8,
        8, 8, 8, 8, 8, 8, 8, 8, 8, 8,
        8, 8, 8, 8, 8, 8, 8, 8, 8, 8
      ],
      maxHeight: 5,
      maxWidth: 8,
      growthRate: 'fast',
      lifespan: 15,
      shapeType: 'rounded',
    },
    care: {
      waterNeeds: 'low',
      sunExposure: 'full-sun',
      soilType: 'Well-drained',
      hardiness: 'USDA Zones 7-10',
      maintenanceLevel: 'low',
    },
  },
  {
    id: 'morella-californica',
    commonName: 'Pacific Wax Myrtle',
    scientificName: 'Morella californica',
    description: 'Evergreen California native shrub with aromatic leaves and waxy purple berries. Excellent for screens and hedges.',
    category: 'shrub',
    nativeToCA: true,
    droughtTolerant: false,
    color: '#2E5A2E', // Dark olive green
    growthData: {
      baseHeightGrowth: [
        2, 4, 6, 8, 10, 12, 14, 16, 18, 20,
        22, 24, 26, 28, 30, 30, 30, 30, 30, 30,
        30, 30, 30, 30, 30, 30, 30, 30, 30, 30
      ],
      baseWidthGrowth: [
        2, 3, 5, 7, 9, 11, 13, 15, 17, 19,
        21, 23, 25, 27, 29, 30, 30, 30, 30, 30,
        30, 30, 30, 30, 30, 30, 30, 30, 30, 30
      ],
      maxHeight: 30,
      maxWidth: 30,
      growthRate: 'fast',
      lifespan: 50,
      shapeType: 'rounded',
    },
    care: {
      waterNeeds: 'moderate',
      sunExposure: 'full-sun',
      soilType: 'Moist, adaptable',
      hardiness: 'USDA Zones 7-10',
      maintenanceLevel: 'low',
    },
  },
  {
    id: 'rhus-integrifolia',
    commonName: 'Lemonade Berry',
    scientificName: 'Rhus integrifolia',
    description: 'Coastal California native evergreen shrub with leathery leaves and edible red berries. Salt-tolerant and tough.',
    category: 'shrub',
    nativeToCA: true,
    droughtTolerant: true,
    color: '#8FBC8F', // Dark sea green
    growthData: {
      baseHeightGrowth: [
        2, 3, 5, 7, 9, 11, 13, 15, 17, 19,
        21, 23, 25, 27, 29, 30, 30, 30, 30, 30,
        30, 30, 30, 30, 30, 30, 30, 30, 30, 30
      ],
      baseWidthGrowth: [
        2, 3, 5, 7, 9, 11, 13, 15, 17, 19,
        21, 23, 25, 27, 29, 30, 30, 30, 30, 30,
        30, 30, 30, 30, 30, 30, 30, 30, 30, 30
      ],
      maxHeight: 30,
      maxWidth: 30,
      growthRate: 'moderate',
      lifespan: 75,
      shapeType: 'rounded',
    },
    care: {
      waterNeeds: 'low',
      sunExposure: 'full-sun',
      soilType: 'Well-drained',
      hardiness: 'USDA Zones 9-11',
      maintenanceLevel: 'low',
    },
  },
  {
    id: 'carpenteria-californica',
    commonName: 'Bush Anemone',
    scientificName: 'Carpenteria californica',
    description: 'Rare California native evergreen shrub with stunning large white flowers with yellow centers. Fragrant blooms in summer.',
    category: 'shrub',
    nativeToCA: true,
    droughtTolerant: true,
    color: '#FFFFFF', // White (for flowers)
    growthData: {
      baseHeightGrowth: [
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
        10, 10, 10, 10, 10, 10, 10, 10, 10, 10,
        10, 10, 10, 10, 10, 10, 10, 10, 10, 10
      ],
      baseWidthGrowth: [
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
        10, 10, 10, 10, 10, 10, 10, 10, 10, 10,
        10, 10, 10, 10, 10, 10, 10, 10, 10, 10
      ],
      maxHeight: 10,
      maxWidth: 10,
      growthRate: 'moderate',
      lifespan: 40,
      shapeType: 'rounded',
    },
    care: {
      waterNeeds: 'low',
      sunExposure: 'partial-shade',
      soilType: 'Well-drained',
      hardiness: 'USDA Zones 8-9',
      maintenanceLevel: 'low',
    },
  },
  {
    id: 'ribes-sanguineum',
    commonName: 'Red Flowering Currant',
    scientificName: 'Ribes sanguineum',
    description: 'Deciduous California native shrub with drooping clusters of pink to red flowers in early spring. Attracts hummingbirds.',
    category: 'shrub',
    nativeToCA: true,
    droughtTolerant: true,
    color: '#FF1493', // Deep pink
    growthData: {
      baseHeightGrowth: [
        2, 3, 5, 7, 9, 11, 13, 15, 16, 17,
        18, 18, 18, 18, 18, 18, 18, 18, 18, 18,
        18, 18, 18, 18, 18, 18, 18, 18, 18, 18
      ],
      baseWidthGrowth: [
        2, 3, 5, 7, 9, 11, 13, 15, 16, 17,
        18, 18, 18, 18, 18, 18, 18, 18, 18, 18,
        18, 18, 18, 18, 18, 18, 18, 18, 18, 18
      ],
      maxHeight: 18,
      maxWidth: 18,
      growthRate: 'moderate',
      lifespan: 30,
      shapeType: 'rounded',
    },
    care: {
      waterNeeds: 'low',
      sunExposure: 'partial-shade',
      soilType: 'Well-drained',
      hardiness: 'USDA Zones 5-9',
      maintenanceLevel: 'low',
    },
  },

  // ===== NATIVE PERENNIALS & GROUND COVERS =====
  {
    id: 'eschscholzia-californica',
    commonName: 'California Poppy',
    scientificName: 'Eschscholzia californica',
    description: 'California state flower! Bright golden-orange flowers cover blue-green ferny foliage. Self-sows readily.',
    category: 'perennial',
    nativeToCA: true,
    droughtTolerant: true,
    color: '#FFA500', // Orange
    growthData: {
      baseHeightGrowth: [
        0.8, 1, 1, 1, 1, 1, 1, 1, 1, 1,
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1
      ],
      baseWidthGrowth: [
        0.5, 1, 1.5, 2, 2, 2, 2, 2, 2, 2,
        2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
        2, 2, 2, 2, 2, 2, 2, 2, 2, 2
      ],
      maxHeight: 1,
      maxWidth: 2,
      growthRate: 'fast',
      lifespan: 3,
      shapeType: 'rounded',
    },
    care: {
      waterNeeds: 'low',
      sunExposure: 'full-sun',
      soilType: 'Well-drained, poor soil ok',
      hardiness: 'USDA Zones 6-10',
      maintenanceLevel: 'low',
    },
  },
  {
    id: 'festuca-californica',
    commonName: 'California Fescue',
    scientificName: 'Festuca californica',
    description: 'Clumping California native grass with fine blue-green blades. Excellent textural accent or meadow grass.',
    category: 'ground-cover',
    nativeToCA: true,
    droughtTolerant: true,
    color: '#7B9F8E', // Blue-green
    growthData: {
      baseHeightGrowth: [
        1, 1.5, 2, 2.5, 3, 3, 3, 3, 3, 3,
        3, 3, 3, 3, 3, 3, 3, 3, 3, 3,
        3, 3, 3, 3, 3, 3, 3, 3, 3, 3
      ],
      baseWidthGrowth: [
        0.5, 1, 1.5, 2, 2.5, 3, 3, 3, 3, 3,
        3, 3, 3, 3, 3, 3, 3, 3, 3, 3,
        3, 3, 3, 3, 3, 3, 3, 3, 3, 3
      ],
      maxHeight: 3,
      maxWidth: 3,
      growthRate: 'moderate',
      lifespan: 20,
      shapeType: 'rounded',
    },
    care: {
      waterNeeds: 'low',
      sunExposure: 'full-sun',
      soilType: 'Well-drained',
      hardiness: 'USDA Zones 7-9',
      maintenanceLevel: 'low',
    },
  },
  {
    id: 'carex-tumulicola',
    commonName: 'Foothill Sedge',
    scientificName: 'Carex tumulicola',
    description: 'Versatile California native sedge forming soft mounds of green foliage. Excellent lawn alternative or filler plant.',
    category: 'ground-cover',
    nativeToCA: true,
    droughtTolerant: true,
    color: '#90EE90', // Light green
    growthData: {
      baseHeightGrowth: [
        0.5, 1, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5,
        1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5,
        1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5
      ],
      baseWidthGrowth: [
        0.5, 1, 1.5, 2, 2.5, 3, 3, 3, 3, 3,
        3, 3, 3, 3, 3, 3, 3, 3, 3, 3,
        3, 3, 3, 3, 3, 3, 3, 3, 3, 3
      ],
      maxHeight: 1.5,
      maxWidth: 3,
      growthRate: 'fast',
      lifespan: 15,
      shapeType: 'rounded',
    },
    care: {
      waterNeeds: 'low',
      sunExposure: 'partial-shade',
      soilType: 'Adaptable',
      hardiness: 'USDA Zones 7-10',
      maintenanceLevel: 'low',
    },
  },
  {
    id: 'achillea-millefolium',
    commonName: 'California Yarrow',
    scientificName: 'Achillea millefolium',
    description: 'Tough California native perennial with white flower clusters and ferny aromatic foliage. Excellent for meadows.',
    category: 'perennial',
    nativeToCA: true,
    droughtTolerant: true,
    color: '#F5F5F5', // White smoke
    growthData: {
      baseHeightGrowth: [
        1, 1.5, 2, 2.5, 3, 3, 3, 3, 3, 3,
        3, 3, 3, 3, 3, 3, 3, 3, 3, 3,
        3, 3, 3, 3, 3, 3, 3, 3, 3, 3
      ],
      baseWidthGrowth: [
        1, 2, 3, 4, 5, 6, 6, 6, 6, 6,
        6, 6, 6, 6, 6, 6, 6, 6, 6, 6,
        6, 6, 6, 6, 6, 6, 6, 6, 6, 6
      ],
      maxHeight: 3,
      maxWidth: 6,
      growthRate: 'fast',
      lifespan: 10,
      shapeType: 'rounded',
    },
    care: {
      waterNeeds: 'low',
      sunExposure: 'full-sun',
      soilType: 'Well-drained',
      hardiness: 'USDA Zones 3-10',
      maintenanceLevel: 'low',
    },
  },
  {
    id: 'iris-douglasiana',
    commonName: 'Douglas Iris',
    scientificName: 'Iris douglasiana',
    description: 'California native iris with stunning blue-purple flowers in spring. Sword-like foliage forms attractive clumps.',
    category: 'perennial',
    nativeToCA: true,
    droughtTolerant: true,
    color: '#6A5ACD', // Slate blue
    growthData: {
      baseHeightGrowth: [
        0.5, 1, 1.5, 2, 2.5, 2.5, 2.5, 2.5, 2.5, 2.5,
        2.5, 2.5, 2.5, 2.5, 2.5, 2.5, 2.5, 2.5, 2.5, 2.5,
        2.5, 2.5, 2.5, 2.5, 2.5, 2.5, 2.5, 2.5, 2.5, 2.5
      ],
      baseWidthGrowth: [
        0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4, 4,
        4, 4, 4, 4, 4, 4, 4, 4, 4, 4,
        4, 4, 4, 4, 4, 4, 4, 4, 4, 4
      ],
      maxHeight: 2.5,
      maxWidth: 4,
      growthRate: 'moderate',
      lifespan: 20,
      shapeType: 'rounded',
    },
    care: {
      waterNeeds: 'low',
      sunExposure: 'partial-shade',
      soilType: 'Well-drained',
      hardiness: 'USDA Zones 7-9',
      maintenanceLevel: 'low',
    },
  },
  {
    id: 'rosa-californica',
    commonName: 'California Wild Rose',
    scientificName: 'Rosa californica',
    description: 'Native rose with fragrant pink flowers followed by red rose hips. Deciduous arching stems form thickets.',
    category: 'shrub',
    nativeToCA: true,
    droughtTolerant: true,
    color: '#FFB6C1', // Light pink
    growthData: {
      baseHeightGrowth: [
        2, 3, 4, 5, 6, 7, 8, 9, 10, 10,
        10, 10, 10, 10, 10, 10, 10, 10, 10, 10,
        10, 10, 10, 10, 10, 10, 10, 10, 10, 10
      ],
      baseWidthGrowth: [
        2, 3, 4, 5, 6, 7, 8, 9, 10, 11,
        12, 12, 12, 12, 12, 12, 12, 12, 12, 12,
        12, 12, 12, 12, 12, 12, 12, 12, 12, 12
      ],
      maxHeight: 10,
      maxWidth: 12,
      growthRate: 'fast',
      lifespan: 30,
      shapeType: 'rounded',
    },
    care: {
      waterNeeds: 'low',
      sunExposure: 'full-sun',
      soilType: 'Moist, adaptable',
      hardiness: 'USDA Zones 5-10',
      maintenanceLevel: 'low',
    },
  },

  // ===== NON-NATIVE BUT WELL-ADAPTED ORNAMENTALS =====
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
        2, 3, 4, 5, 6, 7, 8, 9, 10, 11,
        12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
        22, 23, 24, 25, 25, 25, 25, 25, 25, 25
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
    id: 'lavandula-angustifolia',
    commonName: 'English Lavender',
    scientificName: 'Lavandula angustifolia',
    description: 'Aromatic Mediterranean herb with purple flower spikes and gray-green foliage. Excellent for borders and fragrance.',
    category: 'perennial',
    nativeToCA: false,
    droughtTolerant: true,
    color: '#9370DB', // Medium purple
    growthData: {
      baseHeightGrowth: [
        0.5, 1, 1.5, 2, 2.5, 3, 3, 3, 3, 3,
        3, 3, 3, 3, 3, 3, 3, 3, 3, 3,
        3, 3, 3, 3, 3, 3, 3, 3, 3, 3
      ],
      baseWidthGrowth: [
        0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4, 4,
        4, 4, 4, 4, 4, 4, 4, 4, 4, 4,
        4, 4, 4, 4, 4, 4, 4, 4, 4, 4
      ],
      maxHeight: 3,
      maxWidth: 4,
      growthRate: 'moderate',
      lifespan: 15,
      shapeType: 'rounded',
    },
    care: {
      waterNeeds: 'low',
      sunExposure: 'full-sun',
      soilType: 'Well-drained',
      hardiness: 'USDA Zones 5-9',
      maintenanceLevel: 'low',
    },
  },
  {
    id: 'rosmarinus-officinalis',
    commonName: 'Rosemary',
    scientificName: 'Salvia rosmarinus',
    description: 'Evergreen Mediterranean herb with aromatic needle-like leaves and blue flowers. Excellent for culinary use and landscaping.',
    category: 'shrub',
    nativeToCA: false,
    droughtTolerant: true,
    color: '#6495ED', // Cornflower blue
    growthData: {
      baseHeightGrowth: [
        1, 2, 3, 4, 5, 6, 7, 7, 7, 7,
        7, 7, 7, 7, 7, 7, 7, 7, 7, 7,
        7, 7, 7, 7, 7, 7, 7, 7, 7, 7
      ],
      baseWidthGrowth: [
        1, 2, 3, 4, 5, 6, 7, 8, 8, 8,
        8, 8, 8, 8, 8, 8, 8, 8, 8, 8,
        8, 8, 8, 8, 8, 8, 8, 8, 8, 8
      ],
      maxHeight: 7,
      maxWidth: 8,
      growthRate: 'moderate',
      lifespan: 30,
      shapeType: 'rounded',
    },
    care: {
      waterNeeds: 'low',
      sunExposure: 'full-sun',
      soilType: 'Well-drained',
      hardiness: 'USDA Zones 7-10',
      maintenanceLevel: 'low',
    },
  },
  {
    id: 'agapanthus-praecox',
    commonName: 'Lily of the Nile',
    scientificName: 'Agapanthus praecox',
    description: 'South African perennial with globe-shaped clusters of blue flowers on tall stems. Strappy evergreen foliage.',
    category: 'perennial',
    nativeToCA: false,
    droughtTolerant: true,
    color: '#4169E1', // Royal blue
    growthData: {
      baseHeightGrowth: [
        1, 1.5, 2, 2.5, 3, 3.5, 4, 4, 4, 4,
        4, 4, 4, 4, 4, 4, 4, 4, 4, 4,
        4, 4, 4, 4, 4, 4, 4, 4, 4, 4
      ],
      baseWidthGrowth: [
        0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4, 4,
        4, 4, 4, 4, 4, 4, 4, 4, 4, 4,
        4, 4, 4, 4, 4, 4, 4, 4, 4, 4
      ],
      maxHeight: 4,
      maxWidth: 4,
      growthRate: 'moderate',
      lifespan: 25,
      shapeType: 'rounded',
    },
    care: {
      waterNeeds: 'moderate',
      sunExposure: 'full-sun',
      soilType: 'Well-drained',
      hardiness: 'USDA Zones 8-11',
      maintenanceLevel: 'low',
    },
  },
  {
    id: 'salvia-leucantha',
    commonName: 'Mexican Bush Sage',
    scientificName: 'Salvia leucantha',
    description: 'Showy perennial with velvety purple flower spikes in late summer and fall. Attracts pollinators.',
    category: 'perennial',
    nativeToCA: false,
    droughtTolerant: true,
    color: '#8B008B', // Dark magenta
    growthData: {
      baseHeightGrowth: [
        1, 2, 3, 4, 5, 5, 5, 5, 5, 5,
        5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
        5, 5, 5, 5, 5, 5, 5, 5, 5, 5
      ],
      baseWidthGrowth: [
        1, 2, 3, 4, 5, 6, 7, 7, 7, 7,
        7, 7, 7, 7, 7, 7, 7, 7, 7, 7,
        7, 7, 7, 7, 7, 7, 7, 7, 7, 7
      ],
      maxHeight: 5,
      maxWidth: 7,
      growthRate: 'fast',
      lifespan: 10,
      shapeType: 'rounded',
    },
    care: {
      waterNeeds: 'low',
      sunExposure: 'full-sun',
      soilType: 'Well-drained',
      hardiness: 'USDA Zones 8-10',
      maintenanceLevel: 'low',
    },
  },
  {
    id: 'acer-palmatum-sango-kaku',
    commonName: "Coral Bark Maple 'Sango-kaku'",
    scientificName: "Acer palmatum 'Sango-kaku'",
    description: "Upright Japanese maple prized for vivid coral-red bark that glows when the delicate palmate leaves drop. Green in summer, gold-apricot in fall, bare coral branches in winter.",
    category: 'tree',
    nativeToCA: false,
    droughtTolerant: false,
    color: '#E2583E', // Coral bark
    growthData: {
      baseHeightGrowth: [
        2, 3, 4, 5, 6, 7, 8, 9, 10, 11,
        12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
        21, 22, 22, 22, 22, 22, 22, 22, 22, 22
      ],
      baseWidthGrowth: [
        1.5, 2.5, 3.5, 4.5, 5.5, 6.5, 7.5, 8.5, 9.5, 10.5,
        11.5, 12.5, 13, 14, 15, 15.5, 16, 16.5, 17, 17.5,
        18, 18, 18, 18, 18, 18, 18, 18, 18, 18
      ],
      maxHeight: 22,
      maxWidth: 18,
      growthRate: 'slow',
      lifespan: 80,
      shapeType: 'vase',
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
    id: 'buxus-sempervirens-suffruticosa',
    commonName: 'Dwarf English Boxwood',
    scientificName: "Buxus sempervirens 'Suffruticosa'",
    description: "The classic true-dwarf boxwood and the slowest of all — roughly an inch of growth a year. Fine-textured, densely packed leaves billow into a soft mound wider than it is tall, the timeless choice for formal edging, parterres, and knot gardens. Left unsheared it takes decades to reach 2–3 ft; a century-old plant is still only knee-to-waist high.",
    category: 'shrub',
    nativeToCA: false,
    droughtTolerant: false,
    color: '#2E5D34', // Boxwood green
    // Calibrated to real 'Suffruticosa' data: ~0.5–1.5 in/yr, decelerating,
    // reaching ~2.3 ft tall × ~2.8 ft wide (broader than tall) by year 30.
    growthData: {
      baseHeightGrowth: [
        0.55, 0.66, 0.77, 0.87, 0.97, 1.06, 1.15, 1.23, 1.31, 1.39,
        1.46, 1.53, 1.60, 1.66, 1.72, 1.78, 1.83, 1.88, 1.93, 1.98,
        2.02, 2.06, 2.10, 2.14, 2.17, 2.20, 2.23, 2.26, 2.28, 2.30,
      ],
      baseWidthGrowth: [
        0.60, 0.74, 0.88, 1.01, 1.13, 1.25, 1.36, 1.47, 1.57, 1.67,
        1.76, 1.85, 1.93, 2.01, 2.09, 2.16, 2.23, 2.29, 2.35, 2.41,
        2.46, 2.51, 2.56, 2.61, 2.65, 2.69, 2.73, 2.76, 2.79, 2.82,
      ],
      maxHeight: 2.5,
      maxWidth: 3,
      growthRate: 'slow',
      lifespan: 120,
      shapeType: 'rounded',
    },
    care: {
      waterNeeds: 'moderate',
      sunExposure: 'partial-shade',
      soilType: 'Well-drained, loamy',
      hardiness: 'USDA Zones 5-9',
      maintenanceLevel: 'moderate',
    },
  },
  {
    id: 'buxus-sempervirens',
    commonName: 'American Boxwood',
    scientificName: 'Buxus sempervirens',
    description: 'The common or tree boxwood — larger and far more vigorous than its dwarf cousin, growing 2–3 in a year into a broad, billowing evergreen. Dark, glossy blue-green leaves. Given decades it becomes a small tree of 10–15 ft; over a landscape lifetime it makes a substantial rounded specimen or a tall clipped hedge.',
    category: 'shrub',
    nativeToCA: false,
    droughtTolerant: false,
    color: '#274B26',
    growthData: {
      baseHeightGrowth: [
        0.80, 1.00, 1.25, 1.50, 1.75, 2.00, 2.25, 2.50, 2.75, 3.00,
        3.25, 3.50, 3.72, 3.94, 4.15, 4.35, 4.54, 4.72, 4.90, 5.07,
        5.23, 5.38, 5.53, 5.67, 5.80, 5.93, 6.05, 6.17, 6.28, 6.40,
      ],
      baseWidthGrowth: [
        0.70, 0.90, 1.12, 1.34, 1.55, 1.76, 1.96, 2.15, 2.34, 2.52,
        2.70, 2.87, 3.03, 3.19, 3.34, 3.48, 3.62, 3.75, 3.88, 4.00,
        4.11, 4.22, 4.33, 4.43, 4.53, 4.62, 4.71, 4.79, 4.87, 4.95,
      ],
      maxHeight: 12,
      maxWidth: 8,
      growthRate: 'moderate',
      lifespan: 150,
      shapeType: 'rounded',
    },
    care: {
      waterNeeds: 'moderate',
      sunExposure: 'partial-shade',
      soilType: 'Well-drained, loamy',
      hardiness: 'USDA Zones 5-8',
      maintenanceLevel: 'low',
    },
  },
  {
    id: 'buxus-microphylla-winter-gem',
    commonName: "Winter Gem Boxwood",
    scientificName: "Buxus microphylla japonica 'Winter Gem'",
    description: "A fast, tough littleleaf boxwood that fills quickly into a tidy rounded mound of bright green. Small leaves take on a bronze cast through winter and green up again in spring. Reaches 3–4 ft, a modern workhorse for low hedges and foundation plantings that holds a shear well.",
    category: 'shrub',
    nativeToCA: false,
    droughtTolerant: false,
    color: '#3C6C33',
    growthData: {
      baseHeightGrowth: [
        0.60, 0.82, 1.03, 1.23, 1.42, 1.60, 1.77, 1.93, 2.08, 2.22,
        2.35, 2.47, 2.58, 2.68, 2.78, 2.87, 2.95, 3.02, 3.09, 3.15,
        3.21, 3.26, 3.31, 3.35, 3.39, 3.43, 3.46, 3.49, 3.52, 3.55,
      ],
      baseWidthGrowth: [
        0.65, 0.90, 1.14, 1.37, 1.59, 1.80, 2.00, 2.19, 2.37, 2.54,
        2.70, 2.85, 2.99, 3.12, 3.24, 3.35, 3.45, 3.54, 3.62, 3.70,
        3.77, 3.83, 3.89, 3.94, 3.99, 4.03, 4.07, 4.10, 4.13, 4.15,
      ],
      maxHeight: 4,
      maxWidth: 4.5,
      growthRate: 'moderate',
      lifespan: 90,
      shapeType: 'rounded',
    },
    care: {
      waterNeeds: 'moderate',
      sunExposure: 'full-sun',
      soilType: 'Well-drained, loamy',
      hardiness: 'USDA Zones 5-9',
      maintenanceLevel: 'low',
    },
  },
  {
    id: 'buxus-green-mountain',
    commonName: "Green Mountain Boxwood",
    scientificName: "Buxus 'Green Mountain'",
    description: "A naturally upright, cone-shaped hybrid that holds a rich green through winter without bronzing. Grows into a 3–5 ft pyramid, ideal for topiary cones, matched pairs flanking an entry, and vertical accents in a formal bed. Vigorous and cold-hardy, it keeps its conical form with minimal shearing.",
    category: 'shrub',
    nativeToCA: false,
    droughtTolerant: false,
    color: '#315E2E',
    growthData: {
      baseHeightGrowth: [
        0.80, 1.05, 1.30, 1.54, 1.77, 1.99, 2.20, 2.40, 2.59, 2.77,
        2.94, 3.10, 3.25, 3.39, 3.52, 3.64, 3.75, 3.85, 3.94, 4.03,
        4.11, 4.18, 4.25, 4.31, 4.37, 4.42, 4.47, 4.51, 4.55, 4.60,
      ],
      baseWidthGrowth: [
        0.45, 0.58, 0.72, 0.85, 0.97, 1.09, 1.20, 1.31, 1.41, 1.50,
        1.59, 1.67, 1.75, 1.82, 1.89, 1.95, 2.01, 2.06, 2.11, 2.16,
        2.20, 2.24, 2.28, 2.31, 2.34, 2.37, 2.40, 2.42, 2.44, 2.46,
      ],
      maxHeight: 5,
      maxWidth: 3,
      growthRate: 'moderate',
      lifespan: 100,
      shapeType: 'pyramidal',
    },
    care: {
      waterNeeds: 'moderate',
      sunExposure: 'full-sun',
      soilType: 'Well-drained, loamy',
      hardiness: 'USDA Zones 4-9',
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
