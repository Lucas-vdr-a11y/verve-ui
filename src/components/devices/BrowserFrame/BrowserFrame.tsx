import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./BrowserFrame.css";

export interface BrowserTab {
  /** Tab label. */
  label: React.ReactNode;
  /** Whether this tab is the active one. */
  active?: boolean;
}

export interface BrowserFrameProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** URL shown in the address bar. */
  url?: string;
  /** Chrome appearance. Defaults to `"light"`. */
  chrome?: "light" | "dark";
  /** Optional tab strip rendered above the address bar. */
  tabs?: BrowserTab[];
  /** Show navigation toolbar (back/forward/refresh). Defaults to `true`. */
  toolbar?: boolean;
  /** Screenshot / content rendered in the viewport. */
  children?: React.ReactNode;
}

const TrafficLights = () => (
  <span className="nova-browser-frame__lights" aria-hidden="true">
    <span className="nova-browser-frame__light nova-browser-frame__light--close" />
    <span className="nova-browser-frame__light nova-browser-frame__light--min" />
    <span className="nova-browser-frame__light nova-browser-frame__light--max" />
  </span>
);

const NavIcon = ({ d }: { d: string }) => (
  <svg viewBox="0 0 16 16" width="1em" height="1em" aria-hidden="true" focusable="false">
    <path d={d} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const LockIcon = () => (
  <svg viewBox="0 0 16 16" width="1em" height="1em" aria-hidden="true" focusable="false">
    <rect x="3.5" y="7" width="9" height="6" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.3" />
    <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" fill="none" stroke="currentColor" strokeWidth="1.3" />
  </svg>
);

/**
 * BrowserFrame — realistic browser-window chrome wrapping a content slot.
 * Traffic-light dots, optional tabs, navigation toolbar and an address bar.
 * Adapts to light/dark via the `chrome` prop and semantic tokens.
 */
export const BrowserFrame = forwardRef<HTMLDivElement, BrowserFrameProps>(
  function BrowserFrame(
    { url = "https://example.com", chrome = "light", tabs, toolbar = true, children, className, ...rest },
    ref,
  ) {
    return (
      <div
        ref={ref}
        className={cn("nova-browser-frame", `nova-browser-frame--${chrome}`, className)}
        {...rest}
      >
        {tabs && tabs.length > 0 && (
          <div className="nova-browser-frame__tabs" role="tablist" aria-label="Browser tabs">
            {tabs.map((tab, i) => (
              <div
                key={i}
                role="tab"
                aria-selected={!!tab.active}
                className={cn(
                  "nova-browser-frame__tab",
                  tab.active && "nova-browser-frame__tab--active",
                )}
              >
                {tab.label}
              </div>
            ))}
          </div>
        )}

        <div className="nova-browser-frame__bar">
          <TrafficLights />

          {toolbar && (
            <span className="nova-browser-frame__nav" aria-hidden="true">
              <span className="nova-browser-frame__nav-btn"><NavIcon d="M10 3 5 8l5 5" /></span>
              <span className="nova-browser-frame__nav-btn"><NavIcon d="M6 3l5 5-5 5" /></span>
              <span className="nova-browser-frame__nav-btn"><NavIcon d="M13 8a5 5 0 1 1-1.5-3.6M13 2.5V5h-2.5" /></span>
            </span>
          )}

          <div className="nova-browser-frame__url">
            <span className="nova-browser-frame__url-lock" aria-hidden="true"><LockIcon /></span>
            <span className="nova-browser-frame__url-text">{url}</span>
          </div>
        </div>

        <div className="nova-browser-frame__viewport">{children}</div>
      </div>
    );
  },
);
