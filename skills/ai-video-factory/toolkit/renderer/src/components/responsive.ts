// Shared vertical-frame adaptation for scene/screen components in COMPONENT_MAP
// (SceneRenderer.tsx). Historic defect: components like ClaimEvidenceCompare/CyberTerminal/
// FailureSchematic/AILogicNode render flat 10-49px web-UI design tokens (packages/design-
// tokens/tokens.json's `typography.fontSize`) with zero relationship to either video canvas
// dimension. On landscape (2560x1440) that reads small but acceptable and already went through
// review; on vertical (1440x2560, Shorts) the identical flat px is genuinely too small on a
// frame meant to fill a phone screen edge-to-edge, and two-column `flexDirection: "row"` layouts
// stayed side-by-side in the 1440px-wide frame instead of stacking. Both match the reported
// "too small to read, left-to-right instead of top-to-bottom" defect.
//
// Landscape is deliberately left untouched everywhere this is used (falls through to the
// existing, already-reviewed token value) -- only vertical was reported broken, so this never
// second-guesses landscape's approved sizing.
import { useVideoConfig } from "remotion";

/** True when the active composition is a vertical (Shorts) frame. */
export function useIsVertical(): boolean {
  const { width, height } = useVideoConfig();
  return height > width;
}

// Calibrated against Captions.tsx's own already-reviewed on-screen caption size --
// `Math.min(76, height*0.042)`, ~76-78px on a 1440x2560 frame -- as the "comfortably readable
// on a phone at arm's length" reference point, rather than an arbitrary multiplier of the
// web-scale tokens.
const VERTICAL_TEXT_RATIO = { micro: 0.017, body: 0.026, heading: 0.036 } as const;
const VERTICAL_TEXT_CAP = { micro: 34, body: 58, heading: 78 } as const;

/** Vertical-only font size for a text role (badge/label -> "micro", bullet/paragraph copy ->
 * "body", card/column title -> "heading"). Call with the landscape token value as `fallback` --
 * returns that unchanged when `isVertical` is false. */
export function vtext(kind: keyof typeof VERTICAL_TEXT_RATIO, height: number, isVertical: boolean, fallback: number): number {
  if (!isVertical) return fallback;
  return Math.round(Math.min(VERTICAL_TEXT_CAP[kind], height * VERTICAL_TEXT_RATIO[kind]));
}

/** Vertical-only spacing (padding/gap) bump so layout breathing room keeps pace with the
 * larger `vtext` sizes -- unchanged on landscape. */
export function vspace(px: number, isVertical: boolean): number {
  return isVertical ? Math.round(px * 1.7) : px;
}
