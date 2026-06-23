import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./ShineBorder.css";

export interface ShineBorderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Border thickness in px. Defaults `1.5`. */
  borderWidth?: number;
  /** Duration of one shine cycle in seconds. Defaults `8`. */
  duration?: number;
  /** Corner radius. Defaults the token `--nova-radius-lg`. */
  radius?: string;
  /** One or more colors cycled through the moving gradient. */
  colors?: string[];
  children?: React.ReactNode;
}

/**
 * An animated shining gradient border around a card. A moving multi-stop
 * gradient is painted only on the border ring (mask-composite), creating a
 * continuous sheen. Wraps children; the inner surface stays themeable.
 *
 * SSR-safe (pure CSS). Border layer is aria-hidden. Freezes on reduced-motion.
 */
export const ShineBorder = forwardRef<HTMLDivElement, ShineBorderProps>(
  function ShineBorder(
    {
      borderWidth = 1.5,
      duration = 8,
      radius = "var(--nova-radius-lg)",
      colors = [
        "var(--nova-brand-400)",
        "var(--nova-info-500)",
        "var(--nova-brand-600)",
      ],
      className,
      style,
      children,
      ...rest
    },
    ref
  ) {
    const gradient = `${colors.join(", ")}, ${colors[0]}`;
    return (
      <div
        ref={ref}
        className={cn("nova-shine", className)}
        style={
          {
            "--nova-shine-border": `${borderWidth}px`,
            "--nova-shine-duration": `${duration}s`,
            "--nova-shine-radius": radius,
            "--nova-shine-gradient": gradient,
            ...style,
          } as React.CSSProperties
        }
        {...rest}
      >
        <span aria-hidden="true" className="nova-shine__border" />
        <div className="nova-shine__content">{children}</div>
      </div>
    );
  }
);
