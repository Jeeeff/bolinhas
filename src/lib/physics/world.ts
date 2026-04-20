import type { World } from "@/types/world";
import type { Force } from "@/types/force";
import type { Constraint } from "@/types/constraint";
import type { Integrator } from "@/types/integrator";
import type { Particle, WorldBounds } from "@/types/simulation";
import { createParticle, resetForces } from "./particle";
import { euler } from "./integrators";
import { createDefaultForces } from "./forces";
import { createDefaultConstraints } from "./constraints";

interface WorldOptions {
  bounds: WorldBounds;
  forces?: Force[];
  constraints?: Constraint[];
  integrator?: Integrator;
}

export function createWorld(options: WorldOptions): World {
  return {
    particles: [],
    forces: options.forces ?? createDefaultForces(),
    constraints: options.constraints ?? createDefaultConstraints(),
    integrator: options.integrator ?? euler,
    bounds: options.bounds,
    elapsed: 0,
    pointer: { x: 0, y: 0, active: false, buttons: 0 },
    tilt: { x: 0, y: 0, active: false },
    shockwaves: [],
  };
}

export function spawnShockwave(
  world: World,
  x: number,
  y: number,
  strength = 900,
  speed = 600,
  life = 0.6,
): void {
  world.shockwaves.push({ x, y, bornAt: world.elapsed, strength, speed, life });
}

export function addParticle(
  world: World,
  x: number,
  y: number,
  radius?: number,
  mass?: number,
): Particle {
  const p = createParticle(x, y, radius, mass);
  world.particles.push(p);
  return p;
}

export function clearParticles(world: World): void {
  world.particles.length = 0;
}

export function setBounds(world: World, bounds: WorldBounds): void {
  world.bounds = bounds;
}

export function tick(world: World, dt: number): void {
  world.elapsed += dt;

  // expire old shockwaves
  if (world.shockwaves.length > 0) {
    world.shockwaves = world.shockwaves.filter(
      (s) => world.elapsed - s.bornAt < s.life,
    );
  }

  for (const p of world.particles) {
    resetForces(p);

    for (const force of world.forces) {
      if (force.enabled) force.apply(p, world, dt);
    }

    world.integrator.step(p, dt);

    for (const constraint of world.constraints) {
      if (constraint.enabled) constraint.resolve(p, world);
    }
  }
}

export function findForce(world: World, id: string): Force | undefined {
  return world.forces.find((f) => f.id === id);
}

export function findConstraint(world: World, id: string): Constraint | undefined {
  return world.constraints.find((c) => c.id === id);
}
