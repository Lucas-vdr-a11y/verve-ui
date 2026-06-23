import { forwardRef, Children } from "react";
import { cn } from "../../../utils/cn";
import "./CodeWindow.css";

export interface CodeTab {
  /** Tab label / filename. */
  label: React.ReactNode;
  /** Whether this tab is active. */
  active?: boolean;
}

export interface CodeWindowProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Filename shown in the title bar. */
  filename?: React.ReactNode;
  /** Language label + dot color. */
  language?: string;
  /** Accent color for the language dot. Defaults to brand. */
  languageColor?: string;
  /** Optional tab strip above the code body. */
  tabs?: CodeTab[];
  /** Render gutter line numbers. Defaults to `true`. */
  lineNumbers?: boolean;
  /** Code body (typically a <pre>/<code> or highlighted nodes). */
  children?: React.ReactNode;
}

const TrafficLights = () => (
  <span className="nova-code-window__lights" aria-hidden="true">
    <span className="nova-code-window__light nova-code-window__light--close" />
    <span className="nova-code-window__light nova-code-window__light--min" />
    <span className="nova-code-window__light nova-code-window__light--max" />
  </span>
);

/**
 * CodeWindow — code-editor window with a title bar (filename + language dot),
 * optional tab strip and an optional line-number gutter wrapping a code slot.
 * Line numbers are derived from the rendered text content.
 */
export const CodeWindow = forwardRef<HTMLDivElement, CodeWindowProps>(
  function CodeWindow(
    {
      filename,
      language,
      languageColor,
      tabs,
      lineNumbers = true,
      children,
      className,
      ...rest
    },
    ref,
  ) {
    // Derive a line count for the gutter from string children only (SSR-safe).
    let lineCount = 1;
    if (lineNumbers) {
      const text = Children.toArray(children)
        .map((c) => (typeof c === "string" ? c : ""))
        .join("");
      lineCount = Math.max(1, text.replace(/\n$/, "").split("\n").length);
    }

    return (
      <div ref={ref} className={cn("nova-code-window", className)} {...rest}>
        <div className="nova-code-window__bar">
          <TrafficLights />
          {filename && (
            <span className="nova-code-window__filename">{filename}</span>
          )}
          {language && (
            <span className="nova-code-window__lang">
              <span
                className="nova-code-window__lang-dot"
                style={{ background: languageColor ?? "var(--nova-primary)" }}
                aria-hidden="true"
              />
              {language}
            </span>
          )}
        </div>

        {tabs && tabs.length > 0 && (
          <div className="nova-code-window__tabs" role="tablist" aria-label="Open files">
            {tabs.map((tab, i) => (
              <div
                key={i}
                role="tab"
                aria-selected={!!tab.active}
                className={cn(
                  "nova-code-window__tab",
                  tab.active && "nova-code-window__tab--active",
                )}
              >
                {tab.label}
              </div>
            ))}
          </div>
        )}

        <div className="nova-code-window__body">
          {lineNumbers && (
            <div className="nova-code-window__gutter" aria-hidden="true">
              {Array.from({ length: lineCount }, (_, i) => (
                <span key={i} className="nova-code-window__lineno">
                  {i + 1}
                </span>
              ))}
            </div>
          )}
          <div className="nova-code-window__code">{children}</div>
        </div>
      </div>
    );
  },
);
