import type { Force } from "@/types/force";
import { createGravity } from "./gravity";
import { createWind } from "./wind";
import { createDrag } from "./drag";
import { createMouseAttractor } from "./mouseAttractor";
import { createVortex } from "./vortex";
import { createTurbulence } from "./turbulence";
import { createOrbitalPull } from "./orbitalPull";
import { createShockwave } from "./shockwave";

export function createDefaultForces(): Force[] {
  return [
    createGravity(),
    createWind(),
    createDrag(),
    createMouseAttractor(),
    createVortex(),
    createTurbulence(),
    createOrbitalPull(),
    createShockwave(),
  ];
}

export {
  createGravity,
  createWind,
  createDrag,
  createMouseAttractor,
  createVortex,
  createTurbulence,
  createOrbitalPull,
  createShockwave,
};
