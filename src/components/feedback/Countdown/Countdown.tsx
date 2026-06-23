import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "../../../utils/cn";
import "./Countdown.css";

export type CountdownSize = "sm" | "md" | "lg";

export interface CountdownProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onComplete"> {
  /** Target time to count down to (Date or epoch ms or ISO string). */
  target?: Date | number | string;
  /** Duration in ms to count down from mount. Used when `target` is absent. */
  duration?: number;
  /** Display style. Defaults to `"segmented"`. */
  display?: "segmented" | "compact";
  /** Size on the sm/md/lg scale. Defaults to `"md"`. */
  size?: CountdownSize;
  /** Hide the days segment even when zero is not reached. Defaults to `false`. */
  hideDays?: boolean;
  /** Labels under each segment in segmented mode. */
  labels?: Partial<Record<"days" | "hours" | "minutes" | "seconds", string>>;
  /** Fired once when the countdown reaches zero. */
  onComplete?: () => void;
}

interface Remaining {
  total: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

function split(total: number): Remaining {
  const t = Math.max(total, 0);
  return {
    total: t,
    days: Math.floor(t / DAY),
    hours: Math.floor((t % DAY) / HOUR),
    minutes: Math.floor((t % HOUR) / MINUTE),
    seconds: Math.floor((t % MINUTE) / SECOND),
  };
}

function pad(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

const DEFAULT_LABELS = {
  days: "Days",
  hours: "Hours",
  minutes: "Min",
  seconds: "Sec",
};

/**
 * Countdown — a live timer counting down to a target time or a duration from
 * mount. SSR-safe: the target timestamp is resolved once in an effect (not
 * during render), the interval lives in an effect with cleanup, and the initial
 * render shows a stable zero-state so server and client markup match.
 */
export const Countdown = forwardRef<HTMLDivElement, CountdownProps>(
  function Countdown(
    {
      target,
      duration,
      display = "segmented",
      size = "md",
      hideDays = false,
      labels,
      onComplete,
      className,
      ...rest
    },
    ref
  ) {
    const [remaining, setRemaining] = useState<Remaining>(() => split(0));
    const completedRef = useRef(false);
    const onCompleteRef = useRef(onComplete);
    onCompleteRef.current = onComplete;

    // Resolve the absolute target timestamp. For `duration`, anchor it to mount.
    const targetMs = useMemo(() => {
      if (target != null) {
        const d = target instanceof Date ? target : new Date(target);
        const ms = d.getTime();
        return Number.isNaN(ms) ? null : ms;
      }
      return null;
      // Re-resolve only when the target identity changes.
    }, [target instanceof Date ? target.getTime() : target]);

    useEffect(() => {
      completedRef.current = false;
      const endAt =
        targetMs != null
          ? targetMs
          : Date.now() + (duration != null ? duration : 0);

      const tick = () => {
        const next = split(endAt - Date.now());
        setRemaining(next);
        if (next.total <= 0 && !completedRef.current) {
          completedRef.current = true;
          onCompleteRef.current?.();
          window.clearInterval(id);
        }
      };

      tick();
      const id = window.setInterval(tick, SECOND);
      return () => window.clearInterval(id);
    }, [targetMs, duration]);

    const lab = { ...DEFAULT_LABELS, ...labels };
    const showDays = !hideDays || remaining.days > 0;

    const ariaLabel = `${
      showDays ? `${remaining.days} days ` : ""
    }${remaining.hours} hours ${remaining.minutes} minutes ${
      remaining.seconds
    } seconds remaining`;

    if (display === "compact") {
      const parts: string[] = [];
      if (showDays) parts.push(`${remaining.days}d`);
      parts.push(pad(remaining.hours));
      parts.push(pad(remaining.minutes));
      parts.push(pad(remaining.seconds));
      const dayPart = showDays ? `${parts.shift()} ` : "";
      return (
        <div
          ref={ref}
          role="timer"
          aria-live="off"
          aria-label={ariaLabel}
          className={cn(
            "nova-countdown",
            "nova-countdown--compact",
            `nova-countdown--${size}`,
            className
          )}
          {...rest}
        >
          <span className="nova-countdown__compact">
            {dayPart}
            {parts.join(":")}
          </span>
        </div>
      );
    }

    const segments: Array<{ key: string; value: number; label: string }> = [
      ...(showDays
        ? [{ key: "days", value: remaining.days, label: lab.days }]
        : []),
      { key: "hours", value: remaining.hours, label: lab.hours },
      { key: "minutes", value: remaining.minutes, label: lab.minutes },
      { key: "seconds", value: remaining.seconds, label: lab.seconds },
    ];

    return (
      <div
        ref={ref}
        role="timer"
        aria-live="off"
        aria-label={ariaLabel}
        className={cn(
          "nova-countdown",
          "nova-countdown--segmented",
          `nova-countdown--${size}`,
          className
        )}
        {...rest}
      >
        {segments.map((seg, i) => (
          <span key={seg.key} className="nova-countdown__segment">
            <span className="nova-countdown__value">{pad(seg.value)}</span>
            <span className="nova-countdown__label">{seg.label}</span>
            {i < segments.length - 1 && (
              <span className="nova-countdown__sep" aria-hidden="true">
                :
              </span>
            )}
          </span>
        ))}
      </div>
    );
  }
);
