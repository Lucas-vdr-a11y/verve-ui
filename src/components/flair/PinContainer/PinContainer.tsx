import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./PinContainer.css";

export interface PinContainerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /** Floating pin/label text shown above the card on hover. */
  label?: React.ReactNode;
  /** If set, the whole container becomes a link to this href. */
  href?: string;
  /** Card body. */
  children?: React.ReactNode;
}

/**
 * A 3D pin card (Aceternity-style): on hover the card tilts back in perspective
 * and lifts while a floating "pin" label tag rises above it, backed by a
 * perspective grid that recedes into the distance. Pure CSS transforms — no JS.
 *
 * Renders an `<a>` when `href` is given (so it's keyboard-focusable), otherwise
 * a `<div>`. Under reduced motion the tilt/lift is suppressed.
 */
export const PinContainer = forwardRef<HTMLDivElement, PinContainerProps>(
  function PinContainer(
    { label, href, className, children, ...rest },
    ref
  ) {
    return (
      <div
        ref={ref}
        className={cn("nova-pin-container", className)}
        {...rest}
      >
        <div className="nova-pin-container__perspective">
          <div className="nova-pin-container__tilt">
            {href ? (
              <a className="nova-pin-container__card" href={href}>
                {children}
              </a>
            ) : (
              <div className="nova-pin-container__card">{children}</div>
            )}
          </div>
        </div>

        {label != null && (
          <div className="nova-pin-container__pin" aria-hidden="true">
            <span className="nova-pin-container__pin-label">{label}</span>
            <span className="nova-pin-container__pin-line" />
            <span className="nova-pin-container__pin-ring" />
            <span className="nova-pin-container__pin-ring nova-pin-container__pin-ring--2" />
          </div>
        )}
      </div>
    );
  }
);
