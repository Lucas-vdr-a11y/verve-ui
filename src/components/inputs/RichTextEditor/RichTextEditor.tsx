import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { cn } from "../../../utils/cn";
import "./RichTextEditor.css";

export type RichTextCommand =
  | "bold"
  | "italic"
  | "underline"
  | "strikeThrough"
  | "h1"
  | "h2"
  | "insertUnorderedList"
  | "insertOrderedList"
  | "createLink"
  | "removeFormat";

export interface RichTextEditorProps
  extends Omit<
    React.HTMLAttributes<HTMLDivElement>,
    "onChange" | "defaultValue"
  > {
  /** Controlled HTML value. */
  value?: string;
  /** Initial HTML for uncontrolled usage. */
  defaultValue?: string;
  /** Fired with the current HTML string whenever the content changes. */
  onChange?: (html: string) => void;
  /** Placeholder shown when the editor is empty. */
  placeholder?: string;
  /** Disables editing and the toolbar. */
  disabled?: boolean;
}

/** True once running in the browser (avoids SSR document access). */
const canUseDOM =
  typeof window !== "undefined" && typeof document !== "undefined";

interface ToolbarItem {
  command: RichTextCommand;
  label: string;
  /** execCommand name + optional value, or a custom handler. */
  exec?: string;
  block?: string;
  glyph: React.ReactNode;
  /** Command name passed to queryCommandState for aria-pressed. */
  stateQuery?: string;
}

const TOOLBAR: ToolbarItem[] = [
  { command: "bold", label: "Bold", exec: "bold", stateQuery: "bold", glyph: <strong>B</strong> },
  { command: "italic", label: "Italic", exec: "italic", stateQuery: "italic", glyph: <em>I</em> },
  {
    command: "underline",
    label: "Underline",
    exec: "underline",
    stateQuery: "underline",
    glyph: <span style={{ textDecoration: "underline" }}>U</span>,
  },
  {
    command: "strikeThrough",
    label: "Strikethrough",
    exec: "strikeThrough",
    stateQuery: "strikeThrough",
    glyph: <span style={{ textDecoration: "line-through" }}>S</span>,
  },
  { command: "h1", label: "Heading 1", block: "H1", glyph: "H1" },
  { command: "h2", label: "Heading 2", block: "H2", glyph: "H2" },
  {
    command: "insertUnorderedList",
    label: "Bullet list",
    exec: "insertUnorderedList",
    stateQuery: "insertUnorderedList",
    glyph: "•",
  },
  {
    command: "insertOrderedList",
    label: "Numbered list",
    exec: "insertOrderedList",
    stateQuery: "insertOrderedList",
    glyph: "1.",
  },
  { command: "createLink", label: "Insert link", glyph: "🔗" },
  { command: "removeFormat", label: "Clear formatting", glyph: "⌫" },
];

export const RichTextEditor = forwardRef<HTMLDivElement, RichTextEditorProps>(
  function RichTextEditor(
    {
      value,
      defaultValue = "",
      onChange,
      placeholder = "Write something…",
      disabled = false,
      className,
      ...rest
    },
    ref
  ) {
    const editorRef = useRef<HTMLDivElement | null>(null);
    const isControlled = value !== undefined;
    const [active, setActive] = useState<Record<string, boolean>>({});
    const [isEmpty, setIsEmpty] = useState(true);

    // Sync controlled value into the DOM without clobbering the caret.
    useEffect(() => {
      const el = editorRef.current;
      if (!el) return;
      const next = isControlled ? (value ?? "") : defaultValue;
      if (el.innerHTML !== next) el.innerHTML = next;
      setIsEmpty(el.textContent?.length ? false : el.children.length === 0);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    // Seed uncontrolled default once on mount.
    useEffect(() => {
      const el = editorRef.current;
      if (!el) return;
      if (!isControlled && defaultValue && el.innerHTML === "") {
        el.innerHTML = defaultValue;
      }
      setIsEmpty(!(el.textContent && el.textContent.length > 0));
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const refreshState = useCallback(() => {
      if (!canUseDOM) return;
      const next: Record<string, boolean> = {};
      for (const item of TOOLBAR) {
        if (item.stateQuery) {
          try {
            next[item.command] = document.queryCommandState(item.stateQuery);
          } catch {
            next[item.command] = false;
          }
        }
      }
      setActive(next);
    }, []);

    // Track selection state so aria-pressed reflects the caret context.
    useEffect(() => {
      if (!canUseDOM) return;
      const handler = () => {
        const el = editorRef.current;
        const sel = document.getSelection();
        if (!el || !sel || !sel.anchorNode) return;
        if (el.contains(sel.anchorNode)) refreshState();
      };
      document.addEventListener("selectionchange", handler);
      return () => document.removeEventListener("selectionchange", handler);
    }, [refreshState]);

    const emitChange = useCallback(() => {
      const el = editorRef.current;
      if (!el) return;
      setIsEmpty(!(el.textContent && el.textContent.length > 0));
      onChange?.(el.innerHTML);
    }, [onChange]);

    const focusEditor = useCallback(() => {
      editorRef.current?.focus();
    }, []);

    const runCommand = useCallback(
      (item: ToolbarItem) => {
        if (disabled || !canUseDOM) return;
        focusEditor();

        if (item.block) {
          // Toggle heading: if already that block, revert to paragraph.
          let current = "";
          try {
            current = document.queryCommandValue("formatBlock");
          } catch {
            current = "";
          }
          const target =
            current.toUpperCase() === item.block ? "P" : item.block;
          try {
            document.execCommand("formatBlock", false, target);
          } catch {
            /* no-op */
          }
        } else if (item.command === "createLink") {
          const url =
            typeof window !== "undefined"
              ? window.prompt("Link URL", "https://")
              : null;
          if (url) {
            try {
              document.execCommand("createLink", false, url);
            } catch {
              /* no-op */
            }
          }
        } else if (item.exec) {
          try {
            document.execCommand(item.exec, false);
          } catch {
            /* no-op */
          }
        }

        refreshState();
        emitChange();
      },
      [disabled, emitChange, focusEditor, refreshState]
    );

    return (
      <div
        ref={ref}
        className={cn(
          "nova-rte",
          disabled && "nova-rte--disabled",
          className
        )}
        data-disabled={disabled || undefined}
        {...rest}
      >
        <div
          className="nova-rte__toolbar"
          role="toolbar"
          aria-label="Text formatting"
          aria-disabled={disabled || undefined}
        >
          {TOOLBAR.map((item) => (
            <button
              key={item.command}
              type="button"
              className="nova-rte__tool nova-focusable"
              title={item.label}
              aria-label={item.label}
              aria-pressed={item.stateQuery ? !!active[item.command] : undefined}
              disabled={disabled}
              // Prevent the editor from losing selection on mousedown.
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => runCommand(item)}
            >
              <span aria-hidden="true">{item.glyph}</span>
            </button>
          ))}
        </div>

        <div className="nova-rte__body">
          <div
            ref={editorRef}
            className="nova-rte__content nova-focusable"
            contentEditable={!disabled}
            suppressContentEditableWarning
            role="textbox"
            aria-multiline="true"
            aria-label={placeholder}
            spellCheck
            data-empty={isEmpty || undefined}
            onInput={emitChange}
            onBlur={emitChange}
            onKeyUp={refreshState}
            onMouseUp={refreshState}
          />
          {isEmpty && (
            <span className="nova-rte__placeholder" aria-hidden="true">
              {placeholder}
            </span>
          )}
        </div>
      </div>
    );
  }
);
