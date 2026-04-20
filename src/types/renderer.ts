import type { World } from "./world";

export interface Renderer {
  init(canvas: HTMLCanvasElement): void;
  render(world: World): void;
  dispose(): void;
}
