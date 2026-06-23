import {
  forwardRef,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { cn } from "../../../utils/cn";
import "./Combobox.css";

export type ComboboxSize = "sm" | "md" | "lg";

export interface ComboboxOption {
  /** The value committed on selection. */
  value: string;
  /** The text shown in the field and used for default filtering. */
  label: string;
  /** Disables this option from being selected. */
  disabled?: boolean;
}

export interface ComboboxProps<
  T extends ComboboxOption = ComboboxOption
> extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "size" | "value" | "onChange" | "onSelect" | "children"
  > {
  /** The full list of selectable options. */
  options: T[];
  /** Controlled input text. */
  value?: string;
  /** Called whenever the input text changes. */
  onChange?: (value: string) => void;
  /** Called when an option is chosen (click or Enter). */
  onSelect?: (option: T) => void;
  /** Size on the sm/md/lg scale. Defaults to `"md"`. */
  size?: ComboboxSize;
  /** Marks the field as invalid. */
  invalid?: boolean;
  /**
   * Custom filter predicate. Defaults to a case-insensitive label substring
   * match. Return `true` to keep an option visible for the given query.
   */
  filter?: (option: T, query: string) => boolean;
  /** Custom render for a single option row. */
  renderOption?: (option: T, state: { active: boolean }) => React.ReactNode;
  /** Content shown when no option matches the query. */
  emptyState?: React.ReactNode;
  /** Placeholder text. */
  placeholder?: string;
}

const defaultFilter = (option: ComboboxOption, query: string) =>
  option.label.toLowerCase().includes(query.trim().toLowerCase());

function ComboboxInner<T extends ComboboxOption>(
  {
    options,
    value,
    onChange,
    onSelect,
    size = "md",
    invalid = false,
    filter = defaultFilter as (option: T, query: string) => boolean,
    renderOption,
    emptyState = "No results",
    placeholder,
    disabled,
    className,
    id: idProp,
    onKeyDown,
    onFocus,
    onBlur,
    ...rest
  }: ComboboxProps<T>,
  ref: React.ForwardedRef<HTMLInputElement>
) {
  const isControlled = value !== undefined;
  const [internal, setInternal] = useState("");
  const query = isControlled ? value : internal;

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const reactId = useId();
  const baseId = idProp ?? `nova-combobox-${reactId}`;
  const listId = `${baseId}-list`;

  const rootRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);

  const filtered = useMemo(
    () => options.filter((o) => filter(o, query)),
    [options, filter, query]
  );

  // Keep the active option in view.
  useEffect(() => {
    if (!open || activeIndex < 0) return;
    const list = listRef.current;
    const el = list?.querySelector<HTMLElement>(
      `[data-index="${activeIndex}"]`
    );
    el?.scrollIntoView({ block: "nearest" });
  }, [open, activeIndex]);

  // Click-outside to close.
  useEffect(() => {
    if (!open) return;
    const handle = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  const setQuery = (next: string) => {
    if (!isControlled) setInternal(next);
    onChange?.(next);
  };

  const openList = () => {
    if (!disabled) setOpen(true);
  };

  const firstEnabled = (from: number, dir: 1 | -1) => {
    if (filtered.length === 0) return -1;
    let i = from;
    for (let count = 0; count < filtered.length; count++) {
      i = (i + dir + filtered.length) % filtered.length;
      if (!filtered[i]?.disabled) return i;
    }
    return -1;
  };

  const choose = (index: number) => {
    const opt = filtered[index];
    if (!opt || opt.disabled) return;
    setQuery(opt.label);
    onSelect?.(opt);
    setOpen(false);
    setActiveIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(e);
    if (e.defaultPrevented) return;
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (!open) {
          openList();
          setActiveIndex(firstEnabled(-1, 1));
        } else {
          setActiveIndex((i) => firstEnabled(i, 1));
        }
        break;
      case "ArrowUp":
        e.preventDefault();
        if (!open) {
          openList();
          setActiveIndex(firstEnabled(0, -1));
        } else {
          setActiveIndex((i) => firstEnabled(i, -1));
        }
        break;
      case "Enter":
        if (open && activeIndex >= 0) {
          e.preventDefault();
          choose(activeIndex);
        }
        break;
      case "Escape":
        if (open) {
          e.preventDefault();
          setOpen(false);
          setActiveIndex(-1);
        }
        break;
      case "Tab":
        setOpen(false);
        setActiveIndex(-1);
        break;
      default:
        break;
    }
  };

  const activeId =
    open && activeIndex >= 0 ? `${baseId}-opt-${activeIndex}` : undefined;

  return (
    <div
      ref={rootRef}
      className={cn(
        "nova-combobox",
        `nova-combobox--${size}`,
        invalid && "nova-combobox--invalid",
        disabled && "nova-combobox--disabled",
        className
      )}
      data-disabled={disabled || undefined}
    >
      <input
        {...rest}
        ref={ref}
        id={baseId}
        className="nova-combobox__field nova-focusable"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={activeId}
        aria-invalid={invalid || undefined}
        autoComplete="off"
        disabled={disabled}
        placeholder={placeholder}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          openList();
          setActiveIndex(-1);
        }}
        onFocus={(e) => {
          openList();
          onFocus?.(e);
        }}
        onBlur={(e) => {
          onBlur?.(e);
        }}
        onKeyDown={handleKeyDown}
      />
      <span className="nova-combobox__chevron" aria-hidden="true">
        <svg viewBox="0 0 16 16" fill="none">
          <path
            d="M4 6l4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>

      {open && (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          className="nova-combobox__list"
        >
          {filtered.length === 0 ? (
            <li className="nova-combobox__empty" role="presentation">
              {emptyState}
            </li>
          ) : (
            filtered.map((opt, index) => {
              const active = index === activeIndex;
              return (
                <li
                  key={opt.value}
                  id={`${baseId}-opt-${index}`}
                  data-index={index}
                  role="option"
                  aria-selected={active}
                  aria-disabled={opt.disabled || undefined}
                  className={cn(
                    "nova-combobox__option",
                    active && "nova-combobox__option--active",
                    opt.disabled && "nova-combobox__option--disabled"
                  )}
                  // onMouseDown (not onClick) so it fires before input blur.
                  onMouseDown={(e) => {
                    e.preventDefault();
                    choose(index);
                  }}
                  onMouseEnter={() => !opt.disabled && setActiveIndex(index)}
                >
                  {renderOption
                    ? renderOption(opt, { active })
                    : opt.label}
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
}

export const Combobox = forwardRef(ComboboxInner) as <
  T extends ComboboxOption = ComboboxOption
>(
  props: ComboboxProps<T> & { ref?: React.ForwardedRef<HTMLInputElement> }
) => React.ReactElement;
