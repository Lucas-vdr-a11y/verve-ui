import { forwardRef, useEffect, useRef, useState } from "react";
import { cn } from "../../../utils/cn";
import { useReducedMotion } from "../../utility/useReducedMotion/useReducedMotion";
import "./CountingNumber.css";

export interface CountingNumberProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> {
  /** Target value to roll to. */
  value: number;
  /** Value to start rolling from. Defaults `0`. */
  from?: number;
  /** Roll duration (ms). Defaults `1400`. */
  duration?: number;
  /** Decimal places to show. Defaults `0`. */
  decimals?: number;
  /** Thousands separator. Defaults `","`. Pass `""` to disable. */
  separator?: string;
  /** Decimal point character. Defaults `"."`. */
  decimal?: string;
  /** Prefix (e.g. `"$"`). */
  prefix?: string;
  /** Suffix (e.g. `"%"`, `"+"`). */
  suffix?: string;
  /** Trigger the roll when scrolled into view. Defaults `true`. */
  onView?: boolean;
}

const DIGITS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

function format(
  value: number,
  decimals: number,
  separator: string,
  decimal: string
): string {
  const fixed = Math.abs(value).toFixed(decimals);
  const [int, frac] = fixed.split(".");
  const withSep = separator
    ? int.replace(/\B(?=(\d{3})+(?!\d))/g, separator)
    : int;
  const sign = value < 0 ? "-" : "";
  return sign + (frac ? withSep + decimal + frac : withSep);
}

/**
 * CountingNumber — an odometer-style number that rolls each digit up to its
 * value: every digit column physically slides through 0–9 to settle on its
 * target, easing as it lands. Triggered on scroll-into-view (IntersectionObserver
 * in an effect, SSR-safe). Under reduced-motion it snaps straight to the
 * formatted final value with no rolling.
 */
export const CountingNumber = forwardRef<HTMLSpanElement, CountingNumberProps>(
  function CountingNumber(
    {
      value,
      from = 0,
      duration = 1400,
      decimals = 0,
      separator = ",",
      decimal = ".",
      prefix,
      suffix,
      onView = true,
      className,
      style,
      ...rest
    },
    ref
  ) {
    const reduced = useReducedMotion();
    const innerRef = useRef<HTMLSpanElement | null>(null);
    const rafRef = useRef<number | null>(null);
    const [current, setCurrent] = useState(reduced ? value : from);
    const [started, setStarted] = useState(!onView);

    const setRefs = (node: HTMLSpanElement | null) => {
      innerRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    };

    // Observe entry into view to kick off the roll.
    useEffect(() => {
      if (!onView || reduced) {
        setStarted(true);
        return;
      }
      const node = innerRef.current;
      if (!node || typeof IntersectionObserver === "undefined") {
        setStarted(true);
        return;
      }
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setStarted(true);
            observer.disconnect();
          }
        },
        { threshold: 0.4 }
      );
      observer.observe(node);
      return () => observer.disconnect();
    }, [onView, reduced]);

    // Animate the numeric value with an eased rAF loop.
    useEffect(() => {
      if (!started) return;
      if (reduced || typeof window === "undefined") {
        setCurrent(value);
        return;
      }
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        // easeOutExpo for an odometer that decelerates into place.
        const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
        setCurrent(from + (value - from) * eased);
        if (t < 1) rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
      return () => {
        if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      };
    }, [started, reduced, value, from, duration]);

    const text = format(current, decimals, separator, decimal);

    return (
      <span
        ref={setRefs}
        className={cn("nova-counting-number", className)}
        style={style}
        aria-label={`${prefix ?? ""}${format(value, decimals, separator, decimal)}${suffix ?? ""}`}
        {...rest}
      >
        {prefix != null && (
          <span className="nova-counting-number__affix">{prefix}</span>
        )}
        <span className="nova-counting-number__digits" aria-hidden="true">
          {Array.from(text).map((ch, i) =>
            DIGITS.includes(ch) ? (
              <span key={i} className="nova-counting-number__col">
                <span
                  className="nova-counting-number__roll"
                  style={{ "--nova-counting-d": Number(ch) } as React.CSSProperties}
                >
                  {DIGITS.map((d) => (
                    <span key={d} className="nova-counting-number__cell">
                      {d}
                    </span>
                  ))}
                </span>
              </span>
            ) : (
              <span key={i} className="nova-counting-number__sep">
                {ch}
              </span>
            )
          )}
        </span>
        {suffix != null && (
          <span className="nova-counting-number__affix">{suffix}</span>
        )}
      </span>
    );
  }
);
