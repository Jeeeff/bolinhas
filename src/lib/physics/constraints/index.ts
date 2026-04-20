import type { Constraint } from "@/types/constraint";
import { createBounds } from "./bounds";
import { createCollision } from "./collision";

export function createDefaultConstraints(): Constraint[] {
  return [createBounds(), createCollision()];
}

export { createBounds, createCollision };
