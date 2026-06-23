import { forwardRef, useEffect, useRef, useState } from "react";
import { cn } from "../../../utils/cn";
import { useReducedMotion } from "../../utility/useReducedMotion/useReducedMotion";
import "./ScrambleHover.css";

export interface ScrambleHoverProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> {
  /** The resolved text. */
  text: string;
  /** Glyphs to scramble through. Defaults a symbol/letter mix. */
  glyphs?: string;
  /** Milliseconds between scramble frames. Defaults `35`. */
  frameRate?: number;
  /** Frames each character scrambles before resolving. Defaults `10`. */
  scrambleFrames?: number;
}

const DEFAULT_GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ!<>-_\\/[]{}=+*^?#";

/**
 * ScrambleHover — text scrambles through random glyphs then resolves left to
 * right when hovered or focused ("decode on hover"). Distinct from HyperText,
 * which decodes on mount. A single timer drives the scramble and is cleared on
 * unmount; SSR-safe. Under reduced-motion it never scrambles — the text is
 * always shown resolved.
 */
export const ScrambleHover = forwardRef<HTMLSpanElement, ScrambleHoverProps>(
  function ScrambleHover(
    {
      text,
      glyphs = DEFAULT_GLYPHS,
      frameRate = 35,
      scrambleFrames = 10,
      className,
      onMouseEnter,
      onFocus,
      ...rest
    },
    ref
  ) {
    const reduced = useReducedMotion();
    const [display, setDisplay] = useState(text);
    const frameRef = useRef(0);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
      setDisplay(text);
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }, [text]);

    const run = () => {
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
    };

    const handleMouseEnter: React.MouseEventHandler<HTMLSpanElement> = (e) => {
      run();
      onMouseEnter?.(e);
    };
    const handleFocus: React.FocusEventHandler<HTMLSpanElement> = (e) => {
      run();
      onFocus?.(e);
    };

    return (
      <span
        ref={ref}
        className={cn("nova-scramble-hover", className)}
        onMouseEnter={handleMouseEnter}
        onFocus={handleFocus}
        tabIndex={0}
        aria-label={text}
        {...rest}
      >
        <span aria-hidden="true">{display}</span>
      </span>
    );
  }
);
