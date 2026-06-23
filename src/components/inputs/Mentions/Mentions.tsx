import {
  forwardRef,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { cn } from "../../../utils/cn";
import "./Mentions.css";

export type MentionsSize = "sm" | "md" | "lg";

export interface MentionOption {
  /** Identifier inserted with the mention (e.g. a username or id). */
  value: string;
  /** Label shown in the suggestion list and inserted after the trigger. */
  label: string;
  /** Disable selecting this option. */
  disabled?: boolean;
}

export interface MentionsProps
  extends Omit<
    React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    "onChange" | "value" | "defaultValue"
  > {
  /** The suggestion options. */
  options: MentionOption[];
  /** Controlled plain-text value. */
  value?: string;
  /** Uncontrolled initial value. */
  defaultValue?: string;
  /** Called with the new plain-text value on every change. */
  onChange?: (value: string) => void;
  /** Called when a mention is inserted. */
  onMention?: (option: MentionOption) => void;
  /** Character that triggers the suggestion popover. Defaults to `"@"`. */
  trigger?: string;
  /** Size on the sm/md/lg scale. Defaults to `"md"`. */
  size?: MentionsSize;
  /** Marks the field as invalid. */
  invalid?: boolean;
  /** Content shown when no option matches the query. */
  emptyState?: React.ReactNode;
  /** Custom filter predicate. Defaults to case-insensitive label substring. */
  filter?: (option: MentionOption, query: string) => boolean;
}

const defaultFilter = (option: MentionOption, query: string) =>
  option.label.toLowerCase().includes(query.toLowerCase());

interface TriggerState {
  /** Index of the trigger char in the text. */
  start: number;
  /** The query typed after the trigger char. */
  query: string;
}

// Find an active trigger immediately before the caret, if any.
function findTrigger(
  text: string,
  caret: number,
  trigger: string
): TriggerState | null {
  // Walk backwards from caret to find the trigger char, stopping at whitespace.
  let i = caret - 1;
  while (i >= 0) {
    const ch = text[i];
    if (ch === trigger) {
      const before = text[i - 1];
      // Trigger must be at start or preceded by whitespace.
      if (i === 0 || /\s/.test(before)) {
        return { start: i, query: text.slice(i + 1, caret) };
      }
      return null;
    }
    if (/\s/.test(ch)) return null;
    i--;
  }
  return null;
}

export const Mentions = forwardRef<HTMLTextAreaElement, MentionsProps>(
  function Mentions(
    {
      options,
      value,
      defaultValue,
      onChange,
      onMention,
      trigger = "@",
      size = "md",
      invalid = false,
      emptyState = "No results",
      filter = defaultFilter,
      disabled,
      className,
      id: idProp,
      onKeyDown,
      onBlur,
      ...rest
    },
    ref
  ) {
    const isControlled = value !== undefined;
    const [internal, setInternal] = useState<string>(defaultValue ?? "");
    const text = isControlled ? value : internal;

    const [active, setActive] = useState<TriggerState | null>(null);
    const [activeIndex, setActiveIndex] = useState(0);

    const reactId = useId();
    const baseId = idProp ?? `nova-mentions-${reactId}`;
    const listId = `${baseId}-list`;

    const rootRef = useRef<HTMLDivElement | null>(null);
    const innerRef = useRef<HTMLTextAreaElement | null>(null);
    const listRef = useRef<HTMLUListElement | null>(null);

    const setRef = (node: HTMLTextAreaElement | null) => {
      innerRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    };

    const filtered = useMemo(() => {
      if (!active) return [];
      return options.filter((o) => filter(o, active.query));
    }, [options, filter, active]);

    const open = active !== null;
    const hasResults = filtered.length > 0;

    // Keep active suggestion in view.
    useEffect(() => {
      if (!open) return;
      const el = listRef.current?.querySelector<HTMLElement>(
        `[data-index="${activeIndex}"]`
      );
      el?.scrollIntoView({ block: "nearest" });
    }, [open, activeIndex]);

    // Click-outside closes the popover. SSR-safe.
    useEffect(() => {
      if (!open) return;
      const handle = (e: MouseEvent) => {
        if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
          setActive(null);
        }
      };
      document.addEventListener("mousedown", handle);
      return () => document.removeEventListener("mousedown", handle);
    }, [open]);

    const setText = (next: string) => {
      if (!isControlled) setInternal(next);
      onChange?.(next);
    };

    const syncTrigger = (next: string, caret: number) => {
      const found = findTrigger(next, caret, trigger);
      setActive(found);
      setActiveIndex(0);
    };

    const insert = (opt: MentionOption) => {
      if (opt.disabled || !active) return;
      const el = innerRef.current;
      const caret = el ? el.selectionStart : active.start + 1 + active.query.length;
      const before = text.slice(0, active.start);
      const after = text.slice(caret);
      const insertText = `${trigger}${opt.label} `;
      const next = before + insertText + after;
      setText(next);
      setActive(null);
      onMention?.(opt);
      // Restore caret just after the inserted mention.
      const nextCaret = (before + insertText).length;
      requestAnimationFrame(() => {
        if (el) {
          el.focus();
          el.setSelectionRange(nextCaret, nextCaret);
        }
      });
    };

    const firstEnabled = (from: number, dir: 1 | -1) => {
      if (filtered.length === 0) return 0;
      let i = from;
      for (let count = 0; count < filtered.length; count++) {
        i = (i + dir + filtered.length) % filtered.length;
        if (!filtered[i]?.disabled) return i;
      }
      return from;
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      onKeyDown?.(e);
      if (e.defaultPrevented) return;
      if (!open) return;
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setActiveIndex((i) => firstEnabled(i, 1));
          break;
        case "ArrowUp":
          e.preventDefault();
          setActiveIndex((i) => firstEnabled(i, -1));
          break;
        case "Enter":
        case "Tab":
          if (filtered[activeIndex]) {
            e.preventDefault();
            insert(filtered[activeIndex]);
          }
          break;
        case "Escape":
          e.preventDefault();
          setActive(null);
          break;
        default:
          break;
      }
    };

    return (
      <div
        ref={rootRef}
        className={cn(
          "nova-mentions",
          `nova-mentions--${size}`,
          invalid && "nova-mentions--invalid",
          disabled && "nova-mentions--disabled",
          className
        )}
        data-disabled={disabled || undefined}
      >
        <textarea
          {...rest}
          ref={setRef}
          id={baseId}
          className="nova-mentions__field nova-focusable"
          role="combobox"
          aria-expanded={open}
          aria-controls={open ? listId : undefined}
          aria-autocomplete="list"
          aria-activedescendant={
            open && hasResults ? `${baseId}-opt-${activeIndex}` : undefined
          }
          aria-invalid={invalid || undefined}
          disabled={disabled}
          value={text}
          onChange={(e) => {
            const next = e.target.value;
            setText(next);
            syncTrigger(next, e.target.selectionStart ?? next.length);
          }}
          onClick={(e) => {
            const el = e.currentTarget;
            syncTrigger(el.value, el.selectionStart ?? el.value.length);
          }}
          onKeyUp={(e) => {
            if (
              e.key === "ArrowLeft" ||
              e.key === "ArrowRight" ||
              e.key === "Home" ||
              e.key === "End"
            ) {
              const el = e.currentTarget;
              syncTrigger(el.value, el.selectionStart ?? el.value.length);
            }
          }}
          onKeyDown={handleKeyDown}
          onBlur={(e) => {
            onBlur?.(e);
            // Defer so a suggestion click can fire first.
            window.setTimeout(() => setActive(null), 120);
          }}
        />

        {open && (
          <ul
            ref={listRef}
            id={listId}
            role="listbox"
            className="nova-mentions__list"
          >
            {!hasResults ? (
              <li className="nova-mentions__empty" role="presentation">
                {emptyState}
              </li>
            ) : (
              filtered.map((opt, index) => {
              const isActive = index === activeIndex;
              return (
                <li
                  key={opt.value}
                  id={`${baseId}-opt-${index}`}
                  data-index={index}
                  role="option"
                  aria-selected={isActive}
                  aria-disabled={opt.disabled || undefined}
                  className={cn(
                    "nova-mentions__option",
                    isActive && "nova-mentions__option--active",
                    opt.disabled && "nova-mentions__option--disabled"
                  )}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    insert(opt);
                  }}
                  onMouseEnter={() => !opt.disabled && setActiveIndex(index)}
                >
                  <span className="nova-mentions__option-trigger" aria-hidden="true">
                    {trigger}
                  </span>
                  <span className="nova-mentions__option-label">
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
);
