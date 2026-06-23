import {
  forwardRef,
  useCallback,
  useId,
  useMemo,
  useState,
} from "react";
import { cn } from "../../../utils/cn";
import "./TreeNav.css";

export interface TreeNavItem {
  /** Unique id for this node (used for expansion + active state). */
  id: string;
  /** Visible label. */
  label: React.ReactNode;
  /** Link target. Items without children and with an href render as links. */
  href?: string;
  /** Optional leading icon. */
  icon?: React.ReactNode;
  /** Optional trailing badge (count, status, etc.). */
  badge?: React.ReactNode;
  /** Nested child items — presence makes this a collapsible group. */
  children?: TreeNavItem[];
  /** Disables the item. */
  disabled?: boolean;
}

export interface TreeNavProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "onChange" | "onSelect"> {
  /** The tree of nav items. */
  items: TreeNavItem[];
  /** Currently active item id (highlighted). */
  activeId?: string;
  /** Controlled set of expanded group ids. */
  expanded?: string[];
  /** Initial expanded group ids when uncontrolled. */
  defaultExpanded?: string[];
  /** Called when the set of expanded groups changes. */
  onExpandedChange?: (expanded: string[]) => void;
  /** Called when a (leaf) item is selected. */
  onSelect?: (item: TreeNavItem) => void;
  /** Accessible label for the navigation landmark. */
  "aria-label"?: string;
}

/**
 * TreeNav — a collapsible, nested sidebar navigation menu. Groups (items with
 * children) expand/collapse with `aria-expanded`; leaf items highlight when
 * active. Expansion is controlled or uncontrolled.
 */
export const TreeNav = forwardRef<HTMLElement, TreeNavProps>(function TreeNav(
  {
    items,
    activeId,
    expanded: expandedProp,
    defaultExpanded,
    onExpandedChange,
    onSelect,
    className,
    ...rest
  },
  ref,
) {
  const baseId = useId();
  const isControlled = expandedProp !== undefined;
  const [uncontrolled, setUncontrolled] = useState<string[]>(
    defaultExpanded ?? [],
  );
  const expandedSet = useMemo(
    () => new Set(isControlled ? expandedProp : uncontrolled),
    [isControlled, expandedProp, uncontrolled],
  );

  const toggle = useCallback(
    (id: string) => {
      const next = new Set(isControlled ? expandedProp : uncontrolled);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      const arr = Array.from(next);
      if (!isControlled) setUncontrolled(arr);
      onExpandedChange?.(arr);
    },
    [isControlled, expandedProp, uncontrolled, onExpandedChange],
  );

  return (
    <nav
      ref={ref}
      className={cn("nova-tree-nav", className)}
      aria-label={rest["aria-label"]}
      {...rest}
    >
      <ul className="nova-tree-nav__list" role="list">
        {items.map((item, i) => (
          <TreeNavNode
            key={item.id}
            item={item}
            level={0}
            baseId={`${baseId}-${i}`}
            activeId={activeId}
            expandedSet={expandedSet}
            onToggle={toggle}
            onSelect={onSelect}
          />
        ))}
      </ul>
    </nav>
  );
});

interface TreeNavNodeProps {
  item: TreeNavItem;
  level: number;
  baseId: string;
  activeId: string | undefined;
  expandedSet: Set<string>;
  onToggle: (id: string) => void;
  onSelect?: (item: TreeNavItem) => void;
}

function TreeNavNode({
  item,
  level,
  baseId,
  activeId,
  expandedSet,
  onToggle,
  onSelect,
}: TreeNavNodeProps) {
  const hasChildren = !!item.children && item.children.length > 0;
  const isExpanded = expandedSet.has(item.id);
  const isActive = activeId === item.id;
  const groupId = `${baseId}-group`;
  const indentStyle = {
    "--nova-tree-nav-level": level,
  } as React.CSSProperties;

  const inner = (
    <>
      {item.icon && (
        <span className="nova-tree-nav__icon" aria-hidden="true">
          {item.icon}
        </span>
      )}
      <span className="nova-tree-nav__label">{item.label}</span>
      {item.badge != null && (
        <span className="nova-tree-nav__badge">{item.badge}</span>
      )}
      {hasChildren && (
        <span className="nova-tree-nav__chevron" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path
              d="M9 18l6-6-6-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      )}
    </>
  );

  const rowClass = cn(
    "nova-tree-nav__row",
    "nova-focusable",
    isActive && "nova-tree-nav__row--active",
    item.disabled && "nova-tree-nav__row--disabled",
  );

  return (
    <li className="nova-tree-nav__item" role="listitem">
      {hasChildren ? (
        <button
          type="button"
          className={rowClass}
          style={indentStyle}
          aria-expanded={isExpanded}
          aria-controls={groupId}
          aria-current={isActive ? "page" : undefined}
          disabled={item.disabled}
          onClick={() => !item.disabled && onToggle(item.id)}
        >
          {inner}
        </button>
      ) : item.href ? (
        <a
          href={item.disabled ? undefined : item.href}
          className={rowClass}
          style={indentStyle}
          aria-current={isActive ? "page" : undefined}
          aria-disabled={item.disabled || undefined}
          onClick={(e) => {
            if (item.disabled) {
              e.preventDefault();
              return;
            }
            onSelect?.(item);
          }}
        >
          {inner}
        </a>
      ) : (
        <button
          type="button"
          className={rowClass}
          style={indentStyle}
          aria-current={isActive ? "page" : undefined}
          disabled={item.disabled}
          onClick={() => !item.disabled && onSelect?.(item)}
        >
          {inner}
        </button>
      )}

      {hasChildren && (
        <ul
          id={groupId}
          className="nova-tree-nav__list nova-tree-nav__list--nested"
          role="list"
          hidden={!isExpanded}
        >
          {item.children!.map((child, i) => (
            <TreeNavNode
              key={child.id}
              item={child}
              level={level + 1}
              baseId={`${baseId}-${i}`}
              activeId={activeId}
              expandedSet={expandedSet}
              onToggle={onToggle}
              onSelect={onSelect}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
