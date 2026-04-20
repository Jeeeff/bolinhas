import type { Integrator } from "@/types/integrator";

export const euler: Integrator = {
  id: "euler",
  step(p) {
    p.previousPosition.x = p.position.x;
    p.previousPosition.y = p.position.y;

    p.velocity.x += p.acceleration.x;
    p.velocity.y += p.acceleration.y;

    p.position.x += p.velocity.x;
    p.position.y += p.velocity.y;
  },
};
