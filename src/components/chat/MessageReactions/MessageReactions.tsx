import { forwardRef, useEffect, useRef, useState } from "react";
import { cn } from "../../../utils/cn";
import "./MessageReactions.css";

export interface Reaction {
  /** The emoji glyph, e.g. "👍". */
  emoji: string;
  /** How many people reacted with it. */
  count: number;
  /** Whether the current user has reacted. */
  reacted?: boolean;
}

export interface MessageReactionsProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onToggle"> {
  /** The reactions to display. */
  reactions?: Reaction[];
  /** Fires when a reaction pill or picker emoji is toggled. */
  onToggle?: (emoji: string) => void;
  /** Emojis offered in the add-reaction picker. */
  pickerEmojis?: string[];
  /** Show the add-reaction button + picker. Defaults to `true`. */
  allowAdd?: boolean;
  /** Accessible label for the add-reaction button. */
  addLabel?: string;
}

const DEFAULT_PICKER = ["👍", "❤️", "😂", "🎉", "😮", "😢", "🙏", "🔥"];

const AddIcon = () => (
  <svg viewBox="0 0 20 20" width="1em" height="1em" aria-hidden="true" focusable="false">
    <circle cx="9" cy="9" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
    <path d="M9 6.5v5M6.5 9h5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    <path d="M14.5 13.5v3M13 15h3" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

export const MessageReactions = forwardRef<HTMLDivElement, MessageReactionsProps>(
  function MessageReactions(
    {
      reactions = [],
      onToggle,
      pickerEmojis = DEFAULT_PICKER,
      allowAdd = true,
      addLabel = "Add reaction",
      className,
      ...rest
    },
    ref
  ) {
    const [pickerOpen, setPickerOpen] = useState(false);
    const wrapRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
      if (!pickerOpen || typeof document === "undefined") return;

      const onDocClick = (e: MouseEvent) => {
        if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
          setPickerOpen(false);
        }
      };
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") setPickerOpen(false);
      };

      document.addEventListener("mousedown", onDocClick);
      document.addEventListener("keydown", onKey);
      return () => {
        document.removeEventListener("mousedown", onDocClick);
        document.removeEventListener("keydown", onKey);
      };
    }, [pickerOpen]);

    const handlePick = (emoji: string) => {
      onToggle?.(emoji);
      setPickerOpen(false);
    };

    return (
      <div
        ref={ref}
        className={cn("nova-message-reactions", className)}
        {...rest}
      >
        {reactions.map((r) => (
          <button
            key={r.emoji}
            type="button"
            className={cn(
              "nova-message-reactions__pill nova-focusable",
              r.reacted && "nova-message-reactions__pill--reacted"
            )}
            aria-pressed={!!r.reacted}
            onClick={() => onToggle?.(r.emoji)}
          >
            <span className="nova-message-reactions__emoji" aria-hidden="true">
              {r.emoji}
            </span>
            <span className="nova-message-reactions__count">{r.count}</span>
          </button>
        ))}

        {allowAdd && (
          <div className="nova-message-reactions__add" ref={wrapRef}>
            <button
              type="button"
              className="nova-message-reactions__add-btn nova-focusable"
              aria-label={addLabel}
              aria-haspopup="menu"
              aria-expanded={pickerOpen}
              onClick={() => setPickerOpen((o) => !o)}
            >
              <AddIcon />
            </button>

            {pickerOpen && (
              <div
                className="nova-message-reactions__picker"
                role="menu"
                aria-label={addLabel}
              >
                {pickerEmojis.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    role="menuitem"
                    className="nova-message-reactions__picker-item nova-focusable"
                    onClick={() => handlePick(emoji)}
                  >
                    <span aria-hidden="true">{emoji}</span>
                    <span className="nova-message-reactions__sr-only">{emoji}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
);
