import type { Force } from "@/types/force";

interface TurbulenceConfig {
  strength: number;
  scale: number; // spatial frequency
  speed: number; // temporal frequency
  [key: string]: number | boolean;
}

/**
 * Turbulence: cheap pseudo-noise flow field driven by sin/cos of position + time.
 * Gives organic, fluid-like swirling motion across the whole canvas.
 * Not true Perlin noise but visually similar and 10× faster.
 */
export function createTurbulence(): Force<TurbulenceConfig> {
  return {
    id: "turbulence",
    label: "Turbulência",
    enabled: true,
    config: {
      strength: 0.15,
      scale: 0.003,
      speed: 0.25,
    },
    schema: {
      strength: { kind: "slider", label: "Força", min: 0, max: 4, step: 0.01 },
      scale: { kind: "slider", label: "Escala", min: 0.0005, max: 0.02, step: 0.0005 },
      speed: { kind: "slider", label: "Velocidade", min: 0, max: 3, step: 0.01 },
    },
    apply(p, world) {
      const s = this.config.scale;
      const t = world.elapsed * this.config.speed;
      const x = p.position.x * s;
      const y = p.position.y * s;
      // two out-of-phase trig combos approximate a divergence-free flow field
      const fx = Math.sin(y * 1.3 + t) + Math.cos(y * 0.7 - t * 1.1);
      const fy = Math.cos(x * 1.1 - t) + Math.sin(x * 0.6 + t * 0.9);
      const k = this.config.strength;
      p.acceleration.x += fx * k;
      p.acceleration.y += fy * k;
    },
  };
}
