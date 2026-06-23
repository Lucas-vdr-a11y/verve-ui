import { forwardRef } from "react";
import type { ReactNode } from "react";
import { cn } from "../../../utils/cn";
import "./Figure.css";

export type FigureAlign = "start" | "center" | "end";

export interface FigureProps extends React.HTMLAttributes<HTMLElement> {
  /** Caption content, rendered in a `<figcaption>`. Omit for no caption. */
  caption?: ReactNode;
  /** Caption text alignment. Defaults to `"start"`. */
  captionAlign?: FigureAlign;
  /** Place the caption above the content instead of below. Defaults to `false`. */
  captionTop?: boolean;
  /** Figure content (image, video, code block, etc.). */
  children?: ReactNode;
}

/**
 * Semantic `<figure>` + `<figcaption>` wrapper with caption alignment control.
 */
export const Figure = forwardRef<HTMLElement, FigureProps>(function Figure(
  {
    caption,
    captionAlign = "start",
    captionTop = false,
    children,
    className,
    ...rest
  },
  ref
) {
  const captionEl = caption != null && (
    <figcaption
      className={cn(
        "nova-figure__caption",
        `nova-figure__caption--${captionAlign}`
      )}
    >
      {caption}
    </figcaption>
  );

  return (
    <figure
      ref={ref}
      className={cn(
        "nova-figure",
        captionTop && "nova-figure--caption-top",
        className
      )}
      {...rest}
    >
      {captionTop && captionEl}
      <div className="nova-figure__content">{children}</div>
      {!captionTop && captionEl}
    </figure>
  );
});
