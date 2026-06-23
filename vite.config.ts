import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Three jobs, one config:
//   • dev / default build → the /demo overview + playground site (root = demo)
//   • mode "lib"          → the distributable library bundle (src/index.ts → dist/)
// PAGES_BASE sets the public base path when hosting the site on GitHub Pages
// project pages (e.g. "/nova-ui/"); it defaults to "/" for local dev.
export default defineConfig(({ mode }) => ({
  base: process.env.PAGES_BASE || "/",
  plugins: [react()],
  root: mode === "lib" ? undefined : "demo",
  build:
    mode === "lib"
      ? {
          lib: {
            entry: "src/index.ts",
            formats: ["es"],
            fileName: () => "index.js",
          },
          rollupOptions: {
            external: ["react", "react-dom", "react/jsx-runtime"],
          },
          outDir: "dist",
        }
      : undefined,
}));
