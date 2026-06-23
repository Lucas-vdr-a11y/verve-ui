import { forwardRef, useMemo, useState, useCallback } from "react";
import { cn } from "../../../utils/cn";
import type { ChartTone } from "../../charts/utils";
import { toneColor } from "../../charts/utils";
import "./OrgChart.css";

export interface OrgChartNode {
  /** Stable unique id. */
  id: string;
  /** Primary label (name / title). */
  label: string;
  /** Optional secondary line (role / count). */
  subtitle?: string;
  /** Optional tone accent for the card border. */
  tone?: ChartTone;
  /** Child nodes. */
  children?: OrgChartNode[];
}

export interface OrgChartProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onClick"> {
  /** Root node of the hierarchy. */
  data: OrgChartNode;
  /** Card width in px. Defaults to `160`. */
  nodeWidth?: number;
  /** Card height in px. Defaults to `64`. */
  nodeHeight?: number;
  /** Horizontal gap between sibling subtrees in px. Defaults to `24`. */
  hGap?: number;
  /** Vertical gap between levels in px. Defaults to `48`. */
  vGap?: number;
  /** Allow collapsing nodes with children. Defaults to `true`. */
  collapsible?: boolean;
  /** Ids collapsed initially. */
  defaultCollapsed?: string[];
  /** Fired when a node card is activated. */
  onNodeClick?: (node: OrgChartNode) => void;
}

interface Laid {
  node: OrgChartNode;
  x: number;
  y: number;
  width: number;
  depth: number;
  parent?: Laid;
  hasChildren: boolean;
  collapsed: boolean;
}

/**
 * Pure subtree-width layout: each leaf occupies one slot; a parent is centered
 * over its visible children. No DOM measurement — SSR-safe.
 */
function layout(
  root: OrgChartNode,
  collapsedSet: Set<string>,
  nodeWidth: number,
  nodeHeight: number,
  hGap: number,
  vGap: number
): { nodes: Laid[]; width: number; height: number } {
  const slot = nodeWidth + hGap;
  const level = nodeHeight + vGap;
  const nodes: Laid[] = [];
  let cursor = 0;
  let maxDepth = 0;

  const walk = (node: OrgChartNode, depth: number, parent?: Laid): Laid => {
    maxDepth = Math.max(maxDepth, depth);
    const collapsed = collapsedSet.has(node.id);
    const kids = !collapsed ? node.children ?? [] : [];
    const laid: Laid = {
      node,
      x: 0,
      y: depth * level,
      width: nodeWidth,
      depth,
      parent,
      hasChildren: (node.children?.length ?? 0) > 0,
      collapsed,
    };

    if (kids.length === 0) {
      laid.x = cursor;
      cursor += slot;
    } else {
      const childLaid = kids.map((c) => walk(c, depth + 1, laid));
      const first = childLaid[0].x;
      const last = childLaid[childLaid.length - 1].x;
      laid.x = (first + last) / 2;
    }
    nodes.push(laid);
    return laid;
  };

  walk(root, 0);

  const width = Math.max(slot, cursor) - hGap + nodeWidth; // include card width at edges
  const height = (maxDepth + 1) * level - vGap;
  return { nodes, width: Math.max(width, nodeWidth), height };
}

/** Smooth elbow connector from a parent's bottom edge to a child's top edge. */
function connectorPath(
  px: number,
  py: number,
  cx: number,
  cy: number
): string {
  const midY = (py + cy) / 2;
  return `M ${px} ${py} C ${px} ${midY} ${cx} ${midY} ${cx} ${cy}`;
}

export const OrgChart = forwardRef<HTMLDivElement, OrgChartProps>(
  function OrgChart(
    {
      data,
      nodeWidth = 160,
      nodeHeight = 64,
      hGap = 24,
      vGap = 48,
      collapsible = true,
      defaultCollapsed,
      onNodeClick,
      className,
      ...rest
    },
    ref
  ) {
    const [collapsed, setCollapsed] = useState<Set<string>>(
      () => new Set(defaultCollapsed ?? [])
    );

    const toggle = useCallback((id: string) => {
      setCollapsed((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    }, []);

    const { nodes, width, height } = useMemo(
      () => layout(data, collapsed, nodeWidth, nodeHeight, hGap, vGap),
      [data, collapsed, nodeWidth, nodeHeight, hGap, vGap]
    );

    const byId = useMemo(() => {
      const m = new Map<string, Laid>();
      for (const n of nodes) m.set(n.node.id, n);
      return m;
    }, [nodes]);

    const cardCenterX = (n: Laid) => n.x + nodeWidth / 2;

    return (
      <div
        ref={ref}
        className={cn("nova-org-chart", className)}
        role="tree"
        {...rest}
      >
        <div
          className="nova-org-chart__canvas"
          style={{ width, height }}
        >
          <svg
            className="nova-org-chart__edges"
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            aria-hidden="true"
            focusable="false"
          >
            {nodes.map((n) => {
              if (!n.parent) return null;
              const p = byId.get(n.parent.node.id);
              if (!p) return null;
              return (
                <path
                  key={`edge-${n.node.id}`}
                  className="nova-org-chart__edge"
                  d={connectorPath(
                    cardCenterX(p),
                    p.y + nodeHeight,
                    cardCenterX(n),
                    n.y
                  )}
                  fill="none"
                />
              );
            })}
          </svg>

          {nodes.map((n) => {
            const interactive = !!onNodeClick;
            const accent = n.node.tone
              ? toneColor(n.node.tone, "var(--nova-primary)")
              : undefined;
            return (
              <div
                key={n.node.id}
                className={cn(
                  "nova-org-chart__node",
                  interactive && "nova-org-chart__node--interactive"
                )}
                role="treeitem"
                aria-expanded={
                  n.hasChildren ? !n.collapsed : undefined
                }
                aria-label={n.node.label}
                tabIndex={interactive ? 0 : undefined}
                style={{
                  left: n.x,
                  top: n.y,
                  width: nodeWidth,
                  height: nodeHeight,
                  ...(accent
                    ? ({ "--nova-org-accent": accent } as React.CSSProperties)
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
                <span className="nova-org-chart__label">{n.node.label}</span>
                {n.node.subtitle && (
                  <span className="nova-org-chart__subtitle">
                    {n.node.subtitle}
                  </span>
                )}
                {collapsible && n.hasChildren && (
                  <button
                    type="button"
                    className="nova-org-chart__toggle"
                    aria-label={
                      n.collapsed
                        ? `Expand ${n.node.label}`
                        : `Collapse ${n.node.label}`
                    }
                    aria-expanded={!n.collapsed}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggle(n.node.id);
                    }}
                  >
                    {n.collapsed ? "+" : "−"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
);
