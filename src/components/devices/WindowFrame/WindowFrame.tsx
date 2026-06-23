import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./WindowFrame.css";

export interface WindowFrameProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /** Window title shown in the title bar. */
  title?: React.ReactNode;
  /** Control placement / style. Defaults to `"mac"` (left traffic lights). */
  controls?: "mac" | "windows";
  /** Optional sidebar slot rendered to the left of the content. */
  sidebar?: React.ReactNode;
  /** Main content slot. */
  children?: React.ReactNode;
}

const MacControls = () => (
  <span className="nova-window__lights" aria-hidden="true">
    <span className="nova-window__light nova-window__light--close" />
    <span className="nova-window__light nova-window__light--min" />
    <span className="nova-window__light nova-window__light--max" />
  </span>
);

const WinControls = () => (
  <span className="nova-window__wincontrols" aria-hidden="true">
    <svg viewBox="0 0 10 10" width="0.7em" height="0.7em"><path d="M0 5h10" stroke="currentColor" strokeWidth="1" /></svg>
    <svg viewBox="0 0 10 10" width="0.7em" height="0.7em"><rect x="0.5" y="0.5" width="9" height="9" fill="none" stroke="currentColor" strokeWidth="1" /></svg>
    <svg viewBox="0 0 10 10" width="0.7em" height="0.7em"><path d="M0 0l10 10M10 0L0 10" stroke="currentColor" strokeWidth="1" /></svg>
  </span>
);

/**
 * WindowFrame — generic OS app-window chrome: a title bar with window controls,
 * an optional sidebar slot and a content slot. Static "resizable" look.
 */
export const WindowFrame = forwardRef<HTMLDivElement, WindowFrameProps>(
  function WindowFrame(
    { title, controls = "mac", sidebar, children, className, ...rest },
    ref,
  ) {
    return (
      <div
        ref={ref}
        className={cn("nova-window", `nova-window--${controls}`, className)}
        {...rest}
      >
        <div className="nova-window__titlebar">
          {controls === "mac" && <MacControls />}
          {title && <span className="nova-window__title">{title}</span>}
          {controls === "windows" && <WinControls />}
        </div>

        <div className="nova-window__main">
          {sidebar && <aside className="nova-window__sidebar">{sidebar}</aside>}
          <div className="nova-window__content">{children}</div>
        </div>

        <span className="nova-window__resize" aria-hidden="true" />
      </div>
    );
  },
);
