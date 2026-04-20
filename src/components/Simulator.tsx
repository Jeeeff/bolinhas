"use client";

import { useEffect, useMemo, useState } from "react";
import { Canvas } from "./Canvas";
import { ControlPanel } from "./ControlPanel";
import { useSimulation } from "@/lib/hooks/useSimulation";
import { createCanvas2DRenderer } from "@/lib/render/canvas2d";
import { spawnShockwave } from "@/lib/physics/world";

const PANEL_WIDTH = 280;

export function Simulator() {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [darkMode, setDarkMode] = useState(true);
  const [canvasEl, setCanvasEl] = useState<HTMLCanvasElement | null>(null);
  const [, forceRender] = useState(0);

  useEffect(() => {
    const compute = () => {
      setSize({
        width: Math.max(window.innerWidth - PANEL_WIDTH, 0),
        height: window.innerHeight,
      });
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) root.classList.add("dark");
    else root.classList.remove("dark");
  }, [darkMode]);

  const renderer = useMemo(() => createCanvas2DRenderer(), []);

  const sim = useSimulation({
    width: size.width || 1,
    height: size.height || 1,
    renderer,
    canvas: canvasEl,
  });

  // Pointer tracking → World.pointer (read by mouseAttractor force)
  useEffect(() => {
    if (!canvasEl || !sim.world) return;
    const world = sim.world;
    const handleMove = (e: PointerEvent) => {
      const rect = canvasEl.getBoundingClientRect();
      world.pointer.x = e.clientX - rect.left;
      world.pointer.y = e.clientY - rect.top;
      world.pointer.active = true;
      world.pointer.buttons = e.buttons;
    };
    const handleLeave = () => {
      world.pointer.active = false;
      world.pointer.buttons = 0;
    };
    const handleDown = (e: PointerEvent) => {
      handleMove(e);
      const rect = canvasEl.getBoundingClientRect();
      spawnShockwave(world, e.clientX - rect.left, e.clientY - rect.top);
    };
    canvasEl.addEventListener("pointermove", handleMove);
    canvasEl.addEventListener("pointerleave", handleLeave);
    canvasEl.addEventListener("pointerdown", handleDown);
    canvasEl.addEventListener("pointerup", handleMove);
    return () => {
      canvasEl.removeEventListener("pointermove", handleMove);
      canvasEl.removeEventListener("pointerleave", handleLeave);
      canvasEl.removeEventListener("pointerdown", handleDown);
      canvasEl.removeEventListener("pointerup", handleMove);
    };
  }, [canvasEl, sim.world]);

  return (
    <div className="flex w-screen h-screen overflow-hidden">
      <div className="flex-1 relative">
        {size.width > 0 && (
          <Canvas
            width={size.width}
            height={size.height}
            onCanvasReady={setCanvasEl}
          />
        )}
      </div>
      <ControlPanel
        world={sim.world}
        isRunning={sim.isRunning}
        setRunning={sim.setRunning}
        onReset={sim.reset}
        onClear={sim.clear}
        onSpawn={sim.spawn}
        onSetTargetCount={sim.setTargetCount}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        particleCount={sim.world?.particles.length ?? 0}
        fps={sim.fps}
        setForceEnabled={sim.setForceEnabled}
        setForceConfig={sim.setForceConfig}
        setConstraintEnabled={sim.setConstraintEnabled}
        setConstraintConfig={sim.setConstraintConfig}
        renderOptions={renderer.options}
        onRenderOptionChange={(key, value) => {
          (renderer.options as unknown as Record<string, number | boolean | string>)[
            key as string
          ] = value;
          forceRender((v) => v + 1);
        }}
      />
    </div>
  );
}
