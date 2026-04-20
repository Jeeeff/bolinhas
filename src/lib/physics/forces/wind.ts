import type { Force } from "@/types/force";

interface WindConfig {
  strength: number;
  frequency: number;
  [key: string]: number | boolean;
}

export function createWind(): Force<WindConfig> {
  return {
    id: "wind",
    label: "Vento",
    enabled: false,
    config: {
      strength: 1.5,
      frequency: 0.015,
    },
    schema: {
      strength: { kind: "slider", label: "Força", min: 0, max: 5, step: 0.01 },
      frequency: { kind: "slider", label: "Frequência", min: 0, max: 0.2, step: 0.001 },
    },
    apply(p, world) {
      const wind = Math.sin(world.elapsed * this.config.frequency) * this.config.strength;
      p.acceleration.x += wind / p.mass;
    },
  };
}
