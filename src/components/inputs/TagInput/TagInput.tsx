import { forwardRef, useRef, useState } from "react";
import { cn } from "../../../utils/cn";
import "./TagInput.css";

export type TagInputSize = "sm" | "md" | "lg";

export interface TagInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "size" | "value" | "onChange" | "defaultValue"
  > {
  /** Controlled list of tags. */
  value?: string[];
  /** Uncontrolled initial tags. */
  defaultValue?: string[];
  /** Called with the new list whenever tags are added or removed. */
  onChange?: (tags: string[]) => void;
  /** Size on the sm/md/lg scale. Defaults to `"md"`. */
  size?: TagInputSize;
  /** Marks the field as invalid. */
  invalid?: boolean;
  /** Maximum number of tags allowed. */
  max?: number;
  /** Reject duplicate tags (case-insensitive). Defaults to `true`. */
  dedupe?: boolean;
  /**
   * Validate a candidate tag before it is added. Return `false` to reject.
   * Receives the trimmed value.
   */
  validate?: (tag: string) => boolean;
  /**
   * Keys (besides Enter) that commit the current text as a tag.
   * Defaults to `[","]`.
   */
  addOnKeys?: string[];
  /** Placeholder for the text field (only when below `max`). */
  placeholder?: string;
}

export const TagInput = forwardRef<HTMLInputElement, TagInputProps>(
  function TagInput(
    {
      value,
      defaultValue,
      onChange,
      size = "md",
      invalid = false,
      max,
      dedupe = true,
      validate,
      addOnKeys = [","],
      placeholder,
      disabled,
      className,
      onKeyDown,
      ...rest
    },
    ref
  ) {
    const isControlled = value !== undefined;
    const [internal, setInternal] = useState<string[]>(defaultValue ?? []);
    const tags = isControlled ? value : internal;

    const [draft, setDraft] = useState("");
    const innerRef = useRef<HTMLInputElement | null>(null);

    const setTags = (next: string[]) => {
      if (!isControlled) setInternal(next);
      onChange?.(next);
    };

    const atMax = max != null && tags.length >= max;

    const addTag = (raw: string) => {
      const tag = raw.trim();
      if (!tag) return;
      if (atMax) return;
      if (
        dedupe &&
        tags.some((t) => t.toLowerCase() === tag.toLowerCase())
      ) {
        return;
      }
      if (validate && !validate(tag)) return;
      setTags([...tags, tag]);
      setDraft("");
    };

    const removeAt = (index: number) => {
      setTags(tags.filter((_, i) => i !== index));
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      onKeyDown?.(e);
      if (e.defaultPrevented) return;
      if (e.key === "Enter" || addOnKeys.includes(e.key)) {
        if (draft.trim()) {
          e.preventDefault();
          addTag(draft);
        }
      } else if (
        e.key === "Backspace" &&
        draft === "" &&
        tags.length > 0
      ) {
        e.preventDefault();
        removeAt(tags.length - 1);
      }
    };

    return (
      <div
        className={cn(
          "nova-taginput",
          `nova-taginput--${size}`,
          invalid && "nova-taginput--invalid",
          disabled && "nova-taginput--disabled",
          className
        )}
        data-disabled={disabled || undefined}
        onMouseDown={(e) => {
          // Clicking empty chrome focuses the field without stealing focus
          // from a chip's remove button.
          if (e.target === e.currentTarget) {
            e.preventDefault();
            innerRef.current?.focus();
          }
        }}
      >
        <ul className="nova-taginput__tags" role="list">
          {tags.map((tag, index) => (
            <li key={`${tag}-${index}`} className="nova-taginput__tag">
              <span className="nova-taginput__tag-label">{tag}</span>
              {!disabled && (
                <button
                  type="button"
                  className="nova-taginput__remove nova-focusable"
                  aria-label={`Remove ${tag}`}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => removeAt(index)}
                >
                  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path
                      d="M4 4l8 8M12 4l-8 8"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              )}
            </li>
          ))}
          <li className="nova-taginput__field-wrap">
            <input
              {...rest}
              ref={(node) => {
                innerRef.current = node;
                if (typeof ref === "function") ref(node);
                else if (ref) ref.current = node;
              }}
              className="nova-taginput__field nova-focusable"
              value={draft}
              disabled={disabled || atMax}
              placeholder={atMax ? undefined : placeholder}
              aria-invalid={invalid || undefined}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={(e) => {
                rest.onBlur?.(e);
                if (draft.trim()) addTag(draft);
              }}
              onKeyDown={handleKeyDown}
            />
          </li>
        </ul>
      </div>
    );
  }
);
