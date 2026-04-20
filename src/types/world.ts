import type { Particle, WorldBounds } from "./simulation";
import type { Force } from "./force";
import type { Constraint } from "./constraint";
import type { Integrator } from "./integrator";

export interface PointerState {
  x: number;
  y: number;
  active: boolean;
  buttons: number;
}

export interface TiltState {
  x: number; // -1..1 (gamma normalizado: inclinação lateral)
  y: number; // -1..1 (beta normalizado: inclinação frente/trás)
  active: boolean;
}

export interface Shockwave {
  x: number;
  y: number;
  bornAt: number; // world.elapsed when spawned
  strength: number;
  speed: number; // radius expansion speed (px/s)
  life: number; // seconds
}

export interface World {
  particles: Particle[];
  forces: Force[];
  constraints: Constraint[];
  integrator: Integrator;
  bounds: WorldBounds;
  elapsed: number;
  pointer: PointerState;
  tilt: TiltState;
  shockwaves: Shockwave[];
}
