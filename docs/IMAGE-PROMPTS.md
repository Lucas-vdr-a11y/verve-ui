# Verve UI — image prompt list

The site already ships **two generated, working images** committed to the repo:

| File | Size | Made with | Used for |
| --- | --- | --- | --- |
| `docs/hero-banner.svg` | 1200×400 | hand-authored SVG | README banner |
| `demo/public/og-cover.png` | 1200×630 | rendered from `demo/public/og.html` | social / Open Graph card |

Everything below is **optional polish** — richer, AI-generated alternatives you
can produce whenever you like. For each: generate it, drop it at the given path,
and (if noted) update the reference. Image generators render text unreliably, so
these prompts describe **text-free backgrounds**; the crisp wordmark/stats stay
as the committed versions above (or composite the text in afterwards).

---

## 1. Repo social preview — `docs/social-preview.png` · 1280×640

> Where it's used: GitHub → repo **Settings → Social preview**. Upload manually.

**Prompt:**
> A wide, premium dark-tech hero background, 1280×640. Deep near-black navy
> (#05060f) base with soft volumetric aurora ribbons in indigo (#6366f1),
> violet (#a855f7) and cyan (#22d3ee) flowing diagonally from the top corners,
> heavy gaussian blur, glowing bloom. A faint perspective grid of thin lines
> fading toward the center. Subtle film grain. Lots of clean negative space in
> the middle for a logo to be overlaid later. Cinematic, modern developer-tool
> aesthetic (Linear / Vercel / Aceternity vibe). No text, no logos, no UI
> elements. 16:9-ish, high detail.

---

## 2. Richer OG / share card background — `demo/public/og-cover.png` · 1200×630

> Optional replacement for the committed `og-cover.png`. Keep the same filename
> and 1200×630 size and it goes live on next deploy — `index.html` already
> points its `og:image` / `twitter:image` there. (If your generated version
> includes baked-in text, double-check it reads "Verve UI · 660 components".)

**Prompt (background only, compose text on top):**
> A 1200×630 social-card background. Dark cosmic gradient from #0c1026 at the top
> to #04050c at the bottom. Three large, soft, overlapping aurora light-blooms —
> indigo top-left, magenta-violet top-right, teal-cyan rising from the bottom
> center — all heavily blurred and glowing. A delicate dotted/grid texture
> masked to fade at the edges. Tiny sparkles of starlight. Elegant, high-end,
> minimal. Leave the central third calm and uncluttered for overlaid text. No
> text, no logos.

---

## 3. README "signature" showcase strip — `docs/showcase-strip.png` · 1600×500

> Optional. Add under the Highlights section in `README.md` with
> `![Signature components](docs/showcase-strip.png)`.

**Prompt:**
> A horizontal collage-feel abstract, 1600×500, evoking a modern motion-UI kit:
> glowing aurora gradients, a beam of light tracing a path, drifting particles,
> a subtle bento-grid of softly-lit rounded rectangles, neon edge-lit borders —
> all in indigo/violet/cyan on near-black. Cohesive, premium, slightly
> futuristic. No readable text, no real screenshots, no brand logos.

---

## 4. Favicon / avatar alt (optional) — `docs/avatar-512.png` · 512×512

> Optional org/social avatar. The repo already uses `demo/public/favicon.svg`.

**Prompt:**
> A 512×512 app icon: a rounded-square tile with a deep navy (#0b0d17) base and
> a soft indigo-to-violet gradient glow, featuring a single bold geometric
> letter "N" in a light indigo-lavender gradient, centered, subtle inner shadow,
> premium and minimal, flat modern style. Transparent or dark background.

---

### After generating

1. Save each file to the path in its heading.
2. For #2, no code change is needed (filename matches).
3. For #1, upload via GitHub repo Settings → Social preview.
4. For #3, add the `![…](docs/showcase-strip.png)` line to `README.md`.
5. Commit & push — the Pages deploy picks up `demo/public/*` automatically.
