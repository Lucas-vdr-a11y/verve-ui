import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./Code.css";

export interface CodeProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * Render as a multi-line code block (`<pre><code>`) instead of inline code.
   * Defaults to `false`.
   */
  block?: boolean;
}

export const Code = forwardRef<HTMLElement, CodeProps>(function Code(
  { block = false, className, children, ...rest },
  ref
) {
  if (block) {
    return (
      <pre
        ref={ref as React.Ref<HTMLPreElement>}
        className={cn("nova-code", "nova-code--block", className)}
        {...(rest as React.HTMLAttributes<HTMLPreElement>)}
      >
        <code className="nova-code__inner">{children}</code>
      </pre>
    );
  }

  return (
    <code
      ref={ref}
      className={cn("nova-code", "nova-code--inline", className)}
      {...rest}
    >
      {children}
    </code>
  );
});
