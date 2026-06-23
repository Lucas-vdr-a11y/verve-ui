import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./AspectRatio.css";

export interface AspectRatioProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Desired width-to-height ratio, e.g. `16 / 9` or `1`. Defaults to `16 / 9`.
   */
  ratio?: number;
}

/**
 * Maintains a fixed aspect ratio for its content. Children are stretched to
 * fill the box (absolutely positioned), so a single child like an `<img>` or
 * `<iframe>` cleanly fills the frame.
 */
export const AspectRatio = forwardRef<HTMLDivElement, AspectRatioProps>(
  function AspectRatio({ ratio = 16 / 9, className, style, ...rest }, ref) {
    return (
      <div
        ref={ref}
        className={cn("nova-aspect-ratio", className)}
        style={{ ["--nova-aspect-ratio" as string]: String(ratio), ...style }}
        {...rest}
      />
    );
  }
);
