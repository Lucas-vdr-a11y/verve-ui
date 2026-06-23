import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { cn } from "../../../utils/cn";
import { useReducedMotion } from "../../utility/useReducedMotion";
import "./WobbleCard.css";

export interface WobbleCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Max translation (px) of the card toward the cursor. Defaults `20`. */
  strength?: number;
  /**
   * Extra translation multiplier for the inner content, creating a soft
   * parallax. `1` matches the card; `>1` lags ahead. Defaults `1.6`.
   */
  parallax?: number;
  /** Subtle scale on hover. Defaults `1.02`. */
  scale?: number;
  children?: React.ReactNode;
}

/**
 * A card that elastically wobbles toward the cursor with a spring ease, while
 * its inner content drifts a little further for a layered parallax. Position is
 * driven by CSS variables and the elastic spring easing token, so releasing the
 * pointer lets it overshoot gently back to center.
 *
 * Under reduced motion the wobble and parallax are disabled.
 */
export const WobbleCard = forwardRef<HTMLDivElement, WobbleCardProps>(
  function WobbleCard(
    {
      strength = 20,
      parallax = 1.6,
      scale = 1.02,
      className,
      children,
      onPointerMove,
      onPointerEnter,
      onPointerLeave,
      style,
      ...rest
    },
    ref
  ) {
    const reduced = useReducedMotion();
    const innerRef = useRef<HTMLDivElement | null>(null);
    useImperativeHandle(ref, () => innerRef.current as HTMLDivElement, []);

    const set = useCallback((x: number, y: number, active: boolean) => {
      const node = innerRef.current;
      if (!node) return;
      node.style.setProperty("--nova-wobble-x", `${x.toFixed(2)}px`);
      node.style.setProperty("--nova-wobble-y", `${y.toFixed(2)}px`);
      node.style.setProperty("--nova-wobble-active", active ? "1" : "0");
    }, []);

    const handlePointerMove = useCallback(
      (event: ReactPointerEvent<HTMLDivElement>) => {
        onPointerMove?.(event);
        if (reduced) return;
        const node = innerRef.current;
        if (!node) return;
        const rect = node.getBoundingClientRect();
        const nx = (event.clientX - rect.left) / rect.width - 0.5;
        const ny = (event.clientY - rect.top) / rect.height - 0.5;
        set(nx * 2 * strength, ny * 2 * strength, true);
      },
      [onPointerMove, reduced, strength, set]
    );

    const handlePointerLeave = useCallback(
      (event: ReactPointerEvent<HTMLDivElement>) => {
        onPointerLeave?.(event);
        set(0, 0, false);
      },
      [onPointerLeave, set]
    );

    return (
      <div
        ref={innerRef}
        className={cn("nova-wobble", className)}
        onPointerMove={handlePointerMove}
        onPointerEnter={onPointerEnter}
        onPointerLeave={handlePointerLeave}
        style={
          {
            "--nova-wobble-scale": `${scale}`,
            "--nova-wobble-parallax": `${parallax}`,
            ...style,
          } as React.CSSProperties
        }
        {...rest}
      >
        <div className="nova-wobble__content">{children}</div>
      </div>
    );
  }
);
