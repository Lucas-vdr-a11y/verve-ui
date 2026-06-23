import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { cn } from "../../../utils/cn";
import "./ChatInput.css";

export interface ChatInputProps
  extends Omit<
    React.HTMLAttributes<HTMLDivElement>,
    "onChange" | "onSubmit" | "defaultValue"
  > {
  /** Controlled value. */
  value?: string;
  /** Initial value for uncontrolled use. */
  defaultValue?: string;
  /** Fires on every keystroke (controlled or not). */
  onChange?: (value: string) => void;
  /** Fires when the user submits a non-empty message. */
  onSend?: (text: string) => void;
  /** Placeholder text. Defaults to `"Send a message…"`. */
  placeholder?: string;
  /** Disable the whole input. */
  disabled?: boolean;
  /** Streaming / awaiting response — disables send + shows a busy affordance. */
  loading?: boolean;
  /** Max characters; shows a counter and enforces the limit. */
  maxLength?: number;
  /** Show the character counter (auto-on when `maxLength` is set). */
  showCount?: boolean;
  /** Attach-button slot handler. When provided, an attach button is shown. */
  onAttach?: () => void;
  /** Accessible label for the textarea. Defaults to `"Message"`. */
  label?: string;
  /** Label for the send button. Defaults to `"Send message"`. */
  sendLabel?: string;
  /** Label for the attach button. Defaults to `"Attach file"`. */
  attachLabel?: string;
}

const SendIcon = () => (
  <svg viewBox="0 0 20 20" width="1em" height="1em" aria-hidden="true" focusable="false">
    <path d="M3 10l14-6-6 14-2.5-5.5L3 10z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
  </svg>
);

const AttachIcon = () => (
  <svg viewBox="0 0 20 20" width="1em" height="1em" aria-hidden="true" focusable="false">
    <path d="M13.5 6.5l-6 6a2.5 2.5 0 0 0 3.5 3.5l6-6a4 4 0 0 0-5.7-5.7l-6 6a5.5 5.5 0 0 0 0 0" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Spinner = () => (
  <svg viewBox="0 0 20 20" width="1em" height="1em" aria-hidden="true" focusable="false" className="nova-chat-input__spinner">
    <circle cx="10" cy="10" r="7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="33" strokeDashoffset="10" />
  </svg>
);

export const ChatInput = forwardRef<HTMLTextAreaElement, ChatInputProps>(
  function ChatInput(
    {
      value: controlledValue,
      defaultValue,
      onChange,
      onSend,
      placeholder = "Send a message…",
      disabled = false,
      loading = false,
      maxLength,
      showCount,
      onAttach,
      label = "Message",
      sendLabel = "Send message",
      attachLabel = "Attach file",
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
    const canSend = trimmed.length > 0 && !disabled && !loading;

    const submit = useCallback(() => {
      if (!canSend) return;
      onSend?.(trimmed);
      if (!isControlled) setUncontrolled("");
    }, [canSend, onSend, trimmed, isControlled]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setValue(e.target.value);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
        e.preventDefault();
        submit();
      }
    };

    const counterOn = showCount ?? maxLength != null;
    const overLimit = maxLength != null && value.length > maxLength;

    return (
      <div
        className={cn(
          "nova-chat-input",
          disabled && "nova-chat-input--disabled",
          loading && "nova-chat-input--loading",
          className
        )}
        {...rest}
      >
        <div className="nova-chat-input__row">
          {onAttach && (
            <button
              type="button"
              className="nova-chat-input__icon-btn nova-focusable"
              onClick={onAttach}
              disabled={disabled}
              aria-label={attachLabel}
            >
              <AttachIcon />
            </button>
          )}

          <textarea
            ref={setRef}
            className="nova-chat-input__textarea"
            rows={1}
            value={value}
            placeholder={placeholder}
            disabled={disabled}
            maxLength={maxLength}
            aria-label={label}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
          />

          <button
            type="button"
            className="nova-chat-input__send nova-focusable"
            onClick={submit}
            disabled={!canSend}
            aria-label={sendLabel}
          >
            {loading ? <Spinner /> : <SendIcon />}
          </button>
        </div>

        {counterOn && (
          <div className="nova-chat-input__meta">
            <span
              className={cn(
                "nova-chat-input__count",
                overLimit && "nova-chat-input__count--over"
              )}
            >
              {value.length}
              {maxLength != null ? ` / ${maxLength}` : ""}
            </span>
          </div>
        )}
      </div>
    );
  }
);
