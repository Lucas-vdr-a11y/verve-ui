import { forwardRef, useEffect, useState } from "react";
import { cn } from "../../../utils/cn";
import "./Anchor.css";

export interface AnchorItem {
  /** Target hash, e.g. `"#installation"`. */
  href: string;
  /** Visible label. */
  label: React.ReactNode;
  /** Nesting depth (1 = top level). Defaults to `1`. */
  level?: number;
}

export interface AnchorProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "onChange"> {
  /** Table-of-contents entries. */
  items: AnchorItem[];
  /** Controlled active href. When set, IntersectionObserver is disabled. */
  activeHref?: string;
  /** Fired when the active section changes (scroll-spy or click). */
  onChange?: (href: string) => void;
  /** Smooth-scroll on click. Defaults to `true`. */
  smooth?: boolean;
  /** rootMargin for the IntersectionObserver. Defaults to `"0px 0px -70% 0px"`. */
  rootMargin?: string;
  /** Accessible label for the nav landmark. Defaults to `"Table of contents"`. */
  "aria-label"?: string;
}

/** Table-of-contents navigation with scroll-spy + smooth scrolling. */
export const Anchor = forwardRef<HTMLElement, AnchorProps>(function Anchor(
  {
    items,
    activeHref,
    onChange,
    smooth = true,
    rootMargin = "0px 0px -70% 0px",
    className,
    "aria-label": ariaLabel,
    ...rest
  },
  ref
) {
  const [internalActive, setInternalActive] = useState<string | undefined>(
    activeHref
  );
  const isControlled = activeHref !== undefined;
  const active = isControlled ? activeHref : internalActive;

  useEffect(() => {
    if (isControlled) return;
    if (
      typeof window === "undefined" ||
      typeof IntersectionObserver === "undefined" ||
      typeof document === "undefined"
    ) {
      return;
    }

    const ids = items
      .map((i) => i.href.replace(/^#/, ""))
      .filter(Boolean);
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el != null);
    if (elements.length === 0) return;

    const visible = new Set<string>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.id;
          if (entry.isIntersecting) visible.add(id);
          else visible.delete(id);
        }
        // Pick the first item (in document order) currently visible.
        const firstVisible = ids.find((id) => visible.has(id));
        if (firstVisible) {
          const href = `#${firstVisible}`;
          setInternalActive(href);
          onChange?.(href);
        }
      },
      { rootMargin, threshold: 0 }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, rootMargin, isControlled]);

  const handleClick =
    (href: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (typeof document === "undefined") return;
      const id = href.replace(/^#/, "");
      const target = document.getElementById(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({
          behavior: smooth ? "smooth" : "auto",
          block: "start",
        });
        if (typeof history !== "undefined") {
          history.replaceState(null, "", href);
        }
        if (!isControlled) setInternalActive(href);
        onChange?.(href);
      }
    };

  return (
    <nav
      ref={ref}
      aria-label={ariaLabel ?? "Table of contents"}
      className={cn("nova-anchor", className)}
      {...rest}
    >
      <ul className="nova-anchor__list">
        {items.map((item) => {
          const isActive = active === item.href;
          const level = item.level ?? 1;
          return (
            <li
              key={item.href}
              className="nova-anchor__item"
              style={
                { "--nova-anchor-level": level - 1 } as React.CSSProperties
              }
            >
              <a
                href={item.href}
                aria-current={isActive ? "location" : undefined}
                className={cn(
                  "nova-anchor__link",
                  isActive && "nova-anchor__link--active"
                )}
                onClick={handleClick(item.href)}
              >
                {item.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
});
