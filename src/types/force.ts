import type { Particle } from "./simulation";
import type { World } from "./world";

export type SliderDescriptor = {
  kind: "slider";
  label: string;
  min: number;
  max: number;
  step: number;
};

export type ToggleDescriptor = {
  kind: "toggle";
  label: string;
};

export type ControlDescriptor = SliderDescriptor | ToggleDescriptor;

export type ConfigSchema<C> = {
  [K in keyof C]: ControlDescriptor;
};

export interface Force<C extends Record<string, number | boolean> = Record<string, number | boolean>> {
  id: string;
  label: string;
  enabled: boolean;
  config: C;
  schema: ConfigSchema<C>;
  apply(particle: Particle, world: World, dt: number): void;
  reset?(): void;
}
