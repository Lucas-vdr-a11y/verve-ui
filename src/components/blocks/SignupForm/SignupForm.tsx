import { forwardRef, useId, useState } from "react";
import { cn } from "../../../utils/cn";
import "./SignupForm.css";

export interface SignupSubmitValues {
  name: string;
  email: string;
  password: string;
  confirm?: string;
  acceptedTerms: boolean;
}

export interface SignupFormProps
  extends Omit<React.FormHTMLAttributes<HTMLFormElement>, "onSubmit" | "title"> {
  /** Heading shown above the fields. */
  title?: React.ReactNode;
  /** Supporting copy below the title. */
  subtitle?: React.ReactNode;
  /** Submit button label. @default "Create account" */
  submitLabel?: React.ReactNode;
  /** Render the confirm-password field. @default false */
  showConfirm?: boolean;
  /** Terms-and-conditions label (rendered next to the checkbox). */
  termsLabel?: React.ReactNode;
  /** Social-login buttons slot (rendered above a divider). */
  social?: React.ReactNode;
  /** Error message. When set, shows the error area with role="alert". */
  error?: React.ReactNode;
  /** Puts the form in a busy/submitting state (disables controls). */
  loading?: boolean;
  /** Footer slot, e.g. "Already have an account? Sign in". */
  footer?: React.ReactNode;
  /** Called with the field values on submit. */
  onSubmit?: (values: SignupSubmitValues) => void;
}

/**
 * SignupForm — name, email, password (+ optional confirm), terms checkbox and
 * an optional social-login slot. Self-contained inputs.
 */
export const SignupForm = forwardRef<HTMLFormElement, SignupFormProps>(
  function SignupForm(
    {
      title = "Create your account",
      subtitle,
      submitLabel = "Create account",
      showConfirm = false,
      termsLabel = "I agree to the Terms of Service and Privacy Policy",
      social,
      error,
      loading = false,
      footer,
      onSubmit,
      className,
      ...rest
    },
    ref,
  ) {
    const uid = useId();
    const nameId = `${uid}-name`;
    const emailId = `${uid}-email`;
    const passwordId = `${uid}-password`;
    const confirmId = `${uid}-confirm`;
    const errorId = `${uid}-error`;

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [acceptedTerms, setAcceptedTerms] = useState(false);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (loading) return;
      onSubmit?.({
        name,
        email,
        password,
        confirm: showConfirm ? confirm : undefined,
        acceptedTerms,
      });
    };

    return (
      <form
        ref={ref}
        className={cn("nova-signup-form", className)}
        onSubmit={handleSubmit}
        noValidate
        aria-busy={loading || undefined}
        {...rest}
      >
        {(title || subtitle) && (
          <header className="nova-signup-form__header">
            {title && <h2 className="nova-signup-form__title">{title}</h2>}
            {subtitle && (
              <p className="nova-signup-form__subtitle">{subtitle}</p>
            )}
          </header>
        )}

        {social && (
          <>
            <div className="nova-signup-form__social">{social}</div>
            <div className="nova-signup-form__divider" role="separator">
              <span>or</span>
            </div>
          </>
        )}

        {error && (
          <div id={errorId} className="nova-signup-form__error" role="alert">
            {error}
          </div>
        )}

        <div className="nova-signup-form__field">
          <label className="nova-signup-form__label" htmlFor={nameId}>
            Name
          </label>
          <input
            id={nameId}
            className="nova-signup-form__input"
            type="text"
            name="name"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
            required
          />
        </div>

        <div className="nova-signup-form__field">
          <label className="nova-signup-form__label" htmlFor={emailId}>
            Email
          </label>
          <input
            id={emailId}
            className="nova-signup-form__input"
            type="email"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            required
          />
        </div>

        <div className="nova-signup-form__field">
          <label className="nova-signup-form__label" htmlFor={passwordId}>
            Password
          </label>
          <input
            id={passwordId}
            className="nova-signup-form__input"
            type="password"
            name="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
          />
        </div>

        {showConfirm && (
          <div className="nova-signup-form__field">
            <label className="nova-signup-form__label" htmlFor={confirmId}>
              Confirm password
            </label>
            <input
              id={confirmId}
              className="nova-signup-form__input"
              type="password"
              name="confirm"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              disabled={loading}
              required
            />
          </div>
        )}

        <label className="nova-signup-form__terms">
          <input
            type="checkbox"
            className="nova-signup-form__checkbox"
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
            disabled={loading}
            required
          />
          <span>{termsLabel}</span>
        </label>

        <button
          type="submit"
          className="nova-signup-form__submit"
          disabled={loading}
          aria-disabled={loading || undefined}
        >
          {loading ? "Creating account…" : submitLabel}
        </button>

        {footer && <div className="nova-signup-form__footer">{footer}</div>}
      </form>
    );
  },
);
