import { forwardRef, useEffect, useState } from "react";
import { cn } from "../../../utils/cn";
import { useReducedMotion } from "../../utility/useReducedMotion/useReducedMotion";
import "./MorphingText.css";

export interface MorphingTextProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** Strings to morph between, in order. */
  texts: string[];
  /** Milliseconds each string holds fully visible. Defaults `1800`. */
  holdDuration?: number;
  /** Milliseconds for the blur+fade crossover. Defaults `700`. */
  morphDuration?: number;
}

/**
 * MorphingText — smoothly cross-fades between strings, the outgoing word
 * blurring and fading out while the incoming one sharpens in, looping forever.
 * Two stacked layers are swapped by a timer in an effect (with cleanup); SSR-
 * safe and, under reduced-motion, just shows the first string with no looping.
 */
export const MorphingText = forwardRef<HTMLDivElement, MorphingTextProps>(
  function MorphingText(
    {
      texts,
      holdDuration = 1800,
      morphDuration = 700,
      className,
      style,
      ...rest
    },
    ref
  ) {
    const reduced = useReducedMotion();
    const [index, setIndex] = useState(0);

    useEffect(() => {
      if (reduced || texts.length <= 1) return;
      const timer = setInterval(
        () => setIndex((i) => (i + 1) % texts.length),
        holdDuration + morphDuration
      );
      return () => clearInterval(timer);
    }, [reduced, texts.length, holdDuration, morphDuration]);

    if (reduced) {
      return (
        <div
          ref={ref}
          className={cn("nova-morphing-text", className)}
          style={style}
          {...rest}
        >
          <span className="nova-morphing-text__layer nova-morphing-text__layer--static">
            {texts[0] ?? ""}
          </span>
        </div>
      );
    }

    const prev = (index - 1 + texts.length) % texts.length;

    return (
      <div
        ref={ref}
        className={cn("nova-morphing-text", className)}
        style={
          {
            "--nova-morphing-duration": `${morphDuration}ms`,
            ...style,
          } as React.CSSProperties
        }
        aria-label={texts[index]}
        {...rest}
      >
        {/* Outgoing layer fades+blurs out; incoming sharpens in. Keyed so the
            animation restarts on every swap. */}
        <span
          key={`out-${prev}-${index}`}
          className="nova-morphing-text__layer nova-morphing-text__layer--out"
          aria-hidden="true"
        >
          {texts[prev]}
        </span>
        <span
          key={`in-${index}`}
          className="nova-morphing-text__layer nova-morphing-text__layer--in"
          aria-hidden="true"
        >
          {texts[index]}
        </span>
      </div>
    );
  }
);
