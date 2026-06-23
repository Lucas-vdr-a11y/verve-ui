import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./DeviceShowcase.css";

export interface DeviceShowcaseProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Pedestal backdrop style. Defaults to `"spotlight"`. */
  backdrop?: "spotlight" | "gradient" | "grid" | "none";
  /** Gentle continuous float animation. Defaults to `false`. */
  float?: boolean;
  /** Tilt slightly toward the pointer on hover. Defaults to `false`. */
  tilt?: boolean;
  /** Render a soft mirrored reflection beneath the device. Defaults to `false`. */
  reflection?: boolean;
  /** Vertical padding scale of the pedestal. Defaults to `"md"`. */
  padding?: "sm" | "md" | "lg";
  /** The device (BrowserFrame, PhoneFrame, …) to present. */
  children?: React.ReactNode;
}

/**
 * DeviceShowcase — presents a device on a subtle gradient/spotlight pedestal
 * with optional float, hover-tilt and a mirrored reflection. All motion is
 * CSS-driven and respects reduced-motion via duration tokens.
 */
export const DeviceShowcase = forwardRef<HTMLDivElement, DeviceShowcaseProps>(
  function DeviceShowcase(
    {
      backdrop = "spotlight",
      float = false,
      tilt = false,
      reflection = false,
      padding = "md",
      children,
      className,
      ...rest
    },
    ref,
  ) {
    return (
      <div
        ref={ref}
        className={cn(
          "nova-device-showcase",
          `nova-device-showcase--bd-${backdrop}`,
          `nova-device-showcase--pad-${padding}`,
          tilt && "nova-device-showcase--tilt",
          className,
        )}
        {...rest}
      >
        <div
          className={cn(
            "nova-device-showcase__stage",
            float && "nova-device-showcase__stage--float",
          )}
        >
          <div className="nova-device-showcase__device">{children}</div>
          {reflection && (
            <div className="nova-device-showcase__reflection" aria-hidden="true">
              {children}
            </div>
          )}
        </div>
      </div>
    );
  },
);
