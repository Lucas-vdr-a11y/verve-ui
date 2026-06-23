import { useEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { cn } from "../../../utils/cn";
import {
  resolveScope,
  useCursorEnabled,
  type CursorScope,
} from "../useCursorEngine";
import "./SpotlightCursor.css";

export interface SpotlightCursorProps {
  /** Scope to a container instead of the whole window. */
  containerRef?: CursorScope;
  /** Radius of the fully-transparent hole, in px. @default 120 */
  radius?: number;
  /** Soft falloff distance beyond the hole, in px. @default 80 */
  softness?: number;
  /** Color of the surrounding dark overlay (any CSS color). @default near-black */
  overlayColor?: string;
  /** Easing factor for the hole following the pointer (0–1). @default 0.16 */
  ease?: number;
  className?: string;
}

/**
 * A dark overlay with a transparent radial "flashlight" hole that follows the
 * pointer — a reveal-in-the-dark effect. Content behind the overlay shows
 * through the hole. Pointer events pass through so the page stays interactive.
 */
export function SpotlightCursor({
  containerRef,
  radius = 120,
  softness = 80,
  overlayColor,
  ease = 0.16,
  className,
}: SpotlightCursorProps) {
  const enabled = useCursorEnabled();
  const [host, setHost] = useState<Element | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled) return;
    setHost(resolveScope(containerRef) ?? document.body);
  }, [enabled, containerRef]);

  useEffect(() => {
    if (!enabled || !host) return;
    const overlay = overlayRef.current!;
    const scoped = host !== document.body;

    let raf = 0;
    let tx = -9999;
    let ty = -9999;
    let x = -9999;
    let y = -9999;

    const onMove = (e: PointerEvent) => {
      if (scoped) {
        const r = (host as HTMLElement).getBoundingClientRect();
        tx = e.clientX - r.left;
        ty = e.clientY - r.top;
      } else {
        tx = e.clientX;
        ty = e.clientY;
      }
      overlay.classList.add("nova-spotlight-cursor__overlay--visible");
    };
    const onLeave = () => {
      overlay.classList.remove("nova-spotlight-cursor__overlay--visible");
    };

    const loop = () => {
      x += (tx - x) * ease;
      y += (ty - y) * ease;
      overlay.style.setProperty("--nova-spotlight-cursor-x", `${x}px`);
      overlay.style.setProperty("--nova-spotlight-cursor-y", `${y}px`);
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
    "--nova-spotlight-cursor-radius": `${radius}px`,
    "--nova-spotlight-cursor-soft": `${radius + softness}px`,
    ...(overlayColor
      ? { "--nova-spotlight-cursor-overlay": overlayColor }
      : {}),
  } as CSSProperties;

  return createPortal(
    <div
      ref={overlayRef}
      className={cn(
        "nova-spotlight-cursor__overlay",
        scoped && "nova-spotlight-cursor__overlay--scoped",
        className,
      )}
      style={vars}
      aria-hidden="true"
    />,
    host,
  );
}
