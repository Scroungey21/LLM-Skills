#!/usr/bin/env node
// Permanent Remotion render-invocation CLI (P6-REQ-6.1/6.2, design.md §4.2). The `engine`
// process shells out to this script — never a standing `renderer` container (P1-REQ-8.1).
// Replaces the disposable `_tmp_render_e2e.js`-style scripts Phase 5's own verification used.
//
// Usage:
//   node --experimental-strip-types render-cli.mjs <build_json_path> <frame_dir> [--scale N]
//   node --experimental-strip-types render-cli.mjs <build_json_path> <frame_dir> \
//     --stills=n1,n2,n3 [--scale N]
//
// (`--experimental-strip-types` is required because this script imports `BuildJsonSchema`
// directly from `./src/types.ts` — the single, frozen source of truth for the BuildJson
// contract, RD-61 — rather than duplicating a second copy of the schema in plain JS. Node
// 22.6+ supports stripping type annotations from a same-process `.ts` import without a
// bundler/transpiler devDependency; `types.ts` and its own `@ytpipeline/design-tokens`
// import use only erasable syntax, confirmed against this project's real installed Node.)
//
// Two independent modes, one process:
//
// (1) Full-range render, via `renderFrames()` (proven path, RD-62/P6-REQ-6.2) — never the
//     CLI's internal `render`/`renderMedia()` encode/mux path. Writes exactly one JSON line to
//     stdout on completion, the load-bearing contract `engine/app/render/remotion_client.py`
//     parses:
//       success: {"success": true, "frameCount": N, "fps": N, "width": N, "height": N,
//                 "framePattern": "element-%0Nd.jpeg"}
//
// (2) `--stills=n1,n2,n3` — an arbitrary (non-contiguous) list of single-frame stills, via
//     `renderStill()` (design.md §9.3.1, V7-addendum V7.14; NOT `renderFrames()`, whose
//     `frameRange` only accepts one contiguous range). One `bundle()`, one `openBrowser
//     ("chrome")`, one `selectComposition({puppeteerInstance})`, then one `renderStill(...)`
//     call per requested frame, each writing straight to its own `still_<n>.png` — no
//     rename/temp-dir step. `imageFormat: "png"` (lossless), not mode (1)'s "jpeg" default,
//     since these stills are the NLE export's own deliverable, not an intermediate immediately
//     re-encoded and discarded. Distinct stdout contract:
//       success: {"success": true, "stills": {"<frame>": "<filename>.png", ...}, "fps": N,
//                 "width": N, "height": N}
//
// Both modes share the same failure shape: {"success": false, "error": "..."}. Exit code 0 on
// success, 1 on failure. No retry logic lives here (retry is `render/queue.py`'s job,
// design.md §4.4) — one invocation is one attempt.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { bundle } from "@remotion/bundler";
import { openBrowser, renderFrames, renderStill, selectComposition } from "@remotion/renderer";
import { BuildJsonSchema } from "./src/types.ts";
import { logEvent } from "./src/structured-log.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const COMPOSITION_ID = "MasterSequence";

function emitFailureAndExit(message) {
  logEvent("ERROR", "render-cli failed", { error: message });
  console.log(JSON.stringify({ success: false, error: message }));
  process.exit(1);
}

function parseFrameList(raw) {
  const parts = raw.split(",").map((part) => part.trim()).filter((part) => part.length > 0);
  if (parts.length === 0) {
    throw new Error(`--stills must list at least one frame number, got ${JSON.stringify(raw)}`);
  }
  return parts.map((part) => {
    const frame = Number(part);
    if (!Number.isInteger(frame) || frame < 0) {
      throw new Error(`--stills frame numbers must be non-negative integers, got ${JSON.stringify(part)}`);
    }
    return frame;
  });
}

function parseArgs(argv) {
  const positional = [];
  let scale = 1.0;
  let stills = null;
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--scale") {
      const raw = argv[i + 1];
      i += 1;
      scale = Number(raw);
      if (!Number.isFinite(scale) || scale <= 0) {
        throw new Error(`--scale must be a positive number, got ${JSON.stringify(raw)}`);
      }
    } else if (arg.startsWith("--scale=")) {
      const raw = arg.slice("--scale=".length);
      scale = Number(raw);
      if (!Number.isFinite(scale) || scale <= 0) {
        throw new Error(`--scale must be a positive number, got ${JSON.stringify(raw)}`);
      }
    } else if (arg.startsWith("--stills=")) {
      stills = parseFrameList(arg.slice("--stills=".length));
    } else {
      positional.push(arg);
    }
  }
  const [buildJsonPath, frameDir] = positional;
  if (!buildJsonPath || !frameDir) {
    throw new Error(
      "usage: node render-cli.mjs <build_json_path> <frame_dir> [--scale N] | " +
        "node render-cli.mjs <build_json_path> <frame_dir> --stills=n1,n2,n3 [--scale N]",
    );
  }
  return { buildJsonPath, frameDir, scale, stills };
}

// Mirrors @remotion/renderer's own internal frame-file naming exactly (get-frame-padded-
// index.js): with the default everyNthFrame=1, countType="actual-frames" and the pad width is
// `String(lastFrame).length` where lastFrame is the final rendered frame index (frameCount -
// 1, since no frameRange is passed here). Computed dynamically — never a hardcoded `%03d` —
// so this stays correct for any real clip length, including several-minute/14400+-frame final
// renders, not just short test fixtures.
function computeFramePattern(frameCount) {
  const lastFrame = Math.max(0, frameCount - 1);
  const padLength = String(lastFrame).length;
  return `element-%0${padLength}d.jpeg`;
}

