import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./PageNav.css";

export interface PageNavLink {
  /** Title of the target page. */
  label: React.ReactNode;
  /** Destination URL. */
  href: string;
  /** Optional small eyebrow text (e.g. "Previous"). */
  hint?: React.ReactNode;
}

export interface PageNavProps extends React.HTMLAttributes<HTMLElement> {
  /** Previous-page link (rendered on the start side). */
  prev?: PageNavLink;
  /** Next-page link (rendered on the end side). */
  next?: PageNavLink;
  /** Accessible label for the navigation landmark. */
  "aria-label"?: string;
}

function ChevronLeft() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M15 18l-6-6 6-6"
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

export const PageNav = forwardRef<HTMLElement, PageNavProps>(function PageNav(
  {
    prev,
    next,
    className,
    "aria-label": ariaLabel = "Pagination",
    ...rest
  },
  ref
) {
  return (
    <nav
      ref={ref}
      aria-label={ariaLabel}
      className={cn("nova-page-nav", className)}
      {...rest}
    >
      {prev ? (
        <a
          href={prev.href}
          rel="prev"
          className={cn(
            "nova-page-nav__link",
            "nova-page-nav__link--prev",
            "nova-focusable"
          )}
        >
          <span className="nova-page-nav__chevron" aria-hidden="true">
            <ChevronLeft />
          </span>
          <span className="nova-page-nav__text">
            <span className="nova-page-nav__hint">
              {prev.hint ?? "Previous"}
            </span>
            <span className="nova-page-nav__label">{prev.label}</span>
          </span>
        </a>
      ) : (
        <span className="nova-page-nav__spacer" aria-hidden="true" />
      )}

      {next ? (
        <a
          href={next.href}
          rel="next"
          className={cn(
            "nova-page-nav__link",
            "nova-page-nav__link--next",
            "nova-focusable"
          )}
        >
          <span className="nova-page-nav__text">
            <span className="nova-page-nav__hint">{next.hint ?? "Next"}</span>
            <span className="nova-page-nav__label">{next.label}</span>
          </span>
          <span className="nova-page-nav__chevron" aria-hidden="true">
            <ChevronRight />
          </span>
        </a>
      ) : (
        <span className="nova-page-nav__spacer" aria-hidden="true" />
      )}
    </nav>
  );
});
