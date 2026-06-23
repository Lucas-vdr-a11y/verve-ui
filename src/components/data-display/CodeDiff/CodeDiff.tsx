import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./CodeDiff.css";

export type DiffLineType = "add" | "del" | "ctx";

export interface DiffLine {
  /** Line state: added, deleted, or unchanged context. */
  type: DiffLineType;
  /** The text content of the line. */
  text: string;
  /** Line number in the old file (absent for added lines). */
  oldLine?: number;
  /** Line number in the new file (absent for deleted lines). */
  newLine?: number;
}

export interface CodeDiffProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** Pre-parsed diff lines. Provide this OR `oldText` + `newText`. */
  lines?: DiffLine[];
  /** Original text — diffed against `newText` with a simple LCS line diff. */
  oldText?: string;
  /** New text — diffed against `oldText`. */
  newText?: string;
  /** Layout: a single unified column or two side-by-side columns. */
  view?: "unified" | "split";
  /** Show line-number gutters. Defaults to `true`. */
  showLineNumbers?: boolean;
  /** Optional filename header. */
  filename?: React.ReactNode;
  /** Wrap long lines instead of scrolling. Defaults to `false`. */
  wrap?: boolean;
}

/** Longest-common-subsequence line diff. Small + dependency-free. */
function diffLines(oldText: string, newText: string): DiffLine[] {
  const a = oldText.replace(/\n$/, "").split("\n");
  const b = newText.replace(/\n$/, "").split("\n");
  const n = a.length;
  const m = b.length;

  // lcs[i][j] = LCS length of a[i:] and b[j:]
  const lcs: number[][] = Array.from({ length: n + 1 }, () =>
    new Array<number>(m + 1).fill(0)
  );
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      lcs[i][j] =
        a[i] === b[j]
          ? lcs[i + 1][j + 1] + 1
          : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
    }
  }

  const out: DiffLine[] = [];
  let i = 0;
  let j = 0;
  let oldNo = 1;
  let newNo = 1;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      out.push({ type: "ctx", text: a[i], oldLine: oldNo++, newLine: newNo++ });
      i++;
      j++;
    } else if (lcs[i + 1][j] >= lcs[i][j + 1]) {
      out.push({ type: "del", text: a[i], oldLine: oldNo++ });
      i++;
    } else {
      out.push({ type: "add", text: b[j], newLine: newNo++ });
      j++;
    }
  }
  while (i < n) out.push({ type: "del", text: a[i++], oldLine: oldNo++ });
  while (j < m) out.push({ type: "add", text: b[j++], newLine: newNo++ });
  return out;
}

const GUTTER_SIGN: Record<DiffLineType, string> = {
  add: "+",
  del: "-",
  ctx: " ",
};

function UnifiedRow({
  line,
  showLineNumbers,
}: {
  line: DiffLine;
  showLineNumbers: boolean;
}) {
  return (
    <tr className={cn("nova-code-diff__row", `nova-code-diff__row--${line.type}`)}>
      {showLineNumbers && (
        <>
          <td className="nova-code-diff__num" aria-hidden="true">
            {line.oldLine ?? ""}
          </td>
          <td className="nova-code-diff__num" aria-hidden="true">
            {line.newLine ?? ""}
          </td>
        </>
      )}
      <td className="nova-code-diff__sign" aria-hidden="true">
        {GUTTER_SIGN[line.type]}
      </td>
      <td className="nova-code-diff__code">{line.text || " "}</td>
    </tr>
  );
}

/** Pair up del/add runs into aligned rows for split view. */
function pairForSplit(
  lines: DiffLine[]
): Array<{ left?: DiffLine; right?: DiffLine }> {
  const rows: Array<{ left?: DiffLine; right?: DiffLine }> = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.type === "ctx") {
      rows.push({ left: line, right: line });
      i++;
      continue;
    }
    // collect a run of dels then adds
    const dels: DiffLine[] = [];
    const adds: DiffLine[] = [];
    while (i < lines.length && lines[i].type === "del") dels.push(lines[i++]);
    while (i < lines.length && lines[i].type === "add") adds.push(lines[i++]);
    const max = Math.max(dels.length, adds.length);
    for (let k = 0; k < max; k++) {
      rows.push({ left: dels[k], right: adds[k] });
    }
  }
  return rows;
}

function SplitSide({
  line,
  side,
  showLineNumbers,
}: {
  line?: DiffLine;
  side: "old" | "new";
  showLineNumbers: boolean;
}) {
  const type = line?.type ?? "ctx";
  const empty = !line;
  return (
    <>
      {showLineNumbers && (
        <td className="nova-code-diff__num" aria-hidden="true">
          {(side === "old" ? line?.oldLine : line?.newLine) ?? ""}
        </td>
      )}
      <td
        className={cn(
          "nova-code-diff__code",
          `nova-code-diff__code--${type}`,
          empty && "nova-code-diff__code--empty"
        )}
      >
        {empty ? " " : line!.text || " "}
      </td>
    </>
  );
}

/**
 * CodeDiff — unified or split diff view with line numbers, +/- gutter and
 * token-tinted add/del backgrounds. Pass pre-parsed `lines`, or `oldText` +
 * `newText` for a built-in LCS line diff.
 */
export const CodeDiff = forwardRef<HTMLDivElement, CodeDiffProps>(
  function CodeDiff(
    {
      lines,
      oldText,
      newText,
      view = "unified",
      showLineNumbers = true,
      filename,
      wrap = false,
      className,
      ...rest
    },
    ref
  ) {
    const resolved: DiffLine[] =
      lines ??
      (oldText != null || newText != null
        ? diffLines(oldText ?? "", newText ?? "")
        : []);

    const splitRows = view === "split" ? pairForSplit(resolved) : [];

    return (
      <div
        ref={ref}
        className={cn(
          "nova-code-diff",
          `nova-code-diff--${view}`,
          wrap && "nova-code-diff--wrap",
          className
        )}
        {...rest}
      >
        {filename != null && (
          <div className="nova-code-diff__header">{filename}</div>
        )}
        <div className="nova-code-diff__scroll">
          <table className="nova-code-diff__table">
            <tbody>
              {view === "unified"
                ? resolved.map((line, idx) => (
                    <UnifiedRow
                      key={idx}
                      line={line}
                      showLineNumbers={showLineNumbers}
                    />
                  ))
                : splitRows.map((row, idx) => (
                    <tr key={idx} className="nova-code-diff__row">
                      <SplitSide
                        line={row.left}
                        side="old"
                        showLineNumbers={showLineNumbers}
                      />
                      <SplitSide
                        line={row.right}
                        side="new"
                        showLineNumbers={showLineNumbers}
                      />
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
);
