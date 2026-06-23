import { forwardRef, useId } from "react";
import { cn } from "../../../utils/cn";
import "./GooeyButton.css";

export interface GooeyButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Number of gooey blobs that emerge on hover. Defaults `3`. */
  blobs?: number;
  children?: React.ReactNode;
}

/**
 * A button with a gooey/liquid hover morph: small blobs grow from the surface
 * and merge with the button body through an SVG gooey filter
 * (feGaussianBlur + feColorMatrix alpha threshold), giving a viscous metaball
 * look. A scoped inline <svg> filter keeps it self-contained and SSR-safe; the
 * filter id is unique per instance via useId.
 *
 * Real `<button>`. Blob growth pauses under reduced motion (filter stays inert).
 */
export const GooeyButton = forwardRef<HTMLButtonElement, GooeyButtonProps>(
  function GooeyButton(
    { blobs = 3, className, children, style, type, ...rest },
    ref
  ) {
    const rawId = useId().replace(/[:]/g, "");
    const filterId = `nova-goo-${rawId}`;
    const count = Math.max(0, Math.min(6, blobs));

    return (
      <button
        ref={ref}
        type={type ?? "button"}
        className={cn("nova-gooey", className)}
        style={style}
        {...rest}
      >
        <span
          className="nova-gooey__goo"
          style={{ filter: `url(#${filterId})` }}
          aria-hidden="true"
        >
          <span className="nova-gooey__body" />
          {Array.from({ length: count }, (_, i) => (
            <span
              key={i}
              className="nova-gooey__blob"
              style={
                {
                  "--nova-gooey-i": String(i),
                  "--nova-gooey-n": String(count),
                } as React.CSSProperties
              }
            />
          ))}
        </span>
        <span className="nova-gooey__label">{children}</span>
        <svg
          className="nova-gooey__filter"
          width="0"
          height="0"
          aria-hidden="true"
          focusable="false"
        >
          <defs>
            <filter id={filterId}>
              <feGaussianBlur
                in="SourceGraphic"
                stdDeviation="6"
                result="blur"
              />
              <feColorMatrix
                in="blur"
                mode="matrix"
                values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
                result="goo"
              />
              <feBlend in="SourceGraphic" in2="goo" />
            </filter>
          </defs>
        </svg>
      </button>
    );
  }
);
