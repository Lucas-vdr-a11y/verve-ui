import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./Kbd.css";

export type KbdSize = "sm" | "md" | "lg";

export interface KbdProps extends React.HTMLAttributes<HTMLElement> {
  /** Size on the sm/md/lg scale. Defaults to `"md"`. */
  size?: KbdSize;
}

export const Kbd = forwardRef<HTMLElement, KbdProps>(function Kbd(
  { size = "md", className, children, ...rest },
  ref
) {
  return (
    <kbd
      ref={ref}
      className={cn("nova-kbd", `nova-kbd--${size}`, className)}
      {...rest}
    >
      {children}
    </kbd>
  );
});
