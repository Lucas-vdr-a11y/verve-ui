import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./SuggestionChips.css";

export interface SuggestionChip {
  /** Unique id (falls back to the label when omitted). */
  id?: string;
  /** Visible chip label. */
  label: React.ReactNode;
  /** Value passed to `onSelect`; defaults to the label when it's a string. */
  value?: string;
  /** Optional leading icon. */
  icon?: React.ReactNode;
  /** Disable this chip. */
  disabled?: boolean;
}

export interface SuggestionChipsProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect"> {
  /** The suggestions to render. */
  items: SuggestionChip[];
  /** Fires with the chip value (or label) when chosen. */
  onSelect?: (value: string, item: SuggestionChip) => void;
  /** Accessible label for the group. Defaults to `"Suggestions"`. */
  label?: string;
}

export const SuggestionChips = forwardRef<HTMLDivElement, SuggestionChipsProps>(
  function SuggestionChips(
    { items, onSelect, label = "Suggestions", className, ...rest },
    ref
  ) {
    return (
      <div
        ref={ref}
        className={cn("nova-suggestion-chips", className)}
        role="group"
        aria-label={label}
        {...rest}
      >
        {items.map((item, i) => {
          const value =
            item.value ?? (typeof item.label === "string" ? item.label : "");
          return (
            <button
              key={item.id ?? value ?? i}
              type="button"
              className="nova-suggestion-chips__chip nova-focusable"
              disabled={item.disabled}
              onClick={() => onSelect?.(value, item)}
            >
              {item.icon != null && (
                <span className="nova-suggestion-chips__icon" aria-hidden="true">
                  {item.icon}
                </span>
              )}
              <span className="nova-suggestion-chips__label">{item.label}</span>
            </button>
          );
        })}
      </div>
    );
  }
);
