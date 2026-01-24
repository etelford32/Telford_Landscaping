/**
 * FocusManager - Centralized keyboard navigation and focus management
 * Handles focus trapping, tab order, and keyboard-only navigation
 */

export type FocusableElement = HTMLElement & {
  focus: () => void;
  blur: () => void;
};

export interface FocusZone {
  id: string;
  name: string;
  priority: number;
  elements: FocusableElement[];
  isActive: boolean;
  trapFocus?: boolean; // For modals/dialogs
}

export class FocusManager {
  private zones: Map<string, FocusZone> = new Map();
  private activeZoneId: string | null = null;
  private currentFocusIndex = 0;
  private listeners: Set<(zoneId: string | null) => void> = new Set();
  private isKeyboardMode = false;

  constructor() {
    this.setupGlobalListeners();
  }

  private setupGlobalListeners() {
    // Detect keyboard usage
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        this.isKeyboardMode = true;
        document.body.classList.add('keyboard-navigation');
      }
    });

    // Detect mouse usage
    window.addEventListener('mousedown', () => {
      this.isKeyboardMode = false;
      document.body.classList.remove('keyboard-navigation');
    });

    // Global Tab handling
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        const activeZone = this.getActiveZone();
        if (activeZone?.trapFocus) {
          e.preventDefault();
          this.handleTabInZone(activeZone, e.shiftKey);
        }
      }
    });
  }

  subscribe(listener: (zoneId: string | null) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((listener) => listener(this.activeZoneId));
  }

  registerZone(zone: Omit<FocusZone, 'elements'>) {
    this.zones.set(zone.id, { ...zone, elements: [] });
  }

  unregisterZone(zoneId: string) {
    this.zones.delete(zoneId);
    if (this.activeZoneId === zoneId) {
      this.activeZoneId = null;
      this.notify();
    }
  }

  setActiveZone(zoneId: string | null) {
    this.activeZoneId = zoneId;
    this.currentFocusIndex = 0;
    this.notify();
  }

  getActiveZone(): FocusZone | null {
    if (!this.activeZoneId) return null;
    return this.zones.get(this.activeZoneId) || null;
  }

  registerElement(zoneId: string, element: FocusableElement) {
    const zone = this.zones.get(zoneId);
    if (zone && !zone.elements.includes(element)) {
      zone.elements.push(element);
    }
  }

  unregisterElement(zoneId: string, element: FocusableElement) {
    const zone = this.zones.get(zoneId);
    if (zone) {
      zone.elements = zone.elements.filter((el) => el !== element);
    }
  }

  getFocusableElements(zoneId: string): FocusableElement[] {
    const zone = this.zones.get(zoneId);
    return zone?.elements || [];
  }

  focusFirst(zoneId?: string) {
    const targetZone = zoneId || this.activeZoneId;
    if (!targetZone) return;

    const zone = this.zones.get(targetZone);
    if (zone && zone.elements.length > 0) {
      this.currentFocusIndex = 0;
      zone.elements[0].focus();
    }
  }

  focusLast(zoneId?: string) {
    const targetZone = zoneId || this.activeZoneId;
    if (!targetZone) return;

    const zone = this.zones.get(targetZone);
    if (zone && zone.elements.length > 0) {
      this.currentFocusIndex = zone.elements.length - 1;
      zone.elements[this.currentFocusIndex].focus();
    }
  }

  focusNext(zoneId?: string) {
    const targetZone = zoneId || this.activeZoneId;
    if (!targetZone) return;

    const zone = this.zones.get(targetZone);
    if (!zone || zone.elements.length === 0) return;

    this.currentFocusIndex = (this.currentFocusIndex + 1) % zone.elements.length;
    zone.elements[this.currentFocusIndex].focus();
  }

  focusPrevious(zoneId?: string) {
    const targetZone = zoneId || this.activeZoneId;
    if (!targetZone) return;

    const zone = this.zones.get(targetZone);
    if (!zone || zone.elements.length === 0) return;

    this.currentFocusIndex =
      (this.currentFocusIndex - 1 + zone.elements.length) % zone.elements.length;
    zone.elements[this.currentFocusIndex].focus();
  }

  private handleTabInZone(zone: FocusZone, shiftKey: boolean) {
    if (zone.elements.length === 0) return;

    if (shiftKey) {
      this.focusPrevious(zone.id);
    } else {
      this.focusNext(zone.id);
    }
  }

  trapFocus(zoneId: string, enable: boolean) {
    const zone = this.zones.get(zoneId);
    if (zone) {
      zone.trapFocus = enable;
      if (enable) {
        this.setActiveZone(zoneId);
        this.focusFirst(zoneId);
      }
    }
  }

  isKeyboardNavigating(): boolean {
    return this.isKeyboardMode;
  }

  getAllZones(): FocusZone[] {
    return Array.from(this.zones.values()).sort((a, b) => b.priority - a.priority);
  }

  getZoneById(id: string): FocusZone | null {
    return this.zones.get(id) || null;
  }
}

// Singleton instance
export const focusManager = new FocusManager();
