import { forwardRef } from "react";
import type { CSSProperties, ReactNode } from "react";
import { cn } from "../../../utils/cn";
import "./IsometricCard.css";

export interface IsometricCardProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Card face content. */
  children?: ReactNode;
  /** Extrusion depth in px (thickness of the side walls). @default 24 */
  depth?: number;
  /** Tilt direction of the isometric projection. @default "left" */
  direction?: "left" | "right";
  /** Lift the card on hover. @default true */
  hoverLift?: boolean;
}

/**
 * A card rendered in an isometric / tilted 3D projection with extruded side
 * walls for depth. Lifts toward the viewer on hover.
 */
export const IsometricCard = forwardRef<HTMLDivElement, IsometricCardProps>(
  function IsometricCard(
    {
      children,
      depth = 24,
      direction = "left",
      hoverLift = true,
      className,
      style,
      ...rest
    },
    ref
  ) {
    const cssVars: CSSProperties = {
      ["--nova-iso-depth" as string]: `${depth}px`,
    };

    return (
      <div
        ref={ref}
        className={cn(
          "nova-iso-card",
          `nova-iso-card--${direction}`,
          hoverLift && "nova-iso-card--lift",
          className
        )}
        style={{ ...cssVars, ...style }}
        {...rest}
      >
        <div className="nova-iso-card__solid">
          <span className="nova-iso-card__side nova-iso-card__side--bottom" />
          <span className="nova-iso-card__side nova-iso-card__side--right" />
          <div className="nova-iso-card__face">{children}</div>
        </div>
      </div>
    );
  }
);
