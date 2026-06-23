import { forwardRef, useEffect, useRef, useState } from "react";
import { cn } from "../../../utils/cn";
import "./Sticky.css";

export interface StickyProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Which edge to stick to. `"top"` uses the `offset` as `top`, `"bottom"`
   * uses it as `bottom`. @default "top"
   */
  edge?: "top" | "bottom";
  /**
   * Distance from the chosen edge. A number is treated as `rem` via the spacing
   * scale token if it matches, otherwise any CSS length string. @default 0
   */
  offset?: number | string;
  /** Stacking order for the sticky element. @default var(--nova-z-sticky) */
  zIndex?: number;
  /**
   * Detect when the element becomes "stuck" via IntersectionObserver and expose
   * it as `data-stuck` plus the `onStuckChange` callback. @default false
   */
  trackStuck?: boolean;
  /** Called when the stuck state changes (requires `trackStuck`). */
  onStuckChange?: (stuck: boolean) => void;
}

/**
 * Sticky — wraps content in `position: sticky` with a configurable edge,
 * offset and z-index. When `trackStuck` is set it uses an IntersectionObserver
 * (SSR-guarded) to flag the stuck state via `data-stuck` and `onStuckChange`.
 */
export const Sticky = forwardRef<HTMLDivElement, StickyProps>(function Sticky(
  {
    edge = "top",
    offset = 0,
    zIndex,
    trackStuck = false,
    onStuckChange,
    className,
    style,
    children,
    ...rest
  },
  ref,
) {
  const innerRef = useRef<HTMLDivElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const [stuck, setStuck] = useState(false);

  const offsetValue =
    typeof offset === "number" ? `${offset}px` : offset;

  useEffect(() => {
    if (!trackStuck) return;
    if (typeof IntersectionObserver === "undefined") return;
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    // The sentinel sits just outside the sticky edge. When it scrolls out of
    // view the sticky element has "stuck" to that edge.
    const observer = new IntersectionObserver(
      ([entry]) => {
        const isStuck = !entry.isIntersecting;
        setStuck(isStuck);
        onStuckChange?.(isStuck);
      },
      { threshold: [0] },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [trackStuck, onStuckChange]);

  const stickyStyle: React.CSSProperties = {
    [edge]: offsetValue,
    zIndex: zIndex ?? "var(--nova-z-sticky)",
    ...style,
  } as React.CSSProperties;

  return (
    <div
      ref={(node) => {
        innerRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      }}
      className={cn("nova-sticky", `nova-sticky--${edge}`, className)}
      data-stuck={stuck || undefined}
      style={stickyStyle}
      {...rest}
    >
      {trackStuck && (
        <div
          ref={sentinelRef}
          className={cn(
            "nova-sticky__sentinel",
            `nova-sticky__sentinel--${edge}`,
          )}
          aria-hidden="true"
        />
      )}
      {children}
    </div>
  );
});
