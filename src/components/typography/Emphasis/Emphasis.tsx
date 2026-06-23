import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./Emphasis.css";

export interface EmProps extends React.HTMLAttributes<HTMLElement> {}

/**
 * Em — semantic stress emphasis (`<em>`) with consistent italic styling
 * driven by typographic tokens.
 */
export const Em = forwardRef<HTMLElement, EmProps>(function Em(
  { className, ...rest },
  ref
) {
  return <em ref={ref} className={cn("nova-em", className)} {...rest} />;
});

export interface StrongProps extends React.HTMLAttributes<HTMLElement> {}

/**
 * Strong — semantic strong importance (`<strong>`) with a consistent
 * token-based weight.
 */
export const Strong = forwardRef<HTMLElement, StrongProps>(function Strong(
  { className, ...rest },
  ref
) {
  return (
    <strong ref={ref} className={cn("nova-strong", className)} {...rest} />
  );
});
