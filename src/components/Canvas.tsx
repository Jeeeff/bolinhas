"use client";

import { forwardRef, useEffect, useRef } from "react";

interface CanvasProps {
  width: number;
  height: number;
  onCanvasReady?: (canvas: HTMLCanvasElement) => void;
}

export const Canvas = forwardRef<HTMLCanvasElement, CanvasProps>(function Canvas(
  { width, height, onCanvasReady },
  ref,
) {
  const internalRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (internalRef.current && onCanvasReady) {
      onCanvasReady(internalRef.current);
    }
  }, [onCanvasReady]);

  return (
    <canvas
      ref={(node) => {
        internalRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      }}
      width={width}
      height={height}
      className="block bg-neutral-100 dark:bg-neutral-900"
      style={{ width, height }}
    />
  );
});
