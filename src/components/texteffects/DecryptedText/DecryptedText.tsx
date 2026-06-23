import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { cn } from "../../../utils/cn";
import { useReducedMotion } from "../../utility/useReducedMotion/useReducedMotion";
import "./DecryptedText.css";

export interface DecryptedTextProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> {
  /** Final text to decrypt to. */
  text: string;
  /** Matrix-rain symbol set cycled before each letter locks. */
  glyphs?: string;
  /** Milliseconds between scramble frames. Defaults `45`. */
  frameRate?: number;
  /** Frames before the reveal sweep advances one character. Defaults `3`. */
  revealEvery?: number;
  /** Run once on mount. Defaults `true`. */
  animateOnMount?: boolean;
  /** Re-run the decrypt on hover. Defaults `true`. */
  animateOnHover?: boolean;
}

const MATRIX_GLYPHS =
  "アイウエオカキクケコサシスセソタチツテトﾊﾋﾌﾍﾎ0123456789ｦｧｨｩｪｫｬ:.\"=*+-<>";

/**
 * DecryptedText — every character flickers through a matrix-rain symbol set
 * while a reveal sweep settles the real letters left-to-right (a "decrypt"
 * effect, distinct from a per-letter hover scramble). Driven by a single frame
 * timer in an effect with cleanup; SSR-safe. Under reduced-motion the final
 * text is shown immediately with no scrambling.
 */
export const DecryptedText = forwardRef<HTMLSpanElement, DecryptedTextProps>(
  function DecryptedText(
    {
      text,
      glyphs = MATRIX_GLYPHS,
      frameRate = 45,
      revealEvery = 3,
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
    const [locked, setLocked] = useState<boolean[]>(() =>
      Array.from(text, () => true)
    );
    const frameRef = useRef(0);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const run = useCallback(() => {
      if (reduced || typeof window === "undefined") {
        setDisplay(text);
        setLocked(Array.from(text, () => true));
        return;
      }
      if (timerRef.current) clearInterval(timerRef.current);
      frameRef.current = 0;
      const chars = Array.from(text);

      timerRef.current = setInterval(() => {
        const frame = frameRef.current;
        const revealed = Math.floor(frame / revealEvery);
        const lockedNow = chars.map((_, i) => i < revealed);
        const next = chars
          .map((ch, i) => {
            if (ch === " ") return " ";
            if (i < revealed) return ch;
            return glyphs[Math.floor(Math.random() * glyphs.length)] ?? ch;
          })
          .join("");
        setDisplay(next);
        setLocked(lockedNow);

        if (revealed >= chars.length) {
          setDisplay(text);
          setLocked(chars.map(() => true));
          if (timerRef.current) clearInterval(timerRef.current);
          timerRef.current = null;
        }
        frameRef.current = frame + 1;
      }, frameRate);
    }, [reduced, text, glyphs, frameRate, revealEvery]);

    useEffect(() => {
      if (animateOnMount) run();
      else {
        setDisplay(text);
        setLocked(Array.from(text, () => true));
      }
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }, [animateOnMount, run, text]);

    const handleMouseEnter: React.MouseEventHandler<HTMLSpanElement> = (e) => {
      if (animateOnHover) run();
      onMouseEnter?.(e);
    };

    const chars = Array.from(display);

    return (
      <span
        ref={ref}
        className={cn("nova-decrypted-text", className)}
        onMouseEnter={handleMouseEnter}
        aria-label={text}
        {...rest}
      >
        <span aria-hidden="true">
          {chars.map((ch, i) => (
            <span
              key={i}
              className={cn(
                "nova-decrypted-text__char",
                !locked[i] && "nova-decrypted-text__char--scrambling"
              )}
            >
              {ch === " " ? " " : ch}
            </span>
          ))}
        </span>
      </span>
    );
  }
);
