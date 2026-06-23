import { forwardRef, useState } from "react";
import { cn } from "../../../utils/cn";
import "./JsonViewer.css";

export interface JsonViewerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** Any JSON-serializable value to render as a tree. */
  data: unknown;
  /** Tree depth that is expanded by default. Defaults to `1`. */
  defaultExpandedDepth?: number;
  /** Maximum depth to render before stopping recursion. Defaults to `Infinity`. */
  depthLimit?: number;
  /** Label for the root node. Defaults to `"root"`. */
  rootLabel?: string;
}

type JsonKind =
  | "string"
  | "number"
  | "boolean"
  | "null"
  | "object"
  | "array";

const kindOf = (v: unknown): JsonKind => {
  if (v === null) return "null";
  if (Array.isArray(v)) return "array";
  const t = typeof v;
  if (t === "string") return "string";
  if (t === "number") return "number";
  if (t === "boolean") return "boolean";
  return "object";
};

const isContainer = (k: JsonKind): boolean => k === "object" || k === "array";

interface NodeProps {
  nodeKey: string | number | null;
  value: unknown;
  depth: number;
  defaultExpandedDepth: number;
  depthLimit: number;
  isLast: boolean;
}

const Node = ({
  nodeKey,
  value,
  depth,
  defaultExpandedDepth,
  depthLimit,
  isLast,
}: NodeProps) => {
  const kind = kindOf(value);
  const container = isContainer(kind);
  const [open, setOpen] = useState(depth < defaultExpandedDepth);

  const keyLabel =
    nodeKey === null ? null : (
      <span className="nova-json-viewer__key">
        {typeof nodeKey === "number" ? nodeKey : JSON.stringify(nodeKey)}
      </span>
    );

  if (!container) {
    return (
      <div className="nova-json-viewer__row" style={{ paddingLeft: indent(depth) }}>
        <span className="nova-json-viewer__leaf">
          {keyLabel}
          {keyLabel && <span className="nova-json-viewer__colon">:</span>}
          <span className={cn("nova-json-viewer__value", `nova-json-viewer__value--${kind}`)}>
            {renderPrimitive(value, kind)}
          </span>
          {!isLast && <span className="nova-json-viewer__comma">,</span>}
        </span>
      </div>
    );
  }

  const entries: [string | number, unknown][] =
    kind === "array"
      ? (value as unknown[]).map((v, i) => [i, v])
      : Object.entries(value as Record<string, unknown>);

  const count = entries.length;
  const openBrace = kind === "array" ? "[" : "{";
  const closeBrace = kind === "array" ? "]" : "}";
  const atLimit = depth >= depthLimit;

  return (
    <div className="nova-json-viewer__node">
      <div className="nova-json-viewer__row" style={{ paddingLeft: indent(depth) }}>
        <button
          type="button"
          className="nova-json-viewer__toggle"
          aria-expanded={open}
          onClick={() => !atLimit && setOpen((o) => !o)}
          disabled={count === 0 || atLimit}
        >
          <span className="nova-json-viewer__caret" aria-hidden="true">
            {count === 0 || atLimit ? "" : open ? "▾" : "▸"}
          </span>
          {keyLabel}
          {keyLabel && <span className="nova-json-viewer__colon">:</span>}
          <span className="nova-json-viewer__brace">{openBrace}</span>
          {(!open || atLimit) && (
            <>
              {count > 0 && (
                <span className="nova-json-viewer__count">
                  {count} {kind === "array" ? "items" : "keys"}
                </span>
              )}
              <span className="nova-json-viewer__brace">{closeBrace}</span>
              {!isLast && <span className="nova-json-viewer__comma">,</span>}
            </>
          )}
        </button>
      </div>

      {open && !atLimit && (
        <>
          {entries.map(([k, v], i) => (
            <Node
              key={k}
              nodeKey={kind === "array" ? (k as number) : (k as string)}
              value={v}
              depth={depth + 1}
              defaultExpandedDepth={defaultExpandedDepth}
              depthLimit={depthLimit}
              isLast={i === count - 1}
            />
          ))}
          <div className="nova-json-viewer__row" style={{ paddingLeft: indent(depth) }}>
            <span className="nova-json-viewer__brace">{closeBrace}</span>
            {!isLast && <span className="nova-json-viewer__comma">,</span>}
          </div>
        </>
      )}
    </div>
  );
};

const indent = (depth: number): string => `calc(${depth} * var(--nova-space-4))`;

const renderPrimitive = (value: unknown, kind: JsonKind): string => {
  if (kind === "null") return "null";
  if (kind === "string") return JSON.stringify(value);
  return String(value);
};

export const JsonViewer = forwardRef<HTMLDivElement, JsonViewerProps>(
  function JsonViewer(
    {
      data,
      defaultExpandedDepth = 1,
      depthLimit = Number.POSITIVE_INFINITY,
      rootLabel,
      className,
      ...rest
    },
    ref
  ) {
    return (
      <div
        ref={ref}
        className={cn("nova-json-viewer", className)}
        role="tree"
        {...rest}
      >
        <Node
          nodeKey={rootLabel ?? null}
          value={data}
          depth={0}
          defaultExpandedDepth={defaultExpandedDepth}
          depthLimit={depthLimit}
          isLast
        />
      </div>
    );
  }
);
