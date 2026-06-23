import {
  forwardRef,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { cn } from "../../../utils/cn";
import "./Editable.css";

export type EditableSize = "sm" | "md" | "lg";

export interface EditableProps
  extends Omit<
    React.HTMLAttributes<HTMLDivElement>,
    "onChange" | "onSubmit" | "defaultValue"
  > {
  /** Controlled value. */
  value?: string;
  /** Uncontrolled initial value. */
  defaultValue?: string;
  /** Called on every keystroke while editing. */
  onChange?: (value: string) => void;
  /** Called when the edit is committed (Enter, or blur when configured). */
  onSubmit?: (value: string) => void;
  /** Called when an edit is cancelled (Esc), with the restored value. */
  onCancel?: (value: string) => void;
  /** Size on the sm/md/lg scale. Defaults to `"md"`. */
  size?: EditableSize;
  /** Use a multi-line textarea instead of a single-line input. */
  multiline?: boolean;
  /** Text shown when the value is empty (in preview). */
  placeholder?: string;
  /** Disable editing. */
  disabled?: boolean;
  /** Marks the field as invalid. */
  invalid?: boolean;
  /** What happens when the field loses focus while editing. Defaults to `"submit"`. */
  submitOnBlur?: boolean;
  /** Start in edit mode. */
  startInEditMode?: boolean;
  /** Select all text when entering edit mode. Defaults to `true`. */
  selectAllOnEdit?: boolean;
}

export const Editable = forwardRef<HTMLDivElement, EditableProps>(
  function Editable(
    {
      value,
      defaultValue,
      onChange,
      onSubmit,
      onCancel,
      size = "md",
      multiline = false,
      placeholder = "Empty",
      disabled = false,
      invalid = false,
      submitOnBlur = true,
      startInEditMode = false,
      selectAllOnEdit = true,
      className,
      id: idProp,
      ...rest
    },
    ref
  ) {
    const isControlled = value !== undefined;
    const [internal, setInternal] = useState<string>(
      defaultValue ?? value ?? ""
    );
    const current = isControlled ? value : internal;

    const [editing, setEditing] = useState(startInEditMode);
    // Draft holds the in-progress text so cancel can restore.
    const [draft, setDraft] = useState<string>(current);

    const reactId = useId();
    const baseId = idProp ?? `nova-editable-${reactId}`;

    const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(
      null
    );

    // Focus + optionally select when entering edit mode.
    useEffect(() => {
      if (!editing) return;
      const el = inputRef.current;
      if (!el) return;
      el.focus();
      if (selectAllOnEdit) el.select();
    }, [editing, selectAllOnEdit]);

    const setValue = (next: string) => {
      if (!isControlled) setInternal(next);
      onChange?.(next);
    };

    const startEdit = () => {
      if (disabled) return;
      setDraft(current);
      setEditing(true);
    };

    const submit = () => {
      setEditing(false);
      if (!isControlled) setInternal(draft);
      onSubmit?.(draft);
    };

    const cancel = () => {
      setEditing(false);
      setDraft(current);
      onCancel?.(current);
    };

    const handleKeyDown = (
      e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
      if (e.key === "Enter" && (!multiline || (multiline && e.metaKey) || (multiline && e.ctrlKey))) {
        e.preventDefault();
        submit();
      } else if (e.key === "Escape") {
        e.preventDefault();
        cancel();
      }
    };

    const handlePreviewKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (disabled) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        startEdit();
      }
    };

    const isEmpty = current.length === 0;

    return (
      <div
        {...rest}
        ref={ref}
        className={cn(
          "nova-editable",
          `nova-editable--${size}`,
          editing && "nova-editable--editing",
          invalid && "nova-editable--invalid",
          disabled && "nova-editable--disabled",
          className
        )}
        data-disabled={disabled || undefined}
      >
        {editing ? (
          multiline ? (
            <textarea
              ref={inputRef as React.RefObject<HTMLTextAreaElement>}
              id={baseId}
              className="nova-editable__input nova-editable__textarea nova-focusable"
              value={draft}
              disabled={disabled}
              aria-invalid={invalid || undefined}
              rows={3}
              onChange={(e) => {
                setDraft(e.target.value);
                setValue(e.target.value);
              }}
              onKeyDown={handleKeyDown}
              onBlur={() => (submitOnBlur ? submit() : cancel())}
            />
          ) : (
            <input
              ref={inputRef as React.RefObject<HTMLInputElement>}
              id={baseId}
              className="nova-editable__input nova-focusable"
              value={draft}
              disabled={disabled}
              aria-invalid={invalid || undefined}
              onChange={(e) => {
                setDraft(e.target.value);
                setValue(e.target.value);
              }}
              onKeyDown={handleKeyDown}
              onBlur={() => (submitOnBlur ? submit() : cancel())}
            />
          )
        ) : (
          <div
            id={baseId}
            className={cn(
              "nova-editable__preview nova-focusable",
              isEmpty && "nova-editable__preview--empty"
            )}
            role="button"
            tabIndex={disabled ? -1 : 0}
            aria-disabled={disabled || undefined}
            aria-label={isEmpty ? placeholder : undefined}
            onClick={startEdit}
            onKeyDown={handlePreviewKeyDown}
          >
            {isEmpty ? placeholder : current}
          </div>
        )}
      </div>
    );
  }
);
