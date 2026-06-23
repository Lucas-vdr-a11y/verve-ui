import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./Footer.css";

export interface FooterLink {
  /** Visible link label. */
  label: React.ReactNode;
  /** Destination URL. */
  href: string;
  /** Optional extra anchor attributes (e.g. `target`, `rel`). */
  external?: boolean;
}

export interface FooterColumn {
  /** Column heading. */
  title: React.ReactNode;
  /** Links rendered under the heading. */
  links: FooterLink[];
}

export interface FooterProps extends React.HTMLAttributes<HTMLElement> {
  /** Brand slot (logo + blurb) shown alongside the link columns. */
  brand?: React.ReactNode;
  /** Groups of links rendered as responsive columns. */
  columns?: FooterColumn[];
  /** Copyright / legal text shown in the bottom bar. */
  copyright?: React.ReactNode;
  /** Social/extra slot aligned to the trailing edge of the bottom bar. */
  social?: React.ReactNode;
}

/**
 * Footer — a site footer: an optional brand block, groups of link columns, and
 * a bottom bar with copyright text and an optional social slot. Columns wrap
 * responsively and collapse to a stack on small screens.
 */
export const Footer = forwardRef<HTMLElement, FooterProps>(function Footer(
  { brand, columns, copyright, social, className, children, ...rest },
  ref,
) {
  const hasTop = brand != null || (columns != null && columns.length > 0);
  const hasBottom = copyright != null || social != null;

  return (
    <footer
      ref={ref}
      className={cn("nova-footer", className)}
      {...rest}
    >
      {hasTop && (
        <div className="nova-footer__top">
          {brand != null && (
            <div className="nova-footer__brand">{brand}</div>
          )}
          {columns != null && columns.length > 0 && (
            <div className="nova-footer__columns">
              {columns.map((column, i) => (
                <nav className="nova-footer__column" key={i}>
                  <div className="nova-footer__column-title">
                    {column.title}
                  </div>
                  <ul className="nova-footer__list">
                    {column.links.map((link, j) => (
                      <li className="nova-footer__item" key={j}>
                        <a
                          className="nova-focusable nova-footer__link"
                          href={link.href}
                          {...(link.external
                            ? { target: "_blank", rel: "noreferrer" }
                            : null)}
                        >
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              ))}
            </div>
          )}
        </div>
      )}
      {children}
      {hasBottom && (
        <div className="nova-footer__bottom">
          {copyright != null && (
            <div className="nova-footer__copyright">{copyright}</div>
          )}
          {social != null && (
            <div className="nova-footer__social">{social}</div>
          )}
        </div>
      )}
    </footer>
  );
});
