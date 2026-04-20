import type { Force } from "@/types/force";

interface TiltConfig {
  strength: number;
  [key: string]: number | boolean;
}

/**
 * Tilt: usa o giroscópio/orientação do dispositivo (world.tilt) pra aplicar
 * aceleração proporcional à inclinação. Quando ativa e habilitada, simula
 * uma "gravidade" que segue a direção em que o celular está inclinado.
 *
 * world.tilt.x = inclinação lateral (-1 esquerda .. 1 direita)
 * world.tilt.y = inclinação frente/trás (-1 trás .. 1 frente)
 */
export function createTilt(): Force<TiltConfig> {
  return {
    id: "tilt",
    label: "Giroscópio",
    enabled: true,
    config: {
      strength: 1.6,
    },
    schema: {
      strength: { kind: "slider", label: "Força", min: 0, max: 5, step: 0.05 },
    },
    apply(p, world) {
      if (!world.tilt.active) return;
      const k = this.config.strength;
      p.acceleration.x += world.tilt.x * k;
      p.acceleration.y += world.tilt.y * k;
    },
  };
}
