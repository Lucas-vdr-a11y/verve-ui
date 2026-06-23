import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { cn } from "../../../utils/cn";
import "./TreeView.css";

export interface TreeNode {
  /** Unique identifier for the node. */
  id: string;
  /** Visible label. */
  label: React.ReactNode;
  /** Optional custom icon. Overrides the default branch/leaf icon. */
  icon?: React.ReactNode;
  /** Disable selection and expansion of this node. */
  disabled?: boolean;
  /** Child nodes. Presence (even if empty) marks the node as a branch. */
  children?: TreeNode[];
}

interface FlatNode {
  node: TreeNode;
  level: number;
  isBranch: boolean;
}

interface TreeViewContextValue {
  expanded: Set<string>;
  selected: string | undefined;
  visibleIds: React.MutableRefObject<string[]>;
  toggleExpanded: (id: string, open?: boolean) => void;
  select: (id: string) => void;
  focusNode: (id: string) => void;
  treeId: string;
}

const TreeViewContext = createContext<TreeViewContextValue | null>(null);

function useTreeViewContext(): TreeViewContextValue {
  const ctx = useContext(TreeViewContext);
  if (!ctx) {
    throw new Error("TreeView internals must be used within <TreeView>.");
  }
  return ctx;
}

function isBranchNode(node: TreeNode): boolean {
  return Array.isArray(node.children);
}

export interface TreeViewProps
  extends Omit<React.HTMLAttributes<HTMLUListElement>, "onSelect"> {
  /** Hierarchical node data. */
  items: TreeNode[];
  /** Controlled set of expanded node ids. */
  expandedIds?: string[];
  /** Initially expanded node ids when uncontrolled. */
  defaultExpandedIds?: string[];
  /** Called with the new expanded ids when a branch toggles. */
  onExpandedChange?: (expandedIds: string[]) => void;
  /** Controlled selected node id. */
  selectedId?: string;
  /** Initially selected node id when uncontrolled. */
  defaultSelectedId?: string;
  /** Called with the node id when selection changes. */
  onSelect?: (id: string) => void;
}

export const TreeView = forwardRef<HTMLUListElement, TreeViewProps>(
  function TreeView(
    {
      items,
      expandedIds: expandedProp,
      defaultExpandedIds,
      onExpandedChange,
      selectedId: selectedProp,
      defaultSelectedId,
      onSelect,
      className,
      ...rest
    },
    ref
  ) {
    const treeId = useId();
    const innerRef = useRef<HTMLUListElement | null>(null);
    const visibleIds = useRef<string[]>([]);

    const isExpandedControlled = expandedProp !== undefined;
    const [uncontrolledExpanded, setUncontrolledExpanded] = useState<
      Set<string>
    >(() => new Set(defaultExpandedIds ?? []));
    const expanded = useMemo(
      () =>
        isExpandedControlled
          ? new Set(expandedProp)
          : uncontrolledExpanded,
      [isExpandedControlled, expandedProp, uncontrolledExpanded]
    );

    const isSelectControlled = selectedProp !== undefined;
    const [uncontrolledSelected, setUncontrolledSelected] = useState<
      string | undefined
    >(defaultSelectedId);
    const selected = isSelectControlled ? selectedProp : uncontrolledSelected;

    const toggleExpanded = useCallback(
      (id: string, open?: boolean) => {
        const next = new Set(expanded);
        const shouldOpen = open ?? !next.has(id);
        if (shouldOpen) next.add(id);
        else next.delete(id);
        if (!isExpandedControlled) setUncontrolledExpanded(next);
        onExpandedChange?.(Array.from(next));
      },
      [expanded, isExpandedControlled, onExpandedChange]
    );

    const select = useCallback(
      (id: string) => {
        if (!isSelectControlled) setUncontrolledSelected(id);
        onSelect?.(id);
      },
      [isSelectControlled, onSelect]
    );

    const focusNode = useCallback((id: string) => {
      const node = innerRef.current?.querySelector<HTMLElement>(
        `[data-tree-id="${CSS.escape(id)}"]`
      );
      node?.focus();
    }, []);

    // Flatten currently visible nodes (depth-first, respecting expansion) so
    // keyboard navigation and roving tabindex have a linear order.
    const flat = useMemo(() => {
      const out: FlatNode[] = [];
      const walk = (nodes: TreeNode[], level: number) => {
        for (const node of nodes) {
          const branch = isBranchNode(node);
          out.push({ node, level, isBranch: branch });
          if (branch && expanded.has(node.id) && node.children) {
            walk(node.children, level + 1);
          }
        }
      };
      walk(items, 1);
      return out;
    }, [items, expanded]);

    visibleIds.current = flat.map((f) => f.node.id);

    // First enabled visible node is the roving tabindex target by default.
    const firstFocusableId = useMemo(() => {
      const enabled = flat.find((f) => !f.node.disabled);
      return enabled?.node.id;
    }, [flat]);

    const ctx = useMemo<TreeViewContextValue>(
      () => ({
        expanded,
        selected,
        visibleIds,
        toggleExpanded,
        select,
        focusNode,
        treeId,
      }),
      [expanded, selected, toggleExpanded, select, focusNode, treeId]
    );

    const tabbableId = selected ?? firstFocusableId;

    return (
      <TreeViewContext.Provider value={ctx}>
        <ul
          ref={(node) => {
            innerRef.current = node;
            if (typeof ref === "function") ref(node);
            else if (ref) ref.current = node;
          }}
          role="tree"
          className={cn("nova-tree", className)}
          {...rest}
        >
          {items.map((node) => (
            <TreeViewItem
              key={node.id}
              node={node}
              level={1}
              tabbableId={tabbableId}
            />
          ))}
        </ul>
      </TreeViewContext.Provider>
    );
  }
);

