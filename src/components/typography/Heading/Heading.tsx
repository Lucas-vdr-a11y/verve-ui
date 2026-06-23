import { createElement, forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./Heading.css";

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
export type HeadingSize =
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "2xl"
  | "3xl"
  | "4xl"
  | "5xl";
export type HeadingWeight = "normal" | "medium" | "semibold" | "bold";

export interface HeadingProps
  extends React.HTMLAttributes<HTMLHeadingElement> {
  /** Semantic heading level; renders the matching `h1`–`h6`. Defaults to `2`. */
  level?: HeadingLevel;
  /**
   * Visual size override on the token scale. When omitted the visual size is
   * derived from `level` so the default markup looks like a sensible hierarchy.
   */
  size?: HeadingSize;
  /** Font weight. Defaults to `"semibold"`. */
  weight?: HeadingWeight;
  /** Truncate to a single line with a trailing ellipsis. */
  truncate?: boolean;
}

/** Sensible visual size per semantic level when `size` is not supplied. */
const LEVEL_SIZE: Record<HeadingLevel, HeadingSize> = {
  1: "4xl",
  2: "3xl",
  3: "2xl",
  4: "xl",
  5: "lg",
  6: "md",
};

export const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(
  function Heading(
    {
      level = 2,
      size,
      weight = "semibold",
      truncate = false,
      className,
      children,
      ...rest
    },
    ref
  ) {
    const resolvedSize = size ?? LEVEL_SIZE[level];

    return createElement(
      `h${level}`,
      {
        ref,
        className: cn(
          "nova-heading",
          `nova-heading--${resolvedSize}`,
          `nova-heading--${weight}`,
          truncate && "nova-heading--truncate",
          className
        ),
        ...rest,
      },
      children
    );
  }
);
