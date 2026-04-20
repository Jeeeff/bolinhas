import type { Renderer } from "@/types/renderer";

export interface Canvas2DOptions {
  background: string;
  trails: number;
  colorByVelocity: boolean;
  baseColor: string;
  maxSpeedForColor: number;
  glow: boolean;
}

export const DEFAULT_RENDER_OPTIONS: Canvas2DOptions = {
  background: "#030712",
  trails: 0.22,
  colorByVelocity: false,
  baseColor: "#00f5ff",
  maxSpeedForColor: 8,
  glow: true,
};

export interface Canvas2DRenderer extends Renderer {
  options: Canvas2DOptions;
}

// Number of color buckets when colorByVelocity is on. Higher = smoother gradient
// but more fillStyle switches per frame. 12 is a good balance for 3000+ particles.
const COLOR_BUCKETS = 12;

export function createCanvas2DRenderer(
  initial: Partial<Canvas2DOptions> = {},
): Canvas2DRenderer {
  let canvas: HTMLCanvasElement | null = null;
  let ctx: CanvasRenderingContext2D | null = null;
  const options: Canvas2DOptions = { ...DEFAULT_RENDER_OPTIONS, ...initial };

  // Pre-compute bucket colors. Blue (220) → red (0).
  const bucketColors: string[] = [];
  for (let i = 0; i < COLOR_BUCKETS; i++) {
    const t = i / (COLOR_BUCKETS - 1);
    const hue = 220 - t * 220;
    const light = 60 + t * 10;
    bucketColors.push(`hsl(${hue}, 85%, ${light}%)`);
  }

  return {
    options,
    init(target) {
      canvas = target;
      ctx = target.getContext("2d");
    },
    render(world) {
      if (!canvas || !ctx) return;
      const { width, height } = world.bounds;

      // Trails: paint background with partial alpha instead of fully clearing.
      if (options.trails > 0 && options.trails < 1) {
        ctx.fillStyle = hexToRgba(options.background, 1 - options.trails);
        ctx.fillRect(0, 0, width, height);
      } else {
        ctx.fillStyle = options.background;
        ctx.fillRect(0, 0, width, height);
      }

      ctx.globalCompositeOperation = options.glow ? "lighter" : "source-over";

      const particles = world.particles;
      const TAU = Math.PI * 2;

      if (options.colorByVelocity) {
        // Bucket particles by speed; one fillStyle/beginPath/fill per bucket.
        const buckets: number[][] = Array.from({ length: COLOR_BUCKETS }, () => []);
        const maxSpeed = options.maxSpeedForColor;
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          if (!p) continue;
          const speed = Math.hypot(p.velocity.x, p.velocity.y);
          const t = speed >= maxSpeed ? 1 : speed / maxSpeed;
          const idx = Math.min(COLOR_BUCKETS - 1, Math.floor(t * COLOR_BUCKETS));
          const bucket = buckets[idx];
          if (bucket) bucket.push(i);
        }
        for (let b = 0; b < COLOR_BUCKETS; b++) {
          const bucket = buckets[b];
          if (!bucket || bucket.length === 0) continue;
          const color = bucketColors[b];
          if (!color) continue;
          ctx.fillStyle = color;
          ctx.beginPath();
          for (let j = 0; j < bucket.length; j++) {
            const index = bucket[j];
            if (index === undefined) continue;
            const p = particles[index];
            if (!p) continue;
            ctx.moveTo(p.position.x + p.radius, p.position.y);
            ctx.arc(p.position.x, p.position.y, p.radius, 0, TAU);
          }
          ctx.fill();
        }
      } else {
        ctx.fillStyle = options.baseColor;
        ctx.beginPath();
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          if (!p) continue;
          ctx.moveTo(p.position.x + p.radius, p.position.y);
          ctx.arc(p.position.x, p.position.y, p.radius, 0, TAU);
        }
        ctx.fill();
      }

      // Draw expanding shockwave rings for visual feedback.
      if (world.shockwaves.length > 0) {
        ctx.globalCompositeOperation = "lighter";
        ctx.lineWidth = 1.5;
        for (const s of world.shockwaves) {
          const age = world.elapsed - s.bornAt;
          const ageT = age / s.life;
          if (ageT >= 1) continue;
          const radius = age * s.speed;
          ctx.strokeStyle = `rgba(255, 255, 255, ${(1 - ageT) * 0.5})`;
          ctx.beginPath();
          ctx.arc(s.x, s.y, radius, 0, TAU);
          ctx.stroke();
        }
      }

      ctx.globalCompositeOperation = "source-over";
    },
    dispose() {
      canvas = null;
      ctx = null;
    },
  };
}

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
