import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { cn } from "../../../utils/cn";
import "./CodeBlock.css";

export interface CodeBlockProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** The source code to display. */
  code: string;
  /** Language label shown in the header, e.g. "tsx". */
  language?: string;
  /** Show a gutter with line numbers. Defaults to `true`. */
  showLineNumbers?: boolean;
  /** Optional filename shown in the header. */
  filename?: string;
  /** Wrap long lines instead of scrolling horizontally. Defaults to `false`. */
  wrap?: boolean;
  /** Show the copy-to-clipboard button. Defaults to `true`. */
  copyable?: boolean;
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

export const CodeBlock = forwardRef<HTMLDivElement, CodeBlockProps>(
  function CodeBlock(
    {
      code,
      language,
      showLineNumbers = true,
      filename,
      wrap = false,
      copyable = true,
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

    const lines = code.replace(/\n$/, "").split("\n");
    const hasHeader = Boolean(filename || language || copyable);

    return (
      <div
        ref={ref}
        className={cn("nova-code-block", wrap && "nova-code-block--wrap", className)}
        {...rest}
      >
        {hasHeader && (
          <div className="nova-code-block__header">
            <div className="nova-code-block__meta">
              {filename && (
                <span className="nova-code-block__filename">{filename}</span>
              )}
              {language && (
                <span className="nova-code-block__language">{language}</span>
              )}
            </div>
            {copyable && (
              <button
                type="button"
                className="nova-code-block__copy"
                onClick={handleCopy}
                aria-label={copied ? "Copied" : copyLabel}
              >
                <span className="nova-code-block__copy-icon" aria-hidden="true">
                  {copied ? <CheckIcon /> : <CopyIcon />}
                </span>
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            )}
          </div>
        )}

        <pre className="nova-code-block__pre">
          <code className="nova-code-block__code">
            {lines.map((line, i) => (
              <span className="nova-code-block__line" key={i}>
                {showLineNumbers && (
                  <span className="nova-code-block__line-no" aria-hidden="true">
                    {i + 1}
                  </span>
                )}
                <span className="nova-code-block__line-content">
                  {line === "" ? "\n" : line}
                </span>
              </span>
            ))}
          </code>
        </pre>
      </div>
    );
  }
);
