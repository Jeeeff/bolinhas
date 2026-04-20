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
  resolve(particle: Particle, world: World): void;
}
