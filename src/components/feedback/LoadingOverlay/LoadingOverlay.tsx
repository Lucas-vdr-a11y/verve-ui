import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import { Spinner, type SpinnerSize } from "../Spinner";
import "./LoadingOverlay.css";

export interface LoadingOverlayProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Whether the overlay is shown. Defaults to `false`. */
  loading?: boolean;
  /** Cover the whole viewport instead of the nearest positioned ancestor. */
  fullscreen?: boolean;
  /** Apply a backdrop blur to the dimmed layer. */
  blur?: boolean;
  /** Optional message rendered beneath the spinner. */
  message?: React.ReactNode;
  /** Spinner size on the sm/md/lg scale. Defaults to `"lg"`. */
  spinnerSize?: SpinnerSize;
}

export const LoadingOverlay = forwardRef<HTMLDivElement, LoadingOverlayProps>(
  function LoadingOverlay(
    {
      loading = false,
      fullscreen = false,
      blur = false,
      message,
      spinnerSize = "lg",
      className,
      children,
      ...rest
    },
    ref
  ) {
    if (!loading) return null;

    return (
      <div
        ref={ref}
        role="status"
        aria-busy="true"
        aria-live="polite"
        className={cn(
          "nova-loading-overlay",
          fullscreen && "nova-loading-overlay--fullscreen",
          blur && "nova-loading-overlay--blur",
          className
        )}
        {...rest}
      >
        <div className="nova-loading-overlay__content">
          {children ?? <Spinner size={spinnerSize} />}
          {message != null && (
            <div className="nova-loading-overlay__message">{message}</div>
          )}
        </div>
      </div>
    );
  }
);
