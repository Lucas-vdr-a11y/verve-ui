import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "../../../utils/cn";
import "./CommandPalette.css";

export interface CommandItem {
  /** Unique id. */
  id: string;
  /** Visible label — matched against the filter query. */
  label: string;
  /** Group/section this command belongs to. */
  group?: string;
  /** Leading icon. */
  icon?: React.ReactNode;
  /** Trailing hint (e.g. a shortcut node). */
  hint?: React.ReactNode;
  /** Extra keywords to match against. */
  keywords?: string[];
  /** Invoked on Enter / click. */
  onRun?: (item: CommandItem) => void;
  /** Disable selection. */
  disabled?: boolean;
}

export interface CommandPaletteProps {
  /** Whether the palette is open. */
  open: boolean;
  /** Close handler (Esc, overlay click, or after running). */
  onClose: () => void;
  /** Command list. */
  commands: CommandItem[];
  /** Input placeholder. Defaults to `"Type a command or search…"`. */
  placeholder?: string;
  /** Content shown when nothing matches. */
  emptyMessage?: React.ReactNode;
  /** Accessible dialog label. Defaults to `"Command palette"`. */
  "aria-label"?: string;
  /** Extra class on the dialog panel. */
  className?: string;
}

function fuzzyMatch(query: string, text: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  let qi = 0;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) qi++;
  }
  return qi === q.length;
}

export function CommandPalette({
  open,
  onClose,
  commands,
  placeholder = "Type a command or search…",
  emptyMessage = "No results found",
  "aria-label": ariaLabel = "Command palette",
  className,
}: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    return commands.filter((c) => {
      if (c.disabled) return false;
      const haystack = [c.label, ...(c.keywords ?? [])].join(" ");
      return fuzzyMatch(query, haystack);
    });
  }, [commands, query]);

  // Reset query + selection when (re)opened.
  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIndex(0);
    }
  }, [open]);

  // Keep selection in range as results change.
  useEffect(() => {
    setActiveIndex((i) => Math.min(i, Math.max(filtered.length - 1, 0)));
  }, [filtered.length]);

  // Focus the input when opened.
  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  // Lock body scroll while open (SSR-guarded).
  useEffect(() => {
    if (!open || typeof document === "undefined") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Scroll the active item into view.
  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(
      `[data-index="${activeIndex}"]`
    );
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  if (!open || typeof document === "undefined") return null;

  const runItem = (item: CommandItem | undefined) => {
    if (!item || item.disabled) return;
    item.onRun?.(item);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (filtered.length ? (i + 1) % filtered.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) =>
        filtered.length ? (i - 1 + filtered.length) % filtered.length : 0
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      runItem(filtered[activeIndex]);
    }
  };

  // Group while preserving the flat index used for keyboard nav.
  const groups: { group: string | undefined; items: CommandItem[] }[] = [];
  for (const item of filtered) {
    const last = groups[groups.length - 1];
    if (last && last.group === item.group) last.items.push(item);
    else groups.push({ group: item.group, items: [item] });
  }
  let flatIndex = -1;

  return createPortal(
    <div
      className="nova-command-palette__overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        className={cn("nova-command-palette", className)}
        onKeyDown={handleKeyDown}
      >
        <div className="nova-command-palette__input-row">
          <span className="nova-command-palette__search-icon" aria-hidden="true">
            <svg viewBox="0 0 20 20" width="1em" height="1em" focusable="false">
              <path
                d="M9 3a6 6 0 1 0 3.7 10.7l3.3 3.3 1.4-1.4-3.3-3.3A6 6 0 0 0 9 3Zm0 2a4 4 0 1 1 0 8 4 4 0 0 1 0-8Z"
                fill="currentColor"
              />
            </svg>
          </span>
          <input
            ref={inputRef}
            type="text"
            className="nova-command-palette__input"
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            role="combobox"
            aria-expanded="true"
            aria-controls="nova-command-palette-list"
            aria-autocomplete="list"
          />
        </div>

        <div
          ref={listRef}
          id="nova-command-palette-list"
          role="listbox"
          className="nova-command-palette__list"
        >
          {filtered.length === 0 ? (
            <div className="nova-command-palette__empty">{emptyMessage}</div>
          ) : (
            groups.map((g, gi) => (
              <div className="nova-command-palette__group" key={gi}>
                {g.group && (
                  <div className="nova-command-palette__group-label">
                    {g.group}
                  </div>
                )}
                {g.items.map((item) => {
                  flatIndex++;
                  const idx = flatIndex;
                  const active = idx === activeIndex;
                  return (
                    <div
                      key={item.id}
                      data-index={idx}
                      role="option"
                      aria-selected={active}
                      className={cn(
                        "nova-command-palette__item",
                        active && "nova-command-palette__item--active"
                      )}
                      onMouseMove={() => setActiveIndex(idx)}
                      onClick={() => runItem(item)}
                    >
                      {item.icon && (
                        <span
                          className="nova-command-palette__item-icon"
                          aria-hidden="true"
                        >
                          {item.icon}
                        </span>
                      )}
                      <span className="nova-command-palette__item-label">
                        {item.label}
                      </span>
                      {item.hint != null && (
                        <span className="nova-command-palette__item-hint">
                          {item.hint}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
