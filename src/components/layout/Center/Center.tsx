import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./Center.css";

export interface CenterProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Use `inline-flex` instead of `flex`, so the container only takes the width
   * of its content. @default false
   */
  inline?: boolean;
  /**
   * Minimum height of the centering container (any CSS length). Handy for
   * vertically centering inside a viewport region, e.g. `"100vh"`.
   */
  minHeight?: string;
}

/**
 * Center — centers a single child on both axes. Pass `minHeight` to give the
 * container height to center within (e.g. a full-viewport hero).
 */
export const Center = forwardRef<HTMLDivElement, CenterProps>(function Center(
  { inline = false, minHeight, className, style, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn("nova-center", inline && "nova-center--inline", className)}
      style={
        {
          ...(minHeight !== undefined ? { minHeight } : null),
          ...style,
        } as React.CSSProperties
      }
      {...rest}
    />
  );
});
