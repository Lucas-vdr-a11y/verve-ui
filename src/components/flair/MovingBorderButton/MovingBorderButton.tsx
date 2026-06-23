import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./MovingBorderButton.css";

export interface MovingBorderButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Seconds for the streak to complete one lap. Defaults `3`. */
  duration?: number;
  /** Color of the travelling streak. Defaults to a brand accent. */
  streakColor?: string;
  /** Border radius token-ish value applied to the pill. Defaults `var(--nova-radius-xl)`. */
  radius?: string;
  children?: React.ReactNode;
}

/**
 * A button with a bright light streak that continuously travels around its
 * rounded border (the Aceternity moving border). The streak is a rotating
 * conic-gradient layer masked to a thin rim; an inner solid panel holds the
 * content, so the glow appears to orbit the edge.
 *
 * Real `<button>`. The orbit animation pauses under reduced motion.
 */
export const MovingBorderButton = forwardRef<
  HTMLButtonElement,
  MovingBorderButtonProps
>(function MovingBorderButton(
  {
    duration = 3,
    streakColor,
    radius,
    className,
    children,
    style,
    type,
    ...rest
  },
  ref
) {
  return (
    <button
      ref={ref}
      type={type ?? "button"}
      className={cn("nova-moving-border", className)}
      style={
        {
          "--nova-mb-duration": `${duration}s`,
          ...(streakColor ? { "--nova-mb-streak": streakColor } : null),
          ...(radius ? { "--nova-mb-radius": radius } : null),
          ...style,
        } as React.CSSProperties
      }
      {...rest}
    >
      <span className="nova-moving-border__orbit" aria-hidden="true" />
      <span className="nova-moving-border__content">{children}</span>
    </button>
  );
});
