import { forwardRef, useEffect, useRef } from "react";
import { cn } from "../../../utils/cn";
import "./SpotlightCardGrid.css";

export interface SpotlightCardGridItem {
  /** Card title. */
  title: React.ReactNode;
  /** Card body / description. */
  description?: React.ReactNode;
  /** Optional icon or media node rendered above the title. */
  icon?: React.ReactNode;
}

export interface SpotlightCardGridProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Cards to render. */
  items: SpotlightCardGridItem[];
  /** Column count at full width. Defaults `3`. */
  columns?: number;
  /** Spotlight radius in px. Defaults `360`. */
  radius?: number;
  /** Spotlight tint. Defaults a translucent brand glow. */
  color?: string;
}

/**
 * SpotlightCardGrid — a grid of cards sharing ONE cursor-following radial
 * spotlight. As the pointer moves over the grid, a single glow tracks it and
 * lights up whichever card sits beneath, with each card's border catching the
 * light. The pointer position is written to CSS variables in a rAF-throttled
 * pointermove handler (cleaned up on unmount). SSR-safe; cards are focusable so
 * keyboard users get the same highlight via :focus-within. The glow is purely
 * decorative and disabled under reduced motion.
 */
export const SpotlightCardGrid = forwardRef<
  HTMLDivElement,
  SpotlightCardGridProps
>(function SpotlightCardGrid(
  { items, columns = 3, radius = 360, color, className, style, ...rest },
  ref
) {
  const gridRef = useRef<HTMLDivElement | null>(null);
  const frame = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const el = gridRef.current;
    if (!el) return;

    let lastX = 0;
    let lastY = 0;

    const apply = () => {
      frame.current = null;
      el.style.setProperty("--nova-spotlight-grid-x", `${lastX}px`);
      el.style.setProperty("--nova-spotlight-grid-y", `${lastY}px`);
    };

    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      lastX = e.clientX - rect.left;
      lastY = e.clientY - rect.top;
      el.style.setProperty("--nova-spotlight-grid-opacity", "1");
      if (frame.current === null) {
        frame.current = window.requestAnimationFrame(apply);
      }
    };
    const onLeave = () => {
      el.style.setProperty("--nova-spotlight-grid-opacity", "0");
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      if (frame.current !== null) {
        window.cancelAnimationFrame(frame.current);
        frame.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={mergeRefs(ref, gridRef)}
      className={cn("nova-spotlight-grid", className)}
      style={
        {
          "--nova-spotlight-grid-columns": columns,
          "--nova-spotlight-grid-radius": `${radius}px`,
          ...(color ? { "--nova-spotlight-grid-color": color } : null),
          ...style,
        } as React.CSSProperties
      }
      {...rest}
    >
      {items.map((item, i) => (
        <article key={i} className="nova-spotlight-grid__card" tabIndex={0}>
          <span className="nova-spotlight-grid__glow" aria-hidden="true" />
          <div className="nova-spotlight-grid__content">
            {item.icon && (
              <div className="nova-spotlight-grid__icon">{item.icon}</div>
            )}
            <h3 className="nova-spotlight-grid__title">{item.title}</h3>
            {item.description && (
              <p className="nova-spotlight-grid__desc">{item.description}</p>
            )}
          </div>
        </article>
      ))}
    </div>
  );
});

function mergeRefs<T>(
  external: React.ForwardedRef<T>,
  local: React.MutableRefObject<T | null>
) {
  return (node: T | null) => {
    local.current = node;
    if (typeof external === "function") external(node);
    else if (external) external.current = node;
  };
}
