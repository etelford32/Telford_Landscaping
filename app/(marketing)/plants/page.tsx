"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search, X, Filter, Leaf, Sun, Droplets, TreePine, Sprout,
  ChevronDown, ChevronUp, ArrowRight, Palette, Star, Wind, Flame,
  Shield, Flower, Maximize2, Clock
} from "lucide-react";
import { PLANT_CATALOG, PlantCatalogEntry, getHeightAtYear, ALL_SITUATIONS, ALL_GOALS } from "@/lib/plantCatalog";

const TYPE_LABELS: Record<string, string> = {
  tree: "Trees",
  shrub: "Shrubs",
  grass: "Grasses",
  groundcover: "Ground Covers",
  perennial: "Perennials",
  succulent: "Succulents",
};

const WATER_LABELS: Record<string, string> = {
  none: "None / Drought-proof",
  low: "Low",
  moderate: "Moderate",
  high: "High",
};

const WATER_ICONS = ["💧", "💧💧", "💧💧💧", "💧💧💧💧"];
const WATER_MAP: Record<string, number> = { none: 0, low: 1, moderate: 2, high: 3 };

const SUN_LABELS = ["Full Sun", "Partial Shade", "Filtered Sun", "Full Shade"];

function TypeBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    tree: "bg-green-800/60 text-green-200",
    shrub: "bg-emerald-800/60 text-emerald-200",
    grass: "bg-lime-800/60 text-lime-200",
    groundcover: "bg-teal-800/60 text-teal-200",
    perennial: "bg-purple-800/60 text-purple-200",
    succulent: "bg-amber-800/60 text-amber-200",
  };
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${colors[type] || "bg-white/20 text-white"}`}>
      {TYPE_LABELS[type] || type}
    </span>
  );
}

function WaterDots({ level }: { level: string }) {
  const n = WATER_MAP[level] ?? 1;
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: 4 }).map((_, i) => (
        <span key={i} className={`w-1.5 h-1.5 rounded-full ${i <= n ? "bg-blue-400" : "bg-white/20"}`} />
      ))}
    </span>
  );
}

function GrowthBar({ value, max = 1 }: { value: number; max?: number }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-primary-600 to-primary-400 rounded-full transition-all duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function PlantIcon({ type }: { type: string }) {
  const icons: Record<string, React.ReactNode> = {
    tree: <TreePine className="w-8 h-8" />,
    shrub: <Leaf className="w-8 h-8" />,
    grass: <Sprout className="w-8 h-8" />,
    groundcover: <Sprout className="w-8 h-8" />,
    perennial: <Flower className="w-8 h-8" />,
    succulent: <Star className="w-8 h-8" />,
  };
  return <>{icons[type] || <Leaf className="w-8 h-8" />}</>;
}

interface DetailModalProps {
  plant: PlantCatalogEntry;
  previewYear: number;
  onClose: () => void;
}

function DetailModal({ plant, previewYear, onClose }: DetailModalProps) {
  const [localYear, setLocalYear] = useState(previewYear);
  const height = getHeightAtYear(plant, localYear);
  const heightAtMax = getHeightAtYear(plant, 30);
  const seasons = ["spring", "summer", "fall", "winter"] as const;
  const seasonEmoji: Record<string, string> = {
    spring: "🌸",
    summer: "☀️",
    fall: "🍂",
    winter: "❄️",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative bg-primary-900/95 border border-white/20 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="p-6 rounded-t-2xl relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${plant.color}33 0%, transparent 70%)` }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="flex items-start gap-4">
            <div
              className="p-3 rounded-xl text-white"
              style={{ background: `${plant.color}55` }}
            >
              <PlantIcon type={plant.type} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <TypeBadge type={plant.type} />
                {plant.nativeCalifornia && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary-600/40 text-primary-200">
                    CA Native
                  </span>
                )}
                {plant.deerResistant && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-800/40 text-amber-200">
                    Deer Resistant
                  </span>
                )}
                {plant.fireResistant && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-800/40 text-orange-200">
                    Fire Resistant
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-bold text-white">{plant.name}</h2>
              <p className="text-primary-300 italic text-sm">{plant.scientific}</p>
              <p className="text-primary-200 mt-2 text-sm leading-relaxed">{plant.why}</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Quick specs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Height", value: `${plant.matureHeight[0]}–${plant.matureHeight[1]} ft`, icon: <Maximize2 className="w-4 h-4" /> },
              { label: "Water", value: WATER_LABELS[plant.waterNeeds], icon: <Droplets className="w-4 h-4" /> },
              { label: "Sun", value: plant.sunlight[0], icon: <Sun className="w-4 h-4" /> },
              { label: "Growth", value: plant.growthRate, icon: <Clock className="w-4 h-4" /> },
            ].map(s => (
              <div key={s.label} className="bg-white/10 rounded-xl p-3 text-center border border-white/10">
                <div className="flex items-center justify-center gap-1 text-primary-300 mb-1">{s.icon}</div>
                <div className="text-white font-semibold text-sm capitalize">{s.value}</div>
                <div className="text-primary-400 text-xs">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Growth timeline */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <TreePine className="w-4 h-4 text-primary-400" />
              30-Year Growth Preview
            </h3>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-primary-400 text-xs">Year 1</span>
              <input
                type="range"
                min={1}
                max={30}
                value={localYear}
                onChange={e => setLocalYear(Number(e.target.value))}
                className="flex-1 accent-primary-500"
              />
              <span className="text-primary-400 text-xs">Year 30</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-primary-200 text-sm">
                Year <span className="text-white font-bold">{localYear}</span>: approximately{" "}
                <span className="text-primary-300 font-bold">{height.toFixed(1)} ft</span> tall
              </span>
              <span className="text-primary-400 text-xs">
                Max: {plant.matureHeight[0]}–{plant.matureHeight[1]} ft
              </span>
            </div>
            <div className="mt-2">
              <GrowthBar value={height} max={heightAtMax || 1} />
            </div>
            {/* Mini timeline bars */}
            <div className="mt-3 grid grid-cols-6 gap-1">
              {[1, 5, 10, 15, 20, 30].map(yr => {
                const h = getHeightAtYear(plant, yr);
                const pct = Math.min(100, (h / (heightAtMax || 1)) * 100);
                return (
                  <div key={yr} className="text-center">
                    <div className="h-12 flex items-end">
                      <div
                        className="w-full rounded-t bg-primary-600/60"
                        style={{ height: `${pct}%`, minHeight: "3px" }}
                      />
                    </div>
                    <div className="text-primary-400 text-xs mt-1">yr{yr}</div>
                    <div className="text-white text-xs">{h.toFixed(0)}ft</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Seasonal info */}
          <div>
            <h3 className="text-white font-semibold mb-3">Seasonal Highlights</h3>
            <div className="grid grid-cols-2 gap-3">
              {seasons.map(s => (
                <div key={s} className="bg-white/5 border border-white/10 rounded-xl p-3">
                  <div className="text-sm font-semibold text-white capitalize mb-1">
                    {seasonEmoji[s]} {s}
                  </div>
                  <div className="text-primary-200 text-xs leading-relaxed">{plant.seasons[s].interest}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Best for + companion plants */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <h3 className="text-white font-semibold mb-2 text-sm">Best For</h3>
              <div className="flex flex-wrap gap-1">
                {plant.goals.map(g => (
                  <span key={g} className="text-xs px-2 py-1 rounded-full bg-primary-700/50 text-primary-200 border border-primary-600/30">
                    {g}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-2 text-sm">Works Well With</h3>
              <div className="flex flex-wrap gap-1">
                {plant.companionPlants.slice(0, 4).map(cp => {
                  const companion = PLANT_CATALOG.find(p => p.id === cp);
                  return (
                    <span key={cp} className="text-xs px-2 py-1 rounded-full bg-earth-700/50 text-earth-200 border border-earth-600/30">
                      {companion ? companion.name : cp}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Maintenance */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <h3 className="text-white font-semibold mb-2 text-sm">Maintenance</h3>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-primary-300 text-sm">Level:</span>
              <span className="text-white text-sm capitalize font-semibold">{plant.maintenanceLevel}</span>
            </div>
            <p className="text-primary-200 text-sm">{plant.pruningNeeds}</p>
          </div>

          {/* Cost estimate */}
          <div className="flex items-center gap-2 text-primary-200 text-sm">
            <span className="text-primary-400">Estimated cost:</span>
            <span className="text-white font-semibold">
              ${plant.estimatedCostRange[0]}–${plant.estimatedCostRange[1]} per plant
            </span>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              href="/app"
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-primary-600 to-green-600 text-white font-bold py-3 px-6 rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-200"
            >
              <Palette className="w-5 h-5" />
              Add to 3D Design
            </Link>
            <Link
              href="/#contact"
              className="flex-1 flex items-center justify-center gap-2 bg-white/10 border border-white/20 text-white font-semibold py-3 px-6 rounded-xl hover:bg-white/20 transition-all duration-200"
            >
              <ArrowRight className="w-5 h-5" />
              Request a Quote
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

interface PlantCardProps {
  plant: PlantCatalogEntry;
  previewYear: number;
  onClick: () => void;
}

function PlantCard({ plant, previewYear, onClick }: PlantCardProps) {
  const height = getHeightAtYear(plant, previewYear);
  const heightMax = getHeightAtYear(plant, 30);

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white/10 backdrop-blur-md rounded-xl border border-white/20 hover:bg-white/15 hover:scale-105 hover:shadow-xl transition-all duration-300 overflow-hidden group"
    >
      {/* Color band */}
      <div
        className="h-2 w-full"
        style={{ background: `linear-gradient(90deg, ${plant.color}, ${plant.color}88)` }}
      />

      {/* Card header */}
      <div className="p-4 pb-2">
        <div className="flex items-start justify-between gap-2">
          <div
            className="p-2 rounded-lg text-white flex-shrink-0"
            style={{ background: `${plant.color}44` }}
          >
            <PlantIcon type={plant.type} />
          </div>
          <div className="flex flex-wrap gap-1 justify-end">
            <TypeBadge type={plant.type} />
            {plant.nativeCalifornia && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary-600/40 text-primary-200">Native</span>
            )}
          </div>
        </div>
        <h3 className="text-white font-bold mt-2 group-hover:text-primary-300 transition-colors">{plant.name}</h3>
        <p className="text-primary-300 text-xs italic">{plant.scientific}</p>
      </div>

      {/* Quick why */}
      <p className="px-4 text-primary-200 text-xs leading-relaxed line-clamp-2">{plant.why}</p>

      {/* Stats row */}
      <div className="px-4 pb-2 mt-3 grid grid-cols-3 gap-2 text-xs">
        <div className="flex items-center gap-1 text-primary-300">
          <Droplets className="w-3 h-3" />
          <span className="capitalize">{plant.waterNeeds}</span>
        </div>
        <div className="flex items-center gap-1 text-primary-300">
          <Sun className="w-3 h-3" />
          <span className="truncate">{plant.sunlight[0].replace(" Sun", "").replace("Partial ", "Part.")}</span>
        </div>
        <div className="flex items-center gap-1 text-primary-300">
          <Clock className="w-3 h-3" />
          <span className="capitalize">{plant.growthRate}</span>
        </div>
      </div>

      {/* Growth bar */}
      <div className="px-4 pb-2">
        <div className="flex items-center justify-between text-xs text-primary-400 mb-1">
          <span>Year {previewYear}</span>
          <span>~{height.toFixed(0)} ft tall</span>
        </div>
        <GrowthBar value={height} max={heightMax || 1} />
      </div>

      {/* Goal tags */}
      <div className="px-4 pb-4 flex flex-wrap gap-1">
        {plant.goals.slice(0, 3).map(g => (
          <span key={g} className="text-xs px-1.5 py-0.5 rounded bg-white/10 text-primary-300">{g}</span>
        ))}
        {plant.goals.length > 3 && (
          <span className="text-xs px-1.5 py-0.5 rounded bg-white/10 text-primary-400">+{plant.goals.length - 3}</span>
        )}
      </div>
    </button>
  );
}

function FilterSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-white/10 pb-4 mb-4">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center justify-between w-full text-white font-semibold text-sm mb-2"
      >
        {title}
        {open ? <ChevronUp className="w-4 h-4 text-primary-400" /> : <ChevronDown className="w-4 h-4 text-primary-400" />}
      </button>
      {open && <div>{children}</div>}
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`text-xs px-3 py-1.5 rounded-full border transition-all duration-200 ${
        active
          ? "bg-primary-600 border-primary-500 text-white font-semibold"
          : "bg-white/5 border-white/20 text-primary-300 hover:bg-white/10 hover:text-white"
      }`}
    >
      {label}
    </button>
  );
}

export default function PlantsPage() {
  const [search, setSearch] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedWater, setSelectedWater] = useState<string[]>([]);
  const [selectedSun, setSelectedSun] = useState<string[]>([]);
  const [selectedSituations, setSelectedSituations] = useState<string[]>([]);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [nativeOnly, setNativeOnly] = useState(false);
  const [deerOnly, setDeerOnly] = useState(false);
  const [fireOnly, setFireOnly] = useState(false);
  const [previewYear, setPreviewYear] = useState(10);
  const [sortBy, setSortBy] = useState<"name" | "water" | "height" | "growth">("name");
  const [selectedPlant, setSelectedPlant] = useState<PlantCatalogEntry | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  function toggle<T>(arr: T[], val: T): T[] {
    return arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val];
  }

  const filtered = useMemo(() => {
    let result = PLANT_CATALOG.filter(p => {
      if (search) {
        const q = search.toLowerCase();
        if (
          !p.name.toLowerCase().includes(q) &&
          !p.scientific.toLowerCase().includes(q) &&
          !p.why.toLowerCase().includes(q) &&
          !p.goals.some(g => g.toLowerCase().includes(q)) &&
          !p.situations.some(s => s.toLowerCase().includes(q))
        ) return false;
      }
      if (selectedTypes.length && !selectedTypes.includes(p.type)) return false;
      if (selectedWater.length && !selectedWater.includes(p.waterNeeds)) return false;
      if (selectedSun.length && !selectedSun.some(s => p.sunlight.includes(s))) return false;
      if (selectedSituations.length && !selectedSituations.some(s => p.situations.includes(s))) return false;
      if (selectedGoals.length && !selectedGoals.some(g => p.goals.includes(g))) return false;
      if (nativeOnly && !p.nativeCalifornia) return false;
      if (deerOnly && !p.deerResistant) return false;
      if (fireOnly && !p.fireResistant) return false;
      return true;
    });

    result.sort((a, b) => {
      if (sortBy === "water") return WATER_MAP[a.waterNeeds] - WATER_MAP[b.waterNeeds];
      if (sortBy === "height") return b.matureHeight[1] - a.matureHeight[1];
      if (sortBy === "growth") {
        const order = { fast: 0, moderate: 1, slow: 2 };
        return order[a.growthRate] - order[b.growthRate];
      }
      return a.name.localeCompare(b.name);
    });

    return result;
  }, [search, selectedTypes, selectedWater, selectedSun, selectedSituations, selectedGoals, nativeOnly, deerOnly, fireOnly, sortBy]);

  const activeFilterCount =
    selectedTypes.length +
    selectedWater.length +
    selectedSun.length +
    selectedSituations.length +
    selectedGoals.length +
    (nativeOnly ? 1 : 0) +
    (deerOnly ? 1 : 0) +
    (fireOnly ? 1 : 0);

  function clearAll() {
    setSearch("");
    setSelectedTypes([]);
    setSelectedWater([]);
    setSelectedSun([]);
    setSelectedSituations([]);
    setSelectedGoals([]);
    setNativeOnly(false);
    setDeerOnly(false);
    setFireOnly(false);
  }

  const Sidebar = () => (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 space-y-0">
      {/* Preview year */}
      <div className="pb-4 mb-4 border-b border-white/10">
        <div className="flex items-center justify-between text-white font-semibold text-sm mb-2">
          <span>Growth Preview</span>
          <span className="text-primary-300">Year {previewYear}</span>
        </div>
        <input
          type="range"
          min={1}
          max={30}
          value={previewYear}
          onChange={e => setPreviewYear(Number(e.target.value))}
          className="w-full accent-primary-500"
        />
        <div className="flex justify-between text-primary-400 text-xs mt-1">
          <span>Planted</span>
          <span>30 Years</span>
        </div>
      </div>

      {/* Sort */}
      <div className="pb-4 mb-4 border-b border-white/10">
        <div className="text-white font-semibold text-sm mb-2">Sort By</div>
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value as typeof sortBy)}
          className="w-full bg-white/10 border border-white/20 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="name" className="bg-primary-900">Name (A-Z)</option>
          <option value="water" className="bg-primary-900">Water Needs (Low First)</option>
          <option value="height" className="bg-primary-900">Height (Tallest First)</option>
          <option value="growth" className="bg-primary-900">Growth Rate (Fastest First)</option>
        </select>
      </div>

      {/* Attributes */}
      <FilterSection title="Attributes">
        <div className="space-y-2">
          {[
            { label: "CA Native", state: nativeOnly, set: setNativeOnly, icon: <Leaf className="w-3 h-3" /> },
            { label: "Deer Resistant", state: deerOnly, set: setDeerOnly, icon: <Shield className="w-3 h-3" /> },
            { label: "Fire Resistant", state: fireOnly, set: setFireOnly, icon: <Flame className="w-3 h-3" /> },
          ].map(({ label, state, set, icon }) => (
            <button
              key={label}
              onClick={() => set(v => !v)}
              className={`flex items-center gap-2 w-full text-sm px-3 py-2 rounded-lg border transition-all ${
                state
                  ? "bg-primary-600/30 border-primary-500 text-white font-semibold"
                  : "bg-white/5 border-white/10 text-primary-300 hover:bg-white/10"
              }`}
            >
              <span className="text-primary-400">{icon}</span>
              {label}
              {state && <X className="w-3 h-3 ml-auto" />}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Plant type */}
      <FilterSection title="Plant Type">
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(TYPE_LABELS).map(([type, label]) => (
            <FilterChip
              key={type}
              label={label}
              active={selectedTypes.includes(type)}
              onClick={() => setSelectedTypes(t => toggle(t, type))}
            />
          ))}
        </div>
      </FilterSection>

      {/* Water needs */}
      <FilterSection title="Water Needs">
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(WATER_LABELS).map(([val, label]) => (
            <FilterChip
              key={val}
              label={label}
              active={selectedWater.includes(val)}
              onClick={() => setSelectedWater(w => toggle(w, val))}
            />
          ))}
        </div>
      </FilterSection>

      {/* Sun */}
      <FilterSection title="Sun Exposure">
        <div className="flex flex-wrap gap-1.5">
          {SUN_LABELS.map(s => (
            <FilterChip
              key={s}
              label={s}
              active={selectedSun.includes(s)}
              onClick={() => setSelectedSun(sn => toggle(sn, s))}
            />
          ))}
        </div>
      </FilterSection>

      {/* Situations */}
      <FilterSection title="Site Situations" defaultOpen={false}>
        <div className="flex flex-wrap gap-1.5">
          {ALL_SITUATIONS.slice(0, 12).map(s => (
            <FilterChip
              key={s}
              label={s}
              active={selectedSituations.includes(s)}
              onClick={() => setSelectedSituations(sit => toggle(sit, s))}
            />
          ))}
        </div>
      </FilterSection>

      {/* Goals */}
      <FilterSection title="Goals" defaultOpen={false}>
        <div className="flex flex-wrap gap-1.5">
          {ALL_GOALS.slice(0, 14).map(g => (
            <FilterChip
              key={g}
              label={g}
              active={selectedGoals.includes(g)}
              onClick={() => setSelectedGoals(gl => toggle(gl, g))}
            />
          ))}
        </div>
      </FilterSection>

      {activeFilterCount > 0 && (
        <button
          onClick={clearAll}
          className="w-full mt-2 flex items-center justify-center gap-2 text-sm text-primary-300 hover:text-white border border-white/10 hover:border-white/30 rounded-lg py-2 transition-all"
        >
          <X className="w-4 h-4" />
          Clear all filters ({activeFilterCount})
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-900 via-primary-800 to-earth-900">
      {/* Hero */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <Leaf className="absolute top-12 left-8 w-16 h-16 text-primary-300 animate-pulse" />
          <TreePine className="absolute top-20 right-16 w-20 h-20 text-primary-300" style={{ animationDelay: "1s" }} />
          <Sprout className="absolute bottom-10 left-1/3 w-12 h-12 text-primary-300" />
        </div>
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <div className="inline-block p-3 bg-primary-600/20 rounded-full mb-6 backdrop-blur-sm">
            <Leaf className="w-12 h-12 text-primary-300" />
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold text-white mb-4 drop-shadow-2xl">
            Plant Library
          </h1>
          <p className="text-xl text-primary-100 mb-2 font-light">
            Northern California Landscape Plant Guide
          </p>
          <p className="text-primary-200 max-w-2xl mx-auto mb-8 leading-relaxed">
            Browse {PLANT_CATALOG.length} carefully selected plants for our region — filter by water use, sun, goals, and more. Click any plant to explore seasonal details and 30-year growth projections.
          </p>

          {/* Search */}
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, goal, or situation…"
              className="w-full pl-12 pr-10 py-4 bg-white/10 border border-white/30 rounded-xl text-white placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-400 backdrop-blur-md text-lg"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-primary-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Main content */}
      <section className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-7xl mx-auto">

          {/* Mobile filter toggle */}
          <div className="lg:hidden mb-4 flex items-center gap-3">
            <button
              onClick={() => setShowFilters(v => !v)}
              className="flex items-center gap-2 bg-white/10 border border-white/20 text-white px-4 py-2 rounded-xl hover:bg-white/15 transition-all"
            >
              <Filter className="w-4 h-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="bg-primary-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>
            <span className="text-primary-300 text-sm">
              {filtered.length} of {PLANT_CATALOG.length} plants
            </span>
          </div>

          {showFilters && (
            <div className="lg:hidden mb-6">
              <Sidebar />
            </div>
          )}

          <div className="flex gap-8">
            {/* Desktop sidebar */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-24">
                <div className="text-primary-300 text-sm mb-3">
                  Showing <span className="text-white font-semibold">{filtered.length}</span> of {PLANT_CATALOG.length} plants
                </div>
                <Sidebar />
              </div>
            </aside>

            {/* Plant grid */}
            <main className="flex-1 min-w-0">
              {filtered.length === 0 ? (
                <div className="text-center py-20">
                  <Leaf className="w-16 h-16 text-primary-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">No plants match your filters</h3>
                  <p className="text-primary-300 mb-6">Try broadening your search or clearing some filters.</p>
                  <button
                    onClick={clearAll}
                    className="bg-primary-600 text-white px-6 py-3 rounded-xl hover:bg-primary-700 transition-colors"
                  >
                    Clear All Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filtered.map(plant => (
                    <PlantCard
                      key={plant.id}
                      plant={plant}
                      previewYear={previewYear}
                      onClick={() => setSelectedPlant(plant)}
                    />
                  ))}
                </div>
              )}

              {/* CTA at bottom */}
              <div className="mt-12 bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
                <Palette className="w-12 h-12 text-primary-300 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-3">Ready to design your landscape?</h3>
                <p className="text-primary-200 mb-6 max-w-lg mx-auto">
                  Use our free 3D design tool to place these plants on your property and see 30-year growth simulations in real time.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link
                    href="/app"
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-primary-600 to-green-600 text-white font-bold py-3 px-8 rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-200"
                  >
                    <Palette className="w-5 h-5" />
                    Open 3D Design Tool
                  </Link>
                  <Link
                    href="/#contact"
                    className="flex items-center justify-center gap-2 bg-white/10 border border-white/20 text-white font-semibold py-3 px-8 rounded-xl hover:bg-white/20 transition-all duration-200"
                  >
                    <ArrowRight className="w-5 h-5" />
                    Get Expert Advice
                  </Link>
                </div>
              </div>
            </main>
          </div>
        </div>
      </section>

      {/* Detail modal */}
      {selectedPlant && (
        <DetailModal
          plant={selectedPlant}
          previewYear={previewYear}
          onClose={() => setSelectedPlant(null)}
        />
      )}
    </div>
  );
}
