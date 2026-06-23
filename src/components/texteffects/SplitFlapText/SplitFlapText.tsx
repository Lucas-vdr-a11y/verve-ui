import { forwardRef, useEffect, useRef, useState } from "react";
import { cn } from "../../../utils/cn";
import { useReducedMotion } from "../../utility/useReducedMotion/useReducedMotion";
import "./SplitFlapText.css";

export interface SplitFlapTextProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> {
  /** Final text the board flips to. */
  text: string;
  /** Character pool cycled through on the way to each target glyph. */
  charset?: string;
  /** Milliseconds between flap ticks. Defaults `60`. */
  tickMs?: number;
  /** Extra random flaps before a column settles (adds life). Defaults `4`. */
  extraFlaps?: number;
  /** Replay the flip whenever the text is hovered. Defaults `false`. */
  animateOnHover?: boolean;
}

const DEFAULT_CHARSET =
  " ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,:-'!?";

/**
 * SplitFlapText — an airport/train solari split-flap display. Each column flips
 * through the charset until it lands on its target glyph, columns settling left
 * to right. Driven by a single interval timer in an effect with cleanup;
 * SSR-safe. Under reduced motion the final text is shown immediately.
 */
export const SplitFlapText = forwardRef<HTMLSpanElement, SplitFlapTextProps>(
  function SplitFlapText(
    {
      text,
      charset = DEFAULT_CHARSET,
      tickMs = 60,
      extraFlaps = 4,
      animateOnHover = false,
      className,
      onMouseEnter,
      ...rest
    },
    ref
  ) {
    const reduced = useReducedMotion();
    const target = text.toUpperCase();
    const pool = charset.toUpperCase();

    const [display, setDisplay] = useState<string[]>(() =>
      Array.from(target, (ch) => ch)
    );
    const [flipping, setFlipping] = useState<boolean[]>(() =>
      Array.from(target, () => false)
    );
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const run = () => {
      if (typeof window === "undefined") return;
      if (reduced) {
        setDisplay(Array.from(target));
        setFlipping(Array.from(target, () => false));
        return;
      }
      if (timerRef.current) clearInterval(timerRef.current);

      const chars = Array.from(target);
      // Each column flips for a number of ticks proportional to its index so
      // the board settles left to right.
      const settleAt = chars.map(
        (_, i) => extraFlaps + i * 2 + Math.floor(Math.random() * 3)
      );
      let tick = 0;

      const start = chars.map(() => pool[Math.floor(Math.random() * pool.length)] ?? " ");
      setDisplay(start);
      setFlipping(chars.map((ch) => ch !== " "));

      timerRef.current = setInterval(() => {
        tick += 1;
        const next = chars.map((ch, i) => {
          if (tick >= settleAt[i]!) return ch;
          if (ch === " ") return " ";
          return pool[Math.floor(Math.random() * pool.length)] ?? " ";
        });
        const flip = chars.map((_, i) => tick < settleAt[i]!);
        setDisplay(next);
        setFlipping(flip);

        if (tick > Math.max(0, ...settleAt)) {
          setDisplay(chars);
          setFlipping(chars.map(() => false));
          if (timerRef.current) clearInterval(timerRef.current);
          timerRef.current = null;
        }
      }, tickMs);
    };

    useEffect(() => {
      run();
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [target, pool, tickMs, extraFlaps, reduced]);

    const handleMouseEnter: React.MouseEventHandler<HTMLSpanElement> = (e) => {
      if (animateOnHover) run();
      onMouseEnter?.(e);
    };

    return (
      <span
        ref={ref}
        className={cn("nova-split-flap-text", className)}
        aria-label={text}
        onMouseEnter={handleMouseEnter}
        {...rest}
      >
        <span aria-hidden="true" className="nova-split-flap-text__row">
          {display.map((ch, i) => (
            <span
              key={i}
              className={cn(
                "nova-split-flap-text__cell",
                flipping[i] && "nova-split-flap-text__cell--flipping"
              )}
            >
              <span className="nova-split-flap-text__glyph">
                {ch === " " ? " " : ch}
              </span>
            </span>
          ))}
        </span>
      </span>
    );
  }
);
