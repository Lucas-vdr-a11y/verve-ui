import { forwardRef } from "react";
import type { ReactNode } from "react";
import { cn } from "../../../utils/cn";
import "./MediaObject.css";

export type MediaObjectAlign = "start" | "center" | "end";
export type MediaObjectGap = "sm" | "md" | "lg";

export interface MediaObjectProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The media slot: an image, icon, avatar, etc. Rendered on the left. */
  media?: ReactNode;
  /** Optional heading shown above the body. */
  heading?: ReactNode;
  /** Element/level used for the heading. Defaults to `"h3"`. */
  headingAs?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "div";
  /** Vertical alignment of media against the content. Defaults to `"start"`. */
  align?: MediaObjectAlign;
  /** Gap between media and content. Defaults to `"md"`. */
  gap?: MediaObjectGap;
  /** Flip media to the right of the content. Defaults to `false`. */
  reverse?: boolean;
  /** Body content (rendered under the heading). */
  children?: ReactNode;
}

/**
 * The classic "media object" layout: a fixed media block (image / icon /
 * avatar) beside flexible heading + body content. Reversible and alignable.
 */
export const MediaObject = forwardRef<HTMLDivElement, MediaObjectProps>(
  function MediaObject(
    {
      media,
      heading,
      headingAs = "h3",
      align = "start",
      gap = "md",
      reverse = false,
      children,
      className,
      ...rest
    },
    ref
  ) {
    const Heading = headingAs;
    return (
      <div
        ref={ref}
        className={cn(
          "nova-media-object",
          `nova-media-object--align-${align}`,
          `nova-media-object--gap-${gap}`,
          reverse && "nova-media-object--reverse",
          className
        )}
        {...rest}
      >
        {media != null && (
          <div className="nova-media-object__media">{media}</div>
        )}
        <div className="nova-media-object__content">
          {heading != null && (
            <Heading className="nova-media-object__heading">{heading}</Heading>
          )}
          {children != null && (
            <div className="nova-media-object__body">{children}</div>
          )}
        </div>
      </div>
    );
  }
);
