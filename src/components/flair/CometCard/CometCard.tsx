import { forwardRef, useRef } from "react";
import { cn } from "../../../utils/cn";
import { useReducedMotion } from "../../utility/useReducedMotion";
import "./CometCard.css";

export interface CometCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Max tilt in degrees toward the cursor. Defaults `12`. */
  tilt?: number;
  /** Card content. */
  children?: React.ReactNode;
}

/**
 * A card that tilts toward the cursor in 3D while a bright comet/sheen streak
 * sweeps across its surface following the pointer, backed by a soft floating
 * drop-shadow that shifts with the tilt. Pointer math runs inline and writes
 * CSS variables; reduced motion disables the tilt and streak.
 */
export const CometCard = forwardRef<HTMLDivElement, CometCardProps>(
  function CometCard(
    { tilt = 12, className, children, onPointerMove, onPointerLeave, style, ...rest },
    ref
  ) {
    const reduced = useReducedMotion();
    const innerRef = useRef<HTMLDivElement | null>(null);

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
      if (!reduced) {
        const el = innerRef.current;
        if (el) {
          const r = el.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width; // 0..1
          const py = (e.clientY - r.top) / r.height; // 0..1
          const rx = (0.5 - py) * tilt * 2;
          const ry = (px - 0.5) * tilt * 2;
          el.style.setProperty("--nova-comet-rx", `${rx}deg`);
          el.style.setProperty("--nova-comet-ry", `${ry}deg`);
          el.style.setProperty("--nova-comet-x", `${px * 100}%`);
          el.style.setProperty("--nova-comet-y", `${py * 100}%`);
          el.style.setProperty("--nova-comet-sx", `${(px - 0.5) * -16}px`);
          el.style.setProperty("--nova-comet-sy", `${(py - 0.5) * -16}px`);
        }
      }
      onPointerMove?.(e);
    };

    const handlePointerLeave = (e: React.PointerEvent<HTMLDivElement>) => {
      const el = innerRef.current;
      if (el) {
        el.style.setProperty("--nova-comet-rx", "0deg");
        el.style.setProperty("--nova-comet-ry", "0deg");
        el.style.setProperty("--nova-comet-sx", "0px");
        el.style.setProperty("--nova-comet-sy", "0px");
      }
      onPointerLeave?.(e);
    };

    return (
      <div
        ref={ref}
        className={cn("nova-comet-card", className)}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        style={style}
        {...rest}
      >
        <div ref={innerRef} className="nova-comet-card__inner">
          <div className="nova-comet-card__content">{children}</div>
          <span className="nova-comet-card__sheen" aria-hidden="true" />
          <span className="nova-comet-card__streak" aria-hidden="true" />
        </div>
      </div>
    );
  }
);
