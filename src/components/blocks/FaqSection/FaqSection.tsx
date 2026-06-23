import { forwardRef, useId, useState } from "react";
import { cn } from "../../../utils/cn";
import "./FaqSection.css";

export interface FaqItem {
  /** The question. */
  question: React.ReactNode;
  /** The answer, revealed when the item is expanded. */
  answer: React.ReactNode;
}

export interface FaqSectionProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  /** Section heading. */
  title?: React.ReactNode;
  /** Supporting subtitle. */
  subtitle?: React.ReactNode;
  /** Question/answer pairs. */
  items: FaqItem[];
  /** Allow multiple items open at once. @default false */
  allowMultiple?: boolean;
  /** Indices open on first render. */
  defaultOpen?: number[];
}

const ChevronIcon = () => (
  <svg
    viewBox="0 0 16 16"
    width="1em"
    height="1em"
    aria-hidden="true"
    focusable="false"
  >
    <path
      d="m4 6 4 4 4-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * FaqSection — a heading/subtitle plus a self-contained accordion of Q&A.
 * Single-open by default; set `allowMultiple` to keep several panels open.
 */
export const FaqSection = forwardRef<HTMLElement, FaqSectionProps>(
  function FaqSection(
    {
      title = "Frequently asked questions",
      subtitle,
      items,
      allowMultiple = false,
      defaultOpen = [],
      className,
      ...rest
    },
    ref,
  ) {
    const uid = useId();
    const [open, setOpen] = useState<number[]>(() => defaultOpen);

    const toggle = (index: number) => {
      setOpen((prev) => {
        const isOpen = prev.includes(index);
        if (allowMultiple) {
          return isOpen ? prev.filter((i) => i !== index) : [...prev, index];
        }
        return isOpen ? [] : [index];
      });
    };

    return (
      <section
        ref={ref}
        className={cn("nova-faq", className)}
        {...rest}
      >
        {(title || subtitle) && (
          <header className="nova-faq__header">
            {title && <h2 className="nova-faq__title">{title}</h2>}
            {subtitle && <p className="nova-faq__subtitle">{subtitle}</p>}
          </header>
        )}

        <div className="nova-faq__list">
          {items.map((item, i) => {
            const isOpen = open.includes(i);
            const btnId = `${uid}-q-${i}`;
            const panelId = `${uid}-a-${i}`;
            return (
              <div
                key={i}
                className={cn(
                  "nova-faq__item",
                  isOpen && "nova-faq__item--open",
                )}
              >
                <h3 className="nova-faq__question-heading">
                  <button
                    type="button"
                    id={btnId}
                    className="nova-faq__question"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => toggle(i)}
                  >
                    <span className="nova-faq__question-text">
                      {item.question}
                    </span>
                    <span className="nova-faq__icon" aria-hidden="true">
                      <ChevronIcon />
                    </span>
                  </button>
                </h3>
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={btnId}
                  className="nova-faq__panel"
                  hidden={!isOpen}
                >
                  <div className="nova-faq__answer">{item.answer}</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    );
  },
);
