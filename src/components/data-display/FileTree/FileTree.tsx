import { forwardRef, useCallback, useMemo, useState } from "react";
import { cn } from "../../../utils/cn";
import "./FileTree.css";

export interface FileTreeNode {
  /** Unique id (also used as the active key). */
  id: string;
  /** Display name (e.g. "index.ts", "components"). */
  name: string;
  /** Child nodes — presence (even empty array) marks this as a folder. */
  children?: FileTreeNode[];
  /** Force a folder/file kind regardless of `children`. */
  type?: "file" | "folder";
}

export interface FileTreeProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect"> {
  /** Root-level nodes. */
  nodes: FileTreeNode[];
  /** Currently active file id (highlighted). */
  activeId?: string;
  /** Folder ids that start expanded (uncontrolled). */
  defaultExpandedIds?: string[];
  /** Fired when a node is selected (file or folder). */
  onSelect?: (node: FileTreeNode) => void;
  /** Compact row height. */
  dense?: boolean;
}

function isFolder(node: FileTreeNode): boolean {
  return node.type === "folder" || Array.isArray(node.children);
}

const ChevronIcon = ({ open }: { open: boolean }) => (
  <svg
    className={cn(
      "nova-file-tree__chevron",
      open && "nova-file-tree__chevron--open"
    )}
    viewBox="0 0 16 16"
    width="1em"
    height="1em"
    aria-hidden="true"
    focusable="false"
  >
    <path
      d="M6 4l4 4-4 4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const FolderIcon = ({ open }: { open: boolean }) => (
  <svg
    className="nova-file-tree__icon nova-file-tree__icon--folder"
    viewBox="0 0 16 16"
    width="1em"
    height="1em"
    aria-hidden="true"
    focusable="false"
  >
    {open ? (
      <path
        d="M1.5 4.5A1 1 0 0 1 2.5 3.5h3l1.2 1.4h6.8a1 1 0 0 1 1 1.1l-.6 5a1 1 0 0 1-1 .9H2.6a1 1 0 0 1-1-.9l-.1-7Z"
        fill="currentColor"
        opacity="0.85"
      />
    ) : (
      <path
        d="M1.5 4a1 1 0 0 1 1-1h3l1.3 1.5h6.7a1 1 0 0 1 1 1V12a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1V4Z"
        fill="currentColor"
        opacity="0.85"
      />
    )}
  </svg>
);

const FileIcon = () => (
  <svg
    className="nova-file-tree__icon nova-file-tree__icon--file"
    viewBox="0 0 16 16"
    width="1em"
    height="1em"
    aria-hidden="true"
    focusable="false"
  >
    <path
      d="M4 1.75A.75.75 0 0 1 4.75 1H9l3.5 3.5v9.75a.75.75 0 0 1-.75.75H4.75A.75.75 0 0 1 4 14.25V1.75Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
    />
    <path
      d="M9 1v3.25a.75.75 0 0 0 .75.75H12.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinejoin="round"
    />
  </svg>
);

/** Coarse file-type bucket from a filename extension, drives icon tint. */
function extKind(name: string): string {
  const ext = name.includes(".")
    ? name.slice(name.lastIndexOf(".") + 1).toLowerCase()
    : "";
  if (["ts", "tsx", "js", "jsx", "mjs", "cjs"].includes(ext)) return "code";
  if (["css", "scss", "sass", "less"].includes(ext)) return "style";
  if (["json", "yml", "yaml", "toml", "lock"].includes(ext)) return "data";
  if (["md", "mdx", "txt"].includes(ext)) return "doc";
  if (["png", "jpg", "jpeg", "gif", "svg", "webp", "ico"].includes(ext))
    return "image";
  return "default";
}

interface TreeItemProps {
  node: FileTreeNode;
  depth: number;
  activeId?: string;
  expanded: Set<string>;
  onToggle: (id: string) => void;
  onSelect?: (node: FileTreeNode) => void;
}

function TreeItem({
  node,
  depth,
  activeId,
  expanded,
  onToggle,
  onSelect,
}: TreeItemProps) {
  const folder = isFolder(node);
  const open = expanded.has(node.id);
  const active = activeId === node.id;

  const handleClick = () => {
    if (folder) onToggle(node.id);
    onSelect?.(node);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    } else if (folder && e.key === "ArrowRight" && !open) {
      e.preventDefault();
      onToggle(node.id);
    } else if (folder && e.key === "ArrowLeft" && open) {
      e.preventDefault();
      onToggle(node.id);
    }
  };

  return (
    <li
      className="nova-file-tree__item"
      role="treeitem"
      aria-expanded={folder ? open : undefined}
      aria-selected={active || undefined}
    >
      <div
        className={cn(
          "nova-file-tree__row",
          active && "nova-file-tree__row--active",
          "nova-focusable"
        )}
        style={
          { "--nova-file-tree-depth": depth } as React.CSSProperties
        }
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
      >
        <span className="nova-file-tree__twist" aria-hidden="true">
          {folder ? <ChevronIcon open={open} /> : null}
        </span>
        {folder ? (
          <FolderIcon open={open} />
        ) : (
          <span
            className={cn(
              "nova-file-tree__file-icon",
              `nova-file-tree__file-icon--${extKind(node.name)}`
            )}
          >
            <FileIcon />
          </span>
        )}
        <span className="nova-file-tree__name">{node.name}</span>
      </div>

      {folder && open && node.children && node.children.length > 0 && (
        <ul className="nova-file-tree__group" role="group">
          {node.children.map((child) => (
            <TreeItem
              key={child.id}
              node={child}
              depth={depth + 1}
              activeId={activeId}
              expanded={expanded}
              onToggle={onToggle}
              onSelect={onSelect}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

/**
 * FileTree — a read-only, file-explorer-flavored tree with folder/file icons,
 * expand/collapse, active-file highlight, and `onSelect`. Distinct from a
 * generic disclosure TreeView.
 */
export const FileTree = forwardRef<HTMLDivElement, FileTreeProps>(
  function FileTree(
    {
      nodes,
      activeId,
      defaultExpandedIds,
      onSelect,
      dense = false,
      className,
      ...rest
    },
    ref
  ) {
    const [expanded, setExpanded] = useState<Set<string>>(
      () => new Set(defaultExpandedIds ?? [])
    );

    const onToggle = useCallback((id: string) => {
      setExpanded((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    }, []);

    const items = useMemo(
      () =>
        nodes.map((node) => (
          <TreeItem
            key={node.id}
            node={node}
            depth={0}
            activeId={activeId}
            expanded={expanded}
            onToggle={onToggle}
            onSelect={onSelect}
          />
        )),
      [nodes, activeId, expanded, onToggle, onSelect]
    );

    return (
      <div
        ref={ref}
        className={cn(
          "nova-file-tree",
          dense && "nova-file-tree--dense",
          className
        )}
        {...rest}
      >
        <ul className="nova-file-tree__root" role="tree">
          {items}
        </ul>
      </div>
    );
  }
);
