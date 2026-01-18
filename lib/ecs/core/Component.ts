/**
 * Component - Pure data containers
 *
 * Components are JUST DATA. No methods, no logic.
 * All components must be serializable (no functions, no classes with methods).
 */

/**
 * Component type registry - add new component types here
 */
export type ComponentType =
  | 'Transform'
  | 'Geometry'
  | 'Material'
  | 'Selection'
  | 'PlantData'
  | 'StructureData'
  | 'Growth'
  | 'Metadata'
  | 'Asset';

/**
 * Base interface for all components
 */
export interface Component {
  readonly type: ComponentType;
}

/**
 * Component storage - maps component types to component data
 */
export type ComponentMap = Map<ComponentType, Component>;

/**
 * Type guard to check if an object is a valid component
 */
export function isComponent(obj: any): obj is Component {
  return obj && typeof obj === 'object' && 'type' in obj;
}

/**
 * Deep clone a component (for immutability)
 */
export function cloneComponent<T extends Component>(component: T): T {
  return JSON.parse(JSON.stringify(component));
}
