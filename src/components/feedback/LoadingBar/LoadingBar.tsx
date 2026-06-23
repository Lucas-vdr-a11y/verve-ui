import { forwardRef, useEffect, useRef, useState } from "react";
import { cn } from "../../../utils/cn";
import "./LoadingBar.css";

export type LoadingBarTone =
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "info";

export interface LoadingBarProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Whether the bar is actively loading/visible. */
  loading: boolean;
  /** Color tone. Defaults to `"primary"`. */
  tone?: LoadingBarTone;
  /** Pin the bar to the very top of the viewport (route-loader style). */
  fixed?: boolean;
  /** Bar thickness. Defaults to `"md"`. */
  size?: "sm" | "md" | "lg";
  /** Accessible label. Defaults to `"Loading"`. */
  label?: string;
}

/**
 * LoadingBar — a thin top-of-page progress indicator with a smooth indeterminate
 * "trickle" toward completion, like a route loader. SSR-safe. When `loading`
 * flips false it completes and fades out before unmounting.
 */
export const LoadingBar = forwardRef<HTMLDivElement, LoadingBarProps>(
  function LoadingBar(
    {
      loading,
      tone = "primary",
      fixed = false,
      size = "md",
      label = "Loading",
      className,
      style,
      ...rest
    },
    ref
  ) {
    // mounted controls presence in the DOM; progress drives the trickle width.
    const [mounted, setMounted] = useState(loading);
    const [progress, setProgress] = useState(0);
    const [completing, setCompleting] = useState(false);
    const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

    useEffect(() => {
      const clearTimers = () => {
        timers.current.forEach(clearTimeout);
        timers.current = [];
      };

      if (loading) {
        clearTimers();
        setCompleting(false);
        setMounted(true);
        setProgress(8);

        // Trickle: approach (but never reach) 100% with decreasing steps.
        const tick = () => {
          setProgress((p) => {
            if (p >= 92) return p;
            const remaining = 92 - p;
            const step = Math.max(0.4, remaining * 0.12);
            return p + step;
          });
          const t = setTimeout(tick, 400);
          timers.current.push(t);
        };
        const start = setTimeout(tick, 200);
        timers.current.push(start);
      } else if (mounted) {
        // Finish: snap to 100%, then fade out and unmount.
        clearTimers();
        setProgress(100);
        setCompleting(true);
        const done = setTimeout(() => {
          setMounted(false);
          setProgress(0);
          setCompleting(false);
        }, 320);
        timers.current.push(done);
      }

      return clearTimers;
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loading]);

    if (!mounted) return null;

    return (
      <div
        ref={ref}
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress)}
        className={cn(
          "nova-loading-bar",
          `nova-loading-bar--${tone}`,
          `nova-loading-bar--${size}`,
          fixed && "nova-loading-bar--fixed",
          completing && "nova-loading-bar--completing",
          className
        )}
        style={style}
        {...rest}
      >
        <div
          className="nova-loading-bar__fill"
          style={{ inlineSize: `${progress}%` }}
        >
          <span className="nova-loading-bar__glow" aria-hidden="true" />
        </div>
      </div>
    );
  }
);
