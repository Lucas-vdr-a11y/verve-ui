import { createElement, forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./Text.css";

export type TextElement = "p" | "span" | "div";
export type TextSize = "xs" | "sm" | "md" | "lg" | "xl";
export type TextWeight = "normal" | "medium" | "semibold" | "bold";
export type TextTone =
  | "default"
  | "muted"
  | "subtle"
  | "primary"
  | "danger"
  | "success";
export type TextAlign = "start" | "center" | "end" | "justify";

export interface TextProps extends React.HTMLAttributes<HTMLElement> {
  /** Element to render. Defaults to `"p"`. */
  as?: TextElement;
  /** Font size on the token scale. Defaults to `"md"`. */
  size?: TextSize;
  /** Font weight. Defaults to `"normal"`. */
  weight?: TextWeight;
  /** Semantic color tone. Defaults to `"default"`. */
  tone?: TextTone;
  /** Text alignment. */
  align?: TextAlign;
  /** Truncate to a single line with a trailing ellipsis. */
  truncate?: boolean;
  /**
   * Clamp to a fixed number of lines via `-webkit-line-clamp`. Ignored when
   * `truncate` is set (single-line truncation takes precedence).
   */
  lineClamp?: number;
}

export const Text = forwardRef<HTMLElement, TextProps>(function Text(
  {
    as = "p",
    size = "md",
    weight = "normal",
    tone = "default",
    align,
    truncate = false,
    lineClamp,
    className,
    style,
    children,
    ...rest
  },
  ref
) {
  const clamp = !truncate && typeof lineClamp === "number" && lineClamp > 0;

  return createElement(
    as,
    {
      ref,
      className: cn(
        "nova-text",
        `nova-text--${size}`,
        `nova-text--${weight}`,
        `nova-text--${tone}`,
        align && `nova-text--align-${align}`,
        truncate && "nova-text--truncate",
        clamp && "nova-text--clamp",
        className
      ),
      style: clamp
        ? ({ ["--nova-text-clamp" as string]: lineClamp, ...style } as React.CSSProperties)
        : style,
      ...rest,
    },
    children
  );
});
