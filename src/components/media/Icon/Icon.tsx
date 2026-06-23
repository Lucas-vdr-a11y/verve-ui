import { forwardRef } from "react";
import type { ComponentType, SVGProps } from "react";
import { cn } from "../../../utils/cn";
import "./Icon.css";

export type IconSize = "xs" | "sm" | "md" | "lg" | "xl";

export interface IconProps
  extends Omit<React.SVGAttributes<SVGSVGElement>, "children"> {
  /** Size on the xs/sm/md/lg/xl scale (mapped to `em`). Defaults to `"md"`. */
  size?: IconSize;
  /**
   * An accessible label. When provided the icon becomes `role="img"` with this
   * label; otherwise it is `aria-hidden` (decorative).
   */
  label?: string;
  /**
   * Path data for a single `<path>`. Convenient for simple icons. Ignored when
   * `as` or `children` are provided.
   */
  path?: string;
  /**
   * A component that renders the icon's inner SVG content (or a full svg). It
   * receives no required props; rendered inside the wrapper `<svg>`.
   */
  as?: ComponentType<SVGProps<SVGSVGElement>>;
  /** Raw inline SVG content (e.g. `<path .../>`). Takes precedence over `path`. */
  children?: React.ReactNode;
}

const SIZE_EM: Record<IconSize, string> = {
  xs: "0.75em",
  sm: "1em",
  md: "1.25em",
  lg: "1.5em",
  xl: "2em",
};

/**
 * Inline SVG wrapper. Color inherits `currentColor`. Decorative by default;
 * pass `label` for a meaningful, announced icon.
 */
export const Icon = forwardRef<SVGSVGElement, IconProps>(function Icon(
  { size = "md", label, path, as: As, children, className, style, ...rest },
  ref
) {
  const dimension = SIZE_EM[size];
  const a11y = label
    ? { role: "img" as const, "aria-label": label }
    : { "aria-hidden": true };

  let content: React.ReactNode = children;
  if (content == null && As) content = <As />;
  if (content == null && path) content = <path d={path} fill="currentColor" />;

  return (
    <svg
      ref={ref}
      className={cn("nova-icon", `nova-icon--${size}`, className)}
      viewBox="0 0 24 24"
      width={dimension}
      height={dimension}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      focusable="false"
      style={style}
      {...a11y}
      {...rest}
    >
      {content}
    </svg>
  );
});
