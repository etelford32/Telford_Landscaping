/**
 * ModeAwareElement - Wrapper for mode-aware UI elements
 * Dims and disables elements that aren't relevant to the current mode
 */

"use client";

import { useState, useEffect, ReactNode } from 'react';
import { modeManager, AppMode } from '@/lib/ui/ModeManager';

interface ModeAwareElementProps {
  children: ReactNode;
  relevantModes: AppMode[];
  dimAmount?: number; // 0-1, default 0.3 (70% dim)
  disableWhenIrrelevant?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export default function ModeAwareElement({
  children,
  relevantModes,
  dimAmount = 0.3,
  disableWhenIrrelevant = true,
  className = '',
  style = {},
}: ModeAwareElementProps) {
  const [currentMode, setCurrentMode] = useState<AppMode>(modeManager.getCurrentMode());
  const [isRelevant, setIsRelevant] = useState(true);

  useEffect(() => {
    const checkRelevance = (mode: AppMode) => {
      setCurrentMode(mode);
      setIsRelevant(relevantModes.includes(mode));
    };

    const unsubscribe = modeManager.subscribe(checkRelevance);
    return () => {
      unsubscribe();
    };
  }, [relevantModes]);

  const elementStyle: React.CSSProperties = {
    ...style,
    opacity: !isRelevant ? dimAmount : 1,
    pointerEvents: !isRelevant && disableWhenIrrelevant ? 'none' : 'auto',
    transition: 'opacity 0.3s ease-in-out, filter 0.3s ease-in-out',
    filter: !isRelevant ? 'grayscale(0.5)' : 'none',
  };

  return (
    <div className={className} style={elementStyle}>
      {children}
    </div>
  );
}
