import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import { Transition, type TransitionProps } from "../Transition";
import "./Fade.css";

export interface FadeProps
  extends Omit<TransitionProps, "preset" | "classNames"> {
  /** Drives the fade: `true` fades in, `false` fades out then unmounts. */
  in: boolean;
}

/**
 * Fade in/out wrapper, built on the {@link Transition} primitive. Keeps the
 * child mounted through the fade-out, then unmounts. SSR-safe and reduced-motion
 * aware (inherited from `Transition`).
 */
export const Fade = forwardRef<HTMLDivElement, FadeProps>(function Fade(
  { className, ...rest },
  ref
) {
  return (
    <Transition
      ref={ref}
      preset="fade"
      className={cn("nova-fade", className)}
      {...rest}
    />
  );
});
