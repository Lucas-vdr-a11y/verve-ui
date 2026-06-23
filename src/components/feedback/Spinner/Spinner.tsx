import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./Spinner.css";

export type SpinnerSize = "sm" | "md" | "lg";

export interface SpinnerProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Size on the sm/md/lg scale. Defaults to `"md"`. */
  size?: SpinnerSize;
  /** Accessible label announced to assistive tech. Defaults to `"Loading"`. */
  label?: string;
}

export const Spinner = forwardRef<HTMLSpanElement, SpinnerProps>(function Spinner(
  { size = "md", label = "Loading", className, ...rest },
  ref
) {
  return (
    <span
      ref={ref}
      role="status"
      aria-label={label}
      className={cn("nova-spinner", `nova-spinner--${size}`, className)}
      {...rest}
    >
      <svg
        className="nova-spinner__svg"
        viewBox="0 0 24 24"
        aria-hidden="true"
        focusable="false"
      >
        <circle
          className="nova-spinner__track"
          cx="12"
          cy="12"
          r="9"
          fill="none"
          strokeWidth="3"
        />
        <path
          className="nova-spinner__head"
          d="M21 12a9 9 0 0 0-9-9"
          fill="none"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
});
