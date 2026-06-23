import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./GradientCard.css";

export interface GradientCardProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Animate the gradient continuously instead of only on hover. Defaults `false`. */
  animate?: boolean;
  /** Seconds for one gradient drift cycle. Defaults `6`. */
  duration?: number;
  children?: React.ReactNode;
}

/**
 * A card sitting on an animated multi-stop gradient backdrop that drifts and
 * shifts hue on hover (the "background gradient" card). The gradient lives in a
 * blurred ::before layer behind a solid inner panel so content stays crisp and
 * readable while the colorful glow animates underneath.
 *
 * The drift animation pauses under reduced motion.
 */
export const GradientCard = forwardRef<HTMLDivElement, GradientCardProps>(
  function GradientCard(
    { animate = false, duration = 6, className, children, style, ...rest },
    ref
  ) {
    return (
      <div
        ref={ref}
        className={cn(
          "nova-gradient-card",
          animate && "nova-gradient-card--always",
          className
        )}
        style={
          {
            "--nova-gc-duration": `${duration}s`,
            ...style,
          } as React.CSSProperties
        }
        {...rest}
      >
        <div className="nova-gradient-card__panel">{children}</div>
      </div>
    );
  }
);
