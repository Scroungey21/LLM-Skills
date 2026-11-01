// v8-addendum design.md §5.1/V8-REQ-6.1-6.3: horror_stories's sole backing component --
// atmosphere-narration's ONE screen type carries `foreground_textbox` (progressive text reveal)
// and `background_layer` (a rotating pool of blurred stock footage) as its two named elements
// (design.md §5.1, manifest `elements`).
//
// `foreground_textbox` reveals progressively by ABSOLUTE-TIME overlap against `words` -- never
// `WordTimestamp.scene_index` (RD-131/V8-INV-9): `CisBuildJson` carries no `scenes` array at
// all, so that field has no CIS-mode meaning. `words` here is already the server-windowed
// subset for this one screen (`build_json.py::_build_screen_specs`); this component only
// re-checks each word's own `start` against the current absolute-timeline second, converting
// this screen's own *local* Sequence frame (`useCurrentFrame()`, relative to this screen's own
// `<Sequence from={fromFrame}>` in CisSequence.tsx) back to absolute time via `start` (the
// screen's own resolved start second, already threaded through `screenToSceneProps`).
//
// `background_layer` is the build-time-resolved `{asset_library_id, hold_ms}` schedule
// (`_build_screen_specs`, RD-131) -- rendered in sequence for each entry's own `hold_ms`,
// crossfading between adjacent entries. No `<Video src>`: `asset_library_id` -> a real
// loadable clip is separate, not-yet-built asset-serving plumbing (see `AtmosphereBackgroundEntry`'s
// own doc comment in types.ts) -- a neutral, labeled placeholder box stands in for now, the
// same "never a crash on real, expected content" precedent `MangaPanelComposition.tsx`
// establishes for its own missing-layer fallback, just as this component's ordinary
// steady-state today rather than a defensive edge case.
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, typography } from "@ytpipeline/design-tokens";
import type { AtmosphereBackgroundEntry, SceneProps, WordTimestamp } from "../types";

type AtmosphereNarrationProps = SceneProps & {
  foreground_textbox?: { words: WordTimestamp[] };
  background_layer?: AtmosphereBackgroundEntry[];
};

const CROSSFADE_MS = 400;

export const AtmosphereNarration: React.FC<AtmosphereNarrationProps> = ({ accent, background_layer }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localSeconds = frame / fps;

  // `foreground_textbox` is deliberately NOT rendered: CisSequence already overlays the
  // global Captions layer (same words, same absolute-time reveal, better styled), so this
  // component's own textbox duplicated every line directly underneath the caption bar --
  // two stacked copies of the same sentence (visible once backdrops stopped being blank).
  // The background pool is this component's actual visual job.
  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg[0] }}>
      <BackgroundLayer entries={background_layer ?? []} localMs={localSeconds * 1000} accent={accent} />
    </AbsoluteFill>
  );
};

