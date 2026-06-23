import { forwardRef, useEffect, useRef, useState } from "react";
import { cn } from "../../../utils/cn";
import "./AnimatedCounter.css";

export interface AnimatedCounterProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "prefix"> {
  /** Target value to animate to. */
  value: number;
  /** Value to start from on the first render. Defaults to `0`. */
  from?: number;
  /** Animation duration in milliseconds. Defaults to `1000`. */
  duration?: number;
  /** Number of decimal places to render. Defaults to `0`. */
  decimals?: number;
  /** BCP-47 locale(s) for number formatting, e.g. "en-US". */
  locale?: string | string[];
  /** Extra `Intl.NumberFormat` options (merged with `decimals`). */
  formatOptions?: Intl.NumberFormatOptions;
  /** Content rendered before the number. */
  prefix?: React.ReactNode;
  /** Content rendered after the number. */
  suffix?: React.ReactNode;
}

const prefersReducedMotion = (): boolean => {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);

export const AnimatedCounter = forwardRef<HTMLSpanElement, AnimatedCounterProps>(
  function AnimatedCounter(
    {
      value,
      from = 0,
      duration = 1000,
      decimals = 0,
      locale,
      formatOptions,
      prefix,
      suffix,
      className,
      ...rest
    },
    ref
  ) {
    const [display, setDisplay] = useState<number>(from);
    const prevRef = useRef<number>(from);

    useEffect(() => {
      const start = prevRef.current;
      const end = value;
      prevRef.current = value;

      if (start === end) {
        setDisplay(end);
        return;
      }

      if (
        typeof window === "undefined" ||
        typeof requestAnimationFrame === "undefined" ||
        prefersReducedMotion() ||
        duration <= 0
      ) {
        setDisplay(end);
        return;
      }

      let raf = 0;
      let startTime: number | null = null;

      const tick = (now: number) => {
        if (startTime === null) startTime = now;
        const elapsed = now - startTime;
        const t = Math.min(elapsed / duration, 1);
        const eased = easeOutCubic(t);
        setDisplay(start + (end - start) * eased);
        if (t < 1) {
          raf = requestAnimationFrame(tick);
        } else {
          setDisplay(end);
        }
      };

      raf = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(raf);
    }, [value, duration]);

    const formatter = new Intl.NumberFormat(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
      ...formatOptions,
    });

    return (
      <span
        ref={ref}
        className={cn("nova-animated-counter", className)}
        {...rest}
      >
        {prefix != null && (
          <span className="nova-animated-counter__affix">{prefix}</span>
        )}
        <span className="nova-animated-counter__value">
          {formatter.format(display)}
        </span>
        {suffix != null && (
          <span className="nova-animated-counter__affix">{suffix}</span>
        )}
      </span>
    );
  }
);
