import { useEffect } from "react";

/**
 * Sets the page favicon to `href`.
 *
 * Reuses an existing `<link rel="icon">` if present, otherwise creates one and
 * appends it to `<head>`. SSR-safe: does nothing on the server (guards
 * `document`).
 *
 * @param rel The link relation to target. Defaults to `"icon"`.
 */
export function useFavicon(href: string, rel = "icon"): void {
  useEffect(() => {
    if (typeof document === "undefined") return;

    const head = document.head;
    if (!head) return;

    let link = head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);

    if (!link) {
      link = document.createElement("link");
      link.rel = rel;
      head.appendChild(link);
    }

    link.href = href;
  }, [href, rel]);
}