async function main() {
  const { buildJsonPath, frameDir, scale, stills } = parseArgs(process.argv.slice(2));
  logEvent("INFO", "render-cli started", {
    buildJsonPath,
    frameDir,
    scale,
    mode: stills ? "stills" : "full",
  });

  const absoluteBuildJsonPath = path.resolve(buildJsonPath);
  let raw;
  try {
    raw = fs.readFileSync(absoluteBuildJsonPath, "utf-8");
  } catch (err) {
    throw new Error(`failed to read build.json at ${absoluteBuildJsonPath}: ${err.message}`);
  }

  let parsedJson;
  try {
    parsedJson = JSON.parse(raw);
  } catch (err) {
    throw new Error(`build.json at ${absoluteBuildJsonPath} is not valid JSON: ${err.message}`);
  }

  const validation = BuildJsonSchema.safeParse(parsedJson);
  if (!validation.success) {
    const issues = validation.error.issues
      .map((issue) => `${issue.path.join(".") || "<root>"}: ${issue.message}`)
      .join("; ");
    throw new Error(`build.json failed BuildJsonSchema validation: ${issues}`);
  }
  const build = validation.data;
  logEvent("INFO", "build.json validated", { path: absoluteBuildJsonPath });

  const absoluteFrameDir = path.resolve(frameDir);
  fs.mkdirSync(absoluteFrameDir, { recursive: true });

  logEvent("INFO", "bundling composition", { entryPoint: "src/index.ts" });
  let lastBundleProgressBucket = -1;
  const serveUrl = await bundle({
    entryPoint: path.join(__dirname, "src", "index.ts"),
    onProgress: (f) => {
      const bucket = Math.floor(f / 20) * 20;
      if (bucket !== lastBundleProgressBucket) {
        lastBundleProgressBucket = bucket;
        logEvent("DEBUG", "bundling progress", { percent: f });
      }
    },
  });
  logEvent("INFO", "bundle complete", { serveUrl });

  // §9.3.1 (V7-addendum V7.14): `--stills` is a distinct rendering path from the full-range
  // one below, sharing only the bundle just produced. `renderFrames()`'s `frameRange` accepts
  // a single contiguous range, never an arbitrary frame list, so an arbitrary set of stills
  // needs `renderStill()` called once per frame instead. The browser is opened once here
  // (bare `renderStill()` calls with no `puppeteerInstance` would each open and close their
  // own headless Chromium, erasing the point of batching many stills into one invocation) and
  // closed in `finally` so a mid-loop render failure still cleans it up.
  if (stills) {
    logEvent("INFO", "opening headless browser for stills render", { frameCount: stills.length });
    const browser = await openBrowser("chrome");
    let result;
    try {
      const stillComposition = await selectComposition({
        serveUrl,
        id: COMPOSITION_ID,
        inputProps: { build },
        puppeteerInstance: browser,
      });
      logEvent("INFO", "composition selected", {
        fps: stillComposition.fps,
        width: stillComposition.width,
        height: stillComposition.height,
      });

      const stillFiles = {};
      for (const frame of stills) {
        const filename = `still_${frame}.png`;
        await renderStill({
          composition: stillComposition,
          serveUrl,
          output: path.join(absoluteFrameDir, filename),
          frame,
          inputProps: { build },
          imageFormat: "png",
          scale,
          puppeteerInstance: browser,
        });
        stillFiles[String(frame)] = filename;
        logEvent("DEBUG", "still rendered", { frame, filename });
      }

      result = {
        success: true,
        stills: stillFiles,
        fps: stillComposition.fps,
        width: stillComposition.width,
        height: stillComposition.height,
      };
    } finally {
      await browser.close({ silent: true });
    }

    logEvent("INFO", "stills render complete", { stillCount: stills.length });
    console.log(JSON.stringify(result));
    process.exit(0);
  }

  // Real durationInFrames/fps/width/height are resolved by MasterSequence.tsx's
  // `calculateMasterSequenceMetadata` (30fps, 2560x1440 landscape or 1440x2560 vertical,
  // duration ceil'd from `build.audio.duration_seconds`) — never recomputed differently here.
  const composition = await selectComposition({
    serveUrl,
    id: COMPOSITION_ID,
    inputProps: { build },
  });
  logEvent("INFO", "composition selected", {
    fps: composition.fps,
    width: composition.width,
    height: composition.height,
  });

  let totalFrameCount = 0;
  let lastFrameProgressBucket = -1;
  const { frameCount } = await renderFrames({
    composition,
    serveUrl,
    outputDir: absoluteFrameDir,
    inputProps: { build },
    scale,
    imageFormat: "jpeg",
    onStart: (data) => {
      totalFrameCount = data.frameCount;
      logEvent("INFO", "frame render started", {
        frameCount: data.frameCount,
        resolvedConcurrency: data.resolvedConcurrency,
      });
    },
    onFrameUpdate: (framesRendered, frameIndex, timeToRenderInMilliseconds) => {
      const percent = totalFrameCount > 0 ? Math.floor((framesRendered / totalFrameCount) * 100) : 0;
      const bucket = Math.floor(percent / 10) * 10;
      if (bucket !== lastFrameProgressBucket) {
        lastFrameProgressBucket = bucket;
        logEvent("DEBUG", "frame render progress", { framesRendered, totalFrameCount, percent });
      }
    },
  });

  const framePattern = computeFramePattern(frameCount);
  logEvent("INFO", "frame render complete", { frameCount, framePattern });

  console.log(
    JSON.stringify({
      success: true,
      frameCount,
      fps: composition.fps,
      width: composition.width,
      height: composition.height,
      framePattern,
    }),
  );
  process.exit(0);
}

main().catch((err) => {
  emitFailureAndExit(err && err.stack ? err.stack : String(err));
});
