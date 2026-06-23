import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./PlasmaField.css";

export interface PlasmaFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  /** First blob color. Defaults the brand color. */
  colorA?: string;
  /** Second blob color. Defaults a lighter brand tint. */
  colorB?: string;
  /** Third blob color. Defaults the info accent. */
  colorC?: string;
  /** Animation speed multiplier. Higher is faster. Defaults `1`. */
  speed?: number;
  /** Blur softness in px applied to the blobs. Defaults `60`. */
  blur?: number;
  children?: React.ReactNode;
}

/**
 * A flowing plasma / lava-lamp field built from layered animated radial gradient
 * blobs that drift and a hue-rotate that slowly shifts the palette. Content
 * renders above the field via a slot.
 *
 * SSR-safe (pure CSS, no window access). The drift + hue animations are disabled
 * under reduced-motion via CSS; the field freezes to a static gradient.
 */
export const PlasmaField = forwardRef<HTMLDivElement, PlasmaFieldProps>(
  function PlasmaField(
    {
      colorA = "var(--nova-primary)",
      colorB = "var(--nova-brand-400)",
      colorC = "var(--nova-info)",
      speed = 1,
      blur = 60,
      className,
      style,
      children,
      ...rest
    },
    ref
  ) {
    const dur = `${20 / Math.max(0.1, speed)}s`;
    return (
      <div
        ref={ref}
        className={cn("nova-plasma", className)}
        style={
          {
            "--nova-plasma-a": colorA,
            "--nova-plasma-b": colorB,
            "--nova-plasma-c": colorC,
            "--nova-plasma-dur": dur,
            "--nova-plasma-blur": `${blur}px`,
            ...style,
          } as React.CSSProperties
        }
        {...rest}
      >
        <div aria-hidden="true" className="nova-plasma__field">
          <span className="nova-plasma__blob nova-plasma__blob--a" />
          <span className="nova-plasma__blob nova-plasma__blob--b" />
          <span className="nova-plasma__blob nova-plasma__blob--c" />
        </div>
        <div className="nova-plasma__content">{children}</div>
      </div>
    );
  }
);
