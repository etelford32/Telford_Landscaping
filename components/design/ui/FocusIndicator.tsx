/**
 * FocusIndicator - Visual focus ring component
 * Wraps focusable elements to show prominent focus indicators
 */

"use client";

import { ReactNode, useRef, useEffect, useState } from 'react';
import { focusManager } from '@/lib/ui/FocusManager';

interface FocusIndicatorProps {
  children: ReactNode;
  zoneId?: string;
  className?: string;
  focusClassName?: string;
  disabled?: boolean;
  ariaLabel?: string;
}

export default function FocusIndicator({
  children,
  zoneId,
  className = '',
  focusClassName = 'ring-2 ring-primary-600 ring-offset-2',
  disabled = false,
  ariaLabel,
}: FocusIndicatorProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || disabled || !zoneId) return;

    // Make element focusable
    if (!element.hasAttribute('tabindex')) {
      element.setAttribute('tabindex', '0');
    }

    // Register with focus manager
    focusManager.registerElement(zoneId, element as any);

    // Focus event listeners
    const handleFocus = () => setIsFocused(true);
    const handleBlur = () => setIsFocused(false);

    element.addEventListener('focus', handleFocus);
    element.addEventListener('blur', handleBlur);

    return () => {
      focusManager.unregisterElement(zoneId, element as any);
      element.removeEventListener('focus', handleFocus);
      element.removeEventListener('blur', handleBlur);
    };
  }, [zoneId, disabled]);

  return (
    <div
      ref={elementRef}
      className={`outline-none transition-all ${className} ${
        isFocused ? focusClassName : ''
      }`}
      aria-label={ariaLabel}
      role={ariaLabel ? 'button' : undefined}
    >
      {children}
    </div>
  );
}
