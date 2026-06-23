import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { cn } from "../../../utils/cn";
import { useReducedMotion } from "../../utility/useReducedMotion/useReducedMotion";
import "./HyperText.css";

export interface HyperTextProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> {
  /** Final text to settle on. */
  text: string;
  /** Glyphs to cycle through while scrambling. Defaults A–Z. */
  glyphs?: string;
  /** Milliseconds between scramble frames. Defaults `40`. */
  frameRate?: number;
  /** Frames each character scrambles before locking in. Defaults `8`. */
  scrambleFrames?: number;
  /** Run once on mount. Defaults `true`. */
  animateOnMount?: boolean;
  /** Re-run the decode when the user hovers. Defaults `true`. */
  animateOnHover?: boolean;
}

const DEFAULT_GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/**
 * HyperText — characters cycle through random glyphs, then lock into the final
 * text left-to-right ("decode" effect), on mount and/or hover. Driven by a
 * single timer in an effect with cleanup; SSR-safe and, under reduced-motion,
 * shows the final text immediately with no scrambling.
 */
export const HyperText = forwardRef<HTMLSpanElement, HyperTextProps>(
  function HyperText(
    {
      text,
      glyphs = DEFAULT_GLYPHS,
      frameRate = 40,
      scrambleFrames = 8,
      animateOnMount = true,
      animateOnHover = true,
      className,
      onMouseEnter,
      ...rest
    },
    ref
  ) {
    const reduced = useReducedMotion();
    const [display, setDisplay] = useState(text);
    const frameRef = useRef(0);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const run = useCallback(() => {
      if (reduced || typeof window === "undefined") {
        setDisplay(text);
        return;
      }
      if (timerRef.current) clearInterval(timerRef.current);
      frameRef.current = 0;
      const chars = Array.from(text);

      timerRef.current = setInterval(() => {
        const frame = frameRef.current;
        const settled = Math.floor(frame / scrambleFrames);
        const next = chars
          .map((ch, i) => {
            if (ch === " ") return " ";
            if (i < settled) return ch;
            return glyphs[Math.floor(Math.random() * glyphs.length)] ?? ch;
          })
          .join("");
        setDisplay(next);

        if (settled >= chars.length) {
          setDisplay(text);
          if (timerRef.current) clearInterval(timerRef.current);
          timerRef.current = null;
        }
        frameRef.current = frame + 1;
      }, frameRate);
    }, [reduced, text, glyphs, frameRate, scrambleFrames]);

    useEffect(() => {
      if (animateOnMount) run();
      else setDisplay(text);
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }, [animateOnMount, run, text]);

    const handleMouseEnter: React.MouseEventHandler<HTMLSpanElement> = (e) => {
      if (animateOnHover) run();
      onMouseEnter?.(e);
    };

    return (
      <span
        ref={ref}
        className={cn("nova-hyper-text", className)}
        onMouseEnter={handleMouseEnter}
        aria-label={text}
        {...rest}
      >
        <span aria-hidden="true">{display}</span>
      </span>
    );
  }
);
