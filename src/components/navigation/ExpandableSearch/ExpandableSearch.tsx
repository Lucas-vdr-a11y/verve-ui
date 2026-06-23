import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { cn } from "../../../utils/cn";
import { useReducedMotion } from "../../utility/useReducedMotion";
import "./ExpandableSearch.css";

export interface ExpandableSearchProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "onChange" | "value" | "defaultValue" | "size"
  > {
  /** Input value (controlled). */
  value?: string;
  /** Initial value when uncontrolled. */
  defaultValue?: string;
  /** Called as the query text changes. */
  onValueChange?: (value: string) => void;
  /** Called with the query on Enter or when the search action is clicked. */
  onSearch?: (value: string) => void;
  /** Expanded state (controlled). */
  expanded?: boolean;
  /** Initial expanded state when uncontrolled. @default false */
  defaultExpanded?: boolean;
  /** Called when the expanded state changes. */
  onExpandedChange?: (expanded: boolean) => void;
  /** Placeholder for the input. @default "Search…" */
  placeholder?: string;
  /** Size of the control. @default "md" */
  size?: "sm" | "md" | "lg";
  /** Width of the expanded input. @default "16rem" */
  expandedWidth?: string;
  /** Accessible label for the search control. @default "Search" */
  label?: string;
}

/**
 * ExpandableSearch — an icon button that expands into a full search input on
 * click/focus and collapses on blur (when empty) or Escape, with a smooth width
 * animation. Calls `onSearch` on Enter / icon click. Collapsing keeps any typed
 * value so it survives a re-open.
 */
export const ExpandableSearch = forwardRef<
  HTMLInputElement,
  ExpandableSearchProps
>(function ExpandableSearch(
  {
    value,
    defaultValue = "",
    onValueChange,
    onSearch,
    expanded,
    defaultExpanded = false,
    onExpandedChange,
    placeholder = "Search…",
    size = "md",
    expandedWidth = "16rem",
    label = "Search",
    className,
    onKeyDown,
    onBlur,
    ...rest
  },
  ref,
) {
  const isValueControlled = value !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const query = isValueControlled ? value : uncontrolledValue;

  const isOpenControlled = expanded !== undefined;
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultExpanded);
  const isOpen = isOpenControlled ? expanded : uncontrolledOpen;

  const reduced = useReducedMotion();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const setInputRef = useCallback(
    (node: HTMLInputElement | null) => {
      inputRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ref],
  );

  const setOpen = useCallback(
    (next: boolean) => {
      if (!isOpenControlled) setUncontrolledOpen(next);
      onExpandedChange?.(next);
    },
    [isOpenControlled, onExpandedChange],
  );

  const setQuery = useCallback(
    (next: string) => {
      if (!isValueControlled) setUncontrolledValue(next);
      onValueChange?.(next);
    },
    [isValueControlled, onValueChange],
  );

  // Focus the input when it opens.
  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const expand = () => {
    if (!isOpen) setOpen(true);
    inputRef.current?.focus();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      onSearch?.(query);
    } else if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      inputRef.current?.blur();
    }
    onKeyDown?.(event);
  };

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    // Collapse only when leaving the whole control and the field is empty.
    const next = event.relatedTarget as Node | null;
    if (
      query.trim() === "" &&
      !(next && event.currentTarget.parentElement?.contains(next))
    ) {
      setOpen(false);
    }
    onBlur?.(event);
  };

  return (
    <div
      className={cn(
        "nova-expandable-search",
        `nova-expandable-search--${size}`,
        isOpen && "nova-expandable-search--open",
        reduced && "nova-expandable-search--reduced",
        className,
      )}
      style={{ "--nova-search-w": expandedWidth } as React.CSSProperties}
      role="search"
    >
      <button
        type="button"
        className="nova-expandable-search__button"
        aria-label={isOpen ? `${label}: submit` : `${label}: expand`}
        aria-expanded={isOpen}
        onClick={() => {
          if (isOpen) onSearch?.(query);
          else expand();
        }}
      >
        <svg
          className="nova-expandable-search__icon"
          viewBox="0 0 24 24"
          width="20"
          height="20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </button>

      <input
        ref={setInputRef}
        type="search"
        className="nova-expandable-search__input"
        placeholder={placeholder}
        aria-label={label}
        aria-hidden={!isOpen}
        tabIndex={isOpen ? 0 : -1}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onFocus={expand}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        {...rest}
      />
    </div>
  );
});
