import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./GradientAnimation.css";

export interface GradientAnimationProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Animation speed. Defaults `"md"`. */
  speed?: "sm" | "md" | "lg";
  /** Blur softness of the gradient blobs. Defaults `"md"`. */
  blur?: "sm" | "md" | "lg";
  /** Override the five blob colors (CSS colors). Defaults brand-tinted set. */
  colors?: [string, string, string, string, string];
  /** Solid background behind the blobs. Defaults the bg token. */
  background?: string;
  children?: React.ReactNode;
}

const DEFAULT_COLORS: [string, string, string, string, string] = [
  "var(--nova-brand-500)",
  "var(--nova-brand-400)",
  "var(--nova-info-500)",
  "var(--nova-brand-600)",
  "var(--nova-brand-300)",
];

/**
 * A smoothly animated multi-color mesh gradient — five large radial blobs that
 * drift, scale and orbit independently behind content for a premium ambient
 * backdrop. Speed, blur, the five blob colors and the base background are
 * configurable; accepts content.
 *
 * SSR-safe (pure CSS animation, no JS). Freezes on reduced-motion. Decorative
 * layer aria-hidden.
 */
export const GradientAnimation = forwardRef<
  HTMLDivElement,
  GradientAnimationProps
>(function GradientAnimation(
  {
    speed = "md",
    blur = "md",
    colors = DEFAULT_COLORS,
    background = "var(--nova-bg)",
    className,
    style,
    children,
    ...rest
  },
  ref
) {
  return (
    <div
      ref={ref}
      className={cn(
        "nova-gradient-anim",
        `nova-gradient-anim--speed-${speed}`,
        `nova-gradient-anim--blur-${blur}`,
        className
      )}
      style={
        {
          "--nova-ga-bg": background,
          "--nova-ga-c1": colors[0],
          "--nova-ga-c2": colors[1],
          "--nova-ga-c3": colors[2],
          "--nova-ga-c4": colors[3],
          "--nova-ga-c5": colors[4],
          ...style,
        } as React.CSSProperties
      }
      {...rest}
    >
      <div className="nova-gradient-anim__field" aria-hidden="true">
        <span className="nova-gradient-anim__blob nova-gradient-anim__blob--1" />
        <span className="nova-gradient-anim__blob nova-gradient-anim__blob--2" />
        <span className="nova-gradient-anim__blob nova-gradient-anim__blob--3" />
        <span className="nova-gradient-anim__blob nova-gradient-anim__blob--4" />
        <span className="nova-gradient-anim__blob nova-gradient-anim__blob--5" />
      </div>
      {children != null && (
        <div className="nova-gradient-anim__content">{children}</div>
      )}
    </div>
  );
});
