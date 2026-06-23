import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import { useTheme } from "../ThemeProvider";
import "./ThemeToggle.css";

export interface ThemeToggleProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  /** Button size. Defaults to `"md"`. */
  size?: "sm" | "md" | "lg";
  /**
   * Accessible label. Defaults to a dynamic
   * `"Switch to light/dark theme"` based on the current resolved theme.
   */
  label?: string;
}

/**
 * Polished light/dark toggle backed by {@link useTheme}. Renders a single
 * accessible button with an animated sun ↔ moon crossfade/morph.
 *
 * - `aria-pressed` reflects dark mode being active.
 * - Provides a dynamic `aria-label` (override with `label`).
 * - Must be rendered inside a `<ThemeProvider>`.
 */
export const ThemeToggle = forwardRef<HTMLButtonElement, ThemeToggleProps>(
  function ThemeToggle(
    { size = "md", label, className, onClick, ...rest },
    ref
  ) {
    const { resolvedTheme, toggle } = useTheme();
    const isDark = resolvedTheme === "dark";
    const ariaLabel =
      label ?? `Switch to ${isDark ? "light" : "dark"} theme`;

    return (
      <button
        ref={ref}
        type="button"
        aria-pressed={isDark}
        aria-label={ariaLabel}
        title={ariaLabel}
        data-theme-state={isDark ? "dark" : "light"}
        className={cn(
          "nova-theme-toggle",
          `nova-theme-toggle--${size}`,
          className
        )}
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented) toggle();
        }}
        {...rest}
      >
        <span className="nova-theme-toggle__icon" aria-hidden="true">
          <svg
            className="nova-theme-toggle__svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Sun core (shrinks into the moon crescent in dark mode). */}
            <circle
              className="nova-theme-toggle__sun"
              cx="12"
              cy="12"
              r="5"
            />
            {/* Sun rays (fade/scale out in dark mode). */}
            <g className="nova-theme-toggle__rays">
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </g>
            {/* Moon mask circle (cuts a crescent in dark mode). */}
            <circle
              className="nova-theme-toggle__moon-mask"
              cx="17"
              cy="8"
              r="6"
              fill="var(--nova-theme-toggle-bg, var(--nova-surface))"
              stroke="none"
            />
          </svg>
        </span>
      </button>
    );
  }
);
