import { useEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { cn } from "../../../utils/cn";
import {
  resolveScope,
  useCursorEnabled,
  type CursorScope,
} from "../useCursorEngine";
import "./CursorGlow.css";

export interface CursorGlowProps {
  /** Scope to a container instead of the whole window. */
  containerRef?: CursorScope;
  /** Diameter of the glow, in px. @default 320 */
  size?: number;
  /** Easing factor for the glow following the pointer (0–1). @default 0.12 */
  ease?: number;
  /** Glow tint (any CSS color). Defaults to the brand color. */
  color?: string;
  /** Peak opacity of the glow (0–1). @default 0.35 */
  intensity?: number;
  /**
   * Use the `screen` blend mode (additive) so the glow lightens whatever is
   * underneath — ideal over dark sections. @default true
   */
  additive?: boolean;
  className?: string;
}

/**
 * A soft, tintable glowing light that follows the pointer. Uses an additive
 * (`screen`) blend mode by default so it reads as light over dark sections.
 * Pointer events pass through.
 */
export function CursorGlow({
  containerRef,
  size = 320,
  ease = 0.12,
  color,
  intensity = 0.35,
  additive = true,
  className,
}: CursorGlowProps) {
  const enabled = useCursorEnabled();
  const [host, setHost] = useState<Element | null>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled) return;
    setHost(resolveScope(containerRef) ?? document.body);
  }, [enabled, containerRef]);

  useEffect(() => {
    if (!enabled || !host) return;
    const glow = glowRef.current!;
    const scoped = host !== document.body;

    let raf = 0;
    let tx = 0;
    let ty = 0;
    let x = 0;
    let y = 0;
    let visible = false;

    const onMove = (e: PointerEvent) => {
      if (scoped) {
        const r = (host as HTMLElement).getBoundingClientRect();
        tx = e.clientX - r.left;
        ty = e.clientY - r.top;
      } else {
        tx = e.clientX;
        ty = e.clientY;
      }
      if (!visible) {
        visible = true;
        x = tx;
        y = ty;
        glow.classList.add("nova-cursor-glow__light--visible");
      }
    };
    const onLeave = () => {
      visible = false;
      glow.classList.remove("nova-cursor-glow__light--visible");
    };

    const loop = () => {
      x += (tx - x) * ease;
      y += (ty - y) * ease;
      glow.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
      raf = requestAnimationFrame(loop);
    };

    const moveTarget = scoped ? host : window;
    const leaveTarget = scoped ? host : document;
    moveTarget.addEventListener("pointermove", onMove as EventListener, {
      passive: true,
    });
    leaveTarget.addEventListener("pointerleave", onLeave as EventListener);
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      moveTarget.removeEventListener("pointermove", onMove as EventListener);
      leaveTarget.removeEventListener("pointerleave", onLeave as EventListener);
    };
  }, [enabled, host, ease]);

  if (!enabled || !host) return null;

  const scoped = host !== document.body;
  const vars = {
    "--nova-cursor-glow-size": `${size}px`,
    "--nova-cursor-glow-intensity": String(intensity),
    ...(color ? { "--nova-cursor-glow-color": color } : {}),
  } as CSSProperties;

  return createPortal(
    <div
      className={cn(
        "nova-cursor-glow",
        scoped && "nova-cursor-glow--scoped",
        className,
      )}
      style={vars}
      aria-hidden="true"
    >
      <div
        ref={glowRef}
        className={cn(
          "nova-cursor-glow__light",
          additive && "nova-cursor-glow__light--additive",
        )}
      />
    </div>,
    host,
  );
}
