"use client";

import { useEffect, useRef, useState } from "react";
import type { World } from "@/types/world";

interface GyroButtonProps {
  world: World | null;
}

type PermissionState = "idle" | "granted" | "denied" | "unsupported";

interface DeviceOrientationEventIOS extends DeviceOrientationEvent {
  requestPermission?: () => Promise<"granted" | "denied">;
}

interface DeviceMotionEventIOS extends DeviceMotionEvent {
  requestPermission?: () => Promise<"granted" | "denied">;
}

export function GyroButton({ world }: GyroButtonProps) {
  const [status, setStatus] = useState<PermissionState>("idle");
  const [sample, setSample] = useState<{ x: number; y: number; src: string } | null>(
    null,
  );
  const orientRef = useRef<((e: DeviceOrientationEvent) => void) | null>(null);
  const motionRef = useRef<((e: DeviceMotionEvent) => void) | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("DeviceOrientationEvent" in window) && !("DeviceMotionEvent" in window)) {
      setStatus("unsupported");
    }
  }, []);

  const startListening = () => {
    if (!world) return;

    // devicemotion dá accelerationIncludingGravity — no Android é mais
    // confiável que deviceorientation. Ambos ficam ativos; quem disparar
    // por último ganha (geralmente motion em Android, orientation em iOS).
    const motionHandler = (e: DeviceMotionEvent) => {
      const g = e.accelerationIncludingGravity;
      if (!g || g.x == null || g.y == null) return;
      // gravidade típica em repouso: (0, -9.81, 0) com tela pra cima
      // clamp em ±6 m/s² (≈30° de inclinação) e normaliza
      const tx = Math.max(-1, Math.min(1, -(g.x ?? 0) / 6));
      const ty = Math.max(-1, Math.min(1, (g.y ?? 0) / 6));
      world.tilt.x = tx;
      world.tilt.y = ty;
      world.tilt.active = true;
      setSample({ x: tx, y: ty, src: "motion" });
    };
    const orientHandler = (e: DeviceOrientationEvent) => {
      const beta = e.beta ?? 0;
      const gamma = e.gamma ?? 0;
      const tx = Math.max(-1, Math.min(1, gamma / 45));
      const ty = Math.max(-1, Math.min(1, beta / 45));
      // Só sobrescreve se devicemotion não estiver alimentando
      if (!motionRef.current || sample?.src !== "motion") {
        world.tilt.x = tx;
        world.tilt.y = ty;
        world.tilt.active = true;
        setSample({ x: tx, y: ty, src: "orient" });
      }
    };

    motionRef.current = motionHandler;
    orientRef.current = orientHandler;
    window.addEventListener("devicemotion", motionHandler);
    window.addEventListener("deviceorientation", orientHandler);
    setStatus("granted");
  };

  const activate = async () => {
    if (status === "unsupported") return;
    const OrientCtor = (window as unknown as {
      DeviceOrientationEvent?: DeviceOrientationEventIOS;
    }).DeviceOrientationEvent;
    const MotionCtor = (window as unknown as {
      DeviceMotionEvent?: DeviceMotionEventIOS;
    }).DeviceMotionEvent;

    const needsOrient =
      OrientCtor &&
      typeof (OrientCtor as unknown as { requestPermission?: unknown })
        .requestPermission === "function";
    const needsMotion =
      MotionCtor &&
      typeof (MotionCtor as unknown as { requestPermission?: unknown })
        .requestPermission === "function";

    try {
      if (needsOrient) {
        const r = await (
          OrientCtor as unknown as { requestPermission: () => Promise<"granted" | "denied"> }
        ).requestPermission();
        if (r !== "granted") {
          setStatus("denied");
          return;
        }
      }
      if (needsMotion) {
        await (
          MotionCtor as unknown as { requestPermission: () => Promise<"granted" | "denied"> }
        ).requestPermission();
      }
      startListening();
    } catch {
      setStatus("denied");
    }
  };

  const deactivate = () => {
    if (orientRef.current) {
      window.removeEventListener("deviceorientation", orientRef.current);
      orientRef.current = null;
    }
    if (motionRef.current) {
      window.removeEventListener("devicemotion", motionRef.current);
      motionRef.current = null;
    }
    if (world) {
      world.tilt.active = false;
      world.tilt.x = 0;
      world.tilt.y = 0;
    }
    setSample(null);
    setStatus("idle");
  };

  useEffect(() => {
    return () => {
      if (orientRef.current) window.removeEventListener("deviceorientation", orientRef.current);
      if (motionRef.current) window.removeEventListener("devicemotion", motionRef.current);
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
      <div className="flex flex-col gap-1">
        <button
          onClick={deactivate}
          className="w-full rounded bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-300 text-sm py-1.5 transition-colors"
        >
          Giroscópio ativo — desligar
        </button>
        <div className="text-[10px] font-mono text-neutral-500 flex justify-between px-1">
          <span>src: {sample?.src ?? "—"}</span>
          <span>
            x:{(sample?.x ?? 0).toFixed(2)} y:{(sample?.y ?? 0).toFixed(2)}
          </span>
        </div>
      </div>
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
