import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import { Transition, type TransitionProps } from "../Transition";
import "./Scale.css";

export interface ScaleProps
  extends Omit<TransitionProps, "preset" | "classNames"> {
  /** Drives the scale: `true` scales in, `false` scales out then unmounts. */
  in: boolean;
  /** Scale factor the content grows from (and shrinks to). Defaults `0.95`. */
  from?: number;
  /** CSS `transform-origin` the scale pivots around. Defaults `"center"`. */
  origin?: string;
}

/**
 * Scale + fade wrapper, built on {@link Transition}. The starting scale and the
 * pivot are configurable via CSS custom properties.
 */
export const Scale = forwardRef<HTMLDivElement, ScaleProps>(function Scale(
  { from = 0.95, origin = "center", className, style, ...rest },
  ref
) {
  return (
    <Transition
      ref={ref}
      className={cn("nova-scale", className)}
      style={
        {
          "--nova-scale-from": String(from),
          "--nova-scale-origin": origin,
          ...style,
        } as React.CSSProperties
      }
      {...rest}
    />
  );
});
