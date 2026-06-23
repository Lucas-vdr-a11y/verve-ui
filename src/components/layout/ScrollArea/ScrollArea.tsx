import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./ScrollArea.css";

export type ScrollAreaAxis = "vertical" | "horizontal" | "both";

export interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Which axis (axes) may scroll. @default "vertical" */
  axis?: ScrollAreaAxis;
  /** Caps the height (any CSS length); content beyond it scrolls. */
  maxHeight?: string;
  /** Caps the width (any CSS length); content beyond it scrolls. */
  maxWidth?: string;
  /**
   * Show subtle fade-out masks at the scrollable edges as an affordance.
   * @default false
   */
  fades?: boolean;
}

/**
 * ScrollArea — a styled scroll container with thin, themed scrollbars
 * (webkit + Firefox `scrollbar-*`). Optionally renders fade masks at the
 * scrollable edges. Pure CSS — no JS scroll listeners.
 */
export const ScrollArea = forwardRef<HTMLDivElement, ScrollAreaProps>(
  function ScrollArea(
    {
      axis = "vertical",
      maxHeight,
      maxWidth,
      fades = false,
      className,
      style,
      ...rest
    },
    ref,
  ) {
    return (
      <div
        ref={ref}
        className={cn(
          "nova-scroll-area",
          `nova-scroll-area--${axis}`,
          fades && "nova-scroll-area--fades",
          className,
        )}
        style={
          {
            ...(maxHeight !== undefined ? { maxHeight } : null),
            ...(maxWidth !== undefined ? { maxWidth } : null),
            ...style,
          } as React.CSSProperties
        }
        {...rest}
      />
    );
  },
);
