import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./KbdGroup.css";

export type KbdGroupSize = "sm" | "md" | "lg";

export interface KbdGroupProps extends React.HTMLAttributes<HTMLElement> {
  /** Key labels to render, e.g. `["Cmd", "K"]`. */
  keys: React.ReactNode[];
  /** Visual separator between keys. Defaults to `"+"`. Use `null` to hide. */
  separator?: React.ReactNode;
  /** Key size. Defaults to `"md"`. */
  size?: KbdGroupSize;
}

/**
 * Render a key combo such as `Cmd + K` as a group of styled keys.
 * Self-contained — renders its own `<kbd>` keys (does not depend on the
 * typography `Kbd` component) while matching the same visual treatment.
 */
const KbdGroupBase = forwardRef<HTMLElement, KbdGroupProps>(function KbdGroup(
  { keys, separator = "+", size = "md", className, ...rest },
  ref
) {
  return (
    <span
      ref={ref}
      className={cn("nova-kbd-group", `nova-kbd-group--${size}`, className)}
      {...rest}
    >
      {keys.map((key, i) => (
        <span className="nova-kbd-group__item" key={i}>
          {i > 0 && separator != null && (
            <span className="nova-kbd-group__sep" aria-hidden="true">
              {separator}
            </span>
          )}
          <kbd className="nova-kbd-group__key">{key}</kbd>
        </span>
      ))}
    </span>
  );
});

export const KbdGroup = KbdGroupBase;

/** Alias for KbdGroup — semantic name for a keyboard shortcut. */
export const Shortcut = KbdGroupBase;
export type ShortcutProps = KbdGroupProps;
