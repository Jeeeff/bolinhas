"use client";

import { useEffect, useRef, useState } from "react";
import type { World } from "@/types/world";

interface GyroButtonProps {
  world: World | null;
}

type PermissionState = "idle" | "granted" | "denied" | "unsupported";

// iOS 13+ exige permissão via gesto do usuário
interface DeviceOrientationEventIOS extends DeviceOrientationEvent {
  requestPermission?: () => Promise<"granted" | "denied">;
}

export function GyroButton({ world }: GyroButtonProps) {
  const [status, setStatus] = useState<PermissionState>("idle");
  const listenerRef = useRef<((e: DeviceOrientationEvent) => void) | null>(null);

  // Detectar suporte
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("DeviceOrientationEvent" in window)) {
      setStatus("unsupported");
    }
  }, []);

  const startListening = () => {
    if (!world) return;
    const handler = (e: DeviceOrientationEvent) => {
      // beta:  -180..180  (frente/trás)
      // gamma: -90..90    (lateral)
      const beta = e.beta ?? 0;
      const gamma = e.gamma ?? 0;
      // Normaliza em -1..1 com clamp em ±45° pra resposta confortável
      const tx = Math.max(-1, Math.min(1, gamma / 45));
      const ty = Math.max(-1, Math.min(1, beta / 45));
      world.tilt.x = tx;
      world.tilt.y = ty;
      world.tilt.active = true;
    };
    listenerRef.current = handler;
    window.addEventListener("deviceorientation", handler);
    setStatus("granted");
  };

  const activate = async () => {
    if (status === "unsupported") return;
    const Ctor = (window as unknown as { DeviceOrientationEvent?: DeviceOrientationEventIOS })
      .DeviceOrientationEvent;
    const needsPermission =
      Ctor && typeof (Ctor as unknown as { requestPermission?: unknown }).requestPermission === "function";

    if (needsPermission) {
      try {
        const result = await (
          Ctor as unknown as { requestPermission: () => Promise<"granted" | "denied"> }
        ).requestPermission();
        if (result === "granted") startListening();
        else setStatus("denied");
      } catch {
        setStatus("denied");
      }
    } else {
      startListening();
    }
  };

  const deactivate = () => {
    if (listenerRef.current) {
      window.removeEventListener("deviceorientation", listenerRef.current);
      listenerRef.current = null;
    }
    if (world) {
      world.tilt.active = false;
      world.tilt.x = 0;
      world.tilt.y = 0;
    }
    setStatus("idle");
  };

  // cleanup on unmount
  useEffect(() => {
    return () => {
      if (listenerRef.current) {
        window.removeEventListener("deviceorientation", listenerRef.current);
      }
    };
  }, []);

  if (status === "unsupported") {
    return (
      <div className="text-xs text-neutral-500 italic py-2">
        Giroscópio indisponível neste dispositivo
      </div>
    );
  }

  if (status === "granted") {
    return (
      <button
        onClick={deactivate}
        className="w-full rounded bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-300 text-sm py-1.5 transition-colors"
      >
        Giroscópio ativo — desligar
      </button>
    );
  }

  if (status === "denied") {
    return (
      <div className="flex flex-col gap-1">
        <button
          onClick={activate}
          className="w-full rounded bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-sm py-1.5"
        >
          Tentar de novo
        </button>
        <span className="text-xs text-red-400/80">
          Permissão negada. Ative no celular e tente novamente.
        </span>
      </div>
    );
  }

  return (
    <button
      onClick={activate}
      className="w-full rounded bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-sm py-1.5"
    >
      Ativar giroscópio
    </button>
  );
}
