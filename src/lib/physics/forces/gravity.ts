import type { Force } from "@/types/force";

interface GravityConfig {
  strength: number;
  inverted: boolean;
  [key: string]: number | boolean;
}

export function createGravity(): Force<GravityConfig> {
  return {
    id: "gravity",
    label: "Gravidade",
    enabled: true,
    config: {
      strength: 0.05,
      inverted: false,
    },
    schema: {
      strength: { kind: "slider", label: "Força", min: 0, max: 2, step: 0.01 },
      inverted: { kind: "toggle", label: "Anti-gravidade" },
    },
    apply(p) {
      const dir = this.config.inverted ? -1 : 1;
      p.acceleration.y += this.config.strength * dir;
    },
  };
}
