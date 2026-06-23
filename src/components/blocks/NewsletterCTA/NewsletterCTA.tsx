import { forwardRef, useId, useState } from "react";
import { cn } from "../../../utils/cn";
import "./NewsletterCTA.css";

export type NewsletterCTAStatus = "idle" | "success" | "error";

export interface NewsletterCTAProps
  extends Omit<
    React.HTMLAttributes<HTMLElement>,
    "title" | "onSubmit"
  > {
  /** Section heading. @default "Subscribe to our newsletter" */
  title?: React.ReactNode;
  /** Supporting subtitle. */
  subtitle?: React.ReactNode;
  /** Email input placeholder. @default "you@example.com" */
  placeholder?: string;
  /** Submit button label. @default "Subscribe" */
  submitLabel?: React.ReactNode;
  /** Small privacy note under the form. */
  privacyNote?: React.ReactNode;
  /** Background treatment. @default "gradient" */
  background?: "gradient" | "subtle" | "brand";
  /** Current status; drives the success/error message. @default "idle" */
  status?: NewsletterCTAStatus;
  /** Message shown on success. */
  successMessage?: React.ReactNode;
  /** Message shown on error. */
  errorMessage?: React.ReactNode;
  /** Disables the form while submitting. */
  loading?: boolean;
  /** Called with the entered email on submit. */
  onSubmit?: (email: string) => void;
}

/**
 * NewsletterCTA — a full-width newsletter call-to-action section with a title,
 * subtitle, inline email + button, and a privacy note. Supports gradient, brand,
 * or subtle backgrounds and idle/success/error states.
 */
export const NewsletterCTA = forwardRef<HTMLElement, NewsletterCTAProps>(
  function NewsletterCTA(
    {
      title = "Subscribe to our newsletter",
      subtitle,
      placeholder = "you@example.com",
      submitLabel = "Subscribe",
      privacyNote,
      background = "gradient",
      status = "idle",
      successMessage = "You're in! Check your inbox to confirm.",
      errorMessage = "Something went wrong. Please try again.",
      loading = false,
      onSubmit,
      className,
      ...rest
    },
    ref,
  ) {
    const uid = useId();
    const emailId = `${uid}-email`;
    const msgId = `${uid}-msg`;
    const [email, setEmail] = useState("");

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (loading) return;
      onSubmit?.(email);
    };

    const onBrand = background === "gradient" || background === "brand";

    return (
      <section
        ref={ref}
        aria-labelledby={`${uid}-title`}
        className={cn(
          "nova-newsletter-cta",
          `nova-newsletter-cta--${background}`,
          onBrand && "nova-newsletter-cta--on-brand",
          className,
        )}
        {...rest}
      >
        <div className="nova-newsletter-cta__inner">
          <div className="nova-newsletter-cta__intro">
            <h2 id={`${uid}-title`} className="nova-newsletter-cta__title">
              {title}
            </h2>
            {subtitle && (
              <p className="nova-newsletter-cta__subtitle">{subtitle}</p>
            )}
          </div>

          <form
            className="nova-newsletter-cta__form"
            onSubmit={handleSubmit}
            noValidate
            aria-busy={loading || undefined}
          >
            <div className="nova-newsletter-cta__row">
              <label
                className="nova-newsletter-cta__visually-hidden"
                htmlFor={emailId}
              >
                Email address
              </label>
              <input
                id={emailId}
                className="nova-newsletter-cta__input"
                type="email"
                name="email"
                autoComplete="email"
                placeholder={placeholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading || status === "success"}
                aria-invalid={status === "error" ? true : undefined}
                aria-describedby={status !== "idle" ? msgId : undefined}
                required
              />
              <button
                type="submit"
                className="nova-newsletter-cta__button"
                disabled={loading || status === "success"}
                aria-disabled={loading || undefined}
              >
                {loading ? "Subscribing…" : submitLabel}
              </button>
            </div>

            {status === "success" && (
              <p
                id={msgId}
                className="nova-newsletter-cta__message nova-newsletter-cta__message--success"
                role="status"
              >
                {successMessage}
              </p>
            )}
            {status === "error" && (
              <p
                id={msgId}
                className="nova-newsletter-cta__message nova-newsletter-cta__message--error"
                role="alert"
              >
                {errorMessage}
              </p>
            )}

            {privacyNote && (
              <p className="nova-newsletter-cta__privacy">{privacyNote}</p>
            )}
          </form>
        </div>
      </section>
    );
  },
);
