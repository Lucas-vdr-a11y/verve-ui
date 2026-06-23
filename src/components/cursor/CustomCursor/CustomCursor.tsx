import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "../../../utils/cn";
import {
  resolveScope,
  useCursorEnabled,
  type CursorScope,
} from "../useCursorEngine";
import "./CustomCursor.css";

export interface CustomCursorProps {
  /**
   * Scope the cursor to a container instead of the whole window. When set, the
   * native cursor is hidden only inside that element and the custom cursor only
   * appears while the pointer is over it.
   */
  containerRef?: CursorScope;
  /** Diameter of the inner dot, in px. @default 8 */
  dotSize?: number;
  /** Diameter of the trailing ring, in px. @default 36 */
  ringSize?: number;
  /** Easing factor for the trailing ring (0–1; lower = more lag). @default 0.18 */
  ease?: number;
  /**
   * Scale applied to the ring when hovering an interactive / `[data-cursor]`
   * element. @default 1.8
   */
  hoverScale?: number;
  /** Hide the OS cursor within scope. @default true */
  hideNativeCursor?: boolean;
  className?: string;
}

const INTERACTIVE =
  'a,button,input,textarea,select,label,summary,[role="button"],[data-cursor]';

/**
 * Classic two-element custom cursor: a crisp dot pinned to the pointer plus a
 * larger ring that eases toward it. The ring grows when hovering interactive or
 * `[data-cursor]` elements.
 */
export function CustomCursor({
  containerRef,
  dotSize = 8,
  ringSize = 36,
  ease = 0.18,
  hoverScale = 1.8,
  hideNativeCursor = true,
  className,
}: CustomCursorProps) {
  const enabled = useCursorEnabled();
  const [host, setHost] = useState<Element | null>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  // Resolve the host element (scope or document.body) after mount.
  useEffect(() => {
    if (!enabled) return;
    setHost(resolveScope(containerRef) ?? document.body);
  }, [enabled, containerRef]);

  useEffect(() => {
    if (!enabled || !host) return;
    const target =
      host === document.body
        ? (document.documentElement as HTMLElement)
        : (host as HTMLElement);

    const prevCursor = target.style.cursor;
    if (hideNativeCursor) target.style.cursor = "none";

    let raf = 0;
    let mx = 0;
    let my = 0;
    let rx = 0;
    let ry = 0;
    let visible = false;

    const dot = dotRef.current!;
    const ring = ringRef.current!;

    const onMove = (e: PointerEvent) => {
      mx = e.clientX;
      my = e.clientY;
      if (!visible) {
        visible = true;
        rx = mx;
        ry = my;
        dot.classList.add("nova-custom-cursor__dot--visible");
        ring.classList.add("nova-custom-cursor__ring--visible");
      }
      dot.style.transform = `translate3d(${mx}px, ${my}px, 0) translate(-50%, -50%)`;

      const el = e.target as Element | null;
      const hover = !!el?.closest?.(INTERACTIVE);
      ring.classList.toggle("nova-custom-cursor__ring--hover", hover);
    };

    const onLeave = () => {
      visible = false;
      dot.classList.remove("nova-custom-cursor__dot--visible");
      ring.classList.remove("nova-custom-cursor__ring--visible");
    };

    const loop = () => {
      rx += (mx - rx) * ease;
      ry += (my - ry) * ease;
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`;
      raf = requestAnimationFrame(loop);
    };

    const moveTarget = host === document.body ? window : host;
    moveTarget.addEventListener("pointermove", onMove as EventListener, {
      passive: true,
    });
    (host === document.body ? document : host).addEventListener(
      "pointerleave",
      onLeave as EventListener,
    );
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      moveTarget.removeEventListener("pointermove", onMove as EventListener);
      (host === document.body ? document : host).removeEventListener(
        "pointerleave",
        onLeave as EventListener,
      );
      target.style.cursor = prevCursor;
    };
  }, [enabled, host, ease, hideNativeCursor]);

  if (!enabled || !host) return null;

  const vars = {
    "--nova-custom-cursor-dot": `${dotSize}px`,
    "--nova-custom-cursor-ring": `${ringSize}px`,
    "--nova-custom-cursor-hover-scale": String(hoverScale),
  } as CSSProperties;

  return createPortal(
    <div
      className={cn("nova-custom-cursor", className)}
      style={vars}
      aria-hidden="true"
    >
      <div ref={ringRef} className="nova-custom-cursor__ring" />
      <div ref={dotRef} className="nova-custom-cursor__dot" />
    </div>,
    host,
  );
}
