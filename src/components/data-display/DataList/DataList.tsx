import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { cn } from "../../../utils/cn";
import "./DataList.css";

export interface DataListItem {
  /** The field label. */
  label: React.ReactNode;
  /** The field value (any node). */
  value: React.ReactNode;
  /** Enable copy-on-click for this row. */
  copyable?: boolean;
  /**
   * Text copied to the clipboard. Required to copy when `value` is a node;
   * falls back to `value` when it's a string or number.
   */
  copyText?: string;
}

export interface DataListProps
  extends Omit<React.HTMLAttributes<HTMLDListElement>, "children"> {
  /** The records to display, as aligned label/value rows. */
  items: DataListItem[];
  /** Layout: labels beside values (`"row"`) or above (`"stacked"`). */
  layout?: "row" | "stacked";
  /** Compact vertical padding. */
  dense?: boolean;
  /** Draw separators between rows. Defaults to `true`. */
  divided?: boolean;
}

function resolveCopyText(item: DataListItem): string | null {
  if (item.copyText != null) return item.copyText;
  if (typeof item.value === "string") return item.value;
  if (typeof item.value === "number") return String(item.value);
  return null;
}

const CopyIcon = () => (
  <svg viewBox="0 0 16 16" width="1em" height="1em" aria-hidden="true" focusable="false">
    <rect
      x="5"
      y="5"
      width="8"
      height="8"
      rx="1.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path
      d="M11 5V4a1.5 1.5 0 0 0-1.5-1.5H4A1.5 1.5 0 0 0 2.5 4v5.5A1.5 1.5 0 0 0 4 11h1"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 16 16" width="1em" height="1em" aria-hidden="true" focusable="false">
    <path
      d="M3.5 8.5l3 3 6-6.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * DataList — a definition-style record viewer. Renders `{label, value}` pairs as
 * aligned rows, ideal for detail panels, with optional per-row copy support.
 */
export const DataList = forwardRef<HTMLDListElement, DataListProps>(
  function DataList(
    {
      items,
      layout = "row",
      dense = false,
      divided = true,
      className,
      ...rest
    },
    ref
  ) {
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(
      () => () => {
        if (timer.current) clearTimeout(timer.current);
      },
      []
    );

    const handleCopy = useCallback((index: number, text: string) => {
      if (typeof navigator === "undefined" || !navigator.clipboard) return;
      navigator.clipboard.writeText(text).then(
        () => {
          setCopiedIndex(index);
          if (timer.current) clearTimeout(timer.current);
          timer.current = setTimeout(() => setCopiedIndex(null), 1500);
        },
        () => {
          /* clipboard rejected — leave state unchanged */
        }
      );
    }, []);

    return (
      <dl
        ref={ref}
        className={cn(
          "nova-data-list",
          `nova-data-list--${layout}`,
          dense && "nova-data-list--dense",
          divided && "nova-data-list--divided",
          className
        )}
        {...rest}
      >
        {items.map((item, index) => {
          const copyText = item.copyable ? resolveCopyText(item) : null;
          const canCopy = item.copyable && copyText != null;
          const isCopied = copiedIndex === index;
          return (
            <div className="nova-data-list__row" key={index}>
              <dt className="nova-data-list__label">{item.label}</dt>
              <dd className="nova-data-list__value">
                <span className="nova-data-list__value-text">{item.value}</span>
                {canCopy && (
                  <button
                    type="button"
                    className="nova-data-list__copy nova-focusable"
                    onClick={() => handleCopy(index, copyText!)}
                    aria-label={isCopied ? "Copied" : "Copy value"}
                  >
                    {isCopied ? <CheckIcon /> : <CopyIcon />}
                  </button>
                )}
              </dd>
            </div>
          );
        })}
      </dl>
    );
  }
);
