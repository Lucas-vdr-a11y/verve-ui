import {
  forwardRef,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { cn } from "../../../utils/cn";
import "./Cascader.css";

export type CascaderSize = "sm" | "md" | "lg";

export interface CascaderOption {
  /** Value for this level segment. */
  value: string;
  /** Visible label. */
  label: string;
  /** Disable selecting / expanding this node. */
  disabled?: boolean;
  /** Child options. A node with no children is a selectable leaf. */
  children?: CascaderOption[];
}

export interface CascaderProps
  extends Omit<
    React.HTMLAttributes<HTMLDivElement>,
    "onChange" | "defaultValue"
  > {
  /** The hierarchical option tree. */
  options: CascaderOption[];
  /** Controlled value as a path of segment values from root to leaf. */
  value?: string[];
  /** Uncontrolled initial path. */
  defaultValue?: string[];
  /**
   * Called when a leaf is chosen. Receives the path of values and the
   * matching option nodes along the path.
   */
  onChange?: (path: string[], options: CascaderOption[]) => void;
  /** Size on the sm/md/lg scale. Defaults to `"md"`. */
  size?: CascaderSize;
  /** Marks the field as invalid. */
  invalid?: boolean;
  /** Disable the whole control. */
  disabled?: boolean;
  /** Placeholder shown when nothing is selected. */
  placeholder?: string;
  /** Separator between path labels in the trigger. Defaults to `" / "`. */
  separator?: string;
  /**
   * Allow selecting non-leaf (intermediate) nodes too. When `false` (default)
   * only leaves commit a value.
   */
  changeOnSelect?: boolean;
}

// Resolve a path of values to the matching option nodes.
function resolvePath(
  options: CascaderOption[],
  path: string[]
): CascaderOption[] {
  const result: CascaderOption[] = [];
  let level: CascaderOption[] | undefined = options;
  for (const val of path) {
    const node: CascaderOption | undefined = level?.find(
      (o) => o.value === val
    );
    if (!node) break;
    result.push(node);
    level = node.children;
  }
  return result;
}

export const Cascader = forwardRef<HTMLDivElement, CascaderProps>(
  function Cascader(
    {
      options,
      value,
      defaultValue,
      onChange,
      size = "md",
      invalid = false,
      disabled = false,
      placeholder = "Select…",
      separator = " / ",
      changeOnSelect = false,
      className,
      id: idProp,
      ...rest
    },
    ref
  ) {
    const isControlled = value !== undefined;
    const [internal, setInternal] = useState<string[]>(defaultValue ?? []);
    const selected = isControlled ? value : internal;

    const [open, setOpen] = useState(false);
    // The path currently being navigated/hovered in the open menu.
    const [activePath, setActivePath] = useState<string[]>([]);
    // Keyboard focus position within the open menu: [columnIndex, optionIndex].
    const [focusCell, setFocusCell] = useState<[number, number]>([0, 0]);

    const reactId = useId();
    const baseId = idProp ?? `nova-cascader-${reactId}`;
    const popId = `${baseId}-pop`;

    const rootRef = useRef<HTMLDivElement | null>(null);
    const triggerRef = useRef<HTMLButtonElement | null>(null);
    const popRef = useRef<HTMLDivElement | null>(null);

    const setRootRef = (node: HTMLDivElement | null) => {
      rootRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    };

    const selectedNodes = useMemo(
      () => resolvePath(options, selected),
      [options, selected]
    );
    const triggerLabel =
      selectedNodes.length > 0
        ? selectedNodes.map((n) => n.label).join(separator)
        : "";

    // The columns to render: root, then children of each chosen segment.
    const columns = useMemo(() => {
      const cols: CascaderOption[][] = [options];
      let level: CascaderOption[] | undefined = options;
      for (const val of activePath) {
        const node: CascaderOption | undefined = level?.find(
          (o) => o.value === val
        );
        if (!node || !node.children || node.children.length === 0) break;
        cols.push(node.children);
        level = node.children;
      }
      return cols;
    }, [options, activePath]);

    // Open syncs the active path to the committed selection and focus.
    useEffect(() => {
      if (open) {
        setActivePath(selected);
        setFocusCell([0, Math.max(0, selected.length ? 0 : 0)]);
      }
    }, [open, selected]);

    // Move DOM focus to the keyboard-focused cell.
    useEffect(() => {
      if (!open) return;
      const el = popRef.current?.querySelector<HTMLElement>(
        `[data-col="${focusCell[0]}"][data-idx="${focusCell[1]}"]`
      );
      el?.focus();
    }, [open, focusCell, columns]);

    // Click-outside to close. SSR-safe.
    useEffect(() => {
      if (!open) return;
      const handle = (e: MouseEvent) => {
        if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
          setOpen(false);
        }
      };
      document.addEventListener("mousedown", handle);
      return () => document.removeEventListener("mousedown", handle);
    }, [open]);

    const commit = (path: string[]) => {
      const nodes = resolvePath(options, path);
      if (!isControlled) setInternal(path);
      onChange?.(path, nodes);
    };

    const handleNode = (colIndex: number, opt: CascaderOption) => {
      if (opt.disabled) return;
      const nextPath = [...activePath.slice(0, colIndex), opt.value];
      setActivePath(nextPath);
      const isLeaf = !opt.children || opt.children.length === 0;
      if (isLeaf || changeOnSelect) {
        commit(nextPath);
        if (isLeaf) {
          setOpen(false);
          triggerRef.current?.focus();
        }
      }
    };

    const toggleOpen = () => {
      if (disabled) return;
      setOpen((o) => !o);
    };

    const handleTriggerKeyDown = (
      e: React.KeyboardEvent<HTMLButtonElement>
    ) => {
      if (disabled) return;
      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setOpen(true);
      } else if (e.key === "Escape" && open) {
        e.preventDefault();
        setOpen(false);
      }
    };

    const nextEnabledIndex = (
      col: CascaderOption[],
      from: number,
      dir: 1 | -1
    ) => {
      if (col.length === 0) return from;
      let i = from;
      for (let count = 0; count < col.length; count++) {
        i = (i + dir + col.length) % col.length;
        if (!col[i]?.disabled) return i;
      }
      return from;
    };

    const handlePopoverKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      const [col, idx] = focusCell;
      const column = columns[col] ?? [];
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setFocusCell([col, nextEnabledIndex(column, idx, 1)]);
          break;
        case "ArrowUp":
          e.preventDefault();
          setFocusCell([col, nextEnabledIndex(column, idx, -1)]);
          break;
        case "ArrowRight": {
          e.preventDefault();
          const opt = column[idx];
          if (opt && opt.children && opt.children.length > 0) {
            const nextPath = [...activePath.slice(0, col), opt.value];
            setActivePath(nextPath);
            setFocusCell([col + 1, 0]);
          }
          break;
        }
        case "ArrowLeft":
          e.preventDefault();
          if (col > 0) setFocusCell([col - 1, 0]);
          break;
        case "Enter":
        case " ": {
          e.preventDefault();
          const opt = column[idx];
          if (opt) handleNode(col, opt);
          break;
        }
        case "Escape":
          e.preventDefault();
          setOpen(false);
          triggerRef.current?.focus();
          break;
        case "Tab":
          setOpen(false);
          break;
        default:
          break;
      }
    };

    return (
      <div
        {...rest}
        ref={setRootRef}
        className={cn(
          "nova-cascader",
          `nova-cascader--${size}`,
          invalid && "nova-cascader--invalid",
          disabled && "nova-cascader--disabled",
          className
        )}
        data-disabled={disabled || undefined}
      >
        <button
          ref={triggerRef}
          type="button"
          id={baseId}
          className="nova-cascader__trigger nova-focusable"
          aria-haspopup="tree"
          aria-expanded={open}
          aria-controls={open ? popId : undefined}
          aria-invalid={invalid || undefined}
          disabled={disabled}
          onClick={toggleOpen}
          onKeyDown={handleTriggerKeyDown}
        >
          <span
            className={cn(
              "nova-cascader__value",
              triggerLabel === "" && "nova-cascader__value--placeholder"
            )}
          >
            {triggerLabel === "" ? placeholder : triggerLabel}
          </span>
          <span className="nova-cascader__chevron" aria-hidden="true">
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
        </button>

        {open && (
          <div
            ref={popRef}
            id={popId}
            role="tree"
            className="nova-cascader__popover"
            onKeyDown={handlePopoverKeyDown}
          >
            {columns.map((col, colIndex) => (
              <ul
                key={colIndex}
                role="group"
                className="nova-cascader__column"
              >
                {col.map((opt, optIndex) => {
                  const isActive = activePath[colIndex] === opt.value;
                  const isFocused =
                    focusCell[0] === colIndex && focusCell[1] === optIndex;
                  const hasChildren =
                    !!opt.children && opt.children.length > 0;
                  const isSelectedLeaf =
                    !hasChildren &&
                    selected[colIndex] === opt.value &&
                    selected.length === colIndex + 1;
                  return (
                    <li
                      key={opt.value}
                      role="treeitem"
                      data-col={colIndex}
                      data-idx={optIndex}
                      aria-expanded={hasChildren ? isActive : undefined}
                      aria-selected={isActive}
                      aria-disabled={opt.disabled || undefined}
                      tabIndex={isFocused ? 0 : -1}
                      className={cn(
                        "nova-cascader__option nova-focusable",
                        isActive && "nova-cascader__option--active",
                        isSelectedLeaf && "nova-cascader__option--selected",
                        opt.disabled && "nova-cascader__option--disabled"
                      )}
                      onClick={() => handleNode(colIndex, opt)}
                      onMouseEnter={() => {
                        if (!opt.disabled && hasChildren) {
                          setActivePath([
                            ...activePath.slice(0, colIndex),
                            opt.value,
                          ]);
                        }
                      }}
                    >
                      <span className="nova-cascader__option-label">
                        {opt.label}
                      </span>
                      {hasChildren && (
                        <span
                          className="nova-cascader__arrow"
                          aria-hidden="true"
                        >
                          <svg viewBox="0 0 16 16" fill="none">
                            <path
                              d="M6 4l4 4-4 4"
                              stroke="currentColor"
                              strokeWidth="1.75"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            ))}
          </div>
        )}
      </div>
    );
  }
);
