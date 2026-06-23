import { forwardRef, useMemo } from "react";
import { cn } from "../../../utils/cn";
import "./BackgroundBoxes.css";

export interface BackgroundBoxesProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Number of grid rows. Defaults `12`. */
  rows?: number;
  /** Number of grid columns. Defaults `16`. */
  columns?: number;
  /** Cell hover tint color. Any CSS color. Defaults the brand color. */
  color?: string;
  /** Skew the grid into a 3D plane (the Aceternity look). Defaults `true`. */
  skew?: boolean;
}

/**
 * A large grid of cells that light up with a brand tint as the cursor hovers
 * over them — the Aceternity "background boxes". Pure CSS hover (no JS), with an
 * optional skewed 3D plane.
 *
 * SSR-safe (no window access). Decorative — aria-hidden. The hover transition is
 * neutralized under reduced-motion via tokens; the tint still appears instantly.
 */
export const BackgroundBoxes = forwardRef<HTMLDivElement, BackgroundBoxesProps>(
  function BackgroundBoxes(
    {
      rows = 12,
      columns = 16,
      color = "var(--nova-primary)",
      skew = true,
      className,
      style,
      ...rest
    },
    ref
  ) {
    const cells = useMemo(
      () => Array.from({ length: rows * columns }),
      [rows, columns]
    );

    return (
      <div
        ref={ref}
        aria-hidden="true"
        className={cn(
          "nova-boxes",
          skew && "nova-boxes--skew",
          className
        )}
        style={
          {
            "--nova-boxes-cols": columns,
            "--nova-boxes-rows": rows,
            "--nova-boxes-color": color,
            ...style,
          } as React.CSSProperties
        }
        {...rest}
      >
        <div className="nova-boxes__grid">
          {cells.map((_, i) => (
            <div key={i} className="nova-boxes__cell" />
          ))}
        </div>
      </div>
    );
  }
);
