import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./ButtonGroup.css";

export type ButtonGroupOrientation = "horizontal" | "vertical";
export type ButtonGroupSize = "sm" | "md" | "lg";

export interface ButtonGroupProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Layout direction of the joined buttons. @default "horizontal" */
  orientation?: ButtonGroupOrientation;
  /** Size hint applied to the group (affects radius/spacing). @default "md" */
  size?: ButtonGroupSize;
  /**
   * Visually join the buttons by collapsing the borders between them.
   * @default true
   */
  attached?: boolean;
  /** Stretch buttons to fill the available space. @default false */
  fullWidth?: boolean;
  /** Accessible label for the group. */
  "aria-label"?: string;
}

/**
 * ButtonGroup — a layout primitive that visually joins a row/column of
 * buttons (segmented edges, shared borders). It does not import or render a
 * Button; it styles whatever button-like children you place inside, so it
 * works with native `<button>`, `<a>`, or any button component. Role `group`.
 */
export const ButtonGroup = forwardRef<HTMLDivElement, ButtonGroupProps>(
  function ButtonGroup(
    {
      orientation = "horizontal",
      size = "md",
      attached = true,
      fullWidth = false,
      className,
      ...rest
    },
    ref,
  ) {
    return (
      <div
        ref={ref}
        role="group"
        className={cn(
          "nova-button-group",
          `nova-button-group--${orientation}`,
          `nova-button-group--${size}`,
          attached && "nova-button-group--attached",
          fullWidth && "nova-button-group--full",
          className,
        )}
        {...rest}
      />
    );
  },
);
