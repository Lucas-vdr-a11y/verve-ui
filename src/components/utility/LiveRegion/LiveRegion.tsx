import { forwardRef } from "react";
import { cn } from "../../../utils/cn";

/** ARIA live politeness level. */
export type LiveRegionPoliteness = "polite" | "assertive" | "off";

export interface LiveRegionProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Politeness of announcements. Defaults to `"polite"`. */
  politeness?: LiveRegionPoliteness;
  /**
   * Whether assistive tech should present the entire region on change, not
   * just the diff. Maps to `aria-atomic`. Defaults to `true`.
   */
  atomic?: boolean;
  /**
   * When `true` (default) the region is visually hidden but exposed to screen
   * readers. Set `false` to render visibly (e.g. for a status banner).
   */
  visuallyHidden?: boolean;
}

/**
 * An `aria-live` region for announcing dynamic messages to assistive
 * technology. Render it once (typically near the app root) and update its
 * `children` to make announcements; or drive it with {@link useAnnouncer}.
 *
 * Visually hidden by default via the shared `.nova-visually-hidden` utility.
 */
export const LiveRegion = forwardRef<HTMLDivElement, LiveRegionProps>(
  function LiveRegion(
    {
      politeness = "polite",
      atomic = true,
      visuallyHidden = true,
      className,
      children,
      ...rest
    },
    ref
  ) {
    return (
      <div
        ref={ref}
        role={politeness === "assertive" ? "alert" : "status"}
        aria-live={politeness}
        aria-atomic={atomic}
        className={cn(visuallyHidden && "nova-visually-hidden", className)}
        {...rest}
      >
        {children}
      </div>
    );
  }
);
