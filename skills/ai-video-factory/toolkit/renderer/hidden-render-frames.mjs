#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {bundle} from "@remotion/bundler";
import {renderFrames, selectComposition} from "@remotion/renderer";

// Resolved relative to this script's own location, not process.cwd() (the production
// orchestrator invokes this with cwd=repo-root, and @remotion/bundler otherwise falls back to
// `<cwd>/public`, which doesn't exist -- assets live in this workspace's own `public/`).
const RENDERER_ROOT = path.dirname(fileURLToPath(import.meta.url));
// Channel media (fonts, approved art, gameplay clips, music) lives with the channel, not in the
// skill: default = <repo>/hidden-everyday-systems/renderer-public, override with YT_PUBLIC_DIR.
const PUBLIC_DIR = process.env.YT_PUBLIC_DIR
  ? path.resolve(process.env.YT_PUBLIC_DIR)
  : path.resolve(RENDERER_ROOT, "../../../hidden-everyday-systems/renderer-public");
const [entryPoint, compositionId, outputDir, inputPropsJson] = process.argv.slice(2);
if (!entryPoint || !compositionId || !outputDir) {
  throw new Error("usage: node hidden-render-frames.mjs <entry> <composition-id> <output-dir> [input-props-json]");
}
// Optional 4th arg: JSON-encoded props merged into the composition's defaultProps (e.g. the
// brainrot Shorts variant's backgroundVideo/backgroundStartSec -- see
// hidden-everyday-systems/examples/shorts-brainrot-plan.md). Omitted entirely for ordinary
// renders, which keep using each composition's defaultProps unchanged.
const inputProps = inputPropsJson ? JSON.parse(inputPropsJson) : undefined;

fs.mkdirSync(outputDir, {recursive: true});
let lastBundle = -1;
const serveUrl = await bundle({
  entryPoint: path.resolve(entryPoint),
  publicDir: PUBLIC_DIR,
  onProgress: (value) => {
    const bucket = Math.floor(value / 20) * 20;
    if (bucket !== lastBundle) {
      lastBundle = bucket;
      process.stdout.write(`bundle ${value}%\n`);
    }
  },
});
const composition = await selectComposition({serveUrl, id: compositionId, inputProps});
let total = 0;
let lastProgress = -1;
const result = await renderFrames({
  composition,
  serveUrl,
  inputProps,
  outputDir: path.resolve(outputDir),
  imageFormat: "jpeg",
  jpegQuality: 90,
  concurrency: 4,
  onStart: ({frameCount, resolvedConcurrency}) => {
    total = frameCount;
    process.stdout.write(`frames ${frameCount}, concurrency ${resolvedConcurrency}\n`);
  },
  onFrameUpdate: (rendered) => {
    const progress = total ? Math.floor(rendered / total * 10) * 10 : 0;
    if (progress !== lastProgress) {
      lastProgress = progress;
      process.stdout.write(`render ${progress}%\n`);
    }
  },
});
process.stdout.write(`${JSON.stringify({frameCount: result.frameCount, fps: composition.fps, width: composition.width, height: composition.height})}\n`);

