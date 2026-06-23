// Shared links + small maps for the Verve UI marketing/overview site.

export const GITHUB_USER = "Lucas-vdr-a11y";
export const REPO = "verve-ui";
export const REPO_URL = `https://github.com/${GITHUB_USER}/${REPO}`;
export const PAGES_URL = `https://${GITHUB_USER.toLowerCase()}.github.io/${REPO}/`;
export const DOCS_URL = `${REPO_URL}/blob/main/docs/COMPONENTS.md`;
export const CONTRACT_URL = `${REPO_URL}/blob/main/CONTRACT.md`;

/**
 * Map a catalog category key to the id of its live demo section, when one
 * exists in the playground. Categories without an entry link to the generated
 * docs instead.
 */
export const SECTION_ANCHORS: Record<string, string> = {
  texteffects: "texteffects",
  fx: "fx",
  flair: "flair",
  showcase: "showcase",
  inputs: "inputs",
  layout: "layout",
  typography: "typography",
  feedback: "feedback",
  "data-display": "data",
  charts: "charts",
  overlay: "overlay",
  disclosure: "disclosure",
  navigation: "navigation",
  media: "media",
  blocks: "blocks",
  commerce: "commerce",
  motion: "motion",
  dnd: "dnd",
};

/** Where a category card should link: in-page anchor or the docs index. */
export function categoryHref(key: string): string {
  const anchor = SECTION_ANCHORS[key];
  return anchor ? `#${anchor}` : `${DOCS_URL}#${key}`;
}
