import { useEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { cn } from "../../../utils/cn";
import {
  resolveScope,
  useCursorEnabled,
  type CursorScope,
} from "../useCursorEngine";
import "./TextCursor.css";

export interface TextCursorProps {
  /** Scope to a container instead of the whole window. */
  containerRef?: CursorScope;
  /**
   * Default label shown while a custom cursor is active. Leave empty to only
   * show a label when hovering a `[data-cursor-text]` target.
   */
  label?: string;
  /**
   * CSS selector for elements that reveal the label on hover. The label text is
   * taken from each element's `data-cursor-text` attribute (falling back to
   * `label`). @default "[data-cursor-text]"
   */
  targetSelector?: string;
  /** Diameter of the trailing puck, in px. @default 64 */
  size?: number;
  /** Easing factor for movement (0–1). @default 0.16 */
  ease?: number;
  /** Only render the label puck while hovering a target. @default true */
  revealOnly?: boolean;
  className?: string;
}

/**
 * A label/text that trails the cursor (e.g. "view", "drag"). By default the
 * puck is hidden and reveals when the pointer enters a `[data-cursor-text]`
 * target, morphing to that element's `data-cursor-text` value.
 */
export function TextCursor({
  containerRef,
  label = "",
  targetSelector = "[data-cursor-text]",
  size = 64,
  ease = 0.16,
  revealOnly = true,
  className,
}: TextCursorProps) {
  const enabled = useCursorEnabled();
  const [host, setHost] = useState<Element | null>(null);
  const puckRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!enabled) return;
    setHost(resolveScope(containerRef) ?? document.body);
  }, [enabled, containerRef]);

  useEffect(() => {
    if (!enabled || !host) return;
    const puck = puckRef.current!;
    const labelEl = labelRef.current!;
    const scoped = host !== document.body;

    let raf = 0;
    let tx = 0;
    let ty = 0;
    let x = 0;
    let y = 0;
    let started = false;

    const setActive = (active: boolean, text: string) => {
      labelEl.textContent = text;
      puck.classList.toggle("nova-text-cursor__puck--active", active);
    };

    const onMove = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      if (!started) {
        started = true;
        x = tx;
        y = ty;
      }
      const el = (e.target as Element | null)?.closest?.(targetSelector) as
        | HTMLElement
        | null;
      if (el) {
        const text = el.dataset.cursorText || label;
        setActive(true, text);
      } else if (!revealOnly && label) {
        setActive(true, label);
      } else {
        setActive(false, label);
      }
    };
    const onLeave = () => setActive(false, label);

    const loop = () => {
      x += (tx - x) * ease;
      y += (ty - y) * ease;
      puck.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
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
  }, [enabled, host, ease, label, targetSelector, revealOnly]);

  if (!enabled || !host) return null;

  const vars = { "--nova-text-cursor-size": `${size}px` } as CSSProperties;

  return createPortal(
    <div
      className={cn("nova-text-cursor", className)}
      style={vars}
      aria-hidden="true"
    >
      <div ref={puckRef} className="nova-text-cursor__puck">
        <span ref={labelRef} className="nova-text-cursor__label">
          {label}
        </span>
      </div>
    </div>,
    host,
  );
}
