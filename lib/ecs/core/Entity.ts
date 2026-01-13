/**
 * Entity - Pure identifier with type discrimination
 *
 * Entities are just IDs. All data lives in Components.
 * This ensures deterministic behavior and easy serialization.
 */

export type EntityType =
  | 'plant'
  | 'structure'
  | 'ground'
  | 'house'
  | 'decoration'
  | 'terrain';

export interface Entity {
  readonly id: string;
  readonly type: EntityType;
}

/**
 * Create a new entity with deterministic ID generation
 */
export function createEntity(type: EntityType, id?: string): Entity {
  return {
    id: id || `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type
  };
}

/**
 * Entity equality check (by ID)
 */
export function entitiesEqual(a: Entity, b: Entity): boolean {
  return a.id === b.id;
}
