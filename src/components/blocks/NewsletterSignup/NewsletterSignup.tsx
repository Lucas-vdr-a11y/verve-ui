import { forwardRef, useId, useState } from "react";
import { cn } from "../../../utils/cn";
import "./NewsletterSignup.css";

export type NewsletterStatus = "idle" | "success" | "error";

export interface NewsletterSignupProps
  extends Omit<React.FormHTMLAttributes<HTMLFormElement>, "onSubmit" | "title"> {
  /** Layout variant. @default "compact" */
  layout?: "compact" | "card";
  /** Heading (shown in the card layout). */
  title?: React.ReactNode;
  /** Supporting copy (shown in the card layout). */
  description?: React.ReactNode;
  /** Input placeholder. @default "you@example.com" */
  placeholder?: string;
  /** Subscribe button label. @default "Subscribe" */
  submitLabel?: React.ReactNode;
  /** Current status. Drives the success/error message. @default "idle" */
  status?: NewsletterStatus;
  /** Message shown when status is "success". */
  successMessage?: React.ReactNode;
  /** Message shown when status is "error". */
  errorMessage?: React.ReactNode;
  /** Disables the input + button while submitting. */
  loading?: boolean;
  /** Called with the entered email on submit. */
  onSubmit?: (email: string) => void;
}

/**
 * NewsletterSignup — inline email + subscribe button with success/error states.
 * Supports a compact inline layout and a richer card layout.
 */
export const NewsletterSignup = forwardRef<
  HTMLFormElement,
  NewsletterSignupProps
>(function NewsletterSignup(
  {
    layout = "compact",
    title = "Stay in the loop",
    description,
    placeholder = "you@example.com",
    submitLabel = "Subscribe",
    status = "idle",
    successMessage = "Thanks! Check your inbox to confirm.",
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

  return (
    <form
      ref={ref}
      className={cn(
        "nova-newsletter",
        `nova-newsletter--${layout}`,
        className,
      )}
      onSubmit={handleSubmit}
      noValidate
      aria-busy={loading || undefined}
      {...rest}
    >
      {layout === "card" && (title || description) && (
        <div className="nova-newsletter__intro">
          {title && <h3 className="nova-newsletter__title">{title}</h3>}
          {description && (
            <p className="nova-newsletter__description">{description}</p>
          )}
        </div>
      )}

      <div className="nova-newsletter__row">
        <label className="nova-newsletter__visually-hidden" htmlFor={emailId}>
          Email address
        </label>
        <input
          id={emailId}
          className="nova-newsletter__input"
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
          className="nova-newsletter__button"
          disabled={loading || status === "success"}
          aria-disabled={loading || undefined}
        >
          {loading ? "Subscribing…" : submitLabel}
        </button>
      </div>

      {status === "success" && (
        <p
          id={msgId}
          className="nova-newsletter__message nova-newsletter__message--success"
          role="status"
        >
          {successMessage}
        </p>
      )}
      {status === "error" && (
        <p
          id={msgId}
          className="nova-newsletter__message nova-newsletter__message--error"
          role="alert"
        >
          {errorMessage}
        </p>
      )}
    </form>
  );
});
