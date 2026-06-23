import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import type { CSSProperties, ReactNode } from "react";
import { cn } from "../../../utils/cn";
import { useReducedMotion } from "../../utility/useReducedMotion";
import "./CardCarousel3D.css";

export interface CardCarousel3DItem {
  id: string;
  content: ReactNode;
  label?: string;
}

export interface CardCarousel3DProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** Cards arranged around the ring. */
  items: CardCarousel3DItem[];
  /** Controlled front index. */
  value?: number;
  /** Uncontrolled initial front index. @default 0 */
  defaultValue?: number;
  /** Fired when the front card changes. */
  onChange?: (index: number) => void;
  /** Card width in px. @default 240 */
  cardWidth?: number;
  /** Card height in px. @default 320 */
  cardHeight?: number;
  /** Auto-advance every N ms. `0` disables. @default 0 */
  autoplay?: number;
  /** Allow dragging to spin the ring. @default true */
  draggable?: boolean;
}

/**
 * A rotating 3D ring of cards. Items sit evenly around a cylinder; the ring
 * rotates to bring the selected card to the front. Auto-advance freezes under
 * reduced-motion; keyboard + drag move selection.
 */
export const CardCarousel3D = forwardRef<HTMLDivElement, CardCarousel3DProps>(
  function CardCarousel3D(
    {
      items,
      value,
      defaultValue = 0,
      onChange,
      cardWidth = 240,
      cardHeight = 320,
      autoplay = 0,
      draggable = true,
      className,
      style,
      ...rest
    },
    ref
  ) {
    const reduced = useReducedMotion();
    const isControlled = value != null;
    const count = items.length;
    const [internal, setInternal] = useState(defaultValue);
    const active = isControlled ? (value as number) : internal;
    const baseId = useId();

    const go = useCallback(
      (next: number) => {
        if (!isControlled) setInternal(next);
        // Normalise to 0..count-1 for the reported index.
        const norm = ((next % count) + count) % count;
        onChange?.(norm);
      },
      [count, isControlled, onChange]
    );

    // Radius so cards do not overlap: half-width / tan(pi/n).
    const radius =
      count > 1
        ? Math.round(cardWidth / 2 / Math.tan(Math.PI / count)) + 40
        : 0;

    const ringRotation = -(active * (360 / Math.max(1, count)));

    // ---- Autoplay ---------------------------------------------------------
    const [hovered, setHovered] = useState(false);
    useEffect(() => {
      if (autoplay <= 0 || reduced || hovered || count <= 1) return;
      if (typeof window === "undefined") return;
      const id = window.setInterval(() => go(activeRef.current + 1), autoplay);
      return () => window.clearInterval(id);
    }, [autoplay, reduced, hovered, count, go]);

    // Keep a ref so the interval reads the latest index without resubscribing.
    const activeRef = useRef(active);
    useEffect(() => {
      activeRef.current = active;
    }, [active]);

    // ---- Drag to spin -----------------------------------------------------
    const stageRef = useRef<HTMLDivElement | null>(null);
    const drag = useRef<{ startX: number; pointerId: number } | null>(null);
    useEffect(() => {
      const node = stageRef.current;
      if (node == null || !draggable) return;

      const onDown = (e: PointerEvent) => {
        drag.current = { startX: e.clientX, pointerId: e.pointerId };
        node.setPointerCapture?.(e.pointerId);
      };
      const onMove = (e: PointerEvent) => {
        if (drag.current == null) return;
        const dx = e.clientX - drag.current.startX;
        const step = Math.max(50, cardWidth * 0.4);
        if (Math.abs(dx) >= step) {
          go(activeRef.current + (dx < 0 ? 1 : -1));
          drag.current.startX = e.clientX;
        }
      };
      const end = (e: PointerEvent) => {
        if (drag.current == null) return;
        node.releasePointerCapture?.(drag.current.pointerId);
        drag.current = null;
        void e;
      };

      node.addEventListener("pointerdown", onDown);
      node.addEventListener("pointermove", onMove);
      node.addEventListener("pointerup", end);
      node.addEventListener("pointercancel", end);
      return () => {
        node.removeEventListener("pointerdown", onDown);
        node.removeEventListener("pointermove", onMove);
        node.removeEventListener("pointerup", end);
        node.removeEventListener("pointercancel", end);
      };
    }, [draggable, cardWidth, go]);

    const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        go(active - 1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        go(active + 1);
      }
    };

    const cssVars: CSSProperties = {
      ["--nova-carousel3d-w" as string]: `${cardWidth}px`,
      ["--nova-carousel3d-h" as string]: `${cardHeight}px`,
      ["--nova-carousel3d-radius" as string]: `${radius}px`,
      ["--nova-carousel3d-rotation" as string]: `${ringRotation}deg`,
    };

    const normActive = ((active % count) + count) % count;

    return (
      <div
        ref={ref}
        className={cn("nova-carousel3d", className)}
        style={{ ...cssVars, ...style }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        {...rest}
      >
        <div
          ref={stageRef}
          className="nova-carousel3d__stage"
          role="listbox"
          aria-label="Card carousel"
          aria-activedescendant={`${baseId}-card-${normActive}`}
          tabIndex={0}
          onKeyDown={onKeyDown}
        >
          <div className="nova-carousel3d__ring">
            {items.map((item, i) => {
              const angle = (360 / count) * i;
              const itemVars: CSSProperties = {
                ["--nova-carousel3d-angle" as string]: `${angle}deg`,
              };
              return (
                <div
                  key={item.id}
                  id={`${baseId}-card-${i}`}
                  role="option"
                  aria-selected={i === normActive}
                  aria-label={item.label}
                  className={cn(
                    "nova-carousel3d__card",
                    i === normActive && "nova-carousel3d__card--front"
                  )}
                  style={itemVars}
                  onClick={() => go(active + shortestDelta(normActive, i, count))}
                >
                  <div className="nova-carousel3d__face">{item.content}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
);

/** Signed step from `from` to `to` taking the shorter way round the ring. */
function shortestDelta(from: number, to: number, count: number): number {
  let d = to - from;
  d = ((d % count) + count) % count;
  if (d > count / 2) d -= count;
  return d;
}
