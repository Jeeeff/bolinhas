import type { Force } from "@/types/force";

interface DragConfig {
  coefficient: number;
  [key: string]: number | boolean;
}

export function createDrag(): Force<DragConfig> {
  return {
    id: "drag",
    label: "Arrasto",
    enabled: true,
    config: {
      coefficient: 0.012,
    },
    schema: {
      coefficient: { kind: "slider", label: "Coef.", min: 0, max: 0.3, step: 0.001 },
    },
    apply(p) {
      p.acceleration.x -= p.velocity.x * this.config.coefficient;
      p.acceleration.y -= p.velocity.y * this.config.coefficient;
    },
  };
}
