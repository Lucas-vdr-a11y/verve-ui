import {
  forwardRef,
  useCallback,
  useId,
  useState,
  type ReactNode,
} from "react";
import { cn } from "../../../utils/cn";
import "./FAQ.css";

export interface FAQItem {
  /** Stable identifier. Falls back to the index when omitted. */
  id?: string;
  /** The question text or node. */
  question: ReactNode;
  /** The answer content. */
  answer: ReactNode;
  /** Disable opening/closing this entry. */
  disabled?: boolean;
}

export type FAQMode = "single" | "multiple";

export interface FAQProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** The question/answer entries. */
  items: FAQItem[];
  /** Allow one (`"single"`) or many (`"multiple"`) open answers. Defaults to `"single"`. */
  mode?: FAQMode;
  /** Controlled set of open item keys. */
  open?: string[];
  /** Initially open item keys for uncontrolled usage. */
  defaultOpen?: string[];
  /** Notified with the open keys whenever an answer toggles. */
  onChange?: (open: string[]) => void;
}

function keyFor(item: FAQItem, index: number): string {
  return item.id ?? String(index);
}

/**
 * FAQ — a self-contained question/answer list built on the accordion pattern
 * (it does not import Accordion). Smoothly animates answer height and emits
 * schema-friendly markup (itemscope FAQPage / Question / Answer).
 */
export const FAQ = forwardRef<HTMLDivElement, FAQProps>(function FAQ(
  {
    items,
    mode = "single",
    open: openProp,
    defaultOpen,
    onChange,
    className,
    ...rest
  },
  ref
) {
  const isControlled = openProp !== undefined;
  const [internalOpen, setInternalOpen] = useState<string[]>(
    () => defaultOpen ?? []
  );
  const openKeys = isControlled ? openProp : internalOpen;

  const baseId = useId();

  const emit = useCallback(
    (next: string[]) => {
      if (!isControlled) setInternalOpen(next);
      onChange?.(next);
    },
    [isControlled, onChange]
  );

  const toggle = useCallback(
    (key: string) => {
      const isOpen = openKeys.includes(key);
      if (mode === "single") {
        emit(isOpen ? [] : [key]);
      } else {
        emit(
          isOpen ? openKeys.filter((k) => k !== key) : [...openKeys, key]
        );
      }
    },
    [openKeys, mode, emit]
  );

  return (
    <div
      ref={ref}
      className={cn("nova-faq", className)}
      itemScope
      itemType="https://schema.org/FAQPage"
      {...rest}
    >
      {items.map((item, index) => {
        const key = keyFor(item, index);
        const open = openKeys.includes(key);
        const disabled = item.disabled ?? false;
        const triggerId = `${baseId}-${key}-q`;
        const panelId = `${baseId}-${key}-a`;

        return (
          <div
            key={key}
            className={cn(
              "nova-faq__item",
              open && "nova-faq__item--open",
              disabled && "nova-faq__item--disabled"
            )}
            data-state={open ? "open" : "closed"}
            itemScope
            itemProp="mainEntity"
            itemType="https://schema.org/Question"
          >
            <h3 className="nova-faq__heading">
              <button
                type="button"
                id={triggerId}
                className={cn("nova-faq__question", "nova-focusable")}
                aria-expanded={open}
                aria-controls={panelId}
                aria-disabled={disabled || undefined}
                disabled={disabled}
                onClick={() => {
                  if (!disabled) toggle(key);
                }}
              >
                <span className="nova-faq__question-text" itemProp="name">
                  {item.question}
                </span>
                <span className="nova-faq__icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path
                      d="m6 9 6 6 6-6"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={triggerId}
              className="nova-faq__answer"
              data-state={open ? "open" : "closed"}
              aria-hidden={!open}
              itemScope
              itemProp="acceptedAnswer"
              itemType="https://schema.org/Answer"
            >
              <div className="nova-faq__answer-clip">
                <div
                  className="nova-faq__answer-inner"
                  itemProp="text"
                  {...(!open ? { inert: "true" } : {})}
                >
                  {item.answer}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
});
