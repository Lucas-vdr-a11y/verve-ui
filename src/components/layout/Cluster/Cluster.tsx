import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./Cluster.css";

export type ClusterGap = "none" | "xs" | "sm" | "md" | "lg" | "xl";
export type ClusterAlign = "start" | "center" | "end" | "stretch" | "baseline";
export type ClusterJustify =
  | "start"
  | "center"
  | "end"
  | "between"
  | "around";

export interface ClusterProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Space between items (both axes when wrapping). @default "sm" */
  gap?: ClusterGap;
  /** Cross-axis alignment. @default "center" */
  align?: ClusterAlign;
  /** Main-axis distribution. @default "start" */
  justify?: ClusterJustify;
  /** Whether items wrap onto multiple rows. @default true */
  wrap?: boolean;
  /** Render as a different element (e.g. "ul", "nav"). @default "div" */
  as?: React.ElementType;
}

const GAP_TOKENS: Record<ClusterGap, string> = {
  none: "var(--nova-space-0)",
  xs: "var(--nova-space-1)",
  sm: "var(--nova-space-2)",
  md: "var(--nova-space-3)",
  lg: "var(--nova-space-4)",
  xl: "var(--nova-space-6)",
};

/**
 * Cluster — a wrapping inline group with a consistent gap and alignment.
 * The go-to primitive for tag lists, button rows, metadata, breadcrumb-like
 * groups — anything that should flow inline and wrap gracefully.
 */
export const Cluster = forwardRef<HTMLDivElement, ClusterProps>(
  function Cluster(
    {
      gap = "sm",
      align = "center",
      justify = "start",
      wrap = true,
      as,
      className,
      style,
      ...rest
    },
    ref,
  ) {
    const Component = (as ?? "div") as React.ElementType;
    return (
      <Component
        ref={ref}
        className={cn(
          "nova-cluster",
          `nova-cluster--align-${align}`,
          `nova-cluster--justify-${justify}`,
          !wrap && "nova-cluster--nowrap",
          className,
        )}
        style={
          {
            "--nova-cluster-gap": GAP_TOKENS[gap],
            ...style,
          } as React.CSSProperties
        }
        {...rest}
      />
    );
  },
);
