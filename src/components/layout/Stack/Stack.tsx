import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./Stack.css";

/** Spacing scale keys that map onto the `--nova-space-*` tokens. */
export type StackGap = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12;

export type StackAlign = "start" | "center" | "end" | "stretch" | "baseline";
export type StackJustify =
  | "start"
  | "center"
  | "end"
  | "between"
  | "around"
  | "evenly";

export interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Main-axis direction. @default "vertical" */
  direction?: "vertical" | "horizontal";
  /** Gap between children, from the `--nova-space-*` scale. @default 4 */
  gap?: StackGap;
  /** Cross-axis alignment (`align-items`). */
  align?: StackAlign;
  /** Main-axis distribution (`justify-content`). */
  justify?: StackJustify;
  /** Allow items to wrap onto multiple lines. @default false */
  wrap?: boolean;
}

const ALIGN: Record<StackAlign, string> = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  stretch: "stretch",
  baseline: "baseline",
};

const JUSTIFY: Record<StackJustify, string> = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  between: "space-between",
  around: "space-around",
  evenly: "space-evenly",
};

/**
 * Stack — a one-dimensional flex container. Lays children out in a column
 * (default) or row with a token-based `gap`. Use it for the vast majority of
 * spacing needs instead of margins.
 */
export const Stack = forwardRef<HTMLDivElement, StackProps>(function Stack(
  {
    direction = "vertical",
    gap = 4,
    align,
    justify,
    wrap = false,
    className,
    style,
    ...rest
  },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(
        "nova-stack",
        `nova-stack--${direction}`,
        wrap && "nova-stack--wrap",
        className,
      )}
      style={{
        "--nova-stack-gap": `var(--nova-space-${gap})`,
        ...(align ? { alignItems: ALIGN[align] } : null),
        ...(justify ? { justifyContent: JUSTIFY[justify] } : null),
        ...style,
      } as React.CSSProperties}
      {...rest}
    />
  );
});
