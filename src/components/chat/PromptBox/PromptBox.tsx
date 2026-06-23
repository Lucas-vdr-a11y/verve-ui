import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { cn } from "../../../utils/cn";
import "./PromptBox.css";

export interface PromptBoxProps
  extends Omit<
    React.HTMLAttributes<HTMLDivElement>,
    "onChange" | "onSubmit" | "defaultValue" | "title"
  > {
  /** Headline above the input (e.g. "What can I help with?"). */
  heading?: React.ReactNode;
  /** Secondary line under the heading. */
  subheading?: React.ReactNode;
  /** Controlled value. */
  value?: string;
  /** Initial value for uncontrolled use. */
  defaultValue?: string;
  /** Fires on every keystroke. */
  onChange?: (value: string) => void;
  /** Fires when the user submits a non-empty prompt. */
  onSubmit?: (text: string) => void;
  /** Suggestion chips rendered below the input. Clicking submits the suggestion. */
  suggestions?: string[];
  /** Called when a suggestion chip is clicked. Defaults to filling + submitting. */
  onSuggestion?: (text: string) => void;
  /** Placeholder text. */
  placeholder?: string;
  /** Disable input + send. */
  disabled?: boolean;
  /** Accessible label for the textarea. */
  label?: string;
  /** Label for the send button. */
  sendLabel?: string;
}

const SendIcon = () => (
  <svg viewBox="0 0 20 20" width="1em" height="1em" aria-hidden="true" focusable="false">
    <path d="M10 16V5M5.5 9.5L10 5l4.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const PromptBox = forwardRef<HTMLTextAreaElement, PromptBoxProps>(
  function PromptBox(
    {
      heading,
      subheading,
      value: controlledValue,
      defaultValue,
      onChange,
      onSubmit,
      suggestions,
      onSuggestion,
      placeholder = "Ask anything…",
      disabled = false,
      label = "Prompt",
      sendLabel = "Send",
      className,
      ...rest
    },
    forwardedRef
  ) {
    const isControlled = controlledValue != null;
    const [uncontrolled, setUncontrolled] = useState(defaultValue ?? "");
    const value = isControlled ? controlledValue : uncontrolled;

    const innerRef = useRef<HTMLTextAreaElement | null>(null);

    const setRef = useCallback(
      (node: HTMLTextAreaElement | null) => {
        innerRef.current = node;
        if (typeof forwardedRef === "function") forwardedRef(node);
        else if (forwardedRef) forwardedRef.current = node;
      },
      [forwardedRef]
    );

    const resize = useCallback(() => {
      const el = innerRef.current;
      if (!el) return;
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight}px`;
    }, []);

    useEffect(() => {
      resize();
    }, [resize, value]);

    const setValue = useCallback(
      (next: string) => {
        if (!isControlled) setUncontrolled(next);
        onChange?.(next);
      },
      [isControlled, onChange]
    );

    const trimmed = value.trim();
    const canSend = trimmed.length > 0 && !disabled;

    const submit = useCallback(() => {
      if (!canSend) return;
      onSubmit?.(trimmed);
      if (!isControlled) setUncontrolled("");
    }, [canSend, onSubmit, trimmed, isControlled]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
        e.preventDefault();
        submit();
      }
    };

    const handleSuggestion = (text: string) => {
      if (disabled) return;
      if (onSuggestion) {
        onSuggestion(text);
        return;
      }
      onSubmit?.(text);
    };

    return (
      <div
        className={cn(
          "nova-prompt-box",
          disabled && "nova-prompt-box--disabled",
          className
        )}
        {...rest}
      >
        {(heading != null || subheading != null) && (
          <div className="nova-prompt-box__intro">
            {heading != null && (
              <h2 className="nova-prompt-box__heading">{heading}</h2>
            )}
            {subheading != null && (
              <p className="nova-prompt-box__subheading">{subheading}</p>
            )}
          </div>
        )}

        <div className="nova-prompt-box__field">
          <textarea
            ref={setRef}
            className="nova-prompt-box__textarea"
            rows={1}
            value={value}
            placeholder={placeholder}
            disabled={disabled}
            aria-label={label}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            type="button"
            className="nova-prompt-box__send nova-focusable"
            onClick={submit}
            disabled={!canSend}
            aria-label={sendLabel}
          >
            <SendIcon />
          </button>
        </div>

        {suggestions && suggestions.length > 0 && (
          <div className="nova-prompt-box__suggestions">
            {suggestions.map((s, i) => (
              <button
                key={i}
                type="button"
                className="nova-prompt-box__chip nova-focusable"
                onClick={() => handleSuggestion(s)}
                disabled={disabled}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }
);
