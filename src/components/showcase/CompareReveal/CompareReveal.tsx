import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { cn } from "../../../utils/cn";
import { useReducedMotion } from "../../utility/useReducedMotion/useReducedMotion";
import "./CompareReveal.css";

export interface CompareRevealProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** "Before" content (full width, underneath). */
  before: React.ReactNode;
  /** "After" content (revealed by the divider, on top). */
  after: React.ReactNode;
  /** Interaction mode. Defaults `"hover"`. */
  mode?: "hover" | "drag";
  /** Starting divider position, 0–100. Defaults `50`. */
  initial?: number;
  /** Auto-sweep the divider back and forth when idle. Defaults `false`. */
  autoplay?: boolean;
  /** Accessible label for the slider. Defaults `"Compare before and after"`. */
  label?: string;
}

/**
 * CompareReveal — a content-agnostic before/after card. A glowing vertical
 * divider wipes between the two states. In `hover` mode the divider tracks the
 * pointer; in `drag` mode it is a keyboard-operable slider (arrow keys), and
 * `autoplay` gently sweeps it when untouched. SSR-safe (autoplay rAF lives in
 * an effect, cleaned up) and the autoplay sweep is disabled under
 * reduced-motion.
 */
export const CompareReveal = forwardRef<HTMLDivElement, CompareRevealProps>(
  function CompareReveal(
    {
      before,
      after,
      mode = "hover",
      initial = 50,
      autoplay = false,
      label = "Compare before and after",
      className,
      onPointerMove,
      ...rest
    },
    ref
  ) {
    const reduced = useReducedMotion();
    const localRef = useRef<HTMLDivElement | null>(null);
    const rafRef = useRef<number | null>(null);
    const [pos, setPos] = useState(initial);
    const [interacting, setInteracting] = useState(false);
    const draggingRef = useRef(false);

    const setRefs = (node: HTMLDivElement | null) => {
      localRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    };

    const setFromClientX = useCallback((clientX: number) => {
      const node = localRef.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      const pct = ((clientX - rect.left) / rect.width) * 100;
      setPos(Math.min(100, Math.max(0, pct)));
    }, []);

    // Hover mode: divider follows the pointer.
    const handlePointerMove: React.PointerEventHandler<HTMLDivElement> = (e) => {
      if (mode === "hover") {
        setInteracting(true);
        setFromClientX(e.clientX);
      } else if (draggingRef.current) {
        setFromClientX(e.clientX);
      }
      onPointerMove?.(e);
    };

    // Drag mode handlers.
    const handlePointerDown: React.PointerEventHandler<HTMLDivElement> = (e) => {
      if (mode !== "drag") return;
      draggingRef.current = true;
      setInteracting(true);
      (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
      setFromClientX(e.clientX);
    };
    const handlePointerUp = () => {
      draggingRef.current = false;
    };

    const handleLeave = () => {
      if (mode === "hover") setInteracting(false);
    };

    const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
      if (mode !== "drag") return;
      if (e.key === "ArrowLeft") {
        setInteracting(true);
        setPos((p) => Math.max(0, p - 4));
      } else if (e.key === "ArrowRight") {
        setInteracting(true);
        setPos((p) => Math.min(100, p + 4));
      }
    };

    // Autoplay sweep when idle.
    useEffect(() => {
      if (!autoplay || reduced || interacting || typeof window === "undefined") {
        return;
      }
      let start: number | null = null;
      const tick = (t: number) => {
        if (start == null) start = t;
        const elapsed = (t - start) / 1000;
        // Ease in/out sine between 15% and 85%.
        const v = 50 + 35 * Math.sin(elapsed * 0.8);
        setPos(v);
        rafRef.current = window.requestAnimationFrame(tick);
      };
      rafRef.current = window.requestAnimationFrame(tick);
      return () => {
        if (rafRef.current != null) window.cancelAnimationFrame(rafRef.current);
      };
    }, [autoplay, reduced, interacting]);

    return (
      <div
        ref={setRefs}
        className={cn(
          "nova-compare-reveal",
          `nova-compare-reveal--${mode}`,
          className
        )}
        style={{ "--nova-cr-pos": `${pos}%` } as React.CSSProperties}
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handleLeave}
        onKeyDown={handleKeyDown}
        role="slider"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pos)}
        tabIndex={mode === "drag" ? 0 : undefined}
        {...rest}
      >
        <div className="nova-compare-reveal__layer nova-compare-reveal__before">
          {before}
        </div>
        <div
          className="nova-compare-reveal__layer nova-compare-reveal__after"
          aria-hidden="true"
        >
          {after}
        </div>
        <div className="nova-compare-reveal__divider" aria-hidden="true">
          <span className="nova-compare-reveal__handle" />
        </div>
      </div>
    );
  }
);
