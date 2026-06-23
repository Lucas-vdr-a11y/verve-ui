import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./Card.css";

/** Padding scale keys that map onto the `--nova-space-*` tokens. */
export type CardPadding = 0 | 2 | 3 | 4 | 5 | 6 | 8;

export type CardVariant = "elevated" | "outlined" | "filled";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Surface treatment. @default "elevated" */
  variant?: CardVariant;
  /** Inner padding applied to the card root, from the space scale. @default 6 */
  padding?: CardPadding;
  /** Add hover lift + pointer affordance (e.g. clickable cards). @default false */
  interactive?: boolean;
}

export interface CardSectionProps
  extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * Card — a surface for grouping related content. Compose with `Card.Header`,
 * `Card.Body` and `Card.Footer` for a consistent internal rhythm.
 */
const CardRoot = forwardRef<HTMLDivElement, CardProps>(function Card(
  {
    variant = "elevated",
    padding = 6,
    interactive = false,
    className,
    style,
    ...rest
  },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(
        "nova-card",
        `nova-card--${variant}`,
        interactive && "nova-card--interactive",
        className,
      )}
      style={{
        "--nova-card-padding": `var(--nova-space-${padding})`,
        ...style,
      } as React.CSSProperties}
      {...rest}
    />
  );
});

const CardHeader = forwardRef<HTMLDivElement, CardSectionProps>(
  function CardHeader({ className, ...rest }, ref) {
    return (
      <div
        ref={ref}
        className={cn("nova-card__header", className)}
        {...rest}
      />
    );
  },
);

const CardBody = forwardRef<HTMLDivElement, CardSectionProps>(function CardBody(
  { className, ...rest },
  ref,
) {
  return (
    <div ref={ref} className={cn("nova-card__body", className)} {...rest} />
  );
});

const CardFooter = forwardRef<HTMLDivElement, CardSectionProps>(
  function CardFooter({ className, ...rest }, ref) {
    return (
      <div
        ref={ref}
        className={cn("nova-card__footer", className)}
        {...rest}
      />
    );
  },
);

/** Compound Card: `Card`, `Card.Header`, `Card.Body`, `Card.Footer`. */
export const Card = Object.assign(CardRoot, {
  Header: CardHeader,
  Body: CardBody,
  Footer: CardFooter,
});
