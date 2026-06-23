import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./ShippingTracker.css";

export type ShippingStageStatus = "complete" | "current" | "upcoming";

export interface ShippingStage {
  /** Stage label, e.g. "Shipped". */
  label: React.ReactNode;
  /** Optional date/time text, e.g. "Jun 18". */
  date?: React.ReactNode;
  /**
   * Icon: "ordered" | "shipped" | "transit" | "delivered" for built-ins, or a
   * custom node. Defaults are chosen by position when omitted.
   */
  icon?: "ordered" | "shipped" | "transit" | "delivered" | React.ReactNode;
}

export interface ShippingTrackerProps
  extends React.HTMLAttributes<HTMLOListElement> {
  /** Ordered list of stages, earliest first. */
  stages: ShippingStage[];
  /** Index of the current stage. Earlier stages render as complete. */
  current: number;
  /** Layout orientation. @default "horizontal" */
  orientation?: "horizontal" | "vertical";
}

const BuiltInIcon = ({ kind }: { kind: string }) => {
  switch (kind) {
    case "ordered":
      return (
        <svg viewBox="0 0 20 20" width="1em" height="1em" aria-hidden="true" focusable="false">
          <path d="M5 4h10l1 4H4l1-4zM4 8h12v7a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V8zM8 11h4" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round" />
        </svg>
      );
    case "shipped":
      return (
        <svg viewBox="0 0 20 20" width="1em" height="1em" aria-hidden="true" focusable="false">
          <path d="M2 5h9v8H2V5zM11 8h4l2 2.5V13h-6V8z" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
          <circle cx="6" cy="14.5" r="1.4" fill="none" stroke="currentColor" strokeWidth="1.4" />
          <circle cx="14" cy="14.5" r="1.4" fill="none" stroke="currentColor" strokeWidth="1.4" />
        </svg>
      );
    case "transit":
      return (
        <svg viewBox="0 0 20 20" width="1em" height="1em" aria-hidden="true" focusable="false">
          <circle cx="10" cy="7.5" r="3" fill="none" stroke="currentColor" strokeWidth="1.4" />
          <path d="M10 10.5c-3 0-5 2-5 5h10c0-3-2-5-5-5z" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
        </svg>
      );
    case "delivered":
    default:
      return (
        <svg viewBox="0 0 20 20" width="1em" height="1em" aria-hidden="true" focusable="false">
          <path d="M4 10.5l4 4 8-9" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
  }
};

const DEFAULT_ICONS = ["ordered", "shipped", "transit", "delivered"];

/**
 * ShippingTracker — a commerce-flavored stepper of order states
 * (ordered → shipped → out for delivery → delivered) with dates and icons.
 */
export const ShippingTracker = forwardRef<
  HTMLOListElement,
  ShippingTrackerProps
>(function ShippingTracker(
  { stages, current, orientation = "horizontal", className, ...rest },
  ref,
) {
  return (
    <ol
      ref={ref}
      className={cn(
        "nova-shipping-tracker",
        `nova-shipping-tracker--${orientation}`,
        className,
      )}
      {...rest}
    >
      {stages.map((stage, i) => {
        const status: ShippingStageStatus =
          i < current ? "complete" : i === current ? "current" : "upcoming";

        const iconKind =
          stage.icon !== undefined && typeof stage.icon === "string"
            ? stage.icon
            : undefined;
        const customIcon =
          stage.icon !== undefined && typeof stage.icon !== "string"
            ? stage.icon
            : undefined;
        const fallbackKind =
          DEFAULT_ICONS[Math.min(i, DEFAULT_ICONS.length - 1)];

        return (
          <li
            key={i}
            className={cn(
              "nova-shipping-tracker__step",
              `nova-shipping-tracker__step--${status}`,
            )}
            aria-current={status === "current" ? "step" : undefined}
          >
            <span className="nova-shipping-tracker__connector" aria-hidden="true" />
            <span className="nova-shipping-tracker__marker">
              <span className="nova-shipping-tracker__icon" aria-hidden="true">
                {customIcon ?? <BuiltInIcon kind={iconKind ?? fallbackKind} />}
              </span>
            </span>
            <span className="nova-shipping-tracker__body">
              <span className="nova-shipping-tracker__label">
                {stage.label}
                {status === "complete" && (
                  <span className="nova-shipping-tracker__sr-only">
                    {" "}
                    (completed)
                  </span>
                )}
                {status === "current" && (
                  <span className="nova-shipping-tracker__sr-only">
                    {" "}
                    (current)
                  </span>
                )}
              </span>
              {stage.date !== undefined && (
                <span className="nova-shipping-tracker__date">{stage.date}</span>
              )}
            </span>
          </li>
        );
      })}
    </ol>
  );
});
