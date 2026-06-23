import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./Frame.css";

export type FrameVariant = "outline" | "soft" | "dashed";
export type FramePadding = "none" | "sm" | "md" | "lg";

export interface FrameProps
  extends React.FieldsetHTMLAttributes<HTMLFieldSetElement> {
  /** Optional label rendered on the frame border (fieldset-like). */
  label?: React.ReactNode;
  /** Visual style of the frame. @default "outline" */
  variant?: FrameVariant;
  /** Inner padding on the sm/md/lg scale. @default "md" */
  padding?: FramePadding;
}

/**
 * Frame — a bordered, padded content frame with an optional label sitting on
 * the border (fieldset-like grouping for arbitrary content). Not form-specific;
 * use it to visually group any content. Renders semantically as a
 * `fieldset`/`legend` so the label is associated with the group.
 */
export const Frame = forwardRef<HTMLFieldSetElement, FrameProps>(function Frame(
  { label, variant = "outline", padding = "md", className, children, ...rest },
  ref,
) {
  return (
    <fieldset
      ref={ref}
      className={cn(
        "nova-frame",
        `nova-frame--${variant}`,
        `nova-frame--pad-${padding}`,
        label == null && "nova-frame--no-label",
        className,
      )}
      {...rest}
    >
      {label != null && <legend className="nova-frame__label">{label}</legend>}
      <div className="nova-frame__body">{children}</div>
    </fieldset>
  );
});
