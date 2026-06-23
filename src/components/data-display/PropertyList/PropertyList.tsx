import { forwardRef, useCallback, useState } from "react";
import { cn } from "../../../utils/cn";
import "./PropertyList.css";

export interface PropertyItem {
  /** Stable id (defaults to `label`). */
  id?: string | number;
  /** Property name. */
  label: React.ReactNode;
  /** Property value — any node. */
  value: React.ReactNode;
  /**
   * Enable a copy button for this row. When the value is a string it is copied
   * directly; otherwise provide `copyText`.
   */
  copyable?: boolean;
  /** Explicit text to copy (overrides the rendered value). */
  copyText?: string;
}

export interface PropertyGroup {
  /** Section heading. */
  title?: React.ReactNode;
  /** Rows within the section. */
  items: PropertyItem[];
}

export interface PropertyListProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Either a flat list of rows, or grouped sections. Use `groups` for the
   * grouped/sectioned layout.
   */
  items?: PropertyItem[];
  /** Grouped sections. Takes precedence over `items` when provided. */
  groups?: PropertyGroup[];
  /** Tighter row padding. Defaults to `true` (denser than DescriptionList). */
  dense?: boolean;
  /** Enable copy for every row (per-row `copyable` still wins when set false). */
  copyable?: boolean;
}

const CopyIcon = () => (
  <svg viewBox="0 0 16 16" width="1em" height="1em" aria-hidden="true">
    <rect x="5.5" y="5.5" width="8" height="8" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.3" />
    <path d="M10.5 5.5V4A1.5 1.5 0 0 0 9 2.5H4A1.5 1.5 0 0 0 2.5 4v5A1.5 1.5 0 0 0 4 10.5h1.5" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 16 16" width="1em" height="1em" aria-hidden="true">
    <path d="M3.5 8.5 6.5 11.5 12.5 5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const copyToClipboard = (text: string): Promise<void> => {
  if (
    typeof navigator !== "undefined" &&
    navigator.clipboard &&
    typeof navigator.clipboard.writeText === "function"
  ) {
    return navigator.clipboard.writeText(text);
  }
  return Promise.reject(new Error("Clipboard API unavailable"));
};

interface RowProps {
  item: PropertyItem;
  rowId: string | number;
  groupCopyable: boolean;
  copiedId: string | number | null;
  onCopy: (id: string | number, text: string) => void;
}

const PropertyRow = ({
  item,
  rowId,
  groupCopyable,
  copiedId,
  onCopy,
}: RowProps) => {
  const canCopy = item.copyable ?? groupCopyable;
  const text =
    item.copyText ??
    (typeof item.value === "string" || typeof item.value === "number"
      ? String(item.value)
      : "");
  const showCopy = canCopy && text.length > 0;
  const copied = copiedId === rowId;

  return (
    <div className="nova-property-list__row">
      <dt className="nova-property-list__label">{item.label}</dt>
      <dd className="nova-property-list__value">
        <span className="nova-property-list__value-text">{item.value}</span>
        {showCopy && (
          <button
            type="button"
            className="nova-property-list__copy"
            onClick={() => onCopy(rowId, text)}
            aria-label={copied ? "Copied" : "Copy value"}
          >
            {copied ? <CheckIcon /> : <CopyIcon />}
          </button>
        )}
      </dd>
    </div>
  );
};

export const PropertyList = forwardRef<HTMLDivElement, PropertyListProps>(
  function PropertyList(
    { items, groups, dense = true, copyable = false, className, ...rest },
    ref
  ) {
    const [copiedId, setCopiedId] = useState<string | number | null>(null);

    const handleCopy = useCallback((id: string | number, text: string) => {
      copyToClipboard(text)
        .then(() => {
          setCopiedId(id);
          setTimeout(() => {
            setCopiedId((curr) => (curr === id ? null : curr));
          }, 1500);
        })
        .catch(() => {
          /* clipboard unavailable — silently ignore */
        });
    }, []);

    const resolvedGroups: PropertyGroup[] =
      groups ?? (items ? [{ items }] : []);

    return (
      <div
        ref={ref}
        className={cn(
          "nova-property-list",
          dense && "nova-property-list--dense",
          className
        )}
        {...rest}
      >
        {resolvedGroups.map((group, gi) => (
          <section className="nova-property-list__group" key={gi}>
            {group.title != null && (
              <h4 className="nova-property-list__group-title">{group.title}</h4>
            )}
            <dl className="nova-property-list__items">
              {group.items.map((item, ii) => {
                const rowId = item.id ?? `${gi}:${ii}`;
                return (
                  <PropertyRow
                    key={rowId}
                    item={item}
                    rowId={rowId}
                    groupCopyable={copyable}
                    copiedId={copiedId}
                    onCopy={handleCopy}
                  />
                );
              })}
            </dl>
          </section>
        ))}
      </div>
    );
  }
);
