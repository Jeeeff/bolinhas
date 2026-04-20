"use client";

import type { ControlDescriptor } from "@/types/force";
import { Slider } from "./Slider";
import { Toggle } from "./Toggle";

interface PluginLike {
  id: string;
  label: string;
  enabled: boolean;
  config: Record<string, number | boolean>;
  schema: Record<string, ControlDescriptor>;
}

interface PluginSectionProps {
  plugin: PluginLike;
  onToggle: (enabled: boolean) => void;
  onChange: (key: string, value: number | boolean) => void;
  defaultOpen?: boolean;
}

export function PluginSection({
  plugin,
  onToggle,
  onChange,
  defaultOpen = true,
}: PluginSectionProps) {
  return (
    <details
      open={defaultOpen}
      className="border-b border-neutral-200 dark:border-neutral-800 py-2"
    >
      <summary className="cursor-pointer font-semibold text-sm py-1 select-none flex justify-between">
        <span>{plugin.label}</span>
        <span
          className={`text-xs ${plugin.enabled ? "text-green-600" : "text-neutral-400"}`}
        >
          {plugin.enabled ? "ativo" : "off"}
        </span>
      </summary>
      <div className="flex flex-col gap-3 pt-3 pb-2">
        <Toggle label="Ativado" value={plugin.enabled} onChange={onToggle} />
        {Object.entries(plugin.schema).map(([key, desc]) => {
          const value = plugin.config[key];
          if (desc.kind === "slider" && typeof value === "number") {
            return (
              <Slider
                key={key}
                label={desc.label}
                value={value}
                min={desc.min}
                max={desc.max}
                step={desc.step}
                onChange={(v) => onChange(key, v)}
              />
            );
          }
          if (desc.kind === "toggle" && typeof value === "boolean") {
            return (
              <Toggle
                key={key}
                label={desc.label}
                value={value}
                onChange={(v) => onChange(key, v)}
              />
            );
          }
          return null;
        })}
      </div>
    </details>
  );
}
