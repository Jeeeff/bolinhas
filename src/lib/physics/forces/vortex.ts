import type { Force } from "@/types/force";

interface VortexConfig {
  strength: number;
  radius: number;
  clockwise: boolean;
  [key: string]: number | boolean;
}

/**
 * Vortex: swirls particles tangentially around the pointer.
 * Different from mouseAttractor (which pulls radially) — this creates spin.
 */
export function createVortex(): Force<VortexConfig> {
  return {
    id: "vortex",
    label: "Vórtice (mouse)",
    enabled: false,
    config: {
      strength: 1.2,
      radius: 220,
      clockwise: true,
    },
    schema: {
      strength: { kind: "slider", label: "Força", min: 0, max: 4, step: 0.01 },
      radius: { kind: "slider", label: "Raio", min: 40, max: 800, step: 5 },
      clockwise: { kind: "toggle", label: "Horário" },
    },
    apply(p, world) {
      if (!world.pointer.active) return;
      const dx = p.position.x - world.pointer.x;
      const dy = p.position.y - world.pointer.y;
      const distSq = dx * dx + dy * dy;
      const r = this.config.radius;
      if (distSq > r * r || distSq < 1) return;
      const dist = Math.sqrt(distSq);
      const falloff = 1 - dist / r;
      const sign = this.config.clockwise ? 1 : -1;
      // tangent = perpendicular to radial vector
      const tx = -dy / dist;
      const ty = dx / dist;
      const force = this.config.strength * falloff * sign;
      p.acceleration.x += tx * force;
      p.acceleration.y += ty * force;
    },
  };
}
