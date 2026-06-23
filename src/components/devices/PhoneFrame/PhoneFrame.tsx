import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./PhoneFrame.css";

export interface PhoneFrameProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Top cutout style. Defaults to `"island"` (dynamic island). */
  notch?: "island" | "notch" | "none";
  /** Frame size. Defaults to `"md"`. */
  size?: "sm" | "md" | "lg";
  /** Show a faux status bar (time + indicators). Defaults to `true`. */
  statusBar?: boolean;
  /** Label rendered as the clock in the status bar. */
  time?: string;
  /** Screen content. */
  children?: React.ReactNode;
}

const StatusBar = ({ time }: { time: string }) => (
  <div className="nova-phone__status" aria-hidden="true">
    <span className="nova-phone__time">{time}</span>
    <span className="nova-phone__status-icons">
      <svg viewBox="0 0 18 12" width="1.1em" height="0.9em" focusable="false">
        <rect x="0" y="7" width="3" height="4" rx="0.5" fill="currentColor" />
        <rect x="4" y="5" width="3" height="6" rx="0.5" fill="currentColor" />
        <rect x="8" y="3" width="3" height="8" rx="0.5" fill="currentColor" />
        <rect x="12" y="1" width="3" height="10" rx="0.5" fill="currentColor" />
      </svg>
      <svg viewBox="0 0 24 12" width="1.6em" height="0.9em" focusable="false">
        <rect x="0.5" y="1" width="20" height="10" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1" />
        <rect x="2" y="2.5" width="15" height="7" rx="1" fill="currentColor" />
        <rect x="21.5" y="4" width="1.5" height="4" rx="0.75" fill="currentColor" />
      </svg>
    </span>
  </div>
);

/**
 * PhoneFrame — modern smartphone mockup: rounded bezel, dynamic island/notch,
 * side buttons and an optional status bar. Content fills the screen.
 */
export const PhoneFrame = forwardRef<HTMLDivElement, PhoneFrameProps>(
  function PhoneFrame(
    { notch = "island", size = "md", statusBar = true, time = "9:41", children, className, ...rest },
    ref,
  ) {
    return (
      <div
        ref={ref}
        className={cn("nova-phone", `nova-phone--${size}`, className)}
        {...rest}
      >
        <span className="nova-phone__btn nova-phone__btn--silent" aria-hidden="true" />
        <span className="nova-phone__btn nova-phone__btn--vol-up" aria-hidden="true" />
        <span className="nova-phone__btn nova-phone__btn--vol-down" aria-hidden="true" />
        <span className="nova-phone__btn nova-phone__btn--power" aria-hidden="true" />

        <div className="nova-phone__screen">
          {notch !== "none" && (
            <span
              className={cn("nova-phone__cutout", `nova-phone__cutout--${notch}`)}
              aria-hidden="true"
            />
          )}
          {statusBar && <StatusBar time={time} />}
          <div className="nova-phone__content">{children}</div>
        </div>
      </div>
    );
  },
);
