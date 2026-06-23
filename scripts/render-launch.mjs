// Nova UI — launch-video renderer.
//
// Renders demo/public/launch.html to an MP4 by driving headless Chrome over the
// DevTools Protocol (CDP) with Node's built-in WebSocket — no puppeteer. Each
// frame is produced deterministically via the page's window.__seek(t) hook, so
// the output is reproducible. Frames are assembled with ffmpeg.
//
// Requires: Google Chrome (or Chromium) + ffmpeg on PATH, and a running server
// hosting launch.html (the Vite dev server, or `npm run preview`).
//
// Usage:
//   node scripts/render-launch.mjs [--url URL] [--fps 30] [--out FILE]
// Env: CHROME_BIN, LAUNCH_URL
//
// Defaults: URL http://localhost:5173/launch.html, 30 fps, ./nova-ui-launch.mp4

import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

// ---- args ----
const argv = process.argv.slice(2);
const getArg = (name, def) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : def;
};
const URL = process.env.LAUNCH_URL || getArg("url", "http://localhost:5173/launch.html");
const FPS = parseInt(getArg("fps", "30"), 10);
const OUT = path.resolve(ROOT, getArg("out", "nova-ui-launch.mp4"));
const W = 1920, H = 1080;
const PORT = 9322;
const FRAME_DIR = path.join(ROOT, ".render-frames");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function findChrome() {
  if (process.env.CHROME_BIN && fs.existsSync(process.env.CHROME_BIN)) return process.env.CHROME_BIN;
  const candidates = [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
  ];
  for (const c of candidates) if (fs.existsSync(c)) return c;
  for (const c of ["google-chrome", "chromium", "chromium-browser"]) {
    const r = spawnSync("which", [c]);
    if (r.status === 0) return r.stdout.toString().trim();
  }
  throw new Error("Chrome/Chromium not found. Set CHROME_BIN.");
}

// ---- minimal CDP client over the built-in WebSocket ----
class CDP {
  constructor(ws) {
    this.ws = ws;
    this.id = 0;
    this.pending = new Map();
    this.listeners = new Map();
    ws.addEventListener("message", (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id != null && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result);
      } else if (msg.method) {
        (this.listeners.get(msg.method) || []).forEach((fn) => fn(msg.params));
      }
    });
  }
  send(method, params = {}) {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
      setTimeout(() => {
        if (this.pending.has(id)) { this.pending.delete(id); reject(new Error(`timeout: ${method}`)); }
      }, 30000);
    });
  }
  once(method) {
    return new Promise((resolve) => {
      const arr = this.listeners.get(method) || [];
      const fn = (p) => {
        this.listeners.set(method, (this.listeners.get(method) || []).filter((f) => f !== fn));
        resolve(p);
      };
      arr.push(fn);
      this.listeners.set(method, arr);
    });
  }
}

async function fetchJson(url, tries = 40) {
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(url);
      if (r.ok) return await r.json();
    } catch {}
    await sleep(250);
  }
  throw new Error(`could not reach ${url}`);
}

async function main() {
  // Sanity: ffmpeg present?
  if (spawnSync("ffmpeg", ["-version"]).status !== 0) throw new Error("ffmpeg not found on PATH.");

  const chrome = findChrome();
  console.log(`Chrome:   ${chrome}`);
  console.log(`URL:      ${URL}`);
  console.log(`Output:   ${path.relative(ROOT, OUT)}  (${W}x${H} @ ${FPS}fps)`);

  // Fresh frames dir
  fs.rmSync(FRAME_DIR, { recursive: true, force: true });
  fs.mkdirSync(FRAME_DIR, { recursive: true });

  const userDir = fs.mkdtempSync(path.join(os.tmpdir(), "nova-chrome-"));
  const proc = spawn(chrome, [
    "--headless=new",
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${userDir}`,
    `--window-size=${W},${H}`,
    "--hide-scrollbars",
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-extensions",
    "--force-device-scale-factor=1",
    "--force-color-profile=srgb",
    "about:blank",
  ], { stdio: "ignore" });

  let client, ws;
  try {
    // Find the page target's websocket URL.
    const targets = await fetchJson(`http://127.0.0.1:${PORT}/json`);
    const page = targets.find((t) => t.type === "page") || targets[0];
    ws = new WebSocket(page.webSocketDebuggerUrl);
    await new Promise((res, rej) => { ws.addEventListener("open", res); ws.addEventListener("error", rej); });
    client = new CDP(ws);

    await client.send("Page.enable");
    await client.send("Runtime.enable");
    await client.send("Emulation.setDeviceMetricsOverride",
      { width: W, height: H, deviceScaleFactor: 1, mobile: false, screenWidth: W, screenHeight: H });

    const loaded = client.once("Page.loadEventFired");
    await client.send("Page.navigate", { url: `${URL}?capture=1` });
    await loaded;

    // Wait for the page's font-ready signal (window.__ready).
    let duration = 34;
    for (let i = 0; i < 80; i++) {
      const r = await client.send("Runtime.evaluate", { expression: "(window.__ready===true) && window.__duration", returnByValue: true });
      if (r.result && r.result.value) { duration = r.result.value; break; }
      await sleep(125);
    }
    console.log(`Duration: ${duration}s`);

    const total = Math.ceil(duration * FPS);
    process.stdout.write(`Capturing ${total} frames`);
    for (let i = 0; i < total; i++) {
      const t = i / FPS;
      await client.send("Runtime.evaluate", { expression: `window.__seek(${t})`, awaitPromise: false });
      const shot = await client.send("Page.captureScreenshot",
        { format: "png", clip: { x: 0, y: 0, width: W, height: H, scale: 1 }, captureBeyondViewport: true });
      fs.writeFileSync(path.join(FRAME_DIR, `f${String(i).padStart(5, "0")}.png`), Buffer.from(shot.data, "base64"));
      if (i % 30 === 0) process.stdout.write(".");
    }
    process.stdout.write(" done\n");
  } finally {
    try { ws && ws.close(); } catch {}
    proc.kill("SIGKILL");
    fs.rmSync(userDir, { recursive: true, force: true });
  }

  // Assemble with ffmpeg.
  console.log("Encoding MP4 with ffmpeg…");
  const ff = spawnSync("ffmpeg", [
    "-y",
    "-framerate", String(FPS),
    "-i", path.join(FRAME_DIR, "f%05d.png"),
    "-c:v", "libx264",
    "-pix_fmt", "yuv420p",
    "-crf", "18",
    "-preset", "medium",
    "-movflags", "+faststart",
    OUT,
  ], { stdio: ["ignore", "ignore", "inherit"] });
  if (ff.status !== 0) throw new Error("ffmpeg encoding failed.");

  fs.rmSync(FRAME_DIR, { recursive: true, force: true });
  const mb = (fs.statSync(OUT).size / 1e6).toFixed(1);
  console.log(`\n✓ Rendered ${path.relative(ROOT, OUT)} (${mb} MB)`);
}

main().catch((e) => { console.error("\n✗ render-launch failed:", e.message); process.exit(1); });
