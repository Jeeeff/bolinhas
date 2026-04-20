export interface Vector2 {
  x: number;
  y: number;
}

export interface Particle {
  id: number;
  position: Vector2;
  previousPosition: Vector2;
  velocity: Vector2;
  acceleration: Vector2;
  mass: number;
  radius: number;
}

export interface WorldBounds {
  width: number;
  height: number;
}

export const DEFAULT_PARTICLE_RADIUS = 1.6;
export const DEFAULT_PARTICLE_MASS = 1;
export const DEFAULT_PARTICLE_COUNT = 1000;
export const MAX_PARTICLE_COUNT = 3000;
export const MIN_PARTICLE_COUNT = 100;
export const MAX_DELTA_TIME = 0.05;
