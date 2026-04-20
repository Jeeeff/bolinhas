import type { Force } from "@/types/force";

interface MouseAttractorConfig {
  strength: number;
  radius: number;
  repel: boolean;
  [key: string]: number | boolean;
}

export function createMouseAttractor(): Force<MouseAttractorConfig> {
  return {
    id: "mouseAttractor",
    label: "Mouse",
    enabled: true,
    config: {
      strength: 0.8,
      radius: 180,
      repel: false,
    },
    schema: {
      strength: { kind: "slider", label: "Força", min: 0, max: 3, step: 0.01 },
      radius: { kind: "slider", label: "Raio", min: 20, max: 600, step: 5 },
      repel: { kind: "toggle", label: "Repelir" },
    },
    apply(p, world) {
      if (!world.pointer.active) return;
      const dx = world.pointer.x - p.position.x;
      const dy = world.pointer.y - p.position.y;
      const distSq = dx * dx + dy * dy;
      const r = this.config.radius;
      if (distSq > r * r || distSq < 1) return;
      const dist = Math.sqrt(distSq);
      const falloff = 1 - dist / r;
      const force = this.config.strength * falloff;
      const sign = this.config.repel ? -1 : 1;
      p.acceleration.x += (dx / dist) * force * sign;
      p.acceleration.y += (dy / dist) * force * sign;
    },
  };
}
