import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { saveDesign, loadDesign, saveToLocalStorage, loadFromLocalStorage } from '../saveLoad';
import { PlacedPlant } from '@/lib/plantData';
import { PlacedStructure } from '@/lib/structureData';

describe('saveDesign', () => {
  let createElementSpy: any;
  let clickSpy: any;

  beforeEach(() => {
    createElementSpy = vi.spyOn(document, 'createElement');
    clickSpy = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create a download link with correct data', () => {
    const plants: PlacedPlant[] = [
      {
        id: 'plant-1',
        speciesId: 'quercus-agrifolia',
        position: { x: 0, y: 0, z: 0 },
        rotation: 0,
        scale: 1,
        age: 5,
        variant: 0,
        selected: false,
      },
    ];

    const structures: PlacedStructure[] = [
      {
        id: 'structure-1',
        structureId: 'flagstone-patio',
        position: { x: 5, y: 0, z: 5 },
        rotation: 0,
        scale: 1,
        selected: false,
      },
    ];

    const mockAnchor = {
      href: '',
      download: '',
      click: clickSpy,
      style: {},
    };

    createElementSpy.mockReturnValue(mockAnchor);

    saveDesign('Test Design', plants, structures, 10);

    expect(createElementSpy).toHaveBeenCalledWith('a');
    expect(mockAnchor.download).toMatch(/Test_Design_\d+\.landscape\.json/);
    expect(clickSpy).toHaveBeenCalled();
  });
});

describe('loadDesign', () => {
  it('should load and parse a valid design file', async () => {
    const designData = {
      version: '1.0',
      timestamp: Date.now(),
      name: 'Test Design',
      plants: [],
      structures: [],
      age: 5,
    };

    const blob = new Blob([JSON.stringify(designData)], { type: 'application/json' });
    const file = new File([blob], 'test.landscape.json', { type: 'application/json' });

    const result = await loadDesign(file);

    expect(result.name).toBe('Test Design');
    expect(result.age).toBe(5);
    expect(result.plants).toEqual([]);
    expect(result.structures).toEqual([]);
  });

  it('should throw error for invalid JSON', async () => {
    const blob = new Blob(['invalid json'], { type: 'application/json' });
    const file = new File([blob], 'test.landscape.json', { type: 'application/json' });

    await expect(loadDesign(file)).rejects.toThrow();
  });

  it('should throw error for missing required fields', async () => {
    const designData = {
      version: '1.0',
      // missing plants, structures, etc.
    };

    const blob = new Blob([JSON.stringify(designData)], { type: 'application/json' });
    const file = new File([blob], 'test.landscape.json', { type: 'application/json' });

    await expect(loadDesign(file)).rejects.toThrow('Failed to parse save file');
  });
});

describe('saveToLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should save design to localStorage', () => {
    const plants: PlacedPlant[] = [
      {
        id: 'plant-1',
        speciesId: 'quercus-agrifolia',
        position: { x: 0, y: 0, z: 0 },
        rotation: 0,
        scale: 1,
        age: 5,
        variant: 0,
        selected: false,
      },
    ];

    const structures: PlacedStructure[] = [];

    saveToLocalStorage('test-key', plants, structures, 10);

    const stored = localStorage.getItem('test-key');
    expect(stored).toBeTruthy();

    const parsed = JSON.parse(stored!);
    expect(parsed.plants).toHaveLength(1);
    expect(parsed.age).toBe(10);
  });

  it('should handle localStorage errors gracefully', () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
    setItemSpy.mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });

    // Should not throw
    expect(() => {
      saveToLocalStorage('test-key', [], [], 5);
    }).not.toThrow();

    setItemSpy.mockRestore();
  });
});

describe('loadFromLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should load design from localStorage', () => {
    const designData = {
      version: '1.0',
      timestamp: Date.now(),
      name: 'Autosave',
      plants: [],
      structures: [],
      age: 5,
    };

    localStorage.setItem('test-key', JSON.stringify(designData));

    const result = loadFromLocalStorage('test-key');

    expect(result).toBeTruthy();
    expect(result?.age).toBe(5);
  });

  it('should return null if key does not exist', () => {
    const result = loadFromLocalStorage('non-existent-key');
    expect(result).toBeNull();
  });

  it('should return null for invalid JSON', () => {
    localStorage.setItem('test-key', 'invalid json');

    const result = loadFromLocalStorage('test-key');
    expect(result).toBeNull();
  });

  it('should return null for invalid design format', () => {
    localStorage.setItem('test-key', JSON.stringify({ invalid: 'data' }));

    const result = loadFromLocalStorage('test-key');
    expect(result).toBeNull();
  });
});
