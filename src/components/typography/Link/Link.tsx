import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./Link.css";

export type LinkVariant = "underline" | "hover-underline" | "subtle";

export interface LinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Underline behaviour / emphasis. Defaults to `"hover-underline"`. */
  variant?: LinkVariant;
  /**
   * Marks the link as pointing to an external destination: opens in a new tab
   * with safe `rel`, and renders a trailing icon affordance.
   */
  external?: boolean;
}

function ExternalIcon() {
  return (
    <svg
      className="nova-link__icon"
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M14 5h5v5" />
      <path d="M19 5l-7 7" />
      <path d="M19 14v3a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h3" />
    </svg>
  );
}

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  {
    variant = "hover-underline",
    external = false,
    target,
    rel,
    className,
    children,
    ...rest
  },
  ref
) {
  const resolvedTarget = external ? target ?? "_blank" : target;
  const resolvedRel = external
    ? rel ?? "noopener noreferrer"
    : rel;

  return (
    <a
      ref={ref}
      className={cn(
        "nova-link",
        "nova-focusable",
        `nova-link--${variant}`,
        external && "nova-link--external",
        className
      )}
      target={resolvedTarget}
      rel={resolvedRel}
      {...rest}
    >
      {children}
      {external && <ExternalIcon />}
    </a>
  );
});
