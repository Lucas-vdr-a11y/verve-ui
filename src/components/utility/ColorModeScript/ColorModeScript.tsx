export interface ColorModeScriptProps {
  /**
   * localStorage key the stored preference is read from. Must match the
   * `<ThemeProvider storageKey>`. Defaults to `"nova-theme"`.
   */
  storageKey?: string;
  /**
   * Theme used when nothing is stored. `"system"` follows
   * `prefers-color-scheme`. Defaults to `"system"`.
   */
  defaultTheme?: "light" | "dark" | "system";
  /**
   * Attribute set on the target element. Defaults to `"data-theme"`.
   */
  attribute?: string;
  /**
   * CSS selector for the element the attribute is applied to. Defaults to
   * `"html"` (the document root).
   */
  selector?: string;
  /** Optional nonce for CSP-restricted environments. */
  nonce?: string;
}

function buildScript(
  storageKey: string,
  defaultTheme: "light" | "dark" | "system",
  attribute: string,
  selector: string
): string {
  // Runs synchronously before paint to set the theme attribute and avoid a
  // flash of the wrong theme (FOUC). Kept terse and dependency-free; wrapped in
  // try/catch so a storage failure can never break the page.
  return `(function(){try{var d=document.querySelector(${JSON.stringify(
    selector
  )})||document.documentElement;var k=${JSON.stringify(
    storageKey
  )};var s=null;try{s=localStorage.getItem(k);}catch(e){}var t=s;if(t!=="light"&&t!=="dark"&&t!=="system"){t=${JSON.stringify(
    defaultTheme
  )};}if(t==="system"){t=window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";}d.setAttribute(${JSON.stringify(
    attribute
  )},t);}catch(e){}})();`;
}

/**
 * Inline `<script>` that sets the theme attribute on the document root **before
 * first paint**, eliminating the flash of incorrect theme (FOUC) on initial
 * load and hydration.
 *
 * Render it in the document `<head>` (e.g. Next.js `_document`, or any SSR
 * head) as early as possible. It reads the same `storageKey` the
 * `ThemeProvider` writes (default `"nova-theme"`).
 *
 * This is pure markup — SSR-friendly and emits no client runtime beyond the
 * one-shot inline script.
 */
export function ColorModeScript({
  storageKey = "nova-theme",
  defaultTheme = "system",
  attribute = "data-theme",
  selector = "html",
  nonce,
}: ColorModeScriptProps) {
  const html = buildScript(storageKey, defaultTheme, attribute, selector);
  return (
    <script
      nonce={nonce}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
