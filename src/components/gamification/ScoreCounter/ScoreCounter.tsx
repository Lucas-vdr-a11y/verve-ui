import { forwardRef, useEffect, useRef, useState } from "react";
import { cn } from "../../../utils/cn";
import "./ScoreCounter.css";

export interface ScoreCounterProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "prefix"> {
  /** Score value to display. */
  value: number;
  /** Roll-up duration in ms. Defaults to `600`. */
  duration?: number;
  /** Content rendered before the number (e.g. a coin icon). */
  prefix?: React.ReactNode;
  /** Content rendered after the number. */
  suffix?: React.ReactNode;
  /** Show the floating "+N" on increase. Defaults to `true`. */
  showDelta?: boolean;
  /** BCP-47 locale(s) for formatting. */
  locale?: string | string[];
}

const prefersReducedMotion = (): boolean => {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);

export const ScoreCounter = forwardRef<HTMLSpanElement, ScoreCounterProps>(
  function ScoreCounter(
    {
      value,
      duration = 600,
      prefix,
      suffix,
      showDelta = true,
      locale,
      className,
      ...rest
    },
    ref
  ) {
    const [display, setDisplay] = useState(value);
    const [delta, setDelta] = useState<number | null>(null);
    const [bounce, setBounce] = useState(false);
    const prev = useRef(value);
    const rafRef = useRef<number | null>(null);
    const deltaTimer = useRef<number | null>(null);

    useEffect(() => {
      const start = prev.current;
      const end = value;
      prev.current = value;
      if (start === end) return;

      const increased = end > start;
      if (increased && showDelta && !prefersReducedMotion()) {
        setDelta(end - start);
        setBounce(true);
        if (deltaTimer.current !== null) window.clearTimeout(deltaTimer.current);
        deltaTimer.current = window.setTimeout(() => {
          setDelta(null);
          setBounce(false);
        }, 900);
      }

      if (
        typeof requestAnimationFrame === "undefined" ||
        prefersReducedMotion() ||
        duration <= 0
      ) {
        setDisplay(end);
        return;
      }

      let startTime: number | null = null;
      const tick = (now: number) => {
        if (startTime === null) startTime = now;
        const t = Math.min((now - startTime) / duration, 1);
        setDisplay(Math.round(start + (end - start) * easeOutCubic(t)));
        if (t < 1) {
          rafRef.current = requestAnimationFrame(tick);
        } else {
          setDisplay(end);
        }
      };
      rafRef.current = requestAnimationFrame(tick);
    }, [value, duration, showDelta]);

    useEffect(
      () => () => {
        if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
        if (deltaTimer.current !== null) window.clearTimeout(deltaTimer.current);
      },
      []
    );

    const formatter = new Intl.NumberFormat(locale);

    return (
      <span
        ref={ref}
        className={cn(
          "nova-score-counter",
          bounce && "nova-score-counter--bounce",
          className
        )}
        aria-live="polite"
        {...rest}
      >
        {prefix != null && (
          <span className="nova-score-counter__affix">{prefix}</span>
        )}
        <span className="nova-score-counter__value">
          {formatter.format(display)}
        </span>
        {suffix != null && (
          <span className="nova-score-counter__affix">{suffix}</span>
        )}
        {delta != null && (
          <span className="nova-score-counter__delta" aria-hidden="true">
            +{formatter.format(delta)}
          </span>
        )}
      </span>
    );
  }
);
