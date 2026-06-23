import { forwardRef, useEffect, useId, useState } from "react";
import { cn } from "../../../utils/cn";
import "./AnimatedBlob.css";

/** SSR-safe reduced-motion preference (false until mounted on the client). */
function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);
  return reduced;
}

export interface AnimatedBlobProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color"> {
  /** Diameter token. Defaults `"lg"`. */
  size?: "sm" | "md" | "lg" | "xl";
  /** Seconds for one full morph cycle. Defaults `12`. */
  duration?: number;
  /** Fill: any CSS color, or `"gradient"` for the brand gradient. Defaults the brand gradient. */
  fill?: string | "gradient";
}

const SIZES: Record<NonNullable<AnimatedBlobProps["size"]>, number> = {
  sm: 140,
  md: 240,
  lg: 360,
  xl: 520,
};

/** Morph keyframes (centered on origin, -100..100 viewbox). First == last to loop seamlessly. */
const FRAMES = [
  "M44 -57C57 -47 67 -33 70 -18C73 -3 69 14 60 28C51 42 37 53 21 60C5 67 -13 70 -29 64C-45 58 -59 43 -65 26C-71 9 -69 -10 -61 -26C-53 -42 -39 -55 -23 -63C-7 -71 11 -73 26 -71C41 -69 31 -67 44 -57Z",
  "M48 -60C62 -50 72 -33 74 -16C76 1 70 19 60 33C50 47 36 57 19 64C2 71 -17 75 -33 68C-49 61 -62 44 -67 26C-72 8 -69 -11 -60 -27C-51 -43 -36 -55 -20 -63C-4 -71 13 -75 28 -73C43 -71 34 -70 48 -60Z",
  "M38 -50C51 -42 64 -33 70 -20C76 -7 75 9 68 23C61 37 48 49 33 57C18 65 1 69 -16 66C-33 63 -50 53 -60 38C-70 23 -73 3 -68 -14C-63 -31 -50 -45 -34 -55C-18 -65 1 -71 16 -67C31 -63 25 -58 38 -50Z",
];

/**
 * A blob whose SVG path morphs continuously between a few organic shapes via SMIL
 * (`<animate>`). Brand-tinted by default — great behind hero content.
 *
 * SSR-safe (static markup; SMIL runs in the browser). The morph pauses under
 * reduced-motion (CSS). Decorative — aria-hidden.
 */
export const AnimatedBlob = forwardRef<HTMLDivElement, AnimatedBlobProps>(
  function AnimatedBlob(
    {
      size = "lg",
      duration = 12,
      fill = "gradient",
      className,
      style,
      ...rest
    },
    ref
  ) {
    const px = SIZES[size];
    const isGradient = fill === "gradient";
    const gradId = `nova-ablob-grad-${useId()}`;
    const values = [...FRAMES, FRAMES[0]].join(";");
    const reduced = usePrefersReducedMotion();

    return (
      <div
        ref={ref}
        aria-hidden="true"
        className={cn("nova-animated-blob", className)}
        style={
          {
            "--nova-ablob-fill": isGradient ? undefined : fill,
            width: px,
            height: px,
            ...style,
          } as React.CSSProperties
        }
        {...rest}
      >
        <svg
          className="nova-animated-blob__svg"
          viewBox="-100 -100 200 200"
          width="100%"
          height="100%"
          xmlns="http://www.w3.org/2000/svg"
        >
          {isGradient && (
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="var(--nova-brand-400)" />
                <stop offset="100%" stopColor="var(--nova-brand-700)" />
              </linearGradient>
            </defs>
          )}
          <path
            className="nova-animated-blob__path"
            d={FRAMES[0]}
            fill={isGradient ? `url(#${gradId})` : "var(--nova-ablob-fill)"}
          >
            {!reduced && (
              <animate
                attributeName="d"
                dur={`${duration}s`}
                repeatCount="indefinite"
                values={values}
                calcMode="spline"
                keyTimes="0;0.33;0.66;1"
                keySplines="0.4 0 0.2 1;0.4 0 0.2 1;0.4 0 0.2 1"
              />
            )}
          </path>
        </svg>
      </div>
    );
  }
);
