import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./Spacer.css";

/** Spacing scale keys that map onto the `--nova-space-*` tokens. */
export type SpacerSize = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16 | 20 | 24;

export interface SpacerProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Fixed size from the `--nova-space-*` scale. Applies in both axes so the
   * Spacer works in a row or column. Omit to make the Spacer flexible.
   */
  size?: SpacerSize;
  /**
   * Grow to fill available space in a flex container (pushes siblings apart).
   * Defaults to `true` when no `size` is given, `false` otherwise.
   */
  grow?: boolean;
}

/**
 * Spacer — an empty box used to add space between items in flex/grid layouts.
 * Either a fixed `size` from the token scale, or a flexible spacer that expands
 * to push neighbours apart.
 */
export const Spacer = forwardRef<HTMLDivElement, SpacerProps>(function Spacer(
  { size, grow, className, style, ...rest },
  ref,
) {
  const isFlexible = grow ?? size === undefined;

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn(
        "nova-spacer",
        isFlexible && "nova-spacer--grow",
        size !== undefined && "nova-spacer--fixed",
        className,
      )}
      style={
        size !== undefined
          ? ({
              "--nova-spacer-size": `var(--nova-space-${size})`,
              ...style,
            } as React.CSSProperties)
          : style
      }
      {...rest}
    />
  );
});
