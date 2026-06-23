import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./ChatComposerToolbar.css";

export interface ChatComposerToolbarProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Attach handler. When set, an attach button is rendered. */
  onAttach?: () => void;
  /** Emoji handler. When set, an emoji button is rendered. */
  onEmoji?: () => void;
  /** Voice/mic handler. When set, a mic button is rendered. */
  onVoice?: () => void;
  /** Active/recording state for the mic button. */
  recording?: boolean;
  /** Disable all toolbar buttons. */
  disabled?: boolean;
  /** Slot for a model/tool selector, rendered on the trailing edge. */
  selector?: React.ReactNode;
  /** Accessible label for the toolbar. Defaults to `"Composer actions"`. */
  label?: string;
  /** Label for the attach button. */
  attachLabel?: string;
  /** Label for the emoji button. */
  emojiLabel?: string;
  /** Label for the voice button. */
  voiceLabel?: string;
}

const AttachIcon = () => (
  <svg viewBox="0 0 20 20" width="1em" height="1em" aria-hidden="true" focusable="false">
    <path d="M13.5 6.5l-6 6a2.5 2.5 0 0 0 3.5 3.5l6-6a4 4 0 0 0-5.7-5.7l-6 6a5.5 5.5 0 0 0 0 0" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const EmojiIcon = () => (
  <svg viewBox="0 0 20 20" width="1em" height="1em" aria-hidden="true" focusable="false">
    <circle cx="10" cy="10" r="7" fill="none" stroke="currentColor" strokeWidth="1.5" />
    <path d="M7.5 8h.01M12.5 8h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M7 12a3.5 3.5 0 0 0 6 0" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const MicIcon = () => (
  <svg viewBox="0 0 20 20" width="1em" height="1em" aria-hidden="true" focusable="false">
    <rect x="7.5" y="2.5" width="5" height="9" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
    <path d="M5 9.5a5 5 0 0 0 10 0M10 14.5V17M7.5 17h5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const ChatComposerToolbar = forwardRef<
  HTMLDivElement,
  ChatComposerToolbarProps
>(function ChatComposerToolbar(
  {
    onAttach,
    onEmoji,
    onVoice,
    recording = false,
    disabled = false,
    selector,
    label = "Composer actions",
    attachLabel = "Attach file",
    emojiLabel = "Insert emoji",
    voiceLabel = "Record voice message",
    className,
    children,
    ...rest
  },
  ref
) {
  return (
    <div
      ref={ref}
      role="toolbar"
      aria-label={label}
      className={cn("nova-composer-toolbar", className)}
      {...rest}
    >
      <div className="nova-composer-toolbar__group">
        {onAttach && (
          <button
            type="button"
            className="nova-composer-toolbar__btn nova-focusable"
            onClick={onAttach}
            disabled={disabled}
            aria-label={attachLabel}
          >
            <AttachIcon />
          </button>
        )}
        {onEmoji && (
          <button
            type="button"
            className="nova-composer-toolbar__btn nova-focusable"
            onClick={onEmoji}
            disabled={disabled}
            aria-label={emojiLabel}
          >
            <EmojiIcon />
          </button>
        )}
        {onVoice && (
          <button
            type="button"
            className={cn(
              "nova-composer-toolbar__btn nova-focusable",
              recording && "nova-composer-toolbar__btn--active"
            )}
            onClick={onVoice}
            disabled={disabled}
            aria-label={voiceLabel}
            aria-pressed={recording}
          >
            <MicIcon />
          </button>
        )}
        {children}
      </div>

      {selector != null && (
        <div className="nova-composer-toolbar__selector">{selector}</div>
      )}
    </div>
  );
});
