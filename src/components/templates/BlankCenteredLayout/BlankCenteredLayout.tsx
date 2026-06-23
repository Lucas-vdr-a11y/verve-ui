import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./BlankCenteredLayout.css";

export interface BlankCenteredLayoutProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Brand slot (logo + name) above the content. */
  brand?: React.ReactNode;
  /** Footer slot (links, fine print) below the content. */
  footer?: React.ReactNode;
  /** Max width of the centered column (any CSS length). @default "30rem" */
  maxWidth?: string;
  /** Center the column vertically as well as horizontally. @default true */
  centerVertically?: boolean;
  /** The page content. */
  children?: React.ReactNode;
}

/**
 * BlankCenteredLayout — minimal single-column centered shell for simple pages
 * (onboarding steps, confirmations, interstitials). A constrained column with
 * optional brand and footer slots. SSR-safe and self-contained.
 */
export const BlankCenteredLayout = forwardRef<
  HTMLDivElement,
  BlankCenteredLayoutProps
>(function BlankCenteredLayout(
  {
    brand,
    footer,
    maxWidth = "30rem",
    centerVertically = true,
    className,
    style,
    children,
    ...rest
  },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(
        "nova-blank-centered",
        centerVertically && "nova-blank-centered--center-y",
        className,
      )}
      style={
        {
          "--nova-blank-centered-max-w": maxWidth,
          ...style,
        } as React.CSSProperties
      }
      {...rest}
    >
      <main id="main" className="nova-blank-centered__main">
        <div className="nova-blank-centered__inner">
          {brand != null && (
            <div className="nova-blank-centered__brand">{brand}</div>
          )}
          <div className="nova-blank-centered__content">{children}</div>
          {footer != null && (
            <footer className="nova-blank-centered__footer">{footer}</footer>
          )}
        </div>
      </main>
    </div>
  );
});
