import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./Abbr.css";

export interface AbbrProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  /** The expanded definition shown on hover/focus and to assistive tech. */
  definition: string;
}

/**
 * Accessible `<abbr>` with a dotted underline. The `definition` is surfaced via
 * the native `title` attribute (hover tooltip + AT) and the visual underline
 * hints that the term is explainable.
 */
export const Abbr = forwardRef<HTMLElement, AbbrProps>(function Abbr(
  { definition, className, children, ...rest },
  ref
) {
  return (
    <abbr
      ref={ref}
      title={definition}
      tabIndex={0}
      className={cn("nova-abbr", "nova-focusable", className)}
      {...rest}
    >
      {children}
    </abbr>
  );
});
