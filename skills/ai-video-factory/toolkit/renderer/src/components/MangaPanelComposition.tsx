// V7-REQ-6.2/6.3 / design.md §7.1: manga_panel_composition's backing component — a static
// two-layer composition (no per-frame animation logic, matching manifest.
// max_animation_duration_ms: 0). `background_layer` renders the source panel image full-bleed
// with a strong CSS blur behind `foreground_layer`, the same panel image unblurred and scaled
// to a `scene_energy`-derived percentage (60-80%, `_SCENE_ENERGY_TO_SCALE` server-side,
// screen_generator.py §7) of the frame.
//
// `screens.content` (design.md §1.6) is an arbitrary per-screen-type JSON blob threaded through
// `ScreenSpec.content`. Unlike `AssetSting.tsx`'s still-deferred `content.asset_library_id`
// (that component's own header comment), `CisScreenRenderer.tsx::screenToSceneProps` DOES
// forward `background_layer`/`foreground_layer` into `SceneProps` — this component's entire
// rendered output is that content, not an optional enhancement of an otherwise-meaningful
// narration/cues scene, so the deferred-plumbing pattern that's harmless for asset-sting would
// leave every manga panel blank here. The neutral-placeholder rendering below is retained
// purely as a defensive fallback (a screen whose `content` genuinely lacks a layer, e.g. mid-
// generation or malformed upstream data) — never a crash on missing content, matching this
// codebase's general precedent (`checkCueBounds`'s warn-not-throw, RD-58) — not the expected
// steady-state path.
import React from "react";
import { AbsoluteFill, Img } from "remotion";
import { colors } from "@ytpipeline/design-tokens";
import type { SceneProps, MangaPanelLayer } from "../types";
import { BeatLayer } from "./BeatLayer";
import { MANIFESTS } from "../manifests";

const MANIFEST = MANIFESTS["manga-panel-composition"];

// CSS `filter: blur()` takes a pixel radius, not a percentage — `blur_pct` (0-100, server-side)
// scales linearly into this component's own chosen max background-blur radius.
const MAX_BACKGROUND_BLUR_PX = 40;


type MangaPanelCompositionProps = SceneProps & {
  background_layer?: MangaPanelLayer;
  foreground_layer?: MangaPanelLayer;
};

export const MangaPanelComposition: React.FC<MangaPanelCompositionProps> = ({
  index,
  duration_ms,
  accent,
  background_layer,
  foreground_layer,
}) => {
  if (process.env.NODE_ENV !== "production" && MANIFEST.elements.length !== 2) {
    console.warn(
      "manga-panel-composition: expected 2 manifest elements (background_layer/foreground_layer), " +
        `found ${MANIFEST.elements.length}.`,
    );
  }

  const backgroundBlurPx = ((background_layer?.blur_pct ?? 85) / 100) * MAX_BACKGROUND_BLUR_PX;
  const foregroundScalePct = foreground_layer?.scale_pct ?? 72; // "medium" default (screen_generator.py)

  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg[0] }}>
      {background_layer ? (
        <Img
          src={background_layer.image_path}
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            objectFit: "cover", // "scale: fill" (design.md §7) — full-bleed, cropped not stretched
            filter: `blur(${backgroundBlurPx}px)`,
          }}
        />
      ) : (
        <AbsoluteFill style={{ backgroundColor: colors.bg[1], filter: `blur(${backgroundBlurPx}px)` }} />
      )}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        {foreground_layer ? (
          <Img
            src={foreground_layer.image_path}
            style={{
              width: `${foregroundScalePct}%`,
              height: "auto",
              objectFit: "contain",
              filter: "none",
            }}
          />
        ) : (
          <div
            style={{
              width: `${foregroundScalePct}%`,
              aspectRatio: "3 / 4",
              borderRadius: 4,
              border: `1px solid ${colors.border}`,
              backgroundColor: colors.bg[1],
            }}
          />
        )}
      </AbsoluteFill>
      <BeatLayer holdMs={duration_ms} seed={index} accent={accent} />
    </AbsoluteFill>
  );
};
