import {
  forwardRef,
  useCallback,
  useId,
  useState,
  type ReactNode,
} from "react";
import { cn } from "../../../utils/cn";
import "./ReadMore.css";

export interface ReadMoreProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Number of lines to show when collapsed. Defaults to `3`. */
  lines?: number;
  /** Controlled expanded state. When set, the component is controlled. */
  expanded?: boolean;
  /** Initial expanded state for uncontrolled usage. Defaults to `false`. */
  defaultExpanded?: boolean;
  /** Called whenever the expanded state changes. */
  onExpandedChange?: (expanded: boolean) => void;
  /** Toggle label shown while collapsed. Defaults to `"Read more"`. */
  moreLabel?: ReactNode;
  /** Toggle label shown while expanded. Defaults to `"Show less"`. */
  lessLabel?: ReactNode;
  /** Hide the "Show less" toggle once expanded. Defaults to `false`. */
  hideLessToggle?: boolean;
  /** The content to truncate. */
  children?: ReactNode;
}

/**
 * ReadMore — truncates content to a fixed number of lines using pure CSS
 * line-clamp (SSR-safe, no measuring) with a smooth toggle to reveal the rest.
 */
export const ReadMore = forwardRef<HTMLDivElement, ReadMoreProps>(
  function ReadMore(
    {
      lines = 3,
      expanded: expandedProp,
      defaultExpanded = false,
      onExpandedChange,
      moreLabel = "Read more",
      lessLabel = "Show less",
      hideLessToggle = false,
      className,
      children,
      style,
      ...rest
    },
    ref
  ) {
    const isControlled = expandedProp !== undefined;
    const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
    const expanded = isControlled ? expandedProp : internalExpanded;

    const baseId = useId();
    const contentId = `${baseId}-content`;

    const setExpanded = useCallback(
      (next: boolean) => {
        if (!isControlled) setInternalExpanded(next);
        onExpandedChange?.(next);
      },
      [isControlled, onExpandedChange]
    );

    const showToggle = !expanded || !hideLessToggle;

    return (
      <div
        ref={ref}
        className={cn(
          "nova-read-more",
          expanded
            ? "nova-read-more--expanded"
            : "nova-read-more--collapsed",
          className
        )}
        data-state={expanded ? "expanded" : "collapsed"}
        style={
          { "--nova-read-more-lines": lines, ...style } as React.CSSProperties
        }
        {...rest}
      >
        <div
          id={contentId}
          className="nova-read-more__content"
          aria-hidden={false}
        >
          {children}
        </div>
        {showToggle && (
          <button
            type="button"
            className={cn("nova-read-more__toggle", "nova-focusable")}
            aria-expanded={expanded}
            aria-controls={contentId}
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? lessLabel : moreLabel}
          </button>
        )}
      </div>
    );
  }
);
