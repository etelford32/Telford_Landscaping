/**
 * EnhancedPrecisionEdit - Draggable, resizable, minimal precision editing panel
 * Wraps PrecisionEditPanel with DraggablePanel for maximum utility
 */

"use client";

import { Ruler } from 'lucide-react';
import DraggablePanel from './DraggablePanel';
import PrecisionEditPanel, { PrecisionEditData } from './PrecisionEditPanel';

interface EnhancedPrecisionEditProps {
  data: PrecisionEditData;
  onChange: (data: PrecisionEditData) => void;
  onClose?: () => void;
  snapToGrid?: boolean;
  onToggleSnap?: () => void;
  gridSize?: number;
  unit?: 'feet' | 'inches' | 'meters';
  visible?: boolean;
}

export default function EnhancedPrecisionEdit({
  data,
  onChange,
  onClose,
  snapToGrid = false,
  onToggleSnap,
  gridSize = 1,
  unit = 'feet',
  visible = true,
}: EnhancedPrecisionEditProps) {
  if (!visible) return null;

  return (
    <DraggablePanel
      title="Precision Edit"
      icon={<Ruler className="w-4 h-4" />}
      defaultPosition={{ x: window.innerWidth - 420, y: 100 }}
      defaultSize={{ width: 380, height: 600 }}
      minSize={{ width: 320, height: 400 }}
      maxSize={{ width: 500, height: 900 }}
      resizable={true}
      minimizable={true}
      maximizable={true}
      closable={true}
      onClose={onClose}
      headerColor="from-purple-600 to-purple-700"
      zIndex={35}
      id="precision-edit-panel"
    >
      {/* Remove the redundant header and wrap content */}
      <div className="flex-1 overflow-y-auto">
        <PrecisionEditPanel
          data={data}
          onChange={onChange}
          onClose={onClose}
          snapToGrid={snapToGrid}
          onToggleSnap={onToggleSnap}
          gridSize={gridSize}
          unit={unit}
        />
      </div>
    </DraggablePanel>
  );
}
