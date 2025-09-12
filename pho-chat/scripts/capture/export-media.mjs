import { existsSync, mkdirSync, readdirSync, copyFileSync, writeFileSync } from "node:fs";
import { join, basename } from "node:path";
import { spawnSync } from "node:child_process";

const RESULTS_DIR = join(process.cwd(), "playwright-report");
const TEST_RESULTS_DIR = join(process.cwd(), "test-results"); // fallback older name
const DOCS_DIR = join(process.cwd(), "docs", "ai-chat-v2");

if (!existsSync(DOCS_DIR)) mkdirSync(DOCS_DIR, { recursive: true });

// Robust mapping: detect by keywords in full path (Playwright slugs include test title)
// We intentionally avoid exact hyphen counts and rely on scenario + theme keywords.
const mapping = [
  { all: ["drawer-navigation", "mobile", "light"], out: "mobile-drawer-navigation-light.gif" },
  { all: ["drawer-navigation", "mobile", "dark"], out: "mobile-drawer-navigation-dark.gif" },
  { all: ["session-selection-autoscroll", "light"], out: "session-selection-autoscroll-light.gif" },
  { all: ["session-selection-autoscroll", "dark"], out: "session-selection-autoscroll-dark.gif" },
  { all: ["sidebar-toggle-responsive", "light"], out: "sidebar-toggle-responsive-light.gif" },
  { all: ["sidebar-toggle-responsive", "dark"], out: "sidebar-toggle-responsive-dark.gif" },
];

function findAllVideos(dir) {
  const out = [];
  const walk = (d) => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (/\.(webm|mp4)$/i.test(e.name)) out.push(p);
    }
  };
  if (existsSync(dir)) walk(dir);
  return out;
}

function ffmpegExists() {
  const res = spawnSync("ffmpeg", ["-version"], { stdio: "ignore" });
  return res.status === 0;
}

const videos = [
  ...findAllVideos(RESULTS_DIR),
  ...findAllVideos(TEST_RESULTS_DIR),
];

const hasFfmpeg = ffmpegExists();

for (const v of videos) {
  // Match against full path (directory names include test titles)
  const filePathLower = v.toLowerCase();
  for (const m of mapping) {
    const ok = m.all ? m.all.every((kw) => filePathLower.includes(kw)) : false;
    if (ok) {
      const outPath = join(DOCS_DIR, m.out);
      if (hasFfmpeg) {
        const args = ["-y", "-i", v, "-vf", "fps=10,scale=900:-1:flags=lanczos", outPath];
        spawnSync("ffmpeg", args, { stdio: "inherit" });
      } else {
        // If ffmpeg not available, copy the video with .webm extension next to target name
        const fallback = outPath.replace(/\.gif$/i, ".webm");
        copyFileSync(v, fallback);
      }
      break;
    }
  }
}

// Also copy annotated overview PNGs if tests produced them
const OVERVIEW_FILES = [
  { src: "desktop-sidebar-history-light.png", out: "annotated-overview-light.png" },
  { src: "desktop-sidebar-history-dark.png", out: "annotated-overview-dark.png" },
];
for (const o of OVERVIEW_FILES) {
  const p = join(DOCS_DIR, o.src);
  if (existsSync(p)) {
    const out = join(DOCS_DIR, o.out);
    if (!existsSync(out)) copyFileSync(p, out);
  }
}

writeFileSync(join(DOCS_DIR, "_capture.log"), `Export completed at ${new Date().toISOString()}\n`);
console.log("Export complete. Media saved under docs/ai-chat-v2/");

