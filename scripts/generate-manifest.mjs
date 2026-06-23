// Verve UI — component manifest generator.
//
// Scans src/components/<category>/<ComponentName>/<ComponentName>.tsx and emits
// a machine-readable manifest (docs/components.json) plus a grouped markdown
// index (docs/COMPONENTS.md), generated from source so the docs stay accurate.
//
// ESM, Node built-ins only (node:fs / node:path). Deterministic: the output is
// purely a function of the source tree — no timestamps (generatedAt is null).

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const COMPONENTS_DIR = path.join(ROOT, "src", "components");
const DOCS_DIR = path.join(ROOT, "docs");

/**
 * Extract the exported names from a `.tsx` source string.
 *
 * Matches, at the start of a line (allowing `export default`):
 *   export const X        export function X
 *   export interface X    export type X
 *   export class X        export default class X / function X
 * Returns a de-duplicated, source-order list of names.
 */
function extractExports(source) {
  const names = [];
  const seen = new Set();
  const re =
    /^export\s+(?:default\s+)?(?:abstract\s+)?(?:const|let|var|function\*?|interface|type|class|enum)\s+([A-Za-z_$][\w$]*)/gm;
  let m;
  while ((m = re.exec(source)) !== null) {
    const name = m[1];
    if (!seen.has(name)) {
      seen.add(name);
      names.push(name);
    }
  }
  return names;
}

/**
 * Best-effort short description: a leading top-level JSDoc block `/** ... *\/`
 * placed directly above the main component export
 * (`export const <ComponentName>` / `export function <ComponentName>`).
 * Returns the first non-empty sentence/line, or null if none found.
 */
function extractDescription(source, componentName) {
  // Locate the main export declaration line.
  const exportRe = new RegExp(
    `^export\\s+(?:default\\s+)?(?:const|function\\*?|class)\\s+${componentName}\\b`,
    "m"
  );
  const exportMatch = exportRe.exec(source);
  if (!exportMatch) return null;

  // Look at the text immediately preceding the export. It must end with a
  // closing `*/` whose JSDoc block is top-level (starts at column 0), so we do
  // not pick up indented per-prop docs from an interface above it.
  const before = source.slice(0, exportMatch.index);
  const blockRe = /^\/\*\*([\s\S]*?)\*\/\s*$/m;
  // Find the last top-level JSDoc block in `before`.
  let lastBlock = null;
  const globalBlockRe = /^\/\*\*([\s\S]*?)\*\//gm;
  let bm;
  while ((bm = globalBlockRe.exec(before)) !== null) {
    // Only accept if nothing but whitespace separates the block from the export.
    const between = before.slice(bm.index + bm[0].length);
    if (/^\s*$/.test(between)) {
      lastBlock = bm[1];
    }
  }
  if (lastBlock == null) {
    // Fallback: a simple immediately-preceding block.
    const fb = blockRe.exec(before);
    if (!fb) return null;
    lastBlock = fb[1];
  }

  // Clean the JSDoc body into a one-line description.
  const text = lastBlock
    .split("\n")
    .map((line) => line.replace(/^\s*\*?\s?/, "").trim())
    .filter((line) => line.length > 0 && !line.startsWith("@"))
    .join(" ")
    .trim();

  if (!text) return null;
  return text;
}

function isDirectory(p) {
  try {
    return fs.statSync(p).isDirectory();
  } catch {
    return false;
  }
}

function isFile(p) {
  try {
    return fs.statSync(p).isFile();
  } catch {
    return false;
  }
}

/** Scan one category directory for component folders. */
function scanCategory(categoryName) {
  const categoryDir = path.join(COMPONENTS_DIR, categoryName);
  const entries = fs
    .readdirSync(categoryDir, { withFileTypes: true })
    .filter((e) => e.isDirectory()) // skip the barrel index.ts and other files
    .map((e) => e.name)
    .sort((a, b) => a.localeCompare(b));

  const components = [];
  for (const componentName of entries) {
    const componentDir = path.join(categoryDir, componentName);
    // A component folder is one that contains <Name>/<Name>.tsx. The `utility`
    // category holds hooks authored as <Name>/<Name>.ts (no JSX), so accept
    // either extension; folders with neither are skipped as non-component.
    const tsxPath = path.join(componentDir, `${componentName}.tsx`);
    const tsPath = path.join(componentDir, `${componentName}.ts`);
    const sourcePath = isFile(tsxPath)
      ? tsxPath
      : isFile(tsPath)
        ? tsPath
        : null;
    if (!sourcePath) continue;

    const source = fs.readFileSync(sourcePath, "utf8");
    const exports = extractExports(source);
    const description = extractDescription(source, componentName);
    const hasStyles = isFile(path.join(componentDir, `${componentName}.css`));

    const component = { name: componentName, exports, hasStyles };
    if (description) component.description = description;
    components.push(component);
  }
  return components;
}

function build() {
  if (!isDirectory(COMPONENTS_DIR)) {
    throw new Error(`Components directory not found: ${COMPONENTS_DIR}`);
  }

  const categoryNames = fs
    .readdirSync(COMPONENTS_DIR, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort((a, b) => a.localeCompare(b));

  const categories = [];
  let totalComponents = 0;
  for (const name of categoryNames) {
    const components = scanCategory(name);
    if (components.length === 0) continue; // skip non-component folders
    totalComponents += components.length;
    categories.push({ name, count: components.length, components });
  }

  return {
    generatedAt: null,
    totalComponents,
    totalCategories: categories.length,
    categories,
  };
}

function renderMarkdown(manifest) {
  const lines = [];
  lines.push("# Verve UI — Components");
  lines.push("");
  lines.push(
    "> Auto-generated by `scripts/generate-manifest.mjs`. Do not edit by hand."
  );
  lines.push("");
  lines.push(
    `**${manifest.totalComponents}** components across **${manifest.totalCategories}** categories.`
  );
  lines.push("");
  lines.push("## Categories");
  lines.push("");
  for (const cat of manifest.categories) {
    lines.push(`- [${cat.name}](#${cat.name}) — ${cat.count}`);
  }
  lines.push("");

  for (const cat of manifest.categories) {
    lines.push(`## ${cat.name}`);
    lines.push("");
    lines.push(`_${cat.count} component${cat.count === 1 ? "" : "s"}._`);
    lines.push("");
    for (const c of cat.components) {
      const exportsText = c.exports.length
        ? c.exports.map((e) => `\`${e}\``).join(", ")
        : "_none_";
      let line = `- **${c.name}**`;
      if (c.description) line += ` — ${c.description}`;
      lines.push(line);
      lines.push(`  - exports: ${exportsText}`);
      lines.push(`  - styles: ${c.hasStyles ? "yes" : "no"}`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

function main() {
  const manifest = build();

  fs.mkdirSync(DOCS_DIR, { recursive: true });
  const jsonPath = path.join(DOCS_DIR, "components.json");
  const mdPath = path.join(DOCS_DIR, "COMPONENTS.md");

  fs.writeFileSync(jsonPath, JSON.stringify(manifest, null, 2) + "\n", "utf8");
  fs.writeFileSync(mdPath, renderMarkdown(manifest), "utf8");

  console.log("Verve UI manifest generated.");
  console.log(`  Components: ${manifest.totalComponents}`);
  console.log(`  Categories: ${manifest.totalCategories}`);
  console.log(`  -> ${path.relative(ROOT, jsonPath)}`);
  console.log(`  -> ${path.relative(ROOT, mdPath)}`);
}

main();
