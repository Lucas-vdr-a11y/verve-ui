import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { cn } from "../../../utils/cn";
import { useReducedMotion } from "../../utility/useReducedMotion";
import "./TiltCard.css";

export interface TiltCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Maximum tilt in degrees at the card edges. Defaults `12`. */
  max?: number;
  /** Perspective distance (px). Lower = more dramatic. Defaults `800`. */
  perspective?: number;
  /** Scale applied while hovered. Defaults `1.03`. */
  scale?: number;
  /** Render a moving glare/sheen layer that tracks the cursor. Defaults `true`. */
  glare?: boolean;
  children?: React.ReactNode;
}

/**
 * A 3D card that tilts in perspective toward the cursor, with a light highlight
 * and optional glare layer that follow the pointer. The transform is written to
 * CSS custom properties so the eased transition is handled in CSS.
 *
 * Under reduced motion the tilt and glare are disabled.
 */
export const TiltCard = forwardRef<HTMLDivElement, TiltCardProps>(
  function TiltCard(
    {
      max = 12,
      perspective = 800,
      scale = 1.03,
      glare = true,
      className,
      children,
      onPointerMove,
      onPointerLeave,
      onPointerEnter,
      style,
      ...rest
    },
    ref
  ) {
    const reduced = useReducedMotion();
    const innerRef = useRef<HTMLDivElement | null>(null);
    useImperativeHandle(ref, () => innerRef.current as HTMLDivElement, []);

    const apply = useCallback(
      (rx: number, ry: number, px: number, py: number, active: boolean) => {
        const node = innerRef.current;
        if (!node) return;
        node.style.setProperty("--nova-tilt-rx", `${rx.toFixed(2)}deg`);
        node.style.setProperty("--nova-tilt-ry", `${ry.toFixed(2)}deg`);
        node.style.setProperty("--nova-tilt-px", `${(px * 100).toFixed(2)}%`);
        node.style.setProperty("--nova-tilt-py", `${(py * 100).toFixed(2)}%`);
        node.style.setProperty("--nova-tilt-scale", active ? `${scale}` : "1");
        node.style.setProperty("--nova-tilt-glare", active ? "1" : "0");
      },
      [scale]
    );

    const handlePointerMove = useCallback(
      (event: ReactPointerEvent<HTMLDivElement>) => {
        onPointerMove?.(event);
        if (reduced) return;
        const node = innerRef.current;
        if (!node) return;
        const rect = node.getBoundingClientRect();
        const px = (event.clientX - rect.left) / rect.width;
        const py = (event.clientY - rect.top) / rect.height;
        const ry = (px - 0.5) * 2 * max;
        const rx = -(py - 0.5) * 2 * max;
        apply(rx, ry, px, py, true);
      },
      [onPointerMove, reduced, max, apply]
    );

    const handlePointerLeave = useCallback(
      (event: ReactPointerEvent<HTMLDivElement>) => {
        onPointerLeave?.(event);
        apply(0, 0, 0.5, 0.5, false);
      },
      [onPointerLeave, apply]
    );

    return (
      <div
        ref={innerRef}
        className={cn("nova-tilt", glare && "nova-tilt--glare", className)}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        onPointerEnter={onPointerEnter}
        style={
          {
            "--nova-tilt-perspective": `${perspective}px`,
            ...style,
          } as React.CSSProperties
        }
        {...rest}
      >
        <div className="nova-tilt__inner">
          <div className="nova-tilt__content">{children}</div>
          {glare ? (
            <span className="nova-tilt__glare" aria-hidden="true" />
          ) : null}
        </div>
      </div>
    );
  }
);
