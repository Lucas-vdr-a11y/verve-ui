import { cloneElement, isValidElement, useId } from "react";
import { cn } from "../../../utils/cn";
import "./FormField.css";

export interface FormFieldRenderProps {
  /** id to put on the control (matches the label's htmlFor). */
  id: string;
  /** `aria-describedby` referencing help/error text, when present. */
  "aria-describedby"?: string;
  /** `aria-invalid` when the field has an error. */
  "aria-invalid"?: boolean;
  /** `aria-required` mirror of the `required` flag. */
  "aria-required"?: boolean;
}

export interface FormFieldProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** Visible label. */
  label?: React.ReactNode;
  /** Helper text shown below the control. */
  helpText?: React.ReactNode;
  /** Error text; when set the field renders as invalid and hides help text. */
  error?: React.ReactNode;
  /** Marks the field required (renders an asterisk + `aria-required`). */
  required?: boolean;
  /** Override the generated id used to wire label/control/description. */
  id?: string;
  /**
   * The control. Either a single element (props injected via cloneElement) or a
   * render-prop receiving the wiring props to spread yourself.
   */
  children:
    | React.ReactElement
    | ((props: FormFieldRenderProps) => React.ReactNode);
}

export function FormField({
  label,
  helpText,
  error,
  required = false,
  id,
  className,
  children,
  ...rest
}: FormFieldProps) {
  const generatedId = useId();
  // An explicit id on a single-element child wins, so the label points at the
  // real control. Falls back to the `id` prop, then a generated id.
  const childId =
    isValidElement(children) &&
    typeof (children.props as { id?: string }).id === "string"
      ? (children.props as { id?: string }).id
      : undefined;
  const fieldId = childId ?? id ?? generatedId;
  const helpId = `${fieldId}-help`;
  const errorId = `${fieldId}-error`;

  const hasError = error != null && error !== false;
  const describedBy =
    [hasError ? errorId : null, helpText != null ? helpId : null]
      .filter(Boolean)
      .join(" ") || undefined;

  const wiring: FormFieldRenderProps = {
    id: fieldId,
    "aria-describedby": describedBy,
    "aria-invalid": hasError || undefined,
    "aria-required": required || undefined,
  };

  let control: React.ReactNode;
  if (typeof children === "function") {
    control = children(wiring);
  } else if (isValidElement(children)) {
    const child = children as React.ReactElement<Record<string, unknown>>;
    control = cloneElement(child, {
      ...wiring,
      // Forward `invalid` to Verve controls that understand it; aria-invalid in
      // `wiring` covers the accessibility tree either way.
      invalid: hasError || (child.props as { invalid?: boolean }).invalid,
    });
  } else {
    control = children;
  }

  return (
    <div
      className={cn(
        "nova-field",
        hasError && "nova-field--invalid",
        className
      )}
      {...rest}
    >
      {label != null && (
        <label className="nova-field__label" htmlFor={fieldId}>
          {label}
          {required && (
            <span className="nova-field__required" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}
      <div className="nova-field__control">{control}</div>
      {hasError ? (
        <p className="nova-field__error" id={errorId}>
          {error}
        </p>
      ) : (
        helpText != null && (
          <p className="nova-field__help" id={helpId}>
            {helpText}
          </p>
        )
      )}
    </div>
  );
}
