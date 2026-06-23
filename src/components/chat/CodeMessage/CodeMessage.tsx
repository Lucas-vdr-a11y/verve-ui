import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { cn } from "../../../utils/cn";
import "./CodeMessage.css";

export interface CodeMessageProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** The code to display. */
  code: string;
  /** Language label shown in the header, e.g. "python". */
  language?: string;
  /** Show the copy button. Defaults to `true`. */
  copyable?: boolean;
  /** Wrap long lines instead of horizontal scroll. Defaults to `false`. */
  wrap?: boolean;
  /** Accessible label for the copy button. Defaults to `"Copy code"`. */
  copyLabel?: string;
}

const CopyIcon = () => (
  <svg viewBox="0 0 16 16" width="1em" height="1em" aria-hidden="true" focusable="false">
    <rect x="5" y="5" width="8" height="8" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
    <path d="M11 5V4a1.5 1.5 0 0 0-1.5-1.5H4A1.5 1.5 0 0 0 2.5 4v5.5A1.5 1.5 0 0 0 4 11h1" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 16 16" width="1em" height="1em" aria-hidden="true" focusable="false">
    <path d="M3.5 8.5l3 3 6-6.5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const CodeMessage = forwardRef<HTMLDivElement, CodeMessageProps>(
  function CodeMessage(
    {
      code,
      language,
      copyable = true,
      wrap = false,
      copyLabel = "Copy code",
      className,
      ...rest
    },
    ref
  ) {
    const [copied, setCopied] = useState(false);
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
      return () => {
        if (timer.current) clearTimeout(timer.current);
      };
    }, []);

    const handleCopy = useCallback(() => {
      if (typeof navigator === "undefined" || !navigator.clipboard) return;
      navigator.clipboard.writeText(code).then(
        () => {
          setCopied(true);
          if (timer.current) clearTimeout(timer.current);
          timer.current = setTimeout(() => setCopied(false), 2000);
        },
        () => {
          /* clipboard rejected — leave state unchanged */
        }
      );
    }, [code]);

    return (
      <div
        ref={ref}
        className={cn(
          "nova-code-message",
          wrap && "nova-code-message--wrap",
          className
        )}
        {...rest}
      >
        <div className="nova-code-message__header">
          <span className="nova-code-message__language">
            {language ?? "code"}
          </span>
          {copyable && (
            <button
              type="button"
              className="nova-code-message__copy nova-focusable"
              onClick={handleCopy}
              aria-label={copied ? "Copied" : copyLabel}
            >
              <span className="nova-code-message__copy-icon" aria-hidden="true">
                {copied ? <CheckIcon /> : <CopyIcon />}
              </span>
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
          )}
        </div>
        <pre className="nova-code-message__pre">
          <code className="nova-code-message__code">{code}</code>
        </pre>
      </div>
    );
  }
);
