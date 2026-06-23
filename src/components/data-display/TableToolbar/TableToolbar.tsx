import { forwardRef, useEffect, useId, useRef, useState } from "react";
import { cn } from "../../../utils/cn";
import "./TableToolbar.css";

export interface TableToolbarColumnToggle {
  /** Stable key identifying the column. */
  key: string;
  /** Label shown in the menu. */
  label: React.ReactNode;
  /** Whether the column is currently visible. */
  visible: boolean;
  /** Prevent toggling (e.g. a pinned column). */
  disabled?: boolean;
}

export interface TableToolbarProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** Search input value (controlled). Omit to hide the search box. */
  searchValue?: string;
  /** Search change callback. */
  onSearchChange?: (value: string) => void;
  /** Search input placeholder. */
  searchPlaceholder?: string;
  /** Column-visibility entries. When provided, renders a toggle menu. */
  columns?: TableToolbarColumnToggle[];
  /** Called when a column's visibility is toggled. */
  onColumnVisibilityChange?: (key: string, visible: boolean) => void;
  /** Total row count, shown in the info area. */
  totalCount?: number;
  /** Number of selected rows, shown in the info area when > 0. */
  selectedCount?: number;
  /** Custom filter controls rendered in the toolbar. */
  filterSlot?: React.ReactNode;
  /** Action buttons rendered at the trailing edge. */
  actions?: React.ReactNode;
  /** Compact spacing. */
  dense?: boolean;
}

const SearchIcon = () => (
  <svg
    viewBox="0 0 16 16"
    width="1em"
    height="1em"
    aria-hidden="true"
    focusable="false"
  >
    <circle
      cx="7"
      cy="7"
      r="4.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path
      d="M10.5 10.5 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

const ColumnsIcon = () => (
  <svg
    viewBox="0 0 16 16"
    width="1em"
    height="1em"
    aria-hidden="true"
    focusable="false"
  >
    <rect
      x="2"
      y="2.5"
      width="12"
      height="11"
      rx="1.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path d="M6.5 2.5v11M10 2.5v11" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

export const TableToolbar = forwardRef<HTMLDivElement, TableToolbarProps>(
  function TableToolbar(
    {
      searchValue,
      onSearchChange,
      searchPlaceholder = "Search…",
      columns,
      onColumnVisibilityChange,
      totalCount,
      selectedCount = 0,
      filterSlot,
      actions,
      dense = false,
      className,
      ...rest
    },
    ref
  ) {
    const [menuOpen, setMenuOpen] = useState(false);
    const menuId = useId();
    const wrapRef = useRef<HTMLDivElement>(null);

    const showSearch = searchValue !== undefined || !!onSearchChange;
    const showColumns = !!columns && columns.length > 0;

    useEffect(() => {
      if (!menuOpen) return;
      const onPointerDown = (e: PointerEvent) => {
        if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
          setMenuOpen(false);
        }
      };
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") setMenuOpen(false);
      };
      document.addEventListener("pointerdown", onPointerDown);
      document.addEventListener("keydown", onKey);
      return () => {
        document.removeEventListener("pointerdown", onPointerDown);
        document.removeEventListener("keydown", onKey);
      };
    }, [menuOpen]);

    return (
      <div
        ref={ref}
        role="toolbar"
        aria-label="Table controls"
        className={cn(
          "nova-table-toolbar",
          dense && "nova-table-toolbar--dense",
          className
        )}
        {...rest}
      >
        <div className="nova-table-toolbar__leading">
          {showSearch && (
            <div className="nova-table-toolbar__search">
              <span className="nova-table-toolbar__search-icon" aria-hidden="true">
                <SearchIcon />
              </span>
              <input
                type="search"
                className="nova-table-toolbar__search-input"
                value={searchValue ?? ""}
                placeholder={searchPlaceholder}
                onChange={(e) => onSearchChange?.(e.target.value)}
                aria-label={searchPlaceholder}
              />
            </div>
          )}
          {filterSlot && (
            <div className="nova-table-toolbar__filter">{filterSlot}</div>
          )}
        </div>

        <div className="nova-table-toolbar__trailing">
          {(selectedCount > 0 || totalCount !== undefined) && (
            <span
              className="nova-table-toolbar__info"
              aria-live="polite"
            >
              {selectedCount > 0
                ? `${selectedCount} selected`
                : `${totalCount} ${totalCount === 1 ? "row" : "rows"}`}
            </span>
          )}

          {showColumns && (
            <div className="nova-table-toolbar__columns" ref={wrapRef}>
              <button
                type="button"
                className="nova-table-toolbar__columns-button"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                aria-controls={menuId}
                onClick={() => setMenuOpen((o) => !o)}
              >
                <ColumnsIcon />
                <span>Columns</span>
              </button>
              {menuOpen && (
                <div
                  id={menuId}
                  role="menu"
                  className="nova-table-toolbar__menu"
                >
                  {columns!.map((col) => (
                    <label
                      key={col.key}
                      role="menuitemcheckbox"
                      aria-checked={col.visible}
                      className={cn(
                        "nova-table-toolbar__menu-item",
                        col.disabled && "nova-table-toolbar__menu-item--disabled"
                      )}
                    >
                      <input
                        type="checkbox"
                        className="nova-table-toolbar__menu-checkbox"
                        checked={col.visible}
                        disabled={col.disabled}
                        onChange={(e) =>
                          onColumnVisibilityChange?.(col.key, e.target.checked)
                        }
                      />
                      <span>{col.label}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {actions && (
            <div className="nova-table-toolbar__actions">{actions}</div>
          )}
        </div>
      </div>
    );
  }
);
