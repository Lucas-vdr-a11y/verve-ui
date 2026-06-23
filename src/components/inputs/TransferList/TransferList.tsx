import { forwardRef, useId, useMemo, useState } from "react";
import { cn } from "../../../utils/cn";
import "./TransferList.css";

export type TransferListSize = "sm" | "md" | "lg";

export interface TransferListItem {
  /** Stable identifier; also the value stored in `value`. */
  value: string;
  /** Visible label. */
  label: string;
  /** Disable moving this item. */
  disabled?: boolean;
}

export interface TransferListProps
  extends Omit<
    React.HTMLAttributes<HTMLDivElement>,
    "onChange" | "defaultValue"
  > {
  /** Full set of items shown across both lists. */
  items: TransferListItem[];
  /** Controlled list of selected (right-side) values. */
  value?: string[];
  /** Uncontrolled initial selected values. */
  defaultValue?: string[];
  /** Called with the new list of selected values. */
  onChange?: (values: string[]) => void;
  /** Size on the sm/md/lg scale. Defaults to `"md"`. */
  size?: TransferListSize;
  /** Disable the whole control. */
  disabled?: boolean;
  /** Show a search box per side. Defaults to `true`. */
  searchable?: boolean;
  /** Show move-all buttons. Defaults to `true`. */
  showMoveAll?: boolean;
  /** Title above the available (left) list. */
  availableTitle?: React.ReactNode;
  /** Title above the selected (right) list. */
  selectedTitle?: React.ReactNode;
  /** Placeholder for the search inputs. */
  searchPlaceholder?: string;
}

interface PaneProps {
  baseId: string;
  side: "available" | "selected";
  title: React.ReactNode;
  items: TransferListItem[];
  checked: Set<string>;
  onToggle: (value: string) => void;
  searchable: boolean;
  query: string;
  onQuery: (q: string) => void;
  searchPlaceholder: string;
  disabled: boolean;
}

