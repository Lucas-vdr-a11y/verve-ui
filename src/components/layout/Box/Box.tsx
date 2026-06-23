import { forwardRef } from "react";
import type { ComponentPropsWithoutRef, ElementType, Ref } from "react";
import { cn } from "../../../utils/cn";
import "./Box.css";

/**
 * Polymorphic helper types — let `Box` (and components built on it) render as
 * any element via the `as` prop while keeping the correct native prop types.
 */
type AsProp<T extends ElementType> = { as?: T };

type PolymorphicProps<T extends ElementType, P = object> = P &
  AsProp<T> &
  Omit<ComponentPropsWithoutRef<T>, keyof (AsProp<T> & P)>;

export type BoxOwnProps = object;

export type BoxProps<T extends ElementType = "div"> = PolymorphicProps<
  T,
  BoxOwnProps
>;

/**
 * Box — the layout primitive. Renders a `div` by default, or any element via
 * `as`. It is intentionally unstyled (a single reset-ish class) so every other
 * layout component can build on top of it and pass `style`/`className` through.
 */
export const Box = forwardRef(function Box<T extends ElementType = "div">(
  { as, className, ...rest }: BoxProps<T>,
  ref: Ref<Element>,
) {
  const Component = (as ?? "div") as ElementType;
  return <Component ref={ref} className={cn("nova-box", className)} {...rest} />;
}) as <T extends ElementType = "div">(
  props: BoxProps<T> & { ref?: Ref<Element> },
) => React.ReactElement | null;
