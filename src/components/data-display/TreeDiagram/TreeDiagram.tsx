import { forwardRef, useMemo } from "react";
import { cn } from "../../../utils/cn";
import type { ChartTone } from "../../charts/utils";
import { toneColor } from "../../charts/utils";
import "./TreeDiagram.css";

export interface TreeDiagramNode {
  /** Stable unique id. */
  id: string;
  /** Node label. */
  label: string;
  /** Optional tone accent. */
  tone?: ChartTone;
  /** Children (nested form). */
  children?: TreeDiagramNode[];
}

export type TreeDiagramOrientation = "horizontal" | "vertical";

export interface TreeDiagramProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onClick"> {
  /** Root node of the hierarchy. */
  data: TreeDiagramNode;
  /** `"horizontal"` (left→right, default) or `"vertical"` (top→down). */
  orientation?: TreeDiagramOrientation;
  /** Node box width in px. Defaults to `140`. */
  nodeWidth?: number;
  /** Node box height in px. Defaults to `40`. */
  nodeHeight?: number;
  /** Gap between siblings (cross-axis) in px. Defaults to `16`. */
  siblingGap?: number;
  /** Gap between levels (main axis) in px. Defaults to `64`. */
  levelGap?: number;
  /** Fired when a node is activated. */
  onNodeClick?: (node: TreeDiagramNode) => void;
}

interface Placed {
  node: TreeDiagramNode;
  /** main-axis index (depth). */
  depth: number;
  /** cross-axis position (px center). */
  cross: number;
  parent?: Placed;
}

/**
 * Tidy layout: leaves are packed along the cross axis; parents center over
 * their children. `depth` drives the main axis. Pure — no DOM measuring.
 */
function layoutTree(
  root: TreeDiagramNode,
  crossSize: number,
  crossGap: number
): { placed: Placed[]; maxDepth: number; crossExtent: number } {
  const placed: Placed[] = [];
  const slot = crossSize + crossGap;
  let cursor = 0;
  let maxDepth = 0;

  const walk = (node: TreeDiagramNode, depth: number, parent?: Placed): Placed => {
    maxDepth = Math.max(maxDepth, depth);
    const p: Placed = { node, depth, cross: 0, parent };
    const kids = node.children ?? [];
    if (kids.length === 0) {
      p.cross = cursor + crossSize / 2;
      cursor += slot;
    } else {
      const childPlaced = kids.map((c) => walk(c, depth + 1, p));
      p.cross =
        (childPlaced[0].cross + childPlaced[childPlaced.length - 1].cross) / 2;
    }
    placed.push(p);
    return p;
  };

  walk(root, 0);
  const crossExtent = Math.max(cursor - crossGap, crossSize);
  return { placed, maxDepth, crossExtent };
}

export const TreeDiagram = forwardRef<HTMLDivElement, TreeDiagramProps>(
  function TreeDiagram(
    {
      data,
      orientation = "horizontal",
      nodeWidth = 140,
      nodeHeight = 40,
      siblingGap = 16,
      levelGap = 64,
      onNodeClick,
      className,
      ...rest
    },
    ref
  ) {
    const horizontal = orientation === "horizontal";

    const model = useMemo(() => {
      // cross axis size = the dimension perpendicular to flow
      const crossSize = horizontal ? nodeHeight : nodeWidth;
      const crossGap = siblingGap;
      const { placed, maxDepth, crossExtent } = layoutTree(
        data,
        crossSize,
        crossGap
      );

      const mainSize = horizontal ? nodeWidth : nodeHeight;
      const mainStep = mainSize + levelGap;

      // resolve absolute x/y per node
      const nodes = placed.map((p) => {
        const mainPos = p.depth * mainStep;
        // cross is a center; convert to top-left for box
        const x = horizontal ? mainPos : p.cross - nodeWidth / 2;
        const y = horizontal ? p.cross - nodeHeight / 2 : mainPos;
        return { ...p, x, y };
      });

      const width = horizontal
        ? (maxDepth + 1) * mainStep - levelGap
        : crossExtent;
      const height = horizontal
        ? crossExtent
        : (maxDepth + 1) * mainStep - levelGap;

      return { nodes, width, height };
    }, [data, horizontal, nodeWidth, nodeHeight, siblingGap, levelGap]);

    const byId = useMemo(() => {
      const m = new Map<string, (typeof model.nodes)[number]>();
      for (const n of model.nodes) m.set(n.node.id, n);
      return m;
    }, [model]);

    // curved link from parent edge to child edge
    const linkPath = (
      parent: (typeof model.nodes)[number],
      child: (typeof model.nodes)[number]
    ): string => {
      if (horizontal) {
        const x1 = parent.x + nodeWidth;
        const y1 = parent.y + nodeHeight / 2;
        const x2 = child.x;
        const y2 = child.y + nodeHeight / 2;
        const mx = (x1 + x2) / 2;
        return `M ${x1} ${y1} C ${mx} ${y1} ${mx} ${y2} ${x2} ${y2}`;
      }
      const x1 = parent.x + nodeWidth / 2;
      const y1 = parent.y + nodeHeight;
      const x2 = child.x + nodeWidth / 2;
      const y2 = child.y;
      const my = (y1 + y2) / 2;
      return `M ${x1} ${y1} C ${x1} ${my} ${x2} ${my} ${x2} ${y2}`;
    };

    return (
      <div
        ref={ref}
        className={cn(
          "nova-tree-diagram",
          `nova-tree-diagram--${orientation}`,
          className
        )}
        role="group"
        aria-label="Tree diagram"
        {...rest}
      >
        <div
          className="nova-tree-diagram__canvas"
          style={{ width: model.width, height: model.height }}
        >
          <svg
            className="nova-tree-diagram__links"
            width={model.width}
            height={model.height}
            viewBox={`0 0 ${model.width} ${model.height}`}
            aria-hidden="true"
            focusable="false"
          >
            {model.nodes.map((n) => {
              if (!n.parent) return null;
              const p = byId.get(n.parent.node.id);
              if (!p) return null;
              return (
                <path
                  key={`link-${n.node.id}`}
                  className="nova-tree-diagram__link"
                  d={linkPath(p, n)}
                  fill="none"
                />
              );
            })}
          </svg>

          {model.nodes.map((n) => {
            const interactive = !!onNodeClick;
            const accent = n.node.tone
              ? toneColor(n.node.tone, "var(--nova-primary)")
              : undefined;
            return (
              <div
                key={n.node.id}
                className={cn(
                  "nova-tree-diagram__node",
                  interactive && "nova-tree-diagram__node--interactive"
                )}
                role={interactive ? "button" : undefined}
                tabIndex={interactive ? 0 : undefined}
                aria-label={n.node.label}
                style={{
                  left: n.x,
                  top: n.y,
                  width: nodeWidth,
                  height: nodeHeight,
                  ...(accent
                    ? ({ "--nova-tree-accent": accent } as React.CSSProperties)
                    : {}),
                }}
                onClick={
                  interactive ? () => onNodeClick?.(n.node) : undefined
                }
                onKeyDown={
                  interactive
                    ? (e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          onNodeClick?.(n.node);
                        }
                      }
                    : undefined
                }
              >
                <span className="nova-tree-diagram__label">{n.node.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
);
