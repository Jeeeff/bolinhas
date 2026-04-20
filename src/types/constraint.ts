import type { Particle } from "./simulation";
import type { World } from "./world";
import type { ConfigSchema } from "./force";

export interface Constraint<
  C extends Record<string, number | boolean> = Record<string, number | boolean>,
> {
  id: string;
  label: string;
  enabled: boolean;
  config: C;
  schema: ConfigSchema<C>;
  // Per-particle resolution (bounds, etc.). Opcional quando a constraint
  // usa resolveAll (solver global, ex: colisão pairwise).
  resolve?(particle: Particle, world: World): void;
  // Resolução global — roda uma vez por tick, depois de todas as posições
  // atualizadas. Usada para constraints que precisam ver o mundo todo
  // (ex.: colisão partícula-partícula via spatial hash).
  resolveAll?(world: World): void;
}
