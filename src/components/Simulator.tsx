"use client";

import { useEffect, useMemo, useState } from "react";
import { Canvas } from "./Canvas";
import { ControlPanel } from "./ControlPanel";
import { useSimulation } from "@/lib/hooks/useSimulation";
import { createCanvas2DRenderer } from "@/lib/render/canvas2d";
import { spawnShockwave } from "@/lib/physics/world";

export function Simulator() {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [darkMode, setDarkMode] = useState(true);
  const [canvasEl, setCanvasEl] = useState<HTMLCanvasElement | null>(null);
  const [, forceRender] = useState(0);
  const [panelOpen, setPanelOpen] = useState(false);
  const [bgMode, setBgMode] = useState(false);

  // Detecta ?mode=bg — usado quando o simulador roda como iframe de fundo
  // em outro site (ex.: portfólio). Nesse modo, a UI nativa (botão 🫧 +
  // hint) fica oculta — o site hospedeiro fornece a própria.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("mode") === "bg") setBgMode(true);
  }, []);

  // Ponte postMessage pra controle remoto do iframe pai.
  // Aceita:
  //   { type: "bolinhas:togglePanel" }
  //   { type: "bolinhas:setPanel", open: boolean }
  //   { type: "bolinhas:pointer", x, y, active } — coords relativas ao iframe
  //   { type: "bolinhas:click", x, y } — dispara shockwave
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      const data = e.data;
      if (!data || typeof data !== "object") return;
      if (data.type === "bolinhas:togglePanel") {
        setPanelOpen((v) => !v);
      } else if (data.type === "bolinhas:setPanel" && typeof data.open === "boolean") {
        setPanelOpen(data.open);
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  useEffect(() => {
    const compute = () => {
      setSize({
        width: window.innerWidth,
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

  // Toggle painel com tecla L (modo Lab)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "l" || e.key === "L") {
        const target = e.target as HTMLElement | null;
        if (
          target &&
          (target.tagName === "INPUT" || target.tagName === "TEXTAREA")
        )
          return;
        setPanelOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const renderer = useMemo(() => createCanvas2DRenderer(), []);

  const sim = useSimulation({
    width: size.width || 1,
    height: size.height || 1,
    renderer,
    canvas: canvasEl,
  });

  // Ponte de pointer externo (usado quando o iframe está com pointer-events:none
  // e o site pai forwarda as coordenadas do mouse via postMessage).
  useEffect(() => {
    if (!sim.world) return;
    const world = sim.world;
    const onMessage = (e: MessageEvent) => {
      const data = e.data;
      if (!data || typeof data !== "object") return;
      if (data.type === "bolinhas:pointer") {
        if (typeof data.x === "number" && typeof data.y === "number") {
          world.pointer.x = data.x;
          world.pointer.y = data.y;
          world.pointer.active = data.active !== false;
        } else {
          world.pointer.active = false;
        }
      } else if (data.type === "bolinhas:click") {
        if (typeof data.x === "number" && typeof data.y === "number") {
          spawnShockwave(world, data.x, data.y);
        }
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [sim.world]);

  // Pointer tracking → World.pointer
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
    const handleUp = (e: PointerEvent) => {
      // Em touch, o "dedo saiu" = ponteiro inativo. Senão o mouseAttractor
      // continua puxando tudo pro último toque e mata o efeito de giroscópio.
      if (e.pointerType === "touch") {
        handleLeave();
      } else {
        handleMove(e);
      }
    };
    canvasEl.addEventListener("pointermove", handleMove);
    canvasEl.addEventListener("pointerleave", handleLeave);
    canvasEl.addEventListener("pointercancel", handleLeave);
    canvasEl.addEventListener("pointerdown", handleDown);
    canvasEl.addEventListener("pointerup", handleUp);
    return () => {
      canvasEl.removeEventListener("pointermove", handleMove);
      canvasEl.removeEventListener("pointerleave", handleLeave);
      canvasEl.removeEventListener("pointercancel", handleLeave);
      canvasEl.removeEventListener("pointerdown", handleDown);
      canvasEl.removeEventListener("pointerup", handleUp);
    };
  }, [canvasEl, sim.world]);

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Canvas em tela cheia */}
      {size.width > 0 && (
        <Canvas
          width={size.width}
          height={size.height}
          onCanvasReady={setCanvasEl}
        />
      )}

      {/* Botão flutuante toggle do painel (oculto em modo bg — iframe pai fornece o próprio) */}
      {!bgMode && (
        <button
          onClick={() => setPanelOpen((v) => !v)}
          aria-label={panelOpen ? "Fechar painel" : "Abrir painel (tecla L)"}
          title={panelOpen ? "Fechar (L)" : "Abrir painel (L)"}
          className="fixed bottom-5 right-5 z-50 w-12 h-12 rounded-full flex items-center justify-center text-lg shadow-lg border border-cyan-400/40 bg-neutral-950/80 hover:bg-neutral-900 text-cyan-300 backdrop-blur-md transition-all"
          style={{
            boxShadow: panelOpen
              ? "0 0 20px rgba(0,245,255,0.45)"
              : "0 0 12px rgba(0,245,255,0.25)",
          }}
        >
          {panelOpen ? "×" : "🫧"}
        </button>
      )}

      {/* Hint inicial */}
      {!bgMode && !panelOpen && (
        <div className="fixed bottom-6 right-20 z-40 pointer-events-none text-xs text-cyan-300/70 font-mono select-none hidden sm:block">
          pressione <kbd className="px-1.5 py-0.5 rounded bg-neutral-900/80 border border-cyan-400/30">L</kbd>
        </div>
      )}

      {/* Painel deslizante */}
      <div
        className={`fixed top-0 right-0 z-40 h-screen transition-transform duration-300 ease-out ${
          panelOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
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
    </div>
  );
}
