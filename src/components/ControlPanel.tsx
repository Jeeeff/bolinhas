"use client";

import type { World } from "@/types/world";
import type { Canvas2DOptions } from "@/lib/render/canvas2d";
import { MAX_PARTICLE_COUNT, MIN_PARTICLE_COUNT } from "@/types/simulation";
import { PluginSection } from "./controls/PluginSection";
import { Slider } from "./controls/Slider";
import { Toggle } from "./controls/Toggle";

interface ControlPanelProps {
  world: World | null;
  isRunning: boolean;
  setRunning: (running: boolean) => void;
  onReset: () => void;
  onClear: () => void;
  onSpawn: (count: number) => void;
  onSetTargetCount: (count: number) => void;
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  particleCount: number;
  fps: number;
  setForceEnabled: (id: string, enabled: boolean) => void;
  setForceConfig: (id: string, key: string, value: number | boolean) => void;
  setConstraintEnabled: (id: string, enabled: boolean) => void;
  setConstraintConfig: (id: string, key: string, value: number | boolean) => void;
  renderOptions: Canvas2DOptions;
  onRenderOptionChange: (key: keyof Canvas2DOptions, value: number | boolean | string) => void;
}

export function ControlPanel({
  world,
  isRunning,
  setRunning,
  onReset,
  onClear,
  onSpawn,
  onSetTargetCount,
  darkMode,
  setDarkMode,
  particleCount,
  fps,
  setForceEnabled,
  setForceConfig,
  setConstraintEnabled,
  setConstraintConfig,
  renderOptions,
  onRenderOptionChange,
}: ControlPanelProps) {
  return (
    <aside className="w-[280px] flex-shrink-0 h-screen overflow-y-auto bg-white dark:bg-neutral-950 border-l border-neutral-200 dark:border-neutral-800 px-4 py-3 text-neutral-900 dark:text-neutral-100">
      <h2 className="text-base font-bold mb-2">Controles</h2>

      {world && (
        <>
          <div className="text-xs uppercase tracking-wide text-neutral-400 mt-2 mb-1">
            Forças
          </div>
          {world.forces.map((force) => (
            <PluginSection
              key={force.id}
              plugin={force}
              onToggle={(v) => setForceEnabled(force.id, v)}
              onChange={(k, v) => setForceConfig(force.id, k, v)}
            />
          ))}

          <div className="text-xs uppercase tracking-wide text-neutral-400 mt-4 mb-1">
            Constraints
          </div>
          {world.constraints.map((constraint) => (
            <PluginSection
              key={constraint.id}
              plugin={constraint}
              onToggle={(v) => setConstraintEnabled(constraint.id, v)}
              onChange={(k, v) => setConstraintConfig(constraint.id, k, v)}
            />
          ))}
        </>
      )}

      <div className="text-xs uppercase tracking-wide text-neutral-400 mt-4 mb-1">
        Visual
      </div>
      <div className="flex flex-col gap-3 py-2 border-b border-neutral-200 dark:border-neutral-800">
        <Slider
          label="Rastros"
          value={renderOptions.trails}
          min={0}
          max={0.95}
          step={0.01}
          onChange={(v) => onRenderOptionChange("trails", v)}
        />
        <Slider
          label="Velocidade máx (cor)"
          value={renderOptions.maxSpeedForColor}
          min={1}
          max={30}
          step={0.5}
          onChange={(v) => onRenderOptionChange("maxSpeedForColor", v)}
        />
        <Toggle
          label="Cor por velocidade"
          value={renderOptions.colorByVelocity}
          onChange={(v) => onRenderOptionChange("colorByVelocity", v)}
        />
        <Toggle
          label="Glow (aditivo)"
          value={renderOptions.glow}
          onChange={(v) => onRenderOptionChange("glow", v)}
        />
      </div>

      <div className="text-xs uppercase tracking-wide text-neutral-400 mt-4 mb-1">
        Simulação
      </div>
      <div className="flex flex-col gap-3 py-2 border-b border-neutral-200 dark:border-neutral-800">
        <Toggle label="Pausado" value={!isRunning} onChange={(v) => setRunning(!v)} />
        <Toggle label="Modo escuro" value={darkMode} onChange={setDarkMode} />
        <Slider
          label="Quantidade"
          value={particleCount}
          min={MIN_PARTICLE_COUNT}
          max={MAX_PARTICLE_COUNT}
          step={50}
          onChange={onSetTargetCount}
        />
        <div className="flex gap-2">
          <button
            onClick={onReset}
            className="flex-1 rounded bg-blue-500 hover:bg-blue-600 text-white text-sm py-1.5"
          >
            Reset
          </button>
          <button
            onClick={onClear}
            className="flex-1 rounded bg-neutral-300 dark:bg-neutral-700 hover:bg-neutral-400 dark:hover:bg-neutral-600 text-sm py-1.5"
          >
            Limpar
          </button>
        </div>
        <button
          onClick={() => onSpawn(500)}
          className="rounded bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-sm py-1.5"
        >
          + 500 partículas
        </button>
      </div>

      <div className="py-3 text-sm flex flex-col gap-1">
        <div className="flex justify-between">
          <span>Partículas</span>
          <span className="tabular-nums">{particleCount}</span>
        </div>
        <div className="flex justify-between">
          <span>FPS</span>
          <span className="tabular-nums">{fps}</span>
        </div>
      </div>
    </aside>
  );
}
