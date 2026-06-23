import { forwardRef, useId, useState } from "react";
import { cn } from "../../../utils/cn";
import "./ContactForm.css";

export interface ContactSubmitValues {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ContactFormProps
  extends Omit<React.FormHTMLAttributes<HTMLFormElement>, "onSubmit" | "title"> {
  /** Heading shown above the fields. */
  title?: React.ReactNode;
  /** Supporting copy below the title. */
  subtitle?: React.ReactNode;
  /** Submit button label. @default "Send message" */
  submitLabel?: React.ReactNode;
  /** Whether the subject field is shown. @default true */
  showSubject?: boolean;
  /** Error message. When set, shows the error area with role="alert". */
  error?: React.ReactNode;
  /** Success message. When set, shows a success area with role="status". */
  success?: React.ReactNode;
  /** Disables controls while submitting. */
  loading?: boolean;
  /** Called with the field values on submit. */
  onSubmit?: (values: ContactSubmitValues) => void;
}

const RequiredMark = () => (
  <span className="nova-contact-form__required" aria-hidden="true">
    *
  </span>
);

/**
 * ContactForm — name, email, subject and message fields with required marks.
 * Validation-ready (native required + aria-invalid hooks).
 */
export const ContactForm = forwardRef<HTMLFormElement, ContactFormProps>(
  function ContactForm(
    {
      title = "Get in touch",
      subtitle,
      submitLabel = "Send message",
      showSubject = true,
      error,
      success,
      loading = false,
      onSubmit,
      className,
      ...rest
    },
    ref,
  ) {
    const uid = useId();
    const nameId = `${uid}-name`;
    const emailId = `${uid}-email`;
    const subjectId = `${uid}-subject`;
    const messageId = `${uid}-message`;
    const errorId = `${uid}-error`;

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (loading) return;
      onSubmit?.({ name, email, subject, message });
    };

    return (
      <form
        ref={ref}
        className={cn("nova-contact-form", className)}
        onSubmit={handleSubmit}
        noValidate
        aria-busy={loading || undefined}
        {...rest}
      >
        {(title || subtitle) && (
          <header className="nova-contact-form__header">
            {title && <h2 className="nova-contact-form__title">{title}</h2>}
            {subtitle && (
              <p className="nova-contact-form__subtitle">{subtitle}</p>
            )}
          </header>
        )}

        {error && (
          <div id={errorId} className="nova-contact-form__error" role="alert">
            {error}
          </div>
        )}
        {success && (
          <div className="nova-contact-form__success" role="status">
            {success}
          </div>
        )}

        <div className="nova-contact-form__field">
          <label className="nova-contact-form__label" htmlFor={nameId}>
            Name <RequiredMark />
          </label>
          <input
            id={nameId}
            className="nova-contact-form__input"
            type="text"
            name="name"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
            required
          />
        </div>

        <div className="nova-contact-form__field">
          <label className="nova-contact-form__label" htmlFor={emailId}>
            Email <RequiredMark />
          </label>
          <input
            id={emailId}
            className="nova-contact-form__input"
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

        {showSubject && (
          <div className="nova-contact-form__field">
            <label className="nova-contact-form__label" htmlFor={subjectId}>
              Subject
            </label>
            <input
              id={subjectId}
              className="nova-contact-form__input"
              type="text"
              name="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={loading}
            />
          </div>
        )}

        <div className="nova-contact-form__field">
          <label className="nova-contact-form__label" htmlFor={messageId}>
            Message <RequiredMark />
          </label>
          <textarea
            id={messageId}
            className="nova-contact-form__textarea"
            name="message"
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={loading}
            required
          />
        </div>

        <button
          type="submit"
          className="nova-contact-form__submit"
          disabled={loading}
          aria-disabled={loading || undefined}
        >
          {loading ? "Sending…" : submitLabel}
        </button>
      </form>
    );
  },
);
