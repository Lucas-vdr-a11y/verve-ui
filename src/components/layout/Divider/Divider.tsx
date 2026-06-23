import { forwardRef } from "react";
import type { ReactNode } from "react";
import { cn } from "../../../utils/cn";
import "./Divider.css";

export interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Orientation of the rule. @default "horizontal" */
  orientation?: "horizontal" | "vertical";
  /**
   * Optional label rendered in the middle of a horizontal divider. Ignored for
   * vertical orientation.
   */
  label?: ReactNode;
}

/**
 * Divider — a thematic separator. Renders a semantic separator with the correct
 * `role`/`aria-orientation`; when a `label` is supplied it becomes a labelled
 * group ("OR"-style divider).
 */
export const Divider = forwardRef<HTMLDivElement, DividerProps>(function Divider(
  { orientation = "horizontal", label, className, ...rest },
  ref,
) {
  const hasLabel = orientation === "horizontal" && label != null;

  return (
    <div
      ref={ref}
      role="separator"
      aria-orientation={orientation}
      className={cn(
        "nova-divider",
        `nova-divider--${orientation}`,
        hasLabel && "nova-divider--labelled",
        className,
      )}
      {...rest}
    >
      {hasLabel ? (
        <span className="nova-divider__label">{label}</span>
      ) : null}
    </div>
  );
});
