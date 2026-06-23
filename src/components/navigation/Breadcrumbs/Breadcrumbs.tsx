import { forwardRef, Fragment, useMemo, useState } from "react";
import { cn } from "../../../utils/cn";
import "./Breadcrumbs.css";

export interface BreadcrumbItem {
  /** Visible label. */
  label: React.ReactNode;
  /** Optional href; when present the item renders as a link. */
  href?: string;
  /** Optional icon rendered before the label. */
  icon?: React.ReactNode;
  /** Click handler (e.g. for client-side routing). */
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
}

function DefaultSeparator() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M9 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export interface BreadcrumbsProps
  extends React.HTMLAttributes<HTMLElement> {
  /** Items in order from root to current page. */
  items: BreadcrumbItem[];
  /** Custom separator between items. Defaults to a chevron. */
  separator?: React.ReactNode;
  /**
   * Collapse the middle items into an ellipsis when the item count exceeds
   * this number. Set to `0` to disable. Defaults to `0` (no collapsing).
   */
  maxItems?: number;
  /** How many leading items to keep visible when collapsing. Defaults to `1`. */
  itemsBeforeCollapse?: number;
  /** How many trailing items to keep visible when collapsing. Defaults to `1`. */
  itemsAfterCollapse?: number;
}

interface RenderEntry {
  type: "item" | "ellipsis";
  item?: BreadcrumbItem;
  index?: number;
}

export const Breadcrumbs = forwardRef<HTMLElement, BreadcrumbsProps>(
  function Breadcrumbs(
    {
      items,
      separator,
      maxItems = 0,
      itemsBeforeCollapse = 1,
      itemsAfterCollapse = 1,
      className,
      "aria-label": ariaLabel = "Breadcrumb",
      ...rest
    },
    ref
  ) {
    const [expanded, setExpanded] = useState(false);
    const sep = separator ?? <DefaultSeparator />;

    const entries = useMemo<RenderEntry[]>(() => {
      const shouldCollapse =
        maxItems > 0 && !expanded && items.length > maxItems;

      if (!shouldCollapse) {
        return items.map((item, index) => ({ type: "item", item, index }));
      }

      const before = items
        .slice(0, Math.max(0, itemsBeforeCollapse))
        .map((item, index) => ({ type: "item" as const, item, index }));
      const after = items
        .slice(items.length - Math.max(0, itemsAfterCollapse))
        .map((item, i) => ({
          type: "item" as const,
          item,
          index: items.length - Math.max(0, itemsAfterCollapse) + i,
        }));

      return [...before, { type: "ellipsis" as const }, ...after];
    }, [items, maxItems, expanded, itemsBeforeCollapse, itemsAfterCollapse]);

    return (
      <nav
        ref={ref}
        aria-label={ariaLabel}
        className={cn("nova-breadcrumbs", className)}
        {...rest}
      >
        <ol className="nova-breadcrumbs__list">
          {entries.map((entry, i) => {
            const isLast = i === entries.length - 1;

            return (
              <Fragment key={entry.type === "ellipsis" ? "ellipsis" : entry.index}>
                <li className="nova-breadcrumbs__item">
                  {entry.type === "ellipsis" ? (
                    <button
                      type="button"
                      className={cn(
                        "nova-breadcrumbs__ellipsis",
                        "nova-focusable"
                      )}
                      aria-label="Show collapsed breadcrumbs"
                      onClick={() => setExpanded(true)}
                    >
                      …
                    </button>
                  ) : (
                    <BreadcrumbLink item={entry.item!} isCurrent={isLast} />
                  )}
                </li>
                {!isLast && (
                  <li
                    className="nova-breadcrumbs__separator"
                    role="presentation"
                    aria-hidden="true"
                  >
                    {sep}
                  </li>
                )}
              </Fragment>
            );
          })}
        </ol>
      </nav>
    );
  }
);

function BreadcrumbLink({
  item,
  isCurrent,
}: {
  item: BreadcrumbItem;
  isCurrent: boolean;
}) {
  const content = (
    <>
      {item.icon && (
        <span className="nova-breadcrumbs__icon" aria-hidden="true">
          {item.icon}
        </span>
      )}
      <span className="nova-breadcrumbs__label">{item.label}</span>
    </>
  );

  if (isCurrent || (!item.href && !item.onClick)) {
    return (
      <span
        className="nova-breadcrumbs__current"
        aria-current={isCurrent ? "page" : undefined}
      >
        {content}
      </span>
    );
  }

  return (
    <a
      href={item.href}
      onClick={item.onClick}
      className={cn("nova-breadcrumbs__link", "nova-focusable")}
    >
      {content}
    </a>
  );
}
