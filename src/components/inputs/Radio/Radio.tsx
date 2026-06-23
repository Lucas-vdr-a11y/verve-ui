import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import { useRadioContext, type RadioSize } from "./RadioContext";
import "./Radio.css";

export interface RadioProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "type"> {
  /** Size on the sm/md/lg scale. Inherited from RadioGroup when nested. */
  size?: RadioSize;
  /** Visible label rendered next to the dot. */
  label?: React.ReactNode;
  /** This option's value. Required when used inside a RadioGroup. */
  value?: string;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(
  {
    size,
    label,
    disabled,
    className,
    name,
    value,
    checked,
    onChange,
    ...rest
  },
  ref
) {
  const group = useRadioContext();

  const resolvedSize = size ?? group?.size ?? "md";
  const resolvedName = name ?? group?.name;
  const resolvedDisabled = disabled ?? group?.disabled;
  const resolvedChecked =
    group && value !== undefined ? group.value === value : checked;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(event);
    if (group && value !== undefined) group.onChange?.(value, event);
  };

  return (
    <label
      className={cn(
        "nova-radio",
        `nova-radio--${resolvedSize}`,
        resolvedDisabled && "nova-radio--disabled",
        className
      )}
      data-disabled={resolvedDisabled || undefined}
    >
      <span className="nova-radio__control">
        <input
          ref={ref}
          type="radio"
          className="nova-radio__input nova-focusable"
          name={resolvedName}
          value={value}
          disabled={resolvedDisabled}
          checked={group ? resolvedChecked : checked}
          onChange={handleChange}
          {...rest}
        />
        <span className="nova-radio__circle" aria-hidden="true">
          <span className="nova-radio__dot" />
        </span>
      </span>
      {label != null && <span className="nova-radio__label">{label}</span>}
    </label>
  );
});
