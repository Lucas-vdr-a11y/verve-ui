import { forwardRef, useEffect, useState } from "react";
import { cn } from "../../../utils/cn";
import { useReducedMotion } from "../../utility/useReducedMotion/useReducedMotion";
import "./SparklesText.css";

export interface SparklesTextProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "color"> {
  /** Text to render. */
  text: string;
  /** How many sparkles float around the text at once. Defaults `8`. */
  count?: number;
  /** Sparkle color. Defaults `var(--nova-brand-400)`. */
  sparkleColor?: string;
  /** Smallest / largest sparkle size in px. Defaults `[8, 16]`. */
  sizeRange?: [number, number];
}

interface Sparkle {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
}

/* Deterministic PRNG so the first (SSR) render matches the client, avoiding a
   hydration mismatch. Sparkles then re-randomize over time on the client only. */
function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildSparkles(
  count: number,
  sizeRange: [number, number],
  seed: number
): Sparkle[] {
  const rand = mulberry32(seed);
  const [min, max] = sizeRange;
  return Array.from({ length: count }, (_, id) => ({
    id: seed * 1000 + id,
    x: rand() * 100,
    y: rand() * 100,
    size: min + rand() * (max - min),
    delay: rand() * 0.6,
    duration: 0.8 + rand() * 0.9,
  }));
}

/**
 * SparklesText — little twinkling stars pop at random positions over and around
 * the text, each fading + scaling on its own loop. Positions are seeded so the
 * server and first client render agree (SSR-safe), then re-randomize on an
 * interval purely on the client. Under reduced-motion the sparkles are hidden.
 */
export const SparklesText = forwardRef<HTMLSpanElement, SparklesTextProps>(
  function SparklesText(
    {
      text,
      count = 8,
      sparkleColor,
      sizeRange = [8, 16],
      className,
      style,
      ...rest
    },
    ref
  ) {
    const reduced = useReducedMotion();
    const [seed, setSeed] = useState(1);
    const sparkles = buildSparkles(count, sizeRange, seed);

    useEffect(() => {
      if (reduced) return;
      const interval = setInterval(() => setSeed((s) => s + 1), 1600);
      return () => clearInterval(interval);
    }, [reduced]);

    const cssVars = {
      ...(sparkleColor != null
        ? { "--nova-sparkles-color": sparkleColor }
        : null),
    } as React.CSSProperties;

    return (
      <span
        ref={ref}
        className={cn("nova-sparkles-text", className)}
        style={{ ...cssVars, ...style }}
        {...rest}
      >
        {!reduced && (
          <span className="nova-sparkles-text__field" aria-hidden="true">
            {sparkles.map((s) => (
              <svg
                key={s.id}
                className="nova-sparkles-text__star"
                viewBox="0 0 24 24"
                style={
                  {
                    left: `${s.x}%`,
                    top: `${s.y}%`,
                    width: `${s.size}px`,
                    height: `${s.size}px`,
                    "--nova-sparkles-delay": `${s.delay}s`,
                    "--nova-sparkles-duration": `${s.duration}s`,
                  } as React.CSSProperties
                }
              >
                <path d="M12 0c.6 5.4 6 10.8 12 12-6 1.2-11.4 6.6-12 12-.6-5.4-6-10.8-12-12C6 10.8 11.4 5.4 12 0Z" />
              </svg>
            ))}
          </span>
        )}
        <span className="nova-sparkles-text__label">{text}</span>
      </span>
    );
  }
);