function Pane({
  baseId,
  side,
  title,
  items,
  checked,
  onToggle,
  searchable,
  query,
  onQuery,
  searchPlaceholder,
  disabled,
}: PaneProps) {
  const listId = `${baseId}-${side}-list`;
  return (
    <div className="nova-transferlist__pane">
      <div className="nova-transferlist__pane-header">
        <span className="nova-transferlist__pane-title">{title}</span>
        <span className="nova-transferlist__count" aria-hidden="true">
          {items.length}
        </span>
      </div>
      {searchable && (
        <div className="nova-transferlist__search">
          <input
            className="nova-transferlist__search-input nova-focusable"
            type="text"
            value={query}
            disabled={disabled}
            placeholder={searchPlaceholder}
            aria-label={`Search ${side}`}
            onChange={(e) => onQuery(e.target.value)}
          />
        </div>
      )}
      <ul
        id={listId}
        role="listbox"
        aria-multiselectable="true"
        aria-label={typeof title === "string" ? title : side}
        className="nova-transferlist__list"
      >
        {items.length === 0 ? (
          <li className="nova-transferlist__empty" role="presentation">
            No items
          </li>
        ) : (
          items.map((item) => {
            const isChecked = checked.has(item.value);
            const isDisabled = disabled || item.disabled;
            return (
              <li
                key={item.value}
                role="option"
                aria-selected={isChecked}
                aria-disabled={isDisabled || undefined}
                tabIndex={isDisabled ? -1 : 0}
                className={cn(
                  "nova-transferlist__option",
                  isChecked && "nova-transferlist__option--checked",
                  isDisabled && "nova-transferlist__option--disabled"
                )}
                onClick={() => !isDisabled && onToggle(item.value)}
                onKeyDown={(e) => {
                  if (isDisabled) return;
                  if (e.key === " " || e.key === "Enter") {
                    e.preventDefault();
                    onToggle(item.value);
                  }
                }}
              >
                <span className="nova-transferlist__check" aria-hidden="true">
                  {isChecked && (
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
                <span className="nova-transferlist__option-label">
                  {item.label}
                </span>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}

export const TransferList = forwardRef<HTMLDivElement, TransferListProps>(
  function TransferList(
    {
      items,
      value,
      defaultValue,
      onChange,
      size = "md",
      disabled = false,
      searchable = true,
      showMoveAll = true,
      availableTitle = "Available",
      selectedTitle = "Selected",
      searchPlaceholder = "Search…",
      className,
      id: idProp,
      ...rest
    },
    ref
  ) {
    const isControlled = value !== undefined;
    const [internal, setInternal] = useState<string[]>(defaultValue ?? []);
    const selectedValues = isControlled ? value : internal;

    const reactId = useId();
    const baseId = idProp ?? `nova-transferlist-${reactId}`;

    // Per-side "checked" (staged) selections that the move buttons act on.
    const [checked, setChecked] = useState<Set<string>>(new Set());
    const [availQuery, setAvailQuery] = useState("");
    const [selQuery, setSelQuery] = useState("");

    const selectedSet = useMemo(
      () => new Set(selectedValues),
      [selectedValues]
    );

    const { available, selected } = useMemo(() => {
      const avail: TransferListItem[] = [];
      const sel: TransferListItem[] = [];
      for (const item of items) {
        if (selectedSet.has(item.value)) sel.push(item);
        else avail.push(item);
      }
      return { available: avail, selected: sel };
    }, [items, selectedSet]);

    const matches = (item: TransferListItem, q: string) =>
      item.label.toLowerCase().includes(q.trim().toLowerCase());

    const availableShown = useMemo(
      () => available.filter((i) => matches(i, availQuery)),
      [available, availQuery]
    );
    const selectedShown = useMemo(
      () => selected.filter((i) => matches(i, selQuery)),
      [selected, selQuery]
    );

    const commit = (next: string[]) => {
      if (!isControlled) setInternal(next);
      onChange?.(next);
    };

    const toggleChecked = (value: string) => {
      setChecked((prev) => {
        const next = new Set(prev);
        if (next.has(value)) next.delete(value);
        else next.add(value);
        return next;
      });
    };

    const clearChecked = (values: string[]) => {
      setChecked((prev) => {
        const next = new Set(prev);
        for (const v of values) next.delete(v);
        return next;
      });
    };

    // Move checked items from available -> selected.
    const moveRight = () => {
      const toMove = available.filter(
        (i) => checked.has(i.value) && !i.disabled
      );
      if (toMove.length === 0) return;
      commit([...selectedValues, ...toMove.map((i) => i.value)]);
      clearChecked(toMove.map((i) => i.value));
    };

    const moveLeft = () => {
      const toMove = selected.filter(
        (i) => checked.has(i.value) && !i.disabled
      );
      if (toMove.length === 0) return;
      const moveSet = new Set(toMove.map((i) => i.value));
      commit(selectedValues.filter((v) => !moveSet.has(v)));
      clearChecked(toMove.map((i) => i.value));
    };

    const moveAllRight = () => {
      const movable = available.filter((i) => !i.disabled);
      if (movable.length === 0) return;
      commit([...selectedValues, ...movable.map((i) => i.value)]);
      clearChecked(movable.map((i) => i.value));
    };

    const moveAllLeft = () => {
      const stay = new Set(
        selected.filter((i) => i.disabled).map((i) => i.value)
      );
      commit(selectedValues.filter((v) => stay.has(v)));
      clearChecked(selected.map((i) => i.value));
    };

    const hasCheckedAvailable = available.some(
      (i) => checked.has(i.value) && !i.disabled
    );
    const hasCheckedSelected = selected.some(
      (i) => checked.has(i.value) && !i.disabled
    );

    return (
      <div
        {...rest}
        ref={ref}
        className={cn(
          "nova-transferlist",
          `nova-transferlist--${size}`,
          disabled && "nova-transferlist--disabled",
          className
        )}
        data-disabled={disabled || undefined}
      >
        <Pane
          baseId={baseId}
          side="available"
          title={availableTitle}
          items={availableShown}
          checked={checked}
          onToggle={toggleChecked}
          searchable={searchable}
          query={availQuery}
          onQuery={setAvailQuery}
          searchPlaceholder={searchPlaceholder}
          disabled={disabled}
        />

        <div className="nova-transferlist__controls" role="group" aria-label="Move items">
          {showMoveAll && (
            <button
              type="button"
              className="nova-transferlist__btn nova-focusable"
              aria-label="Move all to selected"
              disabled={disabled || available.every((i) => i.disabled)}
              onClick={moveAllRight}
            >
              <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 4l4 4-4 4M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
          <button
            type="button"
            className="nova-transferlist__btn nova-focusable"
            aria-label="Move selected to right"
            disabled={disabled || !hasCheckedAvailable}
            onClick={moveRight}
          >
            <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            className="nova-transferlist__btn nova-focusable"
            aria-label="Move selected to left"
            disabled={disabled || !hasCheckedSelected}
            onClick={moveLeft}
          >
            <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M10 4l-4 4 4 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          {showMoveAll && (
            <button
              type="button"
              className="nova-transferlist__btn nova-focusable"
              aria-label="Move all to available"
              disabled={disabled || selected.every((i) => i.disabled)}
              onClick={moveAllLeft}
            >
              <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M13 4l-4 4 4 4M7 4l-4 4 4 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
        </div>

        <Pane
          baseId={baseId}
          side="selected"
          title={selectedTitle}
          items={selectedShown}
          checked={checked}
          onToggle={toggleChecked}
          searchable={searchable}
          query={selQuery}
          onQuery={setSelQuery}
          searchPlaceholder={searchPlaceholder}
          disabled={disabled}
        />
      </div>
    );
  }
);
