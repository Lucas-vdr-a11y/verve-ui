import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./FieldGroup.css";

export type FieldGroupOrientation = "vertical" | "horizontal";

/** Gap presets mapped onto the --nova-space-* scale. */
export type FieldGroupGap = "sm" | "md" | "lg";

export interface FieldGroupProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Stacking direction. Defaults to `"vertical"`. */
  orientation?: FieldGroupOrientation;
  /** Spacing between children on the --nova-space-* scale. Defaults to `"md"`. */
  gap?: FieldGroupGap;
  /** Render as a semantic `<fieldset>` with an optional `<legend>`. */
  legend?: React.ReactNode;
  /** Wrap children onto multiple lines when horizontal. Defaults to `true`. */
  wrap?: boolean;
}

export const FieldGroup = forwardRef<HTMLDivElement, FieldGroupProps>(
  function FieldGroup(
    {
      orientation = "vertical",
      gap = "md",
      legend,
      wrap = true,
      className,
      children,
      ...rest
    },
    ref
  ) {
    const classes = cn(
      "nova-field-group",
      `nova-field-group--${orientation}`,
      `nova-field-group--gap-${gap}`,
      orientation === "horizontal" && wrap && "nova-field-group--wrap",
      className
    );

    if (legend != null) {
      return (
        <fieldset
          ref={ref as unknown as React.Ref<HTMLFieldSetElement>}
          className={classes}
          {...(rest as React.FieldsetHTMLAttributes<HTMLFieldSetElement>)}
        >
          <legend className="nova-field-group__legend">{legend}</legend>
          {children}
        </fieldset>
      );
    }

    return (
      <div ref={ref} className={classes} role="group" {...rest}>
        {children}
      </div>
    );
  }
);
