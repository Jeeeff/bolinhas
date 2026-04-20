import type { Constraint } from "@/types/constraint";

interface BoundsConfig {
  restitution: number;
  friction: number;
  [key: string]: number | boolean;
}

export function createBounds(): Constraint<BoundsConfig> {
  return {
    id: "bounds",
    label: "Paredes e atrito",
    enabled: true,
    config: {
      restitution: 0.6,
      friction: 0,
    },
    schema: {
      restitution: { kind: "slider", label: "Restituição", min: 0, max: 1, step: 0.01 },
      friction: { kind: "slider", label: "Atrito", min: 0, max: 1, step: 0.01 },
    },
    resolve(p, world) {
      const { width, height } = world.bounds;
      const { restitution, friction } = this.config;

      p.velocity.x *= 1 - friction;
      p.velocity.y *= 1 - friction;

      if (p.position.x - p.radius < 0) {
        p.position.x = p.radius;
        p.velocity.x = -p.velocity.x * restitution;
      } else if (p.position.x + p.radius > width) {
        p.position.x = width - p.radius;
        p.velocity.x = -p.velocity.x * restitution;
      }

      if (p.position.y - p.radius < 0) {
        p.position.y = p.radius;
        p.velocity.y = -p.velocity.y * restitution;
      } else if (p.position.y + p.radius > height) {
        p.position.y = height - p.radius;
        p.velocity.y = -p.velocity.y * restitution;
      }
    },
  };
}
