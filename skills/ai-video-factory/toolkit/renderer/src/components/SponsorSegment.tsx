// V5-REQ-3.6 / design.md §1.5: sponsor_segment's backing component — generic sponsor-card
// layout for human-authored ad copy (`manifest.copy_source: "human_only"`, hard-checked at
// screen-generation time, not here — this component only ever renders the `narration` string
// it's handed, same as every other prop-driven-from-manifest component; it never generates or
// paraphrases sponsor copy itself).
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, typography } from "@ytpipeline/design-tokens";
import type { SceneProps } from "../types";
import { BeatLayer } from "./BeatLayer";
import { MANIFESTS, checkCueBounds } from "../manifests";
import { useIsVertical, vtext, vspace } from "./responsive";

const MANIFEST = MANIFESTS["sponsor-segment"];
const FADE_SECONDS = 0.4;

export const SponsorSegment: React.FC<SceneProps> = ({ index, narration, cues, duration_ms, accent }) => {
  const frame = useCurrentFrame();
  const { fps, height } = useVideoConfig();
  const t = frame / fps;
  const isVertical = useIsVertical();
  const fs = (kind: "micro" | "body" | "heading", fallbackPx: number) => vtext(kind, height, isVertical, fallbackPx);
  const sp = (px: number) => vspace(px, isVertical);

  if (process.env.NODE_ENV !== "production") {
    for (const warning of checkCueBounds("sponsor-segment", cues, duration_ms)) {
      console.warn(warning);
    }
  }

  const fadeIn = interpolate(t, [0, FADE_SECONDS], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg[0], justifyContent: "center", alignItems: "center" }}>
      <div
        style={{
          width: isVertical ? "88%" : "72%",
          borderRadius: 14,
          backgroundColor: colors.bg[1],
          border: `1px solid ${colors.border}`,
          padding: `${sp(32)}px ${sp(40)}px`,
          opacity: fadeIn,
        }}
      >
        <div
          style={{
            display: "inline-block",
            padding: `${sp(4)}px ${sp(12)}px`,
            borderRadius: 999,
            backgroundColor: accent,
            color: colors.bg[0],
            fontFamily: typography.fontFamily.display,
            fontSize: fs("micro", parseInt(typography.fontSize.xs, 10)),
            fontWeight: typography.fontWeight.semibold,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: sp(16),
          }}
        >
          Sponsored
        </div>
        <div
          style={{
            fontFamily: typography.fontFamily.display,
            fontSize: fs("heading", parseInt(typography.fontSize.xl, 10)),
            lineHeight: typography.lineHeight.snug,
            color: colors.text.primary,
          }}
        >
          {narration}
        </div>
      </div>
      <BeatLayer holdMs={duration_ms} seed={index} accent={accent} />
    </AbsoluteFill>
  );
};
