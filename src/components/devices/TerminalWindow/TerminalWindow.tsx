import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./TerminalWindow.css";

export interface TerminalLine {
  /** The command / output text for the line. */
  text: React.ReactNode;
  /** Render a prompt symbol before the text. Defaults to `true` for input lines. */
  prompt?: boolean;
  /** Line tone for output coloring. */
  tone?: "default" | "muted" | "success" | "warning" | "danger";
}

export interface TerminalWindowProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /** Window title shown in the title bar. */
  title?: React.ReactNode;
  /** Prompt symbol rendered before input lines. Defaults to `"$"`. */
  prompt?: string;
  /** Pre-rendered lines. When omitted, `children` is used as the body. */
  lines?: TerminalLine[];
  /** Show a blinking caret on the final line. Defaults to `true` when `lines` set. */
  caret?: boolean;
  /** Free-form body when not using `lines`. */
  children?: React.ReactNode;
}

const TrafficLights = () => (
  <span className="nova-terminal__lights" aria-hidden="true">
    <span className="nova-terminal__light nova-terminal__light--close" />
    <span className="nova-terminal__light nova-terminal__light--min" />
    <span className="nova-terminal__light nova-terminal__light--max" />
  </span>
);

/**
 * TerminalWindow — terminal/console mockup with traffic lights, a title bar
 * and a monospace body. Optional `lines` render a color-coded prompt with a
 * CSS-only blinking caret (SSR-safe, respects reduced-motion).
 */
export const TerminalWindow = forwardRef<HTMLDivElement, TerminalWindowProps>(
  function TerminalWindow(
    { title = "bash", prompt = "$", lines, caret = true, children, className, ...rest },
    ref,
  ) {
    return (
      <div ref={ref} className={cn("nova-terminal", className)} {...rest}>
        <div className="nova-terminal__bar">
          <TrafficLights />
          <span className="nova-terminal__title">{title}</span>
        </div>

        <div className="nova-terminal__body">
          {lines
            ? lines.map((line, i) => {
                const isLast = i === lines.length - 1;
                const showPrompt = line.prompt ?? true;
                return (
                  <div
                    key={i}
                    className={cn(
                      "nova-terminal__line",
                      `nova-terminal__line--${line.tone ?? "default"}`,
                    )}
                  >
                    {showPrompt && (
                      <span className="nova-terminal__prompt" aria-hidden="true">
                        {prompt}
                      </span>
                    )}
                    <span className="nova-terminal__text">{line.text}</span>
                    {caret && isLast && (
                      <span className="nova-terminal__caret" aria-hidden="true" />
                    )}
                  </div>
                );
              })
            : children}
        </div>
      </div>
    );
  },
);
