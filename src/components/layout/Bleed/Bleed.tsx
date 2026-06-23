import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./Bleed.css";

/** Spacing scale keys that map onto the `--nova-space-*` tokens. */
export type BleedSpace = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12;

export interface BleedProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Negative margin on all sides (shorthand). */
  all?: BleedSpace;
  /** Negative margin on the inline axis (left + right). */
  x?: BleedSpace;
  /** Negative margin on the block axis (top + bottom). */
  y?: BleedSpace;
  /** Negative top margin. */
  top?: BleedSpace;
  /** Negative right margin. */
  right?: BleedSpace;
  /** Negative bottom margin. */
  bottom?: BleedSpace;
  /** Negative left margin. */
  left?: BleedSpace;
}

function neg(space: BleedSpace | undefined): string | undefined {
  if (space === undefined) return undefined;
  if (space === 0) return "0px";
  return `calc(-1 * var(--nova-space-${space}))`;
}

/**
 * Bleed — an escape hatch that pulls its content past the parent's padding via
 * token-scaled negative margins. Useful for full-bleed media inside a padded
 * `Card` or `Container`. Per-side, with `all` / `x` / `y` shorthands.
 */
export const Bleed = forwardRef<HTMLDivElement, BleedProps>(function Bleed(
  { all, x, y, top, right, bottom, left, className, style, ...rest },
  ref,
) {
  const mt = neg(top ?? y ?? all);
  const mr = neg(right ?? x ?? all);
  const mb = neg(bottom ?? y ?? all);
  const ml = neg(left ?? x ?? all);

  return (
    <div
      ref={ref}
      className={cn("nova-bleed", className)}
      style={
        {
          ...(mt !== undefined ? { marginTop: mt } : null),
          ...(mr !== undefined ? { marginRight: mr } : null),
          ...(mb !== undefined ? { marginBottom: mb } : null),
          ...(ml !== undefined ? { marginLeft: ml } : null),
          ...style,
        } as React.CSSProperties
      }
      {...rest}
    />
  );
});
