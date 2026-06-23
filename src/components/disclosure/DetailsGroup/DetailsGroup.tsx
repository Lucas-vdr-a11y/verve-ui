import {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  useId,
} from "react";
import { cn } from "../../../utils/cn";
import "./DetailsGroup.css";

export interface DetailsItemProps
  extends React.DetailsHTMLAttributes<HTMLDetailsElement> {
  /** The always-visible summary label. */
  summary: React.ReactNode;
}

/**
 * A single styled native `<details>`/`<summary>` row. Progressive-enhancement
 * friendly: works without JavaScript. Inside `<DetailsGroup exclusive>` the
 * shared `name` makes only one open at a time.
 */
export const DetailsItem = forwardRef<HTMLDetailsElement, DetailsItemProps>(
  function DetailsItem({ summary, className, children, ...rest }, ref) {
    return (
      <details
        ref={ref}
        className={cn("nova-details-group__item", className)}
        {...rest}
      >
        <summary className="nova-details-group__summary nova-focusable">
          <span className="nova-details-group__summary-label">{summary}</span>
          <svg
            className="nova-details-group__marker"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M4 6l4 4 4-4"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </summary>
        <div className="nova-details-group__content">{children}</div>
      </details>
    );
  }
);

export interface DetailsGroupProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * When `true`, child `<DetailsItem>`s share a generated `name` so opening one
   * closes the others (native exclusive-accordion behavior). Items that already
   * specify their own `name` are left untouched. Defaults to `false`.
   */
  exclusive?: boolean;
}

/**
 * Inject a shared `name` into direct `<DetailsItem>`/`<details>` children that
 * don't already have one, enabling native exclusive behavior.
 */
function withSharedName(
  children: React.ReactNode,
  name: string
): React.ReactNode {
  return Children.map(children, (child) => {
    if (!isValidElement(child)) return child;
    if (child.type !== DetailsItem && child.type !== "details") return child;
    const props = child.props as { name?: string };
    if (props.name !== undefined) return child;
    return cloneElement(child, { name } as Partial<DetailsItemProps>);
  });
}

/**
 * A thin grouping wrapper around native `<details>`/`<summary>` elements styled
 * to the design system. With `exclusive`, only one item stays open at a time.
 */
export const DetailsGroup = forwardRef<HTMLDivElement, DetailsGroupProps>(
  function DetailsGroup(
    { exclusive = false, className, children, ...rest },
    ref
  ) {
    const groupName = useId();
    const content = exclusive
      ? withSharedName(children, groupName)
      : children;

    return (
      <div ref={ref} className={cn("nova-details-group", className)} {...rest}>
        {content}
      </div>
    );
  }
);
