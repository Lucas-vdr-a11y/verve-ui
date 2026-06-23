import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./Split.css";

/** Spacing scale keys that map onto the `--nova-space-*` tokens. */
export type SplitGap = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12;

export interface SplitProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Lay the two panes out side-by-side or stacked. @default "horizontal" */
  direction?: "horizontal" | "vertical";
  /**
   * Size of the first pane relative to the whole, as a fraction `0..1`. The
   * second pane takes the remainder. @default 0.5
   */
  ratio?: number;
  /** Gap between the two panes, from the `--nova-space-*` scale. @default 4 */
  gap?: SplitGap;
  /** First pane content. */
  start: React.ReactNode;
  /** Second pane content. */
  end: React.ReactNode;
}

/**
 * Split — a clean static two-pane split with a configurable `ratio` and `gap`.
 * Not a draggable resizer; just a predictable layout primitive. Panes stack
 * when `direction="vertical"`.
 */
export const Split = forwardRef<HTMLDivElement, SplitProps>(function Split(
  {
    direction = "horizontal",
    ratio = 0.5,
    gap = 4,
    start,
    end,
    className,
    style,
    ...rest
  },
  ref,
) {
  const clamped = Math.min(Math.max(ratio, 0), 1);

  return (
    <div
      ref={ref}
      className={cn("nova-split", `nova-split--${direction}`, className)}
      style={
        {
          "--nova-split-gap": `var(--nova-space-${gap})`,
          "--nova-split-start": clamped,
          "--nova-split-end": 1 - clamped,
          ...style,
        } as React.CSSProperties
      }
      {...rest}
    >
      <div className="nova-split__pane nova-split__pane--start">{start}</div>
      <div className="nova-split__pane nova-split__pane--end">{end}</div>
    </div>
  );
});
