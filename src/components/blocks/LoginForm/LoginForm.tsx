import { forwardRef, useId, useState } from "react";
import { cn } from "../../../utils/cn";
import "./LoginForm.css";

export interface LoginSubmitValues {
  email: string;
  password: string;
  remember: boolean;
}

export interface LoginFormProps
  extends Omit<React.FormHTMLAttributes<HTMLFormElement>, "onSubmit" | "title"> {
  /** Heading shown above the fields. */
  title?: React.ReactNode;
  /** Supporting copy below the title. */
  subtitle?: React.ReactNode;
  /** Submit button label. @default "Sign in" */
  submitLabel?: React.ReactNode;
  /** Show the "remember me" checkbox. @default true */
  showRemember?: boolean;
  /** Forgot-password link href. */
  forgotHref?: string;
  /** Forgot-password click handler (used when no `forgotHref`). */
  onForgotClick?: React.MouseEventHandler<HTMLElement>;
  /** Social-login buttons slot (rendered above a divider). */
  social?: React.ReactNode;
  /** Error message. When set, shows the error area with role="alert". */
  error?: React.ReactNode;
  /** Puts the form in a busy/submitting state (disables controls). */
  loading?: boolean;
  /** Footer slot, e.g. "Don't have an account? Sign up". */
  footer?: React.ReactNode;
  /** Called with the field values on submit. */
  onSubmit?: (values: LoginSubmitValues) => void;
}

/**
 * LoginForm — email + password sign-in block with remember-me, forgot-password
 * link, optional social-login slot and an error area. Self-contained inputs.
 */
export const LoginForm = forwardRef<HTMLFormElement, LoginFormProps>(
  function LoginForm(
    {
      title = "Welcome back",
      subtitle,
      submitLabel = "Sign in",
      showRemember = true,
      forgotHref,
      onForgotClick,
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
    const emailId = `${uid}-email`;
    const passwordId = `${uid}-password`;
    const errorId = `${uid}-error`;

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [remember, setRemember] = useState(false);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (loading) return;
      onSubmit?.({ email, password, remember });
    };

    return (
      <form
        ref={ref}
        className={cn("nova-login-form", className)}
        onSubmit={handleSubmit}
        noValidate
        aria-busy={loading || undefined}
        {...rest}
      >
        {(title || subtitle) && (
          <header className="nova-login-form__header">
            {title && <h2 className="nova-login-form__title">{title}</h2>}
            {subtitle && (
              <p className="nova-login-form__subtitle">{subtitle}</p>
            )}
          </header>
        )}

        {social && (
          <>
            <div className="nova-login-form__social">{social}</div>
            <div className="nova-login-form__divider" role="separator">
              <span>or</span>
            </div>
          </>
        )}

        {error && (
          <div
            id={errorId}
            className="nova-login-form__error"
            role="alert"
          >
            {error}
          </div>
        )}

        <div className="nova-login-form__field">
          <label className="nova-login-form__label" htmlFor={emailId}>
            Email
          </label>
          <input
            id={emailId}
            className="nova-login-form__input"
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

        <div className="nova-login-form__field">
          <div className="nova-login-form__label-row">
            <label className="nova-login-form__label" htmlFor={passwordId}>
              Password
            </label>
            {(forgotHref || onForgotClick) &&
              (forgotHref ? (
                <a
                  className="nova-login-form__forgot"
                  href={forgotHref}
                  onClick={onForgotClick}
                >
                  Forgot password?
                </a>
              ) : (
                <button
                  type="button"
                  className="nova-login-form__forgot"
                  onClick={onForgotClick}
                >
                  Forgot password?
                </button>
              ))}
          </div>
          <input
            id={passwordId}
            className="nova-login-form__input"
            type="password"
            name="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            required
          />
        </div>

        {showRemember && (
          <label className="nova-login-form__remember">
            <input
              type="checkbox"
              className="nova-login-form__checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              disabled={loading}
            />
            <span>Remember me</span>
          </label>
        )}

        <button
          type="submit"
          className="nova-login-form__submit"
          disabled={loading}
          aria-disabled={loading || undefined}
        >
          {loading ? "Signing in…" : submitLabel}
        </button>

        {footer && <div className="nova-login-form__footer">{footer}</div>}
      </form>
    );
  },
);
