// design.md §5.2/§1.7 / tasks.md V5.14: the CIS-mode counterpart to `MasterSequence.tsx`'s
// legacy `scenes`+`component` composition loop. Additive — the legacy branch lives untouched
// inside `MasterSequence.tsx` itself; `MasterSequence` only dispatches into this component when
// `build` carries a `screens` array (§5.2). Sequences each `screens` row across its own
// [start, start+duration_ms] window (Pass-3-resolved timing, never re-derived here — same
// discipline as the legacy branch's scene bounds), dispatches each screen to its rendering
// strategy via `<CisScreenRenderer>`, and applies a baseline cut/fade `transitions` treatment
// between adjacent screens via `transitionOpacity` (`./transitions.ts`).
import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import { colors } from "@ytpipeline/design-tokens";
import { type CisBuildJson, type ScreenSpec, type TransitionSpec, resolveAccent } from "../types";
import { CisScreenRenderer } from "./CisScreenRenderer";
import { Captions } from "./Captions";
import { transitionOpacity } from "./transitions";

export const CisSequence: React.FC<{ build: CisBuildJson }> = ({ build }) => {
  const { fps } = useVideoConfig();
  const accent = resolveAccent(build.niche_key);

  // One `transitions` row connects exactly one (from_screen_id, to_screen_id) pair (§1.7) —
  // index both directions once so each screen's own Sequence looks up its incoming/outgoing
  // transition in O(1) instead of re-scanning `transitions` per screen.
  const incomingByScreenId: Record<number, TransitionSpec> = {};
  const outgoingByScreenId: Record<number, TransitionSpec> = {};
  for (const transition of build.transitions) {
    incomingByScreenId[transition.to_screen_id] = transition;
    outgoingByScreenId[transition.from_screen_id] = transition;
  }

  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg[0] }}>
      {build.screens.map((screen) => {
        const fromFrame = Math.round(screen.start * fps);
        const durationFrames = Math.max(1, Math.round((screen.duration_ms / 1000) * fps));
        return (
          <Sequence key={screen.screen_id} from={fromFrame} durationInFrames={durationFrames}>
            <TransitionedScreen
              screen={screen}
              accent={accent}
              transitionInType={incomingByScreenId[screen.screen_id]?.transition_type}
              transitionOutType={outgoingByScreenId[screen.screen_id]?.transition_type}
            />
          </Sequence>
        );
      })}
      <Captions words={build.words} accent={accent} />
    </AbsoluteFill>
  );
};

const TransitionedScreen: React.FC<{
  screen: ScreenSpec;
  accent: string;
  transitionInType: string | undefined;
  transitionOutType: string | undefined;
}> = ({ screen, accent, transitionInType, transitionOutType }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const opacity = transitionOpacity(t, screen.duration_ms / 1000, transitionInType, transitionOutType);

  return (
    <AbsoluteFill style={{ opacity }}>
      <CisScreenRenderer screen={screen} accent={accent} />
    </AbsoluteFill>
  );
};
