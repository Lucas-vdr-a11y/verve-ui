import {
  forwardRef,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { cn } from "../../../utils/cn";
import "./IconPicker.css";

export type IconPickerSize = "sm" | "md" | "lg";

export interface IconPickerItem {
  /** Unique identifier, committed as the value. */
  name: string;
  /** The icon node to render (typically an inline SVG). */
  node: React.ReactNode;
  /** Extra keywords to match during search. */
  keywords?: string[];
}

export interface IconPickerProps
  extends Omit<
    React.HTMLAttributes<HTMLDivElement>,
    "onChange" | "defaultValue"
  > {
  /** The pickable icons. */
  icons: IconPickerItem[];
  /** Controlled selected icon name. */
  value?: string;
  /** Uncontrolled initial icon name. */
  defaultValue?: string;
  /** Called with the newly-selected icon name. */
  onChange?: (name: string) => void;
  /** Size on the sm/md/lg scale. Defaults to `"md"`. */
  size?: IconPickerSize;
  /** Disable interaction. */
  disabled?: boolean;
  /** Placeholder for the trigger when nothing is selected. */
  placeholder?: string;
  /** Placeholder for the search field. Defaults to `"Search icons…"`. */
  searchPlaceholder?: string;
  /** Content shown when no icon matches the query. */
  emptyState?: React.ReactNode;
  /** Accessible label for the trigger. */
  "aria-label"?: string;
}

export const IconPicker = forwardRef<HTMLDivElement, IconPickerProps>(
  function IconPicker(
    {
      icons,
      value,
      defaultValue,
      onChange,
      size = "md",
      disabled = false,
      placeholder = "Pick an icon",
      searchPlaceholder = "Search icons…",
      emptyState = "No icons found",
      className,
      "aria-label": ariaLabel,
      ...rest
    },
    ref
  ) {
    const isControlled = value !== undefined;
    const [internal, setInternal] = useState<string | undefined>(defaultValue);
    const selected = isControlled ? value : internal;

    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");

    const rootRef = useRef<HTMLDivElement | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const reactId = useId();
    const panelId = `nova-iconpicker-${reactId}-panel`;

    const filtered = useMemo(() => {
      const q = query.trim().toLowerCase();
      if (!q) return icons;
      return icons.filter(
        (ic) =>
          ic.name.toLowerCase().includes(q) ||
          ic.keywords?.some((k) => k.toLowerCase().includes(q))
      );
    }, [icons, query]);

    // Click-outside to close.
    useEffect(() => {
      if (!open || typeof document === "undefined") return;
      const handle = (e: MouseEvent) => {
        if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
          setOpen(false);
        }
      };
      document.addEventListener("mousedown", handle);
      return () => document.removeEventListener("mousedown", handle);
    }, [open]);

    // Focus the search field when opening.
    useEffect(() => {
      if (open) {
        const t = window.setTimeout(() => inputRef.current?.focus(), 0);
        return () => window.clearTimeout(t);
      }
    }, [open]);

    const commit = (name: string) => {
      if (!isControlled) setInternal(name);
      onChange?.(name);
      setOpen(false);
    };

    const selectedItem = icons.find((ic) => ic.name === selected) ?? null;

    return (
      <div
        ref={(node) => {
          rootRef.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }}
        className={cn(
          "nova-iconpicker",
          `nova-iconpicker--${size}`,
          disabled && "nova-iconpicker--disabled",
          className
        )}
        data-disabled={disabled || undefined}
        {...rest}
      >
        <button
          type="button"
          className="nova-iconpicker__trigger nova-focusable"
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls={open ? panelId : undefined}
          aria-label={ariaLabel ?? (selectedItem ? selectedItem.name : placeholder)}
          disabled={disabled}
          onClick={() => !disabled && setOpen((o) => !o)}
        >
          <span className="nova-iconpicker__trigger-icon" aria-hidden="true">
            {selectedItem ? (
              selectedItem.node
            ) : (
              <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path
                  d="M8 3.5v9M3.5 8h9"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </span>
          <span className="nova-iconpicker__trigger-label">
            {selectedItem ? selectedItem.name : placeholder}
          </span>
          <svg
            className="nova-iconpicker__chevron"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M4 6l4 4 4-4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {open && (
          <div
            id={panelId}
            className="nova-iconpicker__panel"
            role="dialog"
            aria-label="Icon picker"
          >
            <div className="nova-iconpicker__search">
              <svg
                className="nova-iconpicker__search-icon"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
                <circle
                  cx="7"
                  cy="7"
                  r="4.5"
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
              <input
                ref={inputRef}
                type="text"
                className="nova-iconpicker__search-input"
                placeholder={searchPlaceholder}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    e.preventDefault();
                    setOpen(false);
                  }
                }}
                aria-label={searchPlaceholder}
              />
            </div>

            {filtered.length === 0 ? (
              <div className="nova-iconpicker__empty">{emptyState}</div>
            ) : (
              <div
                className="nova-iconpicker__grid"
                role="listbox"
                aria-label="Icons"
              >
                {filtered.map((ic) => {
                  const isSelected = ic.name === selected;
                  return (
                    <button
                      key={ic.name}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      title={ic.name}
                      aria-label={ic.name}
                      className={cn(
                        "nova-iconpicker__cell nova-focusable",
                        isSelected && "nova-iconpicker__cell--selected"
                      )}
                      onClick={() => commit(ic.name)}
                    >
                      <span className="nova-iconpicker__cell-icon" aria-hidden="true">
                        {ic.node}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
);
