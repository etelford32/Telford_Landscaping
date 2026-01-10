import { PlacedPlant } from "../plantData";
import { PlacedStructure } from "../structureData";

export interface DesignSaveData {
  version: string;
  timestamp: number;
  name: string;
  plants: PlacedPlant[];
  structures: PlacedStructure[];
  age: number;
}

export function saveDesign(
  name: string,
  plants: PlacedPlant[],
  structures: PlacedStructure[],
  age: number
): void {
  const saveData: DesignSaveData = {
    version: "1.0.0",
    timestamp: Date.now(),
    name,
    plants,
    structures,
    age,
  };

  const json = JSON.stringify(saveData, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `${name.replace(/[^a-z0-9]/gi, "_")}_${Date.now()}.landscape.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function loadDesign(file: File): Promise<DesignSaveData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const data: DesignSaveData = JSON.parse(text);

        // Validate data structure
        if (!data.version || !data.plants || !data.structures) {
          throw new Error("Invalid save file format");
        }

        resolve(data);
      } catch (error) {
        reject(new Error("Failed to parse save file: " + (error as Error).message));
      }
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsText(file);
  });
}

export function saveToLocalStorage(
  key: string,
  plants: PlacedPlant[],
  structures: PlacedStructure[],
  age: number
): void {
  const saveData: DesignSaveData = {
    version: "1.0.0",
    timestamp: Date.now(),
    name: "autosave",
    plants,
    structures,
    age,
  };

  try {
    localStorage.setItem(key, JSON.stringify(saveData));
  } catch (error) {
    console.error("Failed to save to localStorage:", error);
  }
}

export function loadFromLocalStorage(key: string): DesignSaveData | null {
  try {
    const data = localStorage.getItem(key);
    if (!data) return null;

    const saveData: DesignSaveData = JSON.parse(data);

    // Validate data structure
    if (!saveData.version || !saveData.plants || !saveData.structures) {
      console.error("Invalid save file format in localStorage");
      return null;
    }

    return saveData;
  } catch (error) {
    console.error("Failed to load from localStorage:", error);
    return null;
  }
}

export function clearLocalStorage(key: string): void {
  localStorage.removeItem(key);
}
