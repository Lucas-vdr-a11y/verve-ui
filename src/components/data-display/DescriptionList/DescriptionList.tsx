import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./DescriptionList.css";

export type DescriptionListLayout = "horizontal" | "vertical";

export interface DescriptionListProps
  extends React.HTMLAttributes<HTMLDListElement> {
  /** Layout of term/description pairs. Defaults to `"vertical"`. */
  layout?: DescriptionListLayout;
  /** Add dividers between pairs. */
  divided?: boolean;
}

export const DescriptionList = forwardRef<
  HTMLDListElement,
  DescriptionListProps
>(function DescriptionList(
  { layout = "vertical", divided = false, className, children, ...rest },
  ref
) {
  return (
    <dl
      ref={ref}
      className={cn(
        "nova-dl",
        `nova-dl--${layout}`,
        divided && "nova-dl--divided",
        className
      )}
      {...rest}
    >
      {children}
    </dl>
  );
});

export interface DescriptionListItemProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** The term (dt). */
  term: React.ReactNode;
  /** The description (dd). Falls back to `children` when omitted. */
  description?: React.ReactNode;
}

export const DescriptionListItem = forwardRef<
  HTMLDivElement,
  DescriptionListItemProps
>(function DescriptionListItem(
  { term, description, className, children, ...rest },
  ref
) {
  return (
    <div ref={ref} className={cn("nova-dl__row", className)} {...rest}>
      <dt className="nova-dl__term">{term}</dt>
      <dd className="nova-dl__desc">{description ?? children}</dd>
    </div>
  );
});
