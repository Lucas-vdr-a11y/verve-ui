import { forwardRef, useEffect, useRef, useState } from "react";
import { cn } from "../../../utils/cn";
import "./SearchInput.css";

export type SearchInputSize = "sm" | "md" | "lg";

export interface SearchInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "type"> {
  /** Size on the sm/md/lg scale. Defaults to `"md"`. */
  size?: SearchInputSize;
  /** Marks the field as invalid. */
  invalid?: boolean;
  /** Show a loading spinner in place of the clear button. */
  loading?: boolean;
  /**
   * Called with the query, optionally debounced via `debounce`. Fires on every
   * value change (and on clear).
   */
  onSearch?: (query: string) => void;
  /** Debounce in ms applied to `onSearch`. Defaults to `0` (immediate). */
  debounce?: number;
  /** Called when the clear (x) button is pressed. */
  onClear?: () => void;
  /** Accessible label for the clear button. Defaults to `"Clear search"`. */
  clearLabel?: string;
}

const SearchIcon = (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <circle
      cx="7"
      cy="7"
      r="4.25"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path
      d="M10.5 10.5L14 14"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  function SearchInput(
    {
      size = "md",
      invalid = false,
      loading = false,
      onSearch,
      debounce = 0,
      onClear,
      clearLabel = "Clear search",
      value,
      defaultValue,
      disabled,
      className,
      onChange,
      ...rest
    },
    ref
  ) {
    const isControlled = value !== undefined;
    const [internal, setInternal] = useState<string>(
      (defaultValue as string) ?? ""
    );
    const text = isControlled ? String(value ?? "") : internal;
    const hasValue = text.length > 0;

    const innerRef = useRef<HTMLInputElement | null>(null);
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Clean up any pending debounce on unmount.
    useEffect(() => {
      return () => {
        if (timer.current) clearTimeout(timer.current);
      };
    }, []);

    const fireSearch = (next: string) => {
      if (!onSearch) return;
      if (debounce > 0) {
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => onSearch(next), debounce);
      } else {
        onSearch(next);
      }
    };

    const setRefs = (node: HTMLInputElement | null) => {
      innerRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    };

    const handleClear = () => {
      if (!isControlled) setInternal("");
      onClear?.();
      fireSearch("");
      innerRef.current?.focus();
    };

    return (
      <div
        className={cn(
          "nova-search",
          `nova-search--${size}`,
          invalid && "nova-search--invalid",
          disabled && "nova-search--disabled",
          className
        )}
        data-disabled={disabled || undefined}
      >
        <span className="nova-search__icon" aria-hidden="true">
          {SearchIcon}
        </span>
        <input
          {...rest}
          ref={setRefs}
          type="search"
          role="searchbox"
          className="nova-search__field nova-focusable"
          disabled={disabled}
          aria-invalid={invalid || undefined}
          value={isControlled ? value : internal}
          onChange={(e) => {
            const next = e.target.value;
            if (!isControlled) setInternal(next);
            onChange?.(e);
            fireSearch(next);
          }}
        />
        {loading ? (
          <span
            className="nova-search__spinner"
            role="status"
            aria-label="Loading"
          />
        ) : (
          hasValue &&
          !disabled && (
            <button
              type="button"
              className="nova-search__clear nova-focusable"
              aria-label={clearLabel}
              onClick={handleClear}
            >
              <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path
                  d="M4 4l8 8M12 4l-8 8"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          )
        )}
      </div>
    );
  }
);
