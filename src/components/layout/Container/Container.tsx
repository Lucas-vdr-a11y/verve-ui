import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./Container.css";

export type ContainerSize = "sm" | "md" | "lg" | "xl" | "full";

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Max-width preset. `full` removes the cap. @default "lg" */
  size?: ContainerSize;
  /** Apply responsive horizontal padding. @default true */
  padded?: boolean;
}

/**
 * Container — a horizontally-centered wrapper that caps content width and
 * applies consistent gutters. The primary page-level layout boundary.
 */
export const Container = forwardRef<HTMLDivElement, ContainerProps>(
  function Container({ size = "lg", padded = true, className, ...rest }, ref) {
    return (
      <div
        ref={ref}
        className={cn(
          "nova-container",
          `nova-container--${size}`,
          padded && "nova-container--padded",
          className,
        )}
        {...rest}
      />
    );
  },
);
