import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./Affix.css";

export type AffixPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right"
  | "left-center"
  | "right-center";

export interface AffixProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Which viewport edge/corner to pin to. @default "bottom-right" */
  position?: AffixPosition;
  /**
   * Distance from the pinned edges. A number is treated as `px`; a string is
   * used as-is (any CSS length). @default var(--nova-space-4)
   */
  offset?: number | string;
  /** Stacking order. @default var(--nova-z-sticky) */
  zIndex?: number;
}

function toLength(value: number | string | undefined): string | undefined {
  if (value === undefined) return undefined;
  return typeof value === "number" ? `${value}px` : value;
}

/**
 * Affix — pins content to a viewport edge or corner with a configurable offset
 * (a floating helper / back-to-top / chat launcher). Uses `position: fixed`, so
 * it stays put while the page scrolls. SSR-safe: it only emits CSS positioning,
 * no window/document access.
 */
export const Affix = forwardRef<HTMLDivElement, AffixProps>(function Affix(
  { position = "bottom-right", offset, zIndex, className, style, ...rest },
  ref,
) {
  const off = toLength(offset) ?? "var(--nova-space-4)";

  return (
    <div
      ref={ref}
      className={cn("nova-affix", `nova-affix--${position}`, className)}
      style={
        {
          "--nova-affix-offset": off,
          zIndex: zIndex ?? "var(--nova-z-sticky)",
          ...style,
        } as React.CSSProperties
      }
      {...rest}
    />
  );
});
