import {
  DEFAULT_PARTICLE_MASS,
  DEFAULT_PARTICLE_RADIUS,
  type Particle,
} from "@/types/simulation";

let nextId = 0;

export function createParticle(
  x: number,
  y: number,
  radius: number = DEFAULT_PARTICLE_RADIUS,
  mass: number = DEFAULT_PARTICLE_MASS,
): Particle {
  return {
    id: nextId++,
    position: { x, y },
    previousPosition: { x, y },
    velocity: { x: 0, y: 0 },
    acceleration: { x: 0, y: 0 },
    mass,
    radius,
  };
}

export function resetForces(particle: Particle): void {
  particle.acceleration.x = 0;
  particle.acceleration.y = 0;
}
