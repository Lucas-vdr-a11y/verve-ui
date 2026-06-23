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
import "./Coverflow.css";

export interface CoverflowItem {
  /** Stable unique key. */
  id: string;
  /** Cover content (image, card, …). */
  content: ReactNode;
  /** Accessible label for this cover. */
  label?: string;
}

export interface CoverflowProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** Covers to render. */
  items: CoverflowItem[];
  /** Controlled active index. */
  value?: number;
  /** Uncontrolled initial index. @default 0 */
  defaultValue?: number;
  /** Fired when the active index changes. */
  onChange?: (index: number) => void;
  /** Pixel width of each cover. @default 220 */
  coverSize?: number;
  /** Show prev/next arrow buttons. @default true */
  arrows?: boolean;
}

/**
 * iTunes-style coverflow carousel. The centered cover sits flat and large while
 * neighbours rotate away into perspective. Drag, arrows, and keyboard arrows
 * move selection.
 */
export const Coverflow = forwardRef<HTMLDivElement, CoverflowProps>(
  function Coverflow(
    {
      items,
      value,
      defaultValue = 0,
      onChange,
      coverSize = 220,
      arrows = true,
      className,
      style,
      ...rest
    },
    ref
  ) {
    const isControlled = value != null;
    const [internal, setInternal] = useState(() =>
      clamp(defaultValue, 0, Math.max(0, items.length - 1))
    );
    const active = clamp(
      isControlled ? (value as number) : internal,
      0,
      Math.max(0, items.length - 1)
    );
    const baseId = useId();

    const setActive = useCallback(
      (next: number) => {
        const clamped = clamp(next, 0, items.length - 1);
        if (clamped === active) return;
        if (!isControlled) setInternal(clamped);
        onChange?.(clamped);
      },
      [active, isControlled, items.length, onChange]
    );

    // ---- Drag handling (pointer events, in-effect cleanup) ----------------
    const trackRef = useRef<HTMLDivElement | null>(null);
    const drag = useRef<{ startX: number; pointerId: number } | null>(null);

    useEffect(() => {
      const node = trackRef.current;
      if (node == null) return;

      const onPointerDown = (e: PointerEvent) => {
        drag.current = { startX: e.clientX, pointerId: e.pointerId };
        node.setPointerCapture?.(e.pointerId);
      };
      const onPointerMove = (e: PointerEvent) => {
        if (drag.current == null) return;
        const dx = e.clientX - drag.current.startX;
        const threshold = Math.max(40, coverSize * 0.3);
        if (Math.abs(dx) >= threshold) {
          setActive(active + (dx < 0 ? 1 : -1));
          drag.current.startX = e.clientX;
        }
      };
      const endDrag = (e: PointerEvent) => {
        if (drag.current == null) return;
        node.releasePointerCapture?.(drag.current.pointerId);
        drag.current = null;
        void e;
      };

      node.addEventListener("pointerdown", onPointerDown);
      node.addEventListener("pointermove", onPointerMove);
      node.addEventListener("pointerup", endDrag);
      node.addEventListener("pointercancel", endDrag);
      return () => {
        node.removeEventListener("pointerdown", onPointerDown);
        node.removeEventListener("pointermove", onPointerMove);
        node.removeEventListener("pointerup", endDrag);
        node.removeEventListener("pointercancel", endDrag);
      };
    }, [active, coverSize, setActive]);

    const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setActive(active - 1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setActive(active + 1);
      } else if (e.key === "Home") {
        e.preventDefault();
        setActive(0);
      } else if (e.key === "End") {
        e.preventDefault();
        setActive(items.length - 1);
      }
    };

    const cssVars: CSSProperties = {
      ["--nova-coverflow-size" as string]: `${coverSize}px`,
    };

    return (
      <div
        ref={ref}
        className={cn("nova-coverflow", className)}
        style={{ ...cssVars, ...style }}
        {...rest}
      >
        <div
          ref={trackRef}
          className="nova-coverflow__stage"
          role="listbox"
          aria-label="Coverflow"
          aria-activedescendant={`${baseId}-item-${active}`}
          tabIndex={0}
          onKeyDown={onKeyDown}
        >
          <div className="nova-coverflow__track">
            {items.map((item, i) => {
              const offset = i - active;
              const abs = Math.abs(offset);
              const selected = offset === 0;
              const itemVars: CSSProperties = {
                ["--nova-coverflow-offset" as string]: String(offset),
                ["--nova-coverflow-abs" as string]: String(abs),
                ["--nova-coverflow-sign" as string]: String(
                  Math.sign(offset)
                ),
                zIndex: items.length - abs,
              };
              return (
                <div
                  key={item.id}
                  id={`${baseId}-item-${i}`}
                  role="option"
                  aria-selected={selected}
                  aria-label={item.label}
                  className={cn(
                    "nova-coverflow__item",
                    selected && "nova-coverflow__item--active"
                  )}
                  style={itemVars}
                  onClick={() => setActive(i)}
                  hidden={abs > 4}
                >
                  <div className="nova-coverflow__cover">{item.content}</div>
                </div>
              );
            })}
          </div>
        </div>

        {arrows && (
          <div className="nova-coverflow__arrows" aria-hidden="true">
            <button
              type="button"
              className="nova-coverflow__arrow nova-focusable"
              onClick={() => setActive(active - 1)}
              disabled={active <= 0}
              tabIndex={-1}
            >
              ‹
            </button>
            <button
              type="button"
              className="nova-coverflow__arrow nova-focusable"
              onClick={() => setActive(active + 1)}
              disabled={active >= items.length - 1}
              tabIndex={-1}
            >
              ›
            </button>
          </div>
        )}
      </div>
    );
  }
);

function clamp(n: number, min: number, max: number): number {
  if (max < min) return min;
  return Math.min(max, Math.max(min, n));
}
