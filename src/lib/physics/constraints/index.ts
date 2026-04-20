import type { Constraint } from "@/types/constraint";
import { createBounds } from "./bounds";

export function createDefaultConstraints(): Constraint[] {
  return [createBounds()];
}

export { createBounds };
