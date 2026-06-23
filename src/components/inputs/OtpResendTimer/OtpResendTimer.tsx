import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { cn } from "../../../utils/cn";
import "./OtpResendTimer.css";

export interface OtpResendTimerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** Countdown length in seconds before resend re-enables. Defaults to `30`. */
  seconds?: number;
  /** Fired when the user triggers a resend. */
  onResend?: () => void;
  /** Start the countdown immediately on mount. Defaults to `true`. */
  autoStart?: boolean;
  /** Label for the active resend button. Defaults to `"Resend code"`. */
  resendLabel?: string;
  /**
   * Renders the waiting text. Receives remaining seconds.
   * Defaults to `Resend code in {n}s`.
   */
  renderCountdown?: (remaining: number) => React.ReactNode;
  /** Disables the control entirely. */
  disabled?: boolean;
}

export const OtpResendTimer = forwardRef<HTMLDivElement, OtpResendTimerProps>(
  function OtpResendTimer(
    {
      seconds = 30,
      onResend,
      autoStart = true,
      resendLabel = "Resend code",
      renderCountdown,
      disabled = false,
      className,
      ...rest
    },
    ref
  ) {
    const [remaining, setRemaining] = useState<number>(autoStart ? seconds : 0);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const stop = useCallback(() => {
      if (intervalRef.current != null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }, []);

    const start = useCallback(() => {
      stop();
      setRemaining(seconds);
      intervalRef.current = setInterval(() => {
        setRemaining((prev) => {
          if (prev <= 1) {
            stop();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, [seconds, stop]);

    // Kick off the countdown on mount when requested.
    useEffect(() => {
      if (autoStart) start();
      return stop;
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleResend = () => {
      if (disabled || remaining > 0) return;
      onResend?.();
      start();
    };

    const waiting = remaining > 0;

    return (
      <div
        ref={ref}
        className={cn(
          "nova-otp-resend",
          waiting && "nova-otp-resend--waiting",
          disabled && "nova-otp-resend--disabled",
          className
        )}
        data-disabled={disabled || undefined}
        {...rest}
      >
        <button
          type="button"
          className="nova-otp-resend__btn nova-focusable"
          onClick={handleResend}
          disabled={disabled || waiting}
          aria-disabled={disabled || waiting || undefined}
        >
          {resendLabel}
        </button>
        {waiting && (
          <span className="nova-otp-resend__countdown" aria-live="polite">
            {renderCountdown
              ? renderCountdown(remaining)
              : `Resend available in ${remaining}s`}
          </span>
        )}
      </div>
    );
  }
);
