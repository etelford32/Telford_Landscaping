/**
 * CameraController - Camera management with smooth transitions
 * Handles preset views and smooth camera animations
 */

"use client";

import { useEffect, useState } from 'react';
import { useCameraTransition } from '@/lib/hooks/useCameraTransition';
import { CameraPreset, CAMERA_PRESETS } from './CameraPresets';

interface CameraControllerProps {
  preset: CameraPreset;
  enabled: boolean;
}

export default function CameraController({ preset, enabled }: CameraControllerProps) {
  const [targetPosition, setTargetPosition] = useState<[number, number, number] | null>(null);
  const [targetLookAt, setTargetLookAt] = useState<[number, number, number] | null>(null);

  useEffect(() => {
    if (enabled && preset) {
      const presetConfig = CAMERA_PRESETS[preset];
      setTargetPosition(presetConfig.position);
      setTargetLookAt(presetConfig.target);
    }
  }, [preset, enabled]);

  useCameraTransition(targetPosition, targetLookAt, {
    duration: 0.8,
  });

  return null; // This component only handles camera logic
}
