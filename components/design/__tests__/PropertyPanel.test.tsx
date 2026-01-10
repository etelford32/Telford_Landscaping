import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PropertyPanel from '../PropertyPanel';
import { PlacedPlant } from '@/lib/plantData';
import { PlacedStructure } from '@/lib/structureData';

describe('PropertyPanel', () => {
  const mockPlant: PlacedPlant = {
    id: 'plant-1',
    speciesId: 'quercus-agrifolia',
    position: { x: 5, y: 0, z: 10 },
    rotation: Math.PI / 2,
    scale: 1.5,
    age: 10,
    variant: 0,
    selected: true,
  };

  const mockStructure: PlacedStructure = {
    id: 'structure-1',
    structureId: 'flagstone-patio',
    position: { x: 10, y: 0, z: 15 },
    rotation: Math.PI / 4,
    scale: 2,
    selected: true,
  };

  describe('Plant Properties', () => {
    it('should render plant properties panel', () => {
      const onPlantUpdate = vi.fn();
      render(
        <PropertyPanel
          selectedPlant={mockPlant}
          onPlantUpdate={onPlantUpdate}
        />
      );

      expect(screen.getByText('Plant Properties')).toBeInTheDocument();
      expect(screen.getByText('Coast Live Oak')).toBeInTheDocument();
    });

    it('should display plant age', () => {
      const onPlantUpdate = vi.fn();
      render(
        <PropertyPanel
          selectedPlant={mockPlant}
          onPlantUpdate={onPlantUpdate}
        />
      );

      expect(screen.getByText(/Plant Age: 10 years/)).toBeInTheDocument();
    });

    it('should update age when slider changes', () => {
      const onPlantUpdate = vi.fn();
      const { container } = render(
        <PropertyPanel
          selectedPlant={mockPlant}
          onPlantUpdate={onPlantUpdate}
        />
      );

      // Find the age slider by its min/max/value attributes
      const ageSlider = container.querySelector('input[type="range"][min="1"][max="30"]') as HTMLInputElement;
      expect(ageSlider).toBeTruthy();

      fireEvent.change(ageSlider, { target: { value: '15' } });

      expect(onPlantUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ age: 15 })
      );
    });

    it('should display scale as percentage', () => {
      const onPlantUpdate = vi.fn();
      render(
        <PropertyPanel
          selectedPlant={mockPlant}
          onPlantUpdate={onPlantUpdate}
        />
      );

      expect(screen.getByText(/Scale: 150%/)).toBeInTheDocument();
    });

    it('should update scale when slider changes', () => {
      const onPlantUpdate = vi.fn();
      const { container } = render(
        <PropertyPanel
          selectedPlant={mockPlant}
          onPlantUpdate={onPlantUpdate}
        />
      );

      // Find the scale slider by its min/max/step attributes
      const sliders = container.querySelectorAll('input[type="range"][min="0.5"][max="2"]');
      const scaleSlider = sliders[0] as HTMLInputElement;
      expect(scaleSlider).toBeTruthy();

      fireEvent.change(scaleSlider, { target: { value: '1.0' } });

      expect(onPlantUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ scale: 1.0 })
      );
    });

    it('should display rotation in degrees', () => {
      const onPlantUpdate = vi.fn();
      render(
        <PropertyPanel
          selectedPlant={mockPlant}
          onPlantUpdate={onPlantUpdate}
        />
      );

      // Math.PI / 2 = 90 degrees
      expect(screen.getByText(/Rotation: 90°/)).toBeInTheDocument();
    });

    it('should update rotation when slider changes', () => {
      const onPlantUpdate = vi.fn();
      const { container } = render(
        <PropertyPanel
          selectedPlant={mockPlant}
          onPlantUpdate={onPlantUpdate}
        />
      );

      // Find the rotation slider by its min/max attributes
      const rotationSlider = container.querySelector('input[type="range"][min="0"][step="0.1"]') as HTMLInputElement;
      expect(rotationSlider).toBeTruthy();

      fireEvent.change(rotationSlider, { target: { value: String(Math.PI) } });

      expect(onPlantUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ rotation: Math.PI })
      );
    });

    it('should display position coordinates', () => {
      const onPlantUpdate = vi.fn();
      const { container } = render(
        <PropertyPanel
          selectedPlant={mockPlant}
          onPlantUpdate={onPlantUpdate}
        />
      );

      const positionInputs = container.querySelectorAll('input[type="number"]');
      expect(positionInputs.length).toBeGreaterThanOrEqual(2);

      const xInput = positionInputs[0] as HTMLInputElement;
      const zInput = positionInputs[1] as HTMLInputElement;

      expect(xInput.value).toBe('5.0');
      expect(zInput.value).toBe('10.0');
    });

    it('should update position when inputs change', () => {
      const onPlantUpdate = vi.fn();
      const { container } = render(
        <PropertyPanel
          selectedPlant={mockPlant}
          onPlantUpdate={onPlantUpdate}
        />
      );

      const positionInputs = container.querySelectorAll('input[type="number"]');
      const xInput = positionInputs[0] as HTMLInputElement;

      fireEvent.change(xInput, { target: { value: '20' } });

      expect(onPlantUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          position: expect.objectContaining({ x: 20 }),
        })
      );
    });

    it('should display care requirements', () => {
      const onPlantUpdate = vi.fn();
      render(
        <PropertyPanel
          selectedPlant={mockPlant}
          onPlantUpdate={onPlantUpdate}
        />
      );

      expect(screen.getByText('Care Requirements')).toBeInTheDocument();
      expect(screen.getByText('Water:')).toBeInTheDocument();
      expect(screen.getByText('Sun:')).toBeInTheDocument();
      expect(screen.getByText('Growth Rate:')).toBeInTheDocument();
    });

    it('should call onClose when close button is clicked', () => {
      const onClose = vi.fn();
      render(
        <PropertyPanel
          selectedPlant={mockPlant}
          onPlantUpdate={vi.fn()}
          onClose={onClose}
        />
      );

      const closeButton = screen.getAllByRole('button').find((btn) => {
        return btn.querySelector('svg') !== null;
      });

      if (closeButton) {
        fireEvent.click(closeButton);
        expect(onClose).toHaveBeenCalled();
      }
    });
  });

  describe('Structure Properties', () => {
    it('should render structure properties panel', () => {
      const onStructureUpdate = vi.fn();
      render(
        <PropertyPanel
          selectedStructure={mockStructure}
          onStructureUpdate={onStructureUpdate}
        />
      );

      expect(screen.getByText('Structure Properties')).toBeInTheDocument();
      expect(screen.getByText('Flagstone Patio')).toBeInTheDocument();
    });

    it('should display structure scale', () => {
      const onStructureUpdate = vi.fn();
      render(
        <PropertyPanel
          selectedStructure={mockStructure}
          onStructureUpdate={onStructureUpdate}
        />
      );

      expect(screen.getByText(/Scale: 200%/)).toBeInTheDocument();
    });

    it('should update structure scale when slider changes', () => {
      const onStructureUpdate = vi.fn();
      const { container } = render(
        <PropertyPanel
          selectedStructure={mockStructure}
          onStructureUpdate={onStructureUpdate}
        />
      );

      // Find the scale slider
      const scaleSlider = container.querySelector('input[type="range"][min="0.5"][max="2"]') as HTMLInputElement;
      expect(scaleSlider).toBeTruthy();

      fireEvent.change(scaleSlider, { target: { value: '1.0' } });

      expect(onStructureUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ scale: 1.0 })
      );
    });

    it('should display structure dimensions', () => {
      const onStructureUpdate = vi.fn();
      render(
        <PropertyPanel
          selectedStructure={mockStructure}
          onStructureUpdate={onStructureUpdate}
        />
      );

      expect(screen.getByText('Dimensions')).toBeInTheDocument();
      expect(screen.getByText('Width:')).toBeInTheDocument();
      expect(screen.getByText('Depth:')).toBeInTheDocument();
      expect(screen.getByText('Height:')).toBeInTheDocument();
    });
  });

  describe('No Selection', () => {
    it('should return null when nothing is selected', () => {
      const { container } = render(<PropertyPanel />);
      expect(container.firstChild).toBeNull();
    });
  });
});
