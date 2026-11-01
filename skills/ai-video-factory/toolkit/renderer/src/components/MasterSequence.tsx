// P5-REQ-5.1/5.3 / design.md §5: the one component Phase 6 renders. Sequences each scene's
// resolved component across its own [start, end] window, burns in captions. Duration is always
// derived from the real measured audio duration (Remotion's calculateMetadata mechanism) —
// never a hardcoded frame count. Deliberately renders NO <Audio> element — RD-65: audio is
// muxed post-render, externally, directly against `build.audio.wav_path` (an arbitrary local
// path outside `public/`, incompatible with Remotion's own browser-mediated asset loading).
import "../fonts";
import React from "react";
import { AbsoluteFill, Audio, Sequence, useVideoConfig } from "remotion";
import type { CalculateMetadataFunction } from "remotion";
import { colors } from "@ytpipeline/design-tokens";
import { type AnyBuildJson, type BuildJson, BuildJsonSchema, resolveAccent } from "../types";
import { SceneRenderer } from "./SceneRenderer";
import { CisSequence } from "./CisSequence";
import { VisualFilterOverlay } from "./VisualFilterOverlay";
import { Captions } from "./Captions";

export type MasterSequenceProps = {
  build: AnyBuildJson;
  previewAudioUrl?: string;
};

const FPS = 30;

// design.md §5.2/tasks.md V5.14: dispatches on the presence of a `screens` array (CIS,
// `<CisSequence>`) vs. the legacy `scenes`+`component` shape (`<LegacyMasterSequence>` below,
// additive — its body is the exact, untouched pre-CIS `MasterSequence` implementation,
// V5-REQ-9.1) before any hook in either branch runs, so neither branch's own hook-call order
// ever depends on which shape `build` is (React's Rules of Hooks).
export const MasterSequence: React.FC<MasterSequenceProps> = ({ build, previewAudioUrl }) => {
  // P5-REQ-6.3/RD-61: a runtime schema check, not only compile-time typing — Phase 6 constructs
  // this value from a live database at runtime, where drift must fail loudly with a named field,
  // never a blank or partially-rendered video.
  const parsed = BuildJsonSchema.safeParse(build);
  if (!parsed.success) {
    throw new Error(`MasterSequence: invalid BuildJson — ${parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")}`);
  }

  if ("screens" in parsed.data) {
    // v8-addendum design.md §5.2/RD-120/V8-INV-3: "none" (the default for every non-
    // horror_stories niche) renders through unchanged (VisualFilterOverlay's own early return)
    // -- this wrap is unconditional so the ONE place filter dispatch happens stays here,
    // never duplicated per-caller.
    return (
      <VisualFilterOverlay filter={parsed.data.visual_filter ?? "none"}>
        <CisSequence build={parsed.data} />
        {previewAudioUrl && <Audio src={previewAudioUrl} />}
      </VisualFilterOverlay>
    );
  }

  return <LegacyMasterSequence build={parsed.data} />;
};

// The legacy `scenes`+`component` composition loop — untouched from before the CIS dispatch
// branch above existed (V5-REQ-9.1).
const LegacyMasterSequence: React.FC<{ build: BuildJson }> = ({ build }) => {
  const { fps } = useVideoConfig();
  const accent = resolveAccent(build.niche_key);

  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg[0] }}>
      {build.scenes.map((scene) => {
        const fromFrame = Math.round(scene.start * fps);
        const durationFrames = Math.max(1, Math.round((scene.end - scene.start) * fps));
        return (
          <Sequence key={scene.index} from={fromFrame} durationInFrames={durationFrames}>
            <SceneRenderer scene={scene} component={build.component} accent={accent} />
          </Sequence>
        );
      })}
      <Captions words={build.words} accent={accent} />
    </AbsoluteFill>
  );
};

export const calculateMasterSequenceMetadata: CalculateMetadataFunction<MasterSequenceProps> = ({ props }) => {
  // The ONE place composition dimensions are decided. Every output is 1440p:
  // landscape builds are 2560x1440 and vertical builds are 1440x2560.
  // Remotion's `calculateMetadata` return overrides the `<Composition>` static
  // dimensions at actual render time, so this is sufficient on its own.
  // v8-addendum design.md §6.3/RD-123: a vertical-recap CIS build sets `aspect_ratio: "9:16"`
  // (never on the legacy `BuildJson` shape at all -- `"aspect_ratio" in props.build` narrows
  // safely, matching `isCisShaped`'s (types.ts) own `in`-based narrowing convention rather
  // than an inline cast) -- OR'd with the pre-existing `variant === "shorts"` check, since
  // either signal alone is sufficient reason to render vertical and neither depends on the
  // other (a vertical-recap's own condensed script is always `variant="full"`, never
  // "shorts" -- see design.md §8.1 -- so this is not a redundant check in practice, just a
  // second independent trigger for the same vertical frame).
  const isVertical =
    props.build.variant === "shorts" ||
    ("aspect_ratio" in props.build && props.build.aspect_ratio === "9:16");
  return {
    durationInFrames: Math.max(1, Math.ceil(props.build.audio.duration_seconds * FPS)),
    fps: FPS,
    width: isVertical ? 1440 : 2560,
    height: isVertical ? 2560 : 1440,
  };
};
