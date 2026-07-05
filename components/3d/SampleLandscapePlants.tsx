"use client";

import { useMemo } from "react";
import { PlantModel } from "@/components/design/PlantModels";
import { PlacedPlant } from "@/lib/plantData";

interface SamplePlantDef {
  speciesId: string;
  x: number;
  z: number;
  scale?: number;
  rotation?: number;
}

// Curated estate scene — foothill palette. Scales tuned to the hero scene's
// ~4-ft-per-unit world. Species are drawn from the real plant library, so the
// canopy dimensions here are driven by the same growth models as the design tool.
const PLANT_PLACEMENTS: SamplePlantDef[] = [
  // ── Specimen trees — procedural species only: the branch-expansion
  //    renderer gives organic canopies, while primitive models read as
  //    low-poly lollipops at hero scale ──
  { speciesId: "quercus-lobata", x: 6, z: -6.5, scale: 0.5 },             // Valley Oak — rear
  { speciesId: "quercus-agrifolia", x: -7.5, z: 5.5, scale: 0.75 },       // Coast Live Oak — front-left specimen
  { speciesId: "quercus-douglasii", x: -2, z: -8, scale: 0.5 },           // Blue Oak — rear
  { speciesId: "cercis-occidentalis", x: 8.5, z: 3.5, scale: 1.0 },       // Western Redbud — flowering front accent

  // ── Evergreen screen (side/rear) ──
  { speciesId: "pinus-radiata", x: -8.5, z: -2, scale: 0.5 },             // Monterey Pine — left
  { speciesId: "pinus-radiata", x: -8.5, z: -5, scale: 0.45 },            // Monterey Pine — rear-left
  { speciesId: "quercus-agrifolia", x: 9.5, z: -3, scale: 0.45 },         // Coast Live Oak — side
  { speciesId: "pinus-radiata", x: 8.2, z: -6.8, scale: 0.5 },            // Monterey Pine — rear-right screen
  { speciesId: "quercus-douglasii", x: 3.5, z: -9, scale: 0.45 },         // Blue Oak — rear skyline

  // ── Flowering accents near pool/patio ──
  { speciesId: "cercis-occidentalis", x: -6.5, z: -2.5, scale: 0.85 },    // Western Redbud
  { speciesId: "cercis-occidentalis", x: -2.8, z: -5.5, scale: 0.75 },    // Western Redbud

  // ── Foundation shrubs — left wing ──
  { speciesId: "arctostaphylos-densiflora", x: -3.8, z: 2.6, scale: 1 },  // Manzanita
  { speciesId: "ceanothus-thyrsiflorus", x: -5.2, z: 2.6, scale: 1 },     // Ceanothus
  { speciesId: "heteromeles-arbutifolia", x: -6.0, z: 1.5, scale: 0.9 },  // Toyon

  // ── Foundation shrubs — right wing ──
  { speciesId: "arctostaphylos-densiflora", x: 3.8, z: 2.6, scale: 1 },

  // ── Entry accents ──
  { speciesId: "carpenteria-californica", x: -1.8, z: 3.2, scale: 0.9 },  // Bush Anemone
  { speciesId: "carpenteria-californica", x: 1.8, z: 3.2, scale: 0.9 },

  // ── Formal dwarf English boxwood parterre edging along the front walk.
  //    Tight spacing so the slow-growing dwarves read as one low hedge that
  //    fills in over the 30-year timeline. ──
  { speciesId: "buxus-sempervirens-suffruticosa", x: -1.2, z: 3.3, scale: 1 },
  { speciesId: "buxus-sempervirens-suffruticosa", x: -1.2, z: 3.9, scale: 1 },
  { speciesId: "buxus-sempervirens-suffruticosa", x: -1.2, z: 4.5, scale: 1 },
  { speciesId: "buxus-sempervirens-suffruticosa", x: -1.2, z: 5.1, scale: 1 },
  { speciesId: "buxus-sempervirens-suffruticosa", x: 1.2, z: 3.3, scale: 1 },
  { speciesId: "buxus-sempervirens-suffruticosa", x: 1.2, z: 3.9, scale: 1 },
  { speciesId: "buxus-sempervirens-suffruticosa", x: 1.2, z: 4.5, scale: 1 },
  { speciesId: "buxus-sempervirens-suffruticosa", x: 1.2, z: 5.1, scale: 1 },

  // Matched pair of upright 'Green Mountain' boxwood cones flanking the entry.
  { speciesId: "buxus-green-mountain", x: -1.9, z: 3.0, scale: 1 },
  { speciesId: "buxus-green-mountain", x: 1.9, z: 3.0, scale: 1 },

  // 'Green Beauty' specimen globes anchoring the walk approach (hold color).
  { speciesId: "buxus-microphylla-green-beauty", x: -2.3, z: 5.5, scale: 1 },
  { speciesId: "buxus-microphylla-green-beauty", x: 2.3, z: 5.5, scale: 1 },

  // Low 'Green Pillow' dwarf cushions edging the front of the walk.
  { speciesId: "buxus-microphylla-green-pillow", x: -1.55, z: 5.6, scale: 1 },
  { speciesId: "buxus-microphylla-green-pillow", x: 1.55, z: 5.6, scale: 1 },

  // ── Pool border shrubs ──
  { speciesId: "rhamnus-californica", x: -7.0, z: -1.0, scale: 1 },       // Coffeeberry
  { speciesId: "heteromeles-arbutifolia", x: -7.0, z: -4.5, scale: 1 },   // Toyon
  { speciesId: "ceanothus-thyrsiflorus", x: -2.5, z: -6.0, scale: 0.9 },
];

interface SampleLandscapePlantsProps {
  age: number;
}

export default function SampleLandscapePlants({ age }: SampleLandscapePlantsProps) {
  const plants = useMemo<PlacedPlant[]>(
    () =>
      PLANT_PLACEMENTS.map((p, i) => ({
        id: `sample-${i}`,
        speciesId: p.speciesId,
        position: { x: p.x, y: 0, z: p.z },
        rotation: p.rotation ?? ((i * 0.73) % (Math.PI * 2)),
        scale: p.scale ?? 1,
        age,
        variant: 0,
      })),
    [age]
  );

  return (
    <>
      {plants.map((plant) => (
        <PlantModel key={plant.id} plant={plant} />
      ))}
    </>
  );
}
