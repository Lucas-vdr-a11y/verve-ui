import { forwardRef, useCallback, useMemo, useRef } from "react";
import { cn } from "../../../utils/cn";
import "./GlowingStars.css";

export interface GlowingStarsProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Number of stars. Defaults `120`. */
  quantity?: number;
  /** Star color. Defaults a soft brand tint. */
  color?: string;
  /** Radius (px) around the cursor where stars brighten. Defaults `120`. */
  reach?: number;
  children?: React.ReactNode;
}

/**
 * A field of twinkling stars that brighten and bloom near the cursor. Stars are
 * lightweight DOM dots with staggered twinkle animations; a brand-tinted glow
 * masked to the cursor reveals an extra-bright copy of the field on hover.
 *
 * SSR-safe (positions derived deterministically; pointer tracking in an
 * rAF-throttled handler). Star layers are aria-hidden; content renders above.
 */
export const GlowingStars = forwardRef<HTMLDivElement, GlowingStarsProps>(
  function GlowingStars(
    {
      quantity = 120,
      color = "var(--nova-brand-300)",
      reach = 120,
      className,
      style,
      children,
      ...rest
    },
    ref
  ) {
    const rootRef = useRef<HTMLDivElement | null>(null);
    const frame = useRef<number | null>(null);

    const setRefs = useCallback(
      (node: HTMLDivElement | null) => {
        rootRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      },
      [ref]
    );

    const stars = useMemo(() => {
      let seed = quantity * 2654 + 40503;
      const rand = () => {
        seed = (seed * 9301 + 49297) % 233280;
        return seed / 233280;
      };
      return Array.from({ length: quantity }, () => ({
        left: rand() * 100,
        top: rand() * 100,
        size: rand() * 1.6 + 0.6,
        delay: rand() * 4,
        duration: 2.5 + rand() * 3.5,
      }));
    }, [quantity]);

    const handleMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
      const node = rootRef.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      if (frame.current != null) cancelAnimationFrame(frame.current);
      frame.current = requestAnimationFrame(() => {
        node.style.setProperty("--nova-stars-x", `${px}px`);
        node.style.setProperty("--nova-stars-y", `${py}px`);
        node.style.setProperty("--nova-stars-glow", "1");
      });
    }, []);

    const handleLeave = useCallback(() => {
      rootRef.current?.style.setProperty("--nova-stars-glow", "0");
    }, []);

    const field = (className_: string) => (
      <div className={className_} aria-hidden="true">
        {stars.map((s, i) => (
          <span
            key={i}
            className="nova-stars__star"
            style={
              {
                left: `${s.left}%`,
                top: `${s.top}%`,
                width: `${s.size}px`,
                height: `${s.size}px`,
                animationDelay: `${s.delay}s`,
                animationDuration: `${s.duration}s`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>
    );

    return (
      <div
        ref={setRefs}
        className={cn("nova-stars", className)}
        onPointerMove={handleMove}
        onPointerLeave={handleLeave}
        style={
          {
            "--nova-stars-color": color,
            "--nova-stars-reach": `${reach}px`,
            ...style,
          } as React.CSSProperties
        }
        {...rest}
      >
        {field("nova-stars__field")}
        {field("nova-stars__field nova-stars__field--glow")}
        {children != null && (
          <div className="nova-stars__content">{children}</div>
        )}
      </div>
    );
  }
);