interface TreeViewItemProps {
  node: TreeNode;
  level: number;
  tabbableId: string | undefined;
}

function TreeViewItem({ node, level, tabbableId }: TreeViewItemProps) {
  const {
    expanded,
    selected,
    visibleIds,
    toggleExpanded,
    select,
    focusNode,
  } = useTreeViewContext();

  const isBranch = isBranchNode(node);
  const isOpen = isBranch && expanded.has(node.id);
  const isSelected = selected === node.id;
  const disabled = !!node.disabled;

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      const ids = visibleIds.current;
      const idx = ids.indexOf(node.id);

      switch (event.key) {
        case "ArrowDown": {
          event.preventDefault();
          if (idx < ids.length - 1) focusNode(ids[idx + 1]);
          break;
        }
        case "ArrowUp": {
          event.preventDefault();
          if (idx > 0) focusNode(ids[idx - 1]);
          break;
        }
        case "ArrowRight": {
          event.preventDefault();
          if (disabled) break;
          if (isBranch && !isOpen) toggleExpanded(node.id, true);
          else if (isBranch && isOpen && idx < ids.length - 1)
            focusNode(ids[idx + 1]);
          break;
        }
        case "ArrowLeft": {
          event.preventDefault();
          if (disabled) break;
          if (isBranch && isOpen) toggleExpanded(node.id, false);
          else focusParent();
          break;
        }
        case "Home": {
          event.preventDefault();
          if (ids.length) focusNode(ids[0]);
          break;
        }
        case "End": {
          event.preventDefault();
          if (ids.length) focusNode(ids[ids.length - 1]);
          break;
        }
        case "Enter":
        case " ": {
          event.preventDefault();
          if (disabled) break;
          if (isBranch) toggleExpanded(node.id);
          select(node.id);
          break;
        }
        default:
          break;
      }
    },
    // focusParent defined below; stable closure inputs only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [node.id, isBranch, isOpen, disabled]
  );

  // Move focus to the closest ancestor treeitem in the visible order.
  function focusParent() {
    const ids = visibleIds.current;
    const idx = ids.indexOf(node.id);
    for (let i = idx - 1; i >= 0; i--) {
      const candidate = document.querySelector<HTMLElement>(
        `[data-tree-id="${CSS.escape(ids[i])}"]`
      );
      const candidateLevel = Number(candidate?.getAttribute("aria-level"));
      if (candidateLevel < level) {
        candidate?.focus();
        return;
      }
    }
  }

  const isTabbable = tabbableId === node.id;

  return (
    <li
      role="treeitem"
      aria-level={level}
      aria-expanded={isBranch ? isOpen : undefined}
      aria-selected={isSelected}
      aria-disabled={disabled || undefined}
      className={cn(
        "nova-tree__item",
        isBranch && "nova-tree__item--branch"
      )}
    >
      <div
        data-tree-id={node.id}
        tabIndex={isTabbable ? 0 : -1}
        className={cn(
          "nova-tree__row",
          "nova-focusable",
          isSelected && "nova-tree__row--selected",
          disabled && "nova-tree__row--disabled"
        )}
        style={{ ["--nova-tree-level" as string]: level }}
        onKeyDown={handleKeyDown}
        onClick={() => {
          if (disabled) return;
          if (isBranch) toggleExpanded(node.id);
          select(node.id);
        }}
      >
        <span className="nova-tree__indent" aria-hidden="true" />
        {isBranch ? (
          <span className="nova-tree__toggle" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path
                d="m9 6 6 6-6 6"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        ) : (
          <span className="nova-tree__toggle nova-tree__toggle--leaf" aria-hidden="true" />
        )}
        <span className="nova-tree__icon" aria-hidden="true">
          {node.icon ?? (isBranch ? <BranchIcon open={isOpen} /> : <LeafIcon />)}
        </span>
        <span className="nova-tree__label">{node.label}</span>
      </div>
      {isBranch && isOpen && node.children && node.children.length > 0 && (
        <ul role="group" className="nova-tree__group">
          {node.children.map((child) => (
            <TreeViewItem
              key={child.id}
              node={child}
              level={level + 1}
              tabbableId={tabbableId}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

function BranchIcon({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
      {open ? (
        <path
          d="M3 7h5l2 2h9a1 1 0 0 1 1 1v1H4l-1.5 7A1 1 0 0 1 3.5 19"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      ) : (
        <path
          d="M3 6a1 1 0 0 1 1-1h5l2 2h8a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Z"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}

function LeafIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path
        d="M14 3v4a1 1 0 0 0 1 1h4"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6 3h8l5 5v11a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}
