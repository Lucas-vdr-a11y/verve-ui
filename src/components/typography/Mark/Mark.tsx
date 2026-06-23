import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./Mark.css";

export type MarkTone =
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral";

export interface MarkProps extends React.HTMLAttributes<HTMLElement> {
  /** Background tint tone. Defaults to `"warning"`. */
  tone?: MarkTone;
}

/**
 * Mark / Highlight — highlighted inline text with a token-based background
 * tint per tone. Renders a semantic `<mark>` element.
 */
export const Mark = forwardRef<HTMLElement, MarkProps>(function Mark(
  { tone = "warning", className, ...rest },
  ref
) {
  return (
    <mark
      ref={ref}
      className={cn("nova-mark", `nova-mark--${tone}`, className)}
      {...rest}
    />
  );
});
