import type { Particle } from "./simulation";

export type IntegratorId = "euler" | "verlet" | "rk4";

export interface Integrator {
  id: IntegratorId;
  step(particle: Particle, dt: number): void;
}
