import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./Blockquote.css";

export interface BlockquoteProps
  extends Omit<React.BlockquoteHTMLAttributes<HTMLQuoteElement>, "cite"> {
  /** Optional attribution rendered below the quote in a `<footer>`/`<cite>`. */
  cite?: React.ReactNode;
  /**
   * URL source of the quotation, wired to the native `cite` attribute. Distinct
   * from the visible `cite` attribution node.
   */
  citeUrl?: string;
}

export const Blockquote = forwardRef<HTMLQuoteElement, BlockquoteProps>(
  function Blockquote(
    { cite, citeUrl, className, children, ...rest },
    ref
  ) {
    return (
      <blockquote
        ref={ref}
        cite={citeUrl}
        className={cn("nova-blockquote", className)}
        {...rest}
      >
        <div className="nova-blockquote__content">{children}</div>
        {cite != null && (
          <footer className="nova-blockquote__footer">
            <cite className="nova-blockquote__cite">{cite}</cite>
          </footer>
        )}
      </blockquote>
    );
  }
);
