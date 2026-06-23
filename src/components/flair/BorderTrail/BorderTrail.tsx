import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./BorderTrail.css";

export interface BorderTrailProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Seconds for one full lap of the border. Defaults `4`. */
  duration?: number;
  /** Length of the glowing segment, any CSS length. Defaults `"30%"`. */
  size?: string;
  /** Trail color (CSS color). Defaults the brand primary token. */
  color?: string;
  /** Border thickness, any CSS length. Defaults `"2px"`. */
  thickness?: string;
  /** Card content. */
  children?: React.ReactNode;
}

/**
 * A self-looping border trail: a small glowing segment continuously travels
 * around the element's border path (top → right → bottom → left), distinct from
 * a cursor-following border. Implemented with a conic-gradient mask animated via
 * CSS, so it needs no JS and is GPU-friendly. Reduced motion freezes the trail.
 */
export const BorderTrail = forwardRef<HTMLDivElement, BorderTrailProps>(
  function BorderTrail(
    {
      duration = 4,
      size = "30%",
      color,
      thickness = "2px",
      className,
      children,
      style,
      ...rest
    },
    ref
  ) {
    return (
      <div
        ref={ref}
        className={cn("nova-border-trail", className)}
        style={
          {
            "--nova-bt-duration": `${duration}s`,
            "--nova-bt-size": size,
            "--nova-bt-thickness": thickness,
            ...(color ? { "--nova-bt-color": color } : null),
            ...style,
          } as React.CSSProperties
        }
        {...rest}
      >
        <span className="nova-border-trail__trail" aria-hidden="true" />
        <div className="nova-border-trail__content">{children}</div>
      </div>
    );
  }
);
