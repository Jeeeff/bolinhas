"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { World } from "@/types/world";
import type { Renderer } from "@/types/renderer";
import {
  addParticle,
  clearParticles,
  createWorld,
  findConstraint,
  findForce,
  setBounds,
  tick,
} from "@/lib/physics/world";
import {
  DEFAULT_PARTICLE_COUNT,
  MAX_DELTA_TIME,
} from "@/types/simulation";

interface UseSimulationOptions {
  width: number;
  height: number;
  initialParticleCount?: number;
  renderer: Renderer | null;
  canvas: HTMLCanvasElement | null;
}

interface UseSimulationResult {
  world: World | null;
  version: number;
  isRunning: boolean;
  setRunning: (running: boolean) => void;
  reset: () => void;
  clear: () => void;
  spawn: (count: number) => void;
  setTargetCount: (count: number) => void;
  setForceEnabled: (id: string, enabled: boolean) => void;
  setForceConfig: (id: string, key: string, value: number | boolean) => void;
  setConstraintEnabled: (id: string, enabled: boolean) => void;
  setConstraintConfig: (id: string, key: string, value: number | boolean) => void;
  fps: number;
}

function seedParticles(world: World, count: number): void {
  const { width, height } = world.bounds;
  for (let i = 0; i < count; i++) {
    addParticle(world, Math.random() * width, Math.random() * (height * 0.2));
  }
}

export function useSimulation({
  width,
  height,
  initialParticleCount = DEFAULT_PARTICLE_COUNT,
  renderer,
  canvas,
}: UseSimulationOptions): UseSimulationResult {
  const worldRef = useRef<World | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const runningRef = useRef<boolean>(true);
  const rendererRef = useRef<Renderer | null>(null);
  const seededRef = useRef<boolean>(false);

  const [version, setVersion] = useState(0);
  const [isRunning, setIsRunningState] = useState(true);
  const [fps, setFps] = useState(0);

  // Defer world creation until we have real bounds so particles spawn in the visible area.
  if (worldRef.current === null && width > 1 && height > 1) {
    worldRef.current = createWorld({ bounds: { width, height } });
    seedParticles(worldRef.current, initialParticleCount);
    seededRef.current = true;
  }

  // Init renderer when canvas + renderer provided
  useEffect(() => {
    if (!renderer || !canvas) return;
    renderer.init(canvas);
    rendererRef.current = renderer;
    return () => {
      renderer.dispose();
      rendererRef.current = null;
    };
  }, [renderer, canvas]);

  // Keep bounds in sync
  useEffect(() => {
    const world = worldRef.current;
    if (!world) return;
    setBounds(world, { width: Math.max(width, 1), height: Math.max(height, 1) });
  }, [width, height]);

  // Animation loop
  useEffect(() => {
    let frameCount = 0;
    let fpsAccum = 0;

    const loop = (time: number) => {
      const world = worldRef.current;
      const last = lastTimeRef.current || time;
      const rawDt = (time - last) / 1000;
      const dt = Math.min(rawDt, MAX_DELTA_TIME);
      lastTimeRef.current = time;

      if (world) {
        if (runningRef.current) {
          tick(world, dt);
        }
        rendererRef.current?.render(world);
      }

      fpsAccum += rawDt;
      frameCount++;
      if (fpsAccum >= 0.5) {
        setFps(Math.round(frameCount / fpsAccum));
        frameCount = 0;
        fpsAccum = 0;
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastTimeRef.current = 0;
    };
  }, []);

  const bump = useCallback(() => setVersion((v) => v + 1), []);

  const setRunning = useCallback((running: boolean) => {
    runningRef.current = running;
    setIsRunningState(running);
  }, []);

  const reset = useCallback(() => {
    const world = worldRef.current;
    if (!world) return;
    clearParticles(world);
    seedParticles(world, initialParticleCount);
    bump();
  }, [initialParticleCount, bump]);

  const clear = useCallback(() => {
    const world = worldRef.current;
    if (!world) return;
    clearParticles(world);
    bump();
  }, [bump]);

  const spawn = useCallback(
    (count: number) => {
      const world = worldRef.current;
      if (!world) return;
      seedParticles(world, count);
      bump();
    },
    [bump],
  );

  const setTargetCount = useCallback(
    (count: number) => {
      const world = worldRef.current;
      if (!world) return;
      const current = world.particles.length;
      if (count > current) {
        seedParticles(world, count - current);
      } else if (count < current) {
        world.particles.length = count;
      }
      bump();
    },
    [bump],
  );

  const setForceEnabled = useCallback(
    (id: string, enabled: boolean) => {
      const world = worldRef.current;
      if (!world) return;
      const f = findForce(world, id);
      if (!f) return;
      f.enabled = enabled;
      bump();
    },
    [bump],
  );

  const setForceConfig = useCallback(
    (id: string, key: string, value: number | boolean) => {
      const world = worldRef.current;
      if (!world) return;
      const f = findForce(world, id);
      if (!f) return;
      (f.config as Record<string, number | boolean>)[key] = value;
      bump();
    },
    [bump],
  );

  const setConstraintEnabled = useCallback(
    (id: string, enabled: boolean) => {
      const world = worldRef.current;
      if (!world) return;
      const c = findConstraint(world, id);
      if (!c) return;
      c.enabled = enabled;
      bump();
    },
    [bump],
  );

  const setConstraintConfig = useCallback(
    (id: string, key: string, value: number | boolean) => {
      const world = worldRef.current;
      if (!world) return;
      const c = findConstraint(world, id);
      if (!c) return;
      (c.config as Record<string, number | boolean>)[key] = value;
      bump();
    },
    [bump],
  );

  return {
    world: worldRef.current,
    version,
    isRunning,
    setRunning,
    reset,
    clear,
    spawn,
    setTargetCount,
    setForceEnabled,
    setForceConfig,
    setConstraintEnabled,
    setConstraintConfig,
    fps,
  };
}
