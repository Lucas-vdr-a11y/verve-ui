import {
  forwardRef,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { cn } from "../../../utils/cn";
import "./MultiSelect.css";

export type MultiSelectSize = "sm" | "md" | "lg";

export interface MultiSelectOption {
  /** The value committed on selection. */
  value: string;
  /** The text shown in chips and the list, used for default filtering. */
  label: string;
  /** Disables this option from being toggled. */
  disabled?: boolean;
}

export interface MultiSelectProps<
  T extends MultiSelectOption = MultiSelectOption
> extends Omit<
    React.HTMLAttributes<HTMLDivElement>,
    "onChange" | "defaultValue" | "children"
  > {
  /** The full list of selectable options. */
  options: T[];
  /** Controlled list of selected values. */
  value?: string[];
  /** Uncontrolled initial selected values. */
  defaultValue?: string[];
  /** Called with the new list of selected values whenever it changes. */
  onChange?: (values: string[], options: T[]) => void;
  /** Size on the sm/md/lg scale. Defaults to `"md"`. */
  size?: MultiSelectSize;
  /** Marks the field as invalid. */
  invalid?: boolean;
  /** Disables the whole control. */
  disabled?: boolean;
  /** Maximum number of selections allowed. */
  max?: number;
  /** Show a button to clear all selections. Defaults to `true`. */
  clearable?: boolean;
  /** Allow filtering options with a text input. Defaults to `true`. */
  searchable?: boolean;
  /** Placeholder shown when nothing is selected. */
  placeholder?: string;
  /** Content shown when no option matches the query. */
  emptyState?: React.ReactNode;
  /** Custom filter predicate. Defaults to case-insensitive label substring. */
  filter?: (option: T, query: string) => boolean;
}

const defaultFilter = (option: MultiSelectOption, query: string) =>
  option.label.toLowerCase().includes(query.trim().toLowerCase());

function MultiSelectInner<T extends MultiSelectOption>(
  {
    options,
    value,
    defaultValue,
    onChange,
    size = "md",
    invalid = false,
    disabled = false,
    max,
    clearable = true,
    searchable = true,
    placeholder = "Select…",
    emptyState = "No results",
    filter = defaultFilter as (option: T, query: string) => boolean,
    className,
    id: idProp,
    ...rest
  }: MultiSelectProps<T>,
  ref: React.ForwardedRef<HTMLDivElement>
) {
  const isControlled = value !== undefined;
  const [internal, setInternal] = useState<string[]>(defaultValue ?? []);
  const selected = isControlled ? value : internal;

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);

  const reactId = useId();
  const baseId = idProp ?? `nova-multiselect-${reactId}`;
  const listId = `${baseId}-list`;

  const rootRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);

  const setRootRef = (node: HTMLDivElement | null) => {
    rootRef.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) ref.current = node;
  };

  const selectedSet = useMemo(() => new Set(selected), [selected]);
  const optionByValue = useMemo(() => {
    const m = new Map<string, T>();
    for (const o of options) m.set(o.value, o);
    return m;
  }, [options]);

  const filtered = useMemo(
    () => (searchable ? options.filter((o) => filter(o, query)) : options),
    [options, filter, query, searchable]
  );

  const atMax = max != null && selected.length >= max;

  // Keep active option in view.
  useEffect(() => {
    if (!open || activeIndex < 0) return;
    const el = listRef.current?.querySelector<HTMLElement>(
      `[data-index="${activeIndex}"]`
    );
    el?.scrollIntoView({ block: "nearest" });
  }, [open, activeIndex]);

  // Click-outside to close. SSR-safe — only runs in an effect.
  useEffect(() => {
    if (!open) return;
    const handle = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
        setActiveIndex(-1);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  const commit = (next: string[]) => {
    if (!isControlled) setInternal(next);
    onChange?.(
      next,
      next.map((v) => optionByValue.get(v)).filter(Boolean) as T[]
    );
  };

  const toggle = (opt: T) => {
    if (opt.disabled) return;
    if (selectedSet.has(opt.value)) {
      commit(selected.filter((v) => v !== opt.value));
    } else {
      if (atMax) return;
      commit([...selected, opt.value]);
    }
  };

  const remove = (val: string) => {
    commit(selected.filter((v) => v !== val));
  };

  const clearAll = () => {
    commit([]);
    inputRef.current?.focus();
  };

  const openList = () => {
    if (!disabled) setOpen(true);
  };

  const firstEnabled = (from: number, dir: 1 | -1) => {
    if (filtered.length === 0) return -1;
    let i = from;
    for (let count = 0; count < filtered.length; count++) {
      i = (i + dir + filtered.length) % filtered.length;
      const o = filtered[i];
      if (o && !o.disabled && !(atMax && !selectedSet.has(o.value))) return i;
    }
    return -1;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
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
        if (open && activeIndex >= 0 && filtered[activeIndex]) {
          e.preventDefault();
          toggle(filtered[activeIndex]);
        }
        break;
      case "Escape":
        if (open) {
          e.preventDefault();
          setOpen(false);
          setActiveIndex(-1);
          setQuery("");
        }
        break;
      case "Backspace":
        if (query === "" && selected.length > 0) {
          e.preventDefault();
          remove(selected[selected.length - 1]);
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
  const showClear = clearable && selected.length > 0 && !disabled;

  return (
    <div
      {...rest}
      ref={setRootRef}
      className={cn(
        "nova-multiselect",
        `nova-multiselect--${size}`,
        invalid && "nova-multiselect--invalid",
        disabled && "nova-multiselect--disabled",
        className
      )}
      data-disabled={disabled || undefined}
    >
      <div
        className="nova-multiselect__control"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) {
            e.preventDefault();
            openList();
            inputRef.current?.focus();
          }
        }}
      >
        <div className="nova-multiselect__chips">
          {selected.map((val) => {
            const opt = optionByValue.get(val);
            const label = opt?.label ?? val;
            return (
              <span key={val} className="nova-multiselect__chip">
                <span className="nova-multiselect__chip-label">{label}</span>
                {!disabled && (
                  <button
                    type="button"
                    className="nova-multiselect__chip-remove nova-focusable"
                    aria-label={`Remove ${label}`}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => remove(val)}
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
                )}
              </span>
            );
          })}
          <input
            ref={inputRef}
            id={baseId}
            className="nova-multiselect__input nova-focusable"
            role="combobox"
            aria-expanded={open}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-haspopup="listbox"
            aria-activedescendant={activeId}
            aria-invalid={invalid || undefined}
            autoComplete="off"
            readOnly={!searchable}
            disabled={disabled}
            placeholder={selected.length === 0 ? placeholder : undefined}
            value={query}
            onChange={(e) => {
              if (!searchable) return;
              setQuery(e.target.value);
              openList();
              setActiveIndex(-1);
            }}
            onFocus={openList}
            onMouseDown={openList}
            onKeyDown={handleKeyDown}
          />
        </div>

        {showClear && (
          <button
            type="button"
            className="nova-multiselect__clear nova-focusable"
            aria-label="Clear all"
            onMouseDown={(e) => e.preventDefault()}
            onClick={clearAll}
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
        )}
        <span className="nova-multiselect__chevron" aria-hidden="true">
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
      </div>

      {open && (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          aria-multiselectable="true"
          className="nova-multiselect__list"
        >
          {filtered.length === 0 ? (
            <li className="nova-multiselect__empty" role="presentation">
              {emptyState}
            </li>
          ) : (
            filtered.map((opt, index) => {
              const isSelected = selectedSet.has(opt.value);
              const active = index === activeIndex;
              const blockedByMax = atMax && !isSelected;
              const isDisabled = opt.disabled || blockedByMax;
              return (
                <li
                  key={opt.value}
                  id={`${baseId}-opt-${index}`}
                  data-index={index}
                  role="option"
                  aria-selected={isSelected}
                  aria-disabled={isDisabled || undefined}
                  className={cn(
                    "nova-multiselect__option",
                    active && "nova-multiselect__option--active",
                    isSelected && "nova-multiselect__option--selected",
                    isDisabled && "nova-multiselect__option--disabled"
                  )}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    toggle(opt);
                  }}
                  onMouseEnter={() => !isDisabled && setActiveIndex(index)}
                >
                  <span className="nova-multiselect__check" aria-hidden="true">
                    {isSelected && (
                      <svg viewBox="0 0 16 16" fill="none">
                        <path
                          d="M3.5 8.5l3 3 6-7"
                          stroke="currentColor"
                          strokeWidth="1.9"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </span>
                  <span className="nova-multiselect__option-label">
                    {opt.label}
                  </span>
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
}

export const MultiSelect = forwardRef(MultiSelectInner) as <
  T extends MultiSelectOption = MultiSelectOption
>(
  props: MultiSelectProps<T> & { ref?: React.ForwardedRef<HTMLDivElement> }
) => React.ReactElement;
