import { forwardRef, useMemo } from "react";
import { cn } from "../../../utils/cn";
import "./Pagination.css";

export type PaginationSize = "sm" | "md" | "lg";

type PageEntry = number | "ellipsis-start" | "ellipsis-end";

export interface PaginationProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "onChange"> {
  /** Current page (1-based). */
  page: number;
  /** Total number of pages. */
  count: number;
  /** Called with the new page when navigation occurs. */
  onPageChange?: (page: number) => void;
  /** Pages shown on each side of the current page. Defaults to `1`. */
  siblingCount?: number;
  /** Pages always shown at the start/end edges. Defaults to `1`. */
  boundaryCount?: number;
  /** Size on the sm/md/lg scale. Defaults to `"md"`. */
  size?: PaginationSize;
  /** Hide the previous/next controls. Defaults to `false`. */
  hidePrevNext?: boolean;
}

function range(start: number, end: number): number[] {
  const out: number[] = [];
  for (let i = start; i <= end; i++) out.push(i);
  return out;
}

function ChevronLeft() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M15 6l-6 6 6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronRight() {
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

export const Pagination = forwardRef<HTMLElement, PaginationProps>(
  function Pagination(
    {
      page,
      count,
      onPageChange,
      siblingCount = 1,
      boundaryCount = 1,
      size = "md",
      hidePrevNext = false,
      className,
      "aria-label": ariaLabel = "Pagination",
      ...rest
    },
    ref
  ) {
    const entries = useMemo<PageEntry[]>(() => {
      if (count <= 0) return [];

      const totalNumbers = boundaryCount * 2 + siblingCount * 2 + 3;
      if (totalNumbers >= count) {
        return range(1, count);
      }

      const startPages = range(1, boundaryCount);
      const endPages = range(count - boundaryCount + 1, count);

      const siblingsStart = Math.max(
        Math.min(page - siblingCount, count - boundaryCount - siblingCount * 2 - 1),
        boundaryCount + 2
      );
      const siblingsEnd = Math.min(
        Math.max(page + siblingCount, boundaryCount + siblingCount * 2 + 2),
        endPages[0] - 2
      );

      const result: PageEntry[] = [...startPages];

      if (siblingsStart > boundaryCount + 2) {
        result.push("ellipsis-start");
      } else if (boundaryCount + 1 < count - boundaryCount) {
        result.push(boundaryCount + 1);
      }

      result.push(...range(siblingsStart, siblingsEnd));

      if (siblingsEnd < count - boundaryCount - 1) {
        result.push("ellipsis-end");
      } else if (count - boundaryCount > boundaryCount) {
        result.push(count - boundaryCount);
      }

      result.push(...endPages);
      return result;
    }, [page, count, siblingCount, boundaryCount]);

    const go = (target: number) => {
      const clamped = Math.min(Math.max(target, 1), count);
      if (clamped !== page) onPageChange?.(clamped);
    };

    const atStart = page <= 1;
    const atEnd = page >= count;

    return (
      <nav
        ref={ref}
        aria-label={ariaLabel}
        className={cn("nova-pagination", `nova-pagination--${size}`, className)}
        {...rest}
      >
        <ul className="nova-pagination__list">
          {!hidePrevNext && (
            <li>
              <button
                type="button"
                className={cn(
                  "nova-pagination__item",
                  "nova-pagination__nav",
                  "nova-focusable"
                )}
                onClick={() => go(page - 1)}
                disabled={atStart}
                aria-label="Go to previous page"
              >
                <ChevronLeft />
              </button>
            </li>
          )}

          {entries.map((entry, i) => {
            if (entry === "ellipsis-start" || entry === "ellipsis-end") {
              return (
                <li key={`${entry}-${i}`}>
                  <span
                    className="nova-pagination__ellipsis"
                    aria-hidden="true"
                  >
                    …
                  </span>
                </li>
              );
            }

            const isCurrent = entry === page;
            return (
              <li key={entry}>
                <button
                  type="button"
                  className={cn(
                    "nova-pagination__item",
                    "nova-focusable",
                    isCurrent && "nova-pagination__item--active"
                  )}
                  onClick={() => go(entry)}
                  aria-label={`Go to page ${entry}`}
                  aria-current={isCurrent ? "page" : undefined}
                >
                  {entry}
                </button>
              </li>
            );
          })}

          {!hidePrevNext && (
            <li>
              <button
                type="button"
                className={cn(
                  "nova-pagination__item",
                  "nova-pagination__nav",
                  "nova-focusable"
                )}
                onClick={() => go(page + 1)}
                disabled={atEnd}
                aria-label="Go to next page"
              >
                <ChevronRight />
              </button>
            </li>
          )}
        </ul>
      </nav>
    );
  }
);
