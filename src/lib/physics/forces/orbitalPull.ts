import type { Force } from "@/types/force";

interface OrbitalPullConfig {
  strength: number;
  spin: number; // tangential component (negative = reverse)
  [key: string]: number | boolean;
}

/**
 * OrbitalPull: constant attraction toward the center of the canvas, plus a
 * tangential component that induces orbit. Creates galaxy-like swirl
 * independent of mouse position.
 */
export function createOrbitalPull(): Force<OrbitalPullConfig> {
  return {
    id: "orbitalPull",
    label: "Órbita (centro)",
    enabled: false,
    config: {
      strength: 0.4,
      spin: 0.8,
    },
    schema: {
      strength: { kind: "slider", label: "Atração", min: 0, max: 3, step: 0.01 },
      spin: { kind: "slider", label: "Rotação", min: -3, max: 3, step: 0.01 },
    },
    apply(p, world) {
      const cx = world.bounds.width * 0.5;
      const cy = world.bounds.height * 0.5;
      const dx = cx - p.position.x;
      const dy = cy - p.position.y;
      const distSq = dx * dx + dy * dy;
      if (distSq < 1) return;
      const dist = Math.sqrt(distSq);
      const inv = 1 / dist;
      const nx = dx * inv;
      const ny = dy * inv;
      const k = this.config.strength;
      p.acceleration.x += nx * k;
      p.acceleration.y += ny * k;
      // tangent
      const s = this.config.spin;
      p.acceleration.x += -ny * s;
      p.acceleration.y += nx * s;
    },
  };
}