const BackgroundLayer: React.FC<{ entries: AtmosphereBackgroundEntry[]; localMs: number; accent: string }> = ({
  entries,
  localMs,
  accent,
}) => {
  if (entries.length === 0) {
    return <AbsoluteFill style={{ backgroundColor: colors.bg[1] }} />;
  }

  // Locate which pool entry `localMs` falls into by walking cumulative `hold_ms` boundaries --
  // the same "ordered schedule summing to the screen's known duration" `_build_screen_specs`
  // already guarantees server-side (design.md §5.1), never re-derived/re-bounded here.
  let cursor = 0;
  let activeIndex = entries.length - 1; // clamp to the last entry past the final boundary
  for (let i = 0; i < entries.length; i++) {
    const entryEnd = cursor + entries[i].hold_ms;
    if (localMs < entryEnd) {
      activeIndex = i;
      break;
    }
    cursor = entryEnd;
  }
  const activeEntry = entries[activeIndex];
  const activeStart = entries.slice(0, activeIndex).reduce((sum, e) => sum + e.hold_ms, 0);
  const msIntoActive = localMs - activeStart;
  const msRemainingInActive = activeEntry.hold_ms - msIntoActive;

  // Crossfade the outgoing entry out over its own final CROSSFADE_MS, the incoming one in over
  // its own first CROSSFADE_MS -- both entries render simultaneously only inside that overlap
  // window, otherwise only the active one does (avoids compositing every pool entry always).
  const fadingOut = msRemainingInActive < CROSSFADE_MS && activeIndex < entries.length - 1;
  const fadingIn = msIntoActive < CROSSFADE_MS && activeIndex > 0;
  const activeOpacity = fadingOut ? Math.max(0, msRemainingInActive / CROSSFADE_MS) : 1;

  return (
    <AbsoluteFill>
      {fadingIn && (
        <AbsoluteFill style={{ opacity: 1 - msIntoActive / CROSSFADE_MS }}>
          <BackgroundClipPlaceholder entry={entries[activeIndex - 1]} accent={accent} />
        </AbsoluteFill>
      )}
      <AbsoluteFill style={{ opacity: activeOpacity }}>
        <BackgroundClipPlaceholder entry={activeEntry} accent={accent} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// Until real stock-footage serving lands, each pool entry renders as a rich PROCEDURAL
// backdrop instead of the old flat box + tiny label (which read as a "nonexistent render" on
// screen). Everything is deterministic per `asset_library_id` and per-frame derivable
// (Remotion's out-of-order/parallel frame model — see mechanics.ts's own rationale): a seeded
// hue, drifting diagonal sheen bands, two slow-rotating geometric rings, scanlines, and a
// vignette. The asset id survives only as a small corner tag.
const BackgroundClipPlaceholder: React.FC<{ entry: AtmosphereBackgroundEntry; accent: string }> = ({
  entry,
  accent,
}) => {
  const frame = useCurrentFrame();
  const { fps, height } = useVideoConfig();
  const t = frame / fps;
  const seed = entry.asset_library_id;
  const rand = (n: number) => {
    const x = Math.sin(seed * 127.1 + n * 311.7) * 43758.5453;
    return x - Math.floor(x);
  };
  const hueA = 205 + Math.floor(rand(1) * 50); // deep blue-violet band, varies per entry
  const hueB = 260 + Math.floor(rand(2) * 60);
  const drift = t * 26; // px/s sheen travel
  const spinA = t * (4 + rand(3) * 4) + rand(4) * 360;
  const spinB = -t * (3 + rand(5) * 3) + rand(6) * 360;

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {/* Deep tonal base */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(120% 90% at ${20 + rand(7) * 60}% ${25 + rand(8) * 40}%, hsl(${hueA} 45% 16%) 0%, ${colors.bg[0]} 62%), radial-gradient(80% 70% at ${70 - rand(9) * 40}% 80%, hsl(${hueB} 40% 13%) 0%, transparent 70%)`,
        }}
      />
      {/* Drifting diagonal sheen bands */}
      <AbsoluteFill
        style={{
          background: `repeating-linear-gradient(115deg, transparent 0px, transparent 140px, ${accent}0d 200px, transparent 260px, ${accent}08 380px, transparent 460px)`,
          backgroundPositionX: `${drift % 600}px`,
          filter: "blur(2px)",
        }}
      />
      {/* Slow-rotating geometric rings */}
      <div
        style={{
          position: "absolute",
          left: `${12 + rand(10) * 20}%`,
          top: `${18 + rand(11) * 30}%`,
          width: height * 0.55,
          height: height * 0.55,
          borderRadius: "50%",
          border: `2px solid ${accent}1f`,
          boxShadow: `inset 0 0 60px ${accent}12`,
          transform: `translate(-50%, -50%) rotate(${spinA}deg)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: `${55 + rand(12) * 30}%`,
          top: `${45 + rand(13) * 35}%`,
          width: height * 0.38,
          height: height * 0.38,
          border: `1px dashed ${accent}2e`,
          transform: `translate(-50%, -50%) rotate(${spinB}deg)`,
        }}
      />
      {/* Scanlines + vignette */}
      <AbsoluteFill
        style={{
          background:
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.022) 0px, rgba(255,255,255,0.022) 1px, transparent 1px, transparent 4px)",
        }}
      />
      <AbsoluteFill
        style={{
          background: "radial-gradient(100% 100% at 50% 50%, transparent 55%, rgba(0, 0, 0, 0.55) 100%)",
        }}
      />
      {/* Corner asset tag */}
      <span
        style={{
          position: "absolute",
          right: 28,
          bottom: 20,
          color: colors.text.muted,
          fontFamily: typography.fontFamily.mono,
          fontSize: typography.fontSize.xs,
          opacity: 0.55,
          letterSpacing: "0.08em",
        }}
      >
        FEED-{seed}
      </span>
    </AbsoluteFill>
  );
};

