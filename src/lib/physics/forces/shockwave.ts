import type { Force } from "@/types/force";

interface ShockwaveConfig {
  thickness: number; // band width in px where particles feel the wave
  [key: string]: number | boolean;
}

/**
 * Shockwave: reads world.shockwaves (populated by pointerdown in Simulator).
 * Each wave expands from its origin; particles near the expanding ring are
 * pushed radially outward with intensity falling off by age and ring-distance.
 */
export function createShockwave(): Force<ShockwaveConfig> {
  return {
    id: "shockwave",
    label: "Onda (clique)",
    enabled: true,
    config: {
      thickness: 60,
    },
    schema: {
      thickness: { kind: "slider", label: "Espessura", min: 10, max: 200, step: 1 },
    },
    apply(p, world) {
      if (world.shockwaves.length === 0) return;
      const thickness = this.config.thickness;
      for (const s of world.shockwaves) {
        const age = world.elapsed - s.bornAt;
        const ageT = age / s.life; // 0..1
        if (ageT >= 1) continue;
        const ringRadius = age * s.speed;
        const dx = p.position.x - s.x;
        const dy = p.position.y - s.y;
        const distSq = dx * dx + dy * dy;
        const dist = Math.sqrt(distSq);
        const delta = Math.abs(dist - ringRadius);
        if (delta > thickness || dist < 0.5) continue;
        const ringFall = 1 - delta / thickness;
        const ageFall = 1 - ageT;
        const k = s.strength * ringFall * ageFall;
        p.acceleration.x += (dx / dist) * k;
        p.acceleration.y += (dy / dist) * k;
      }
    },
  };
}
