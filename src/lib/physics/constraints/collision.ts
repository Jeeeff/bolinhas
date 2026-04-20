import type { Constraint } from "@/types/constraint";
import type { Particle } from "@/types/simulation";
import type { World } from "@/types/world";

interface CollisionConfig {
  restitution: number;
  iterations: number;
  [key: string]: number | boolean;
}

// Spatial hash reutilizado entre ticks. Armazena índices no array de
// partículas — permite dedup de pares via comparação de índice.
const grid = new Map<number, number[]>();

function cellKey(cx: number, cy: number): number {
  return (cx + 0x8000) * 0x10000 + (cy + 0x8000);
}

function resolvePair(a: Particle, b: Particle, restitution: number): void {
  const dx = b.position.x - a.position.x;
  const dy = b.position.y - a.position.y;
  const rSum = a.radius + b.radius;
  const d2 = dx * dx + dy * dy;
  if (d2 >= rSum * rSum || d2 === 0) return;

  const d = Math.sqrt(d2);
  const nx = dx / d;
  const ny = dy / d;
  const overlap = rSum - d;

  const invA = 1 / a.mass;
  const invB = 1 / b.mass;
  const invSum = invA + invB;
  a.position.x -= nx * (overlap * invA) / invSum;
  a.position.y -= ny * (overlap * invA) / invSum;
  b.position.x += nx * (overlap * invB) / invSum;
  b.position.y += ny * (overlap * invB) / invSum;

  const rvx = b.velocity.x - a.velocity.x;
  const rvy = b.velocity.y - a.velocity.y;
  const velAlongNormal = rvx * nx + rvy * ny;
  if (velAlongNormal > 0) return;

  const j = (-(1 + restitution) * velAlongNormal) / invSum;
  const jx = j * nx;
  const jy = j * ny;
  a.velocity.x -= jx * invA;
  a.velocity.y -= jy * invA;
  b.velocity.x += jx * invB;
  b.velocity.y += jy * invB;
}

export function createCollision(): Constraint<CollisionConfig> {
  return {
    id: "collision",
    label: "Colisão",
    enabled: true,
    config: {
      restitution: 0.4,
      iterations: 2,
    },
    schema: {
      restitution: { kind: "slider", label: "Elasticidade", min: 0, max: 1, step: 0.01 },
      iterations: { kind: "slider", label: "Passos", min: 1, max: 4, step: 1 },
    },
    resolveAll(world: World) {
      const particles = world.particles;
      const n = particles.length;
      if (n < 2) return;

      let maxR = 0;
      for (let i = 0; i < n; i++) {
        const r = particles[i]!.radius;
        if (r > maxR) maxR = r;
      }
      const cellSize = Math.max(4, maxR * 2);
      const inv = 1 / cellSize;

      const iterations = Math.max(1, Math.round(this.config.iterations));
      const restitution = this.config.restitution;

      for (let iter = 0; iter < iterations; iter++) {
        grid.clear();
        for (let i = 0; i < n; i++) {
          const p = particles[i]!;
          const cx = Math.floor(p.position.x * inv);
          const cy = Math.floor(p.position.y * inv);
          const key = cellKey(cx, cy);
          const bucket = grid.get(key);
          if (bucket) bucket.push(i);
          else grid.set(key, [i]);
        }

        // Para cada partícula i, checa vizinhos em 9 células (3×3) e só
        // resolve pares (i, j) onde j > i — dedup barato.
        for (let i = 0; i < n; i++) {
          const p = particles[i]!;
          const cx = Math.floor(p.position.x * inv);
          const cy = Math.floor(p.position.y * inv);
          for (let oy = -1; oy <= 1; oy++) {
            for (let ox = -1; ox <= 1; ox++) {
              const bucket = grid.get(cellKey(cx + ox, cy + oy));
              if (!bucket) continue;
              for (let k = 0; k < bucket.length; k++) {
                const j = bucket[k]!;
                if (j <= i) continue;
                resolvePair(p, particles[j]!, restitution);
              }
            }
          }
        }
      }
    },
  };
}
