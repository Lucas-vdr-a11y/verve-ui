import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./Glossary.css";

export interface GlossaryEntry {
  /** The glossary term (rendered as a bold `<dt>`). */
  term: React.ReactNode;
  /** The definition (rendered as a `<dd>`). */
  definition: React.ReactNode;
}

export interface GlossaryProps extends React.HTMLAttributes<HTMLDListElement> {
  /** Term/definition pairs to render. */
  entries: GlossaryEntry[];
}

/**
 * A styled definition list for glossaries: each entry renders a bold term
 * (`<dt>`) above its definition (`<dd>`). Distinct from data-display's
 * DescriptionList, which is for inline key/value metadata.
 */
export const Glossary = forwardRef<HTMLDListElement, GlossaryProps>(
  function Glossary({ entries, className, ...rest }, ref) {
    return (
      <dl ref={ref} className={cn("nova-glossary", className)} {...rest}>
        {entries.map((entry, i) => (
          <div className="nova-glossary__group" key={i}>
            <dt className="nova-glossary__term">{entry.term}</dt>
            <dd className="nova-glossary__definition">{entry.definition}</dd>
          </div>
        ))}
      </dl>
    );
  }
);
