import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./PullQuote.css";

export type PullQuoteFloat = "none" | "left" | "right";

export interface PullQuoteProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "cite"> {
  /** Optional attribution shown beneath the quote. */
  attribution?: React.ReactNode;
  /** Source URL for the quote, wired to the native `cite` attribute. */
  citeUrl?: string;
  /** Float the pull-quote within editorial body copy. Defaults to `"none"`. */
  float?: PullQuoteFloat;
}

/**
 * An oversized decorative pull-quote for editorial layouts: large accent text
 * with an optional float (left/right) so body copy wraps around it. For emphasis
 * of a line already present in the article — distinct from `Blockquote`.
 */
export const PullQuote = forwardRef<HTMLElement, PullQuoteProps>(
  function PullQuote(
    { attribution, citeUrl, float = "none", className, children, ...rest },
    ref
  ) {
    return (
      <figure
        ref={ref}
        className={cn(
          "nova-pull-quote",
          float !== "none" && `nova-pull-quote--float-${float}`,
          className
        )}
        {...rest}
      >
        <blockquote className="nova-pull-quote__quote" cite={citeUrl}>
          {children}
        </blockquote>
        {attribution ? (
          <figcaption className="nova-pull-quote__attribution">
            {attribution}
          </figcaption>
        ) : null}
      </figure>
    );
  }
);
