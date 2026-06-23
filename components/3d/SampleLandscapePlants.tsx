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
  // ── Specimen trees ──
  { speciesId: "quercus-lobata", x: 6, z: -6.5, scale: 0.5 },             // Valley Oak — rear
  { speciesId: "quercus-agrifolia", x: -7.5, z: 5.5, scale: 0.6 },        // Coast Live Oak — procedural specimen, front-left (its own dense-crown model)
  { speciesId: "quercus-douglasii", x: -2, z: -8, scale: 0.5 },           // Blue Oak — rear
  { speciesId: "acer-palmatum-sango-kaku", x: 8.5, z: 3.5, scale: 0.9 },  // Coral Bark Maple — procedural front accent

  // ── Conifer screen (side/rear) ──
  { speciesId: "pinus-radiata", x: -8.5, z: -2, scale: 0.5 },             // Monterey Pine
  { speciesId: "sequoia-sempervirens", x: -8.5, z: -5, scale: 0.35 },     // Coast Redwood — tall
  { speciesId: "sequoia-sempervirens", x: 9.5, z: -3, scale: 0.35 },      // Coast Redwood — side

  // ── Flowering accents near pool/patio ──
  { speciesId: "cercis-occidentalis", x: -6.5, z: -2.5, scale: 0.85 },    // Western Redbud
  { speciesId: "cercis-occidentalis", x: -2.8, z: -5.5, scale: 0.75 },    // Western Redbud

  // ── Foundation shrubs — left wing ──
  { speciesId: "arctostaphylos-densiflora", x: -3.8, z: 2.6, scale: 1 },  // Manzanita
  { speciesId: "ceanothus-thyrsiflorus", x: -5.2, z: 2.6, scale: 1 },     // Ceanothus
  { speciesId: "heteromeles-arbutifolia", x: -6.0, z: 1.5, scale: 0.9 },  // Toyon

  // ── Foundation shrubs — right wing ──
  { speciesId: "arctostaphylos-densiflora", x: 3.8, z: 2.6, scale: 1 },
  { speciesId: "ceanothus-thyrsiflorus", x: 5.0, z: 2.6, scale: 0.95 },

  // ── Entry accents ──
  { speciesId: "carpenteria-californica", x: -1.8, z: 3.2, scale: 0.9 },  // Bush Anemone
  { speciesId: "carpenteria-californica", x: 1.8, z: 3.2, scale: 0.9 },

  // ── Formal boxwood edging along the front walk (procedural) ──
  { speciesId: "buxus-sempervirens-suffruticosa", x: -1.15, z: 3.4, scale: 1 },
  { speciesId: "buxus-sempervirens-suffruticosa", x: -1.15, z: 4.2, scale: 1 },
  { speciesId: "buxus-sempervirens-suffruticosa", x: -1.15, z: 5.0, scale: 1 },
  { speciesId: "buxus-sempervirens-suffruticosa", x: 1.15, z: 3.4, scale: 1 },
  { speciesId: "buxus-sempervirens-suffruticosa", x: 1.15, z: 4.2, scale: 1 },
  { speciesId: "buxus-sempervirens-suffruticosa", x: 1.15, z: 5.0, scale: 1 },

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
