import { forwardRef, useId, useState } from "react";
import { cn } from "../../../utils/cn";
import {
  CreditCardInput,
  type CardBrand,
  type CreditCardChange,
} from "../CreditCardInput";
import { ExpiryInput, type ExpiryChange } from "../ExpiryInput";
import { CvvInput } from "../CvvInput";
import "./CardForm.css";

export type CardFormSize = "sm" | "md" | "lg";

export interface CardFormValue {
  /** Cardholder name as typed. */
  name: string;
  /** Card number digits only. */
  number: string;
  /** Detected brand from the number. */
  brand: CardBrand;
  /** Two-digit expiry month, or "". */
  expMonth: string;
  /** Two-digit expiry year (YY), or "". */
  expYear: string;
  /** CVV/CVC digits. */
  cvv: string;
}

export interface CardFormProps
  extends Omit<
    React.FormHTMLAttributes<HTMLFormElement>,
    "onChange" | "onSubmit" | "defaultValue"
  > {
  /** Size on the sm/md/lg scale applied to every field. Defaults to `"md"`. */
  size?: CardFormSize;
  /** Initial (uncontrolled) values. */
  defaultValue?: Partial<CardFormValue>;
  /** Called whenever any field changes, with the aggregate value + validity. */
  onChange?: (value: CardFormValue, valid: boolean) => void;
  /** Called on submit with the aggregate value + validity. */
  onSubmit?: (value: CardFormValue, valid: boolean) => void;
  /** Mask the CVV with a reveal toggle. Defaults to `true`. */
  maskCvv?: boolean;
  /** Label for the submit button. Pass `null` to omit the button. */
  submitLabel?: React.ReactNode;
}

const EMPTY: CardFormValue = {
  name: "",
  number: "",
  brand: "unknown",
  expMonth: "",
  expYear: "",
  cvv: "",
};

function computeValidity(
  value: CardFormValue,
  cardValid: boolean,
  expiryValid: boolean
): boolean {
  const cvvLen = value.brand === "amex" ? 4 : 3;
  return (
    value.name.trim().length > 0 &&
    cardValid &&
    expiryValid &&
    value.cvv.length === cvvLen
  );
}

export const CardForm = forwardRef<HTMLFormElement, CardFormProps>(
  function CardForm(
    {
      size = "md",
      defaultValue,
      onChange,
      onSubmit,
      maskCvv = true,
      submitLabel = "Pay",
      className,
      ...rest
    },
    ref
  ) {
    const [value, setValue] = useState<CardFormValue>(() => ({
      ...EMPTY,
      ...defaultValue,
    }));
    // Track field-level validity reported by the child components.
    const [cardValid, setCardValid] = useState(false);
    const [expiryValid, setExpiryValid] = useState(false);

    const cvvLength = value.brand === "amex" ? 4 : 3;
    const valid = computeValidity(value, cardValid, expiryValid);

    const reactId = useId();
    const nameId = `${reactId}-name`;
    const numberId = `${reactId}-number`;
    const expId = `${reactId}-exp`;
    const cvvId = `${reactId}-cvv`;

    const update = (
      patch: Partial<CardFormValue>,
      flags?: { cardValid?: boolean; expiryValid?: boolean }
    ) => {
      const nextCardValid = flags?.cardValid ?? cardValid;
      const nextExpiryValid = flags?.expiryValid ?? expiryValid;
      if (flags?.cardValid !== undefined) setCardValid(flags.cardValid);
      if (flags?.expiryValid !== undefined) setExpiryValid(flags.expiryValid);

      setValue((prev) => {
        const next = { ...prev, ...patch };
        onChange?.(next, computeValidity(next, nextCardValid, nextExpiryValid));
        return next;
      });
    };

    const handleCard = (c: CreditCardChange) => {
      update({ number: c.raw, brand: c.brand }, { cardValid: c.valid });
    };

    const handleExpiry = (c: ExpiryChange) => {
      update(
        { expMonth: c.month, expYear: c.year },
        { expiryValid: c.valid }
      );
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      onSubmit?.(value, valid);
    };

    return (
      <form
        {...rest}
        ref={ref}
        className={cn("nova-card-form", `nova-card-form--${size}`, className)}
        onSubmit={handleSubmit}
        noValidate
      >
        <div className="nova-card-form__field nova-card-form__field--full">
          <label className="nova-card-form__label" htmlFor={nameId}>
            Cardholder name
          </label>
          <div className="nova-card-form__name nova-card-form__control">
            <input
              id={nameId}
              type="text"
              autoComplete="cc-name"
              className="nova-card-form__name-field nova-focusable"
              placeholder="Name on card"
              value={value.name}
              onChange={(e) => update({ name: e.target.value })}
            />
          </div>
        </div>

        <div className="nova-card-form__field nova-card-form__field--full">
          <label className="nova-card-form__label" htmlFor={numberId}>
            Card number
          </label>
          <CreditCardInput
            id={numberId}
            size={size}
            value={value.number}
            onChange={handleCard}
          />
        </div>

        <div className="nova-card-form__row">
          <div className="nova-card-form__field">
            <label className="nova-card-form__label" htmlFor={expId}>
              Expiry
            </label>
            <ExpiryInput
              id={expId}
              size={size}
              onChange={handleExpiry}
            />
          </div>

          <div className="nova-card-form__field">
            <label className="nova-card-form__label" htmlFor={cvvId}>
              Security code
            </label>
            <CvvInput
              id={cvvId}
              size={size}
              length={cvvLength}
              masked={maskCvv}
              value={value.cvv}
              onChange={(c) => update({ cvv: c.value })}
            />
          </div>
        </div>

        {submitLabel != null && (
          <button
            type="submit"
            className="nova-card-form__submit nova-focusable"
            disabled={!valid}
            aria-disabled={!valid || undefined}
          >
            {submitLabel}
          </button>
        )}
      </form>
    );
  }
);
