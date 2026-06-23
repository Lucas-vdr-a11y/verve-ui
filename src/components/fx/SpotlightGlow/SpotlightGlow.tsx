import { forwardRef, useCallback, useRef } from "react";
import { cn } from "../../../utils/cn";
import "./SpotlightGlow.css";

export interface SpotlightGlowProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Radius of the spotlight in px. Defaults `320`. */
  size?: number;
  /** Spotlight color. Defaults a soft brand glow. */
  color?: string;
  /** Glow opacity at the center (0–1). Defaults `0.15`. */
  intensity?: number;
  children?: React.ReactNode;
}

/**
 * A radial spotlight glow that follows the cursor across a section — the classic
 * "Linear hero" effect. The glow position is pushed to CSS variables in an
 * rAF-throttled pointermove handler; content renders above it.
 *
 * SSR-safe (no window access during render). Glow layer is aria-hidden and fades
 * out when the pointer leaves.
 */
export const SpotlightGlow = forwardRef<HTMLDivElement, SpotlightGlowProps>(
  function SpotlightGlow(
    {
      size = 320,
      color = "var(--nova-primary)",
      intensity = 0.15,
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

    const handleMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
      const node = rootRef.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      if (frame.current != null) cancelAnimationFrame(frame.current);
      frame.current = requestAnimationFrame(() => {
        node.style.setProperty("--nova-spot-x", `${px}px`);
        node.style.setProperty("--nova-spot-y", `${py}px`);
        node.style.setProperty("--nova-spot-opacity", "1");
      });
    }, []);

    const handleLeave = useCallback(() => {
      rootRef.current?.style.setProperty("--nova-spot-opacity", "0");
    }, []);

    return (
      <div
        ref={setRefs}
        className={cn("nova-spotlight", className)}
        onPointerMove={handleMove}
        onPointerLeave={handleLeave}
        style={
          {
            "--nova-spot-size": `${size}px`,
            "--nova-spot-color": color,
            "--nova-spot-intensity": intensity,
            ...style,
          } as React.CSSProperties
        }
        {...rest}
      >
        <span aria-hidden="true" className="nova-spotlight__glow" />
        <div className="nova-spotlight__content">{children}</div>
      </div>
    );
  }
);
