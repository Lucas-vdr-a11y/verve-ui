import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./LampGlow.css";

export interface LampGlowProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Glow color. Any CSS color. Defaults the brand color. */
  color?: string;
  /** Glow intensity (0–1). Defaults `0.5`. */
  intensity?: number;
  children?: React.ReactNode;
}

/**
 * A focused conic lamp glow that fans out from a thin top bar — a pure-background
 * variant of the Aceternity "lamp" (distinct from a heading-paired LampHeader).
 * Content renders above the glow via a slot.
 *
 * SSR-safe (no window access). The glow layer is aria-hidden; the breathing
 * animation is disabled under reduced-motion via CSS.
 */
export const LampGlow = forwardRef<HTMLDivElement, LampGlowProps>(
  function LampGlow(
    { color = "var(--nova-primary)", intensity = 0.5, className, style, children, ...rest },
    ref
  ) {
    return (
      <div
        ref={ref}
        className={cn("nova-lamp", className)}
        style={
          {
            "--nova-lamp-color": color,
            "--nova-lamp-intensity": intensity,
            ...style,
          } as React.CSSProperties
        }
        {...rest}
      >
        <div aria-hidden="true" className="nova-lamp__stage">
          <span className="nova-lamp__cone nova-lamp__cone--left" />
          <span className="nova-lamp__cone nova-lamp__cone--right" />
          <span className="nova-lamp__bar" />
          <span className="nova-lamp__halo" />
        </div>
        <div className="nova-lamp__content">{children}</div>
      </div>
    );
  }
);
