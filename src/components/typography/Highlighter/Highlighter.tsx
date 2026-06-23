import { forwardRef, Fragment, useMemo } from "react";
import { cn } from "../../../utils/cn";
import "./Highlighter.css";

export interface HighlighterProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  /** The full text to render and search within. */
  text: string;
  /** The substring(s) to highlight. A single string or a list of terms. */
  query?: string | string[];
  /** Match case exactly. Defaults to `false` (case-insensitive). */
  caseSensitive?: boolean;
}

/** Escape a string for safe use inside a RegExp. */
function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Highlights every occurrence of `query` within `text` by wrapping matches in
 * `<mark>` elements. Case-insensitive by default; supports multiple terms.
 */
export const Highlighter = forwardRef<HTMLSpanElement, HighlighterProps>(
  function Highlighter(
    { text, query, caseSensitive = false, className, ...rest },
    ref
  ) {
    const segments = useMemo(() => {
      const terms = (Array.isArray(query) ? query : [query])
        .filter((t): t is string => typeof t === "string" && t.length > 0)
        .map(escapeRegExp);

      if (terms.length === 0) return [{ value: text, match: false }];

      const splitRe = new RegExp(
        `(${terms.join("|")})`,
        caseSensitive ? "g" : "gi"
      );
      // Non-global, anchored matcher to classify each split segment without
      // depending on a shared `lastIndex`.
      const testRe = new RegExp(
        `^(?:${terms.join("|")})$`,
        caseSensitive ? "" : "i"
      );
      const parts = text.split(splitRe);

      return parts
        .filter((part) => part.length > 0)
        .map((part) => ({ value: part, match: testRe.test(part) }));
    }, [text, query, caseSensitive]);

    return (
      <span ref={ref} className={cn("nova-highlighter", className)} {...rest}>
        {segments.map((seg, i) =>
          seg.match ? (
            <mark key={i} className="nova-highlighter__mark">
              {seg.value}
            </mark>
          ) : (
            <Fragment key={i}>{seg.value}</Fragment>
          )
        )}
      </span>
    );
  }
);
