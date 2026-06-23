import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./Flex.css";

/** Spacing scale keys that map onto the `--nova-space-*` tokens. */
export type FlexGap = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12;

export type FlexDirection = "row" | "row-reverse" | "column" | "column-reverse";
export type FlexAlign = "start" | "center" | "end" | "stretch" | "baseline";
export type FlexJustify =
  | "start"
  | "center"
  | "end"
  | "between"
  | "around"
  | "evenly";
export type FlexWrap = "nowrap" | "wrap" | "wrap-reverse";

export interface FlexProps extends React.HTMLAttributes<HTMLDivElement> {
  /** `flex-direction`. @default "row" */
  direction?: FlexDirection;
  /** Cross-axis alignment (`align-items`). */
  align?: FlexAlign;
  /** Main-axis distribution (`justify-content`). */
  justify?: FlexJustify;
  /** Wrapping behaviour (`flex-wrap`). @default "nowrap" */
  wrap?: FlexWrap;
  /** Gap between children, from the `--nova-space-*` scale. @default 0 */
  gap?: FlexGap;
  /** Row gap override, from the `--nova-space-*` scale. */
  rowGap?: FlexGap;
  /** Column gap override, from the `--nova-space-*` scale. */
  columnGap?: FlexGap;
  /** Sets `display: inline-flex`. @default false */
  inline?: boolean;
  /** `flex-grow` on this container. */
  grow?: number;
  /** `flex-shrink` on this container. */
  shrink?: number;
  /** `flex-basis` (any CSS length). */
  basis?: string;
}

const ALIGN: Record<FlexAlign, string> = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  stretch: "stretch",
  baseline: "baseline",
};

const JUSTIFY: Record<FlexJustify, string> = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  between: "space-between",
  around: "space-around",
  evenly: "space-evenly",
};

/**
 * Flex — a general-purpose flexbox container. More flexible than `Stack`:
 * exposes every flex axis plus grow/shrink/basis helpers. Reach for `Stack`
 * for simple one-direction spacing; reach for `Flex` when you need full control.
 */
export const Flex = forwardRef<HTMLDivElement, FlexProps>(function Flex(
  {
    direction = "row",
    align,
    justify,
    wrap = "nowrap",
    gap = 0,
    rowGap,
    columnGap,
    inline = false,
    grow,
    shrink,
    basis,
    className,
    style,
    ...rest
  },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn("nova-flex", inline && "nova-flex--inline", className)}
      style={
        {
          "--nova-flex-gap": `var(--nova-space-${gap})`,
          flexDirection: direction,
          flexWrap: wrap,
          ...(align ? { alignItems: ALIGN[align] } : null),
          ...(justify ? { justifyContent: JUSTIFY[justify] } : null),
          ...(rowGap !== undefined
            ? { rowGap: `var(--nova-space-${rowGap})` }
            : null),
          ...(columnGap !== undefined
            ? { columnGap: `var(--nova-space-${columnGap})` }
            : null),
          ...(grow !== undefined ? { flexGrow: grow } : null),
          ...(shrink !== undefined ? { flexShrink: shrink } : null),
          ...(basis !== undefined ? { flexBasis: basis } : null),
          ...style,
        } as React.CSSProperties
      }
      {...rest}
    />
  );
});
