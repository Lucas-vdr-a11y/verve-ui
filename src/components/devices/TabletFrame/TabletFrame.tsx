import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./TabletFrame.css";

export interface TabletFrameProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Orientation. Defaults to `"portrait"`. */
  orientation?: "portrait" | "landscape";
  /** Frame size. Defaults to `"md"`. */
  size?: "sm" | "md" | "lg";
  /** Screen content. */
  children?: React.ReactNode;
}

/**
 * TabletFrame — tablet mockup with an even bezel and a front camera dot.
 * Content fills the screen. Supports portrait / landscape orientation.
 */
export const TabletFrame = forwardRef<HTMLDivElement, TabletFrameProps>(
  function TabletFrame(
    { orientation = "portrait", size = "md", children, className, ...rest },
    ref,
  ) {
    return (
      <div
        ref={ref}
        className={cn(
          "nova-tablet",
          `nova-tablet--${orientation}`,
          `nova-tablet--${size}`,
          className,
        )}
        {...rest}
      >
        <span className="nova-tablet__camera" aria-hidden="true" />
        <div className="nova-tablet__screen">{children}</div>
      </div>
    );
  },
);
