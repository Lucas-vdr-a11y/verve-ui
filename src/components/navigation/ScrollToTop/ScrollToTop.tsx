import { forwardRef, useEffect, useState } from "react";
import { cn } from "../../../utils/cn";
import "./ScrollToTop.css";

export type ScrollToTopPlacement =
  | "bottom-right"
  | "bottom-left"
  | "bottom-center";

export interface ScrollToTopProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Scroll distance (in px) past which the button appears. Defaults to `300`.
   */
  threshold?: number;
  /** Corner placement when fixed. Defaults to `"bottom-right"`. */
  placement?: ScrollToTopPlacement;
  /** Element scrolled / scrolled-to. Defaults to the window. */
  target?: React.RefObject<HTMLElement>;
  /** Smooth-scroll behaviour. Defaults to `true`. */
  smooth?: boolean;
  /** Accessible label. Defaults to `"Scroll to top"`. */
  "aria-label"?: string;
}

function ArrowUpIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 19V5M5 12l7-7 7 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export const ScrollToTop = forwardRef<HTMLButtonElement, ScrollToTopProps>(
  function ScrollToTop(
    {
      threshold = 300,
      placement = "bottom-right",
      target,
      smooth = true,
      className,
      children,
      onClick,
      "aria-label": ariaLabel = "Scroll to top",
      ...rest
    },
    ref
  ) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
      if (typeof window === "undefined") return;

      const scroller: HTMLElement | Window = target?.current ?? window;
      const getScrollTop = () =>
        scroller instanceof Window
          ? window.scrollY || window.pageYOffset
          : scroller.scrollTop;

      const update = () => setVisible(getScrollTop() > threshold);

      update();
      scroller.addEventListener("scroll", update, { passive: true });
      return () => scroller.removeEventListener("scroll", update);
    }, [threshold, target]);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      if (event.defaultPrevented) return;
      if (typeof window === "undefined") return;

      const behavior: ScrollBehavior = smooth ? "smooth" : "auto";
      const scroller: HTMLElement | Window = target?.current ?? window;
      if (scroller instanceof Window) {
        window.scrollTo({ top: 0, behavior });
      } else {
        scroller.scrollTo({ top: 0, behavior });
      }
    };

    return (
      <button
        ref={ref}
        type="button"
        aria-label={ariaLabel}
        aria-hidden={!visible}
        tabIndex={visible ? 0 : -1}
        className={cn(
          "nova-scroll-top",
          `nova-scroll-top--${placement}`,
          "nova-focusable",
          visible && "nova-scroll-top--visible",
          className
        )}
        onClick={handleClick}
        {...rest}
      >
        {children ?? <ArrowUpIcon />}
      </button>
    );
  }
);
