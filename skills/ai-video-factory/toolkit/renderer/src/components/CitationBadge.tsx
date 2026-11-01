import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, motion as motionTokens, typography } from "@ytpipeline/design-tokens";
import type { SceneProps } from "../types";
import { checkCueBounds } from "../manifests";
import { useIsVertical, vtext, vspace } from "./responsive";

const SCRUTINY_EASING = Easing.bezier(...motionTokens.easing.scrutiny);

/**
 * CLOUD_CODES_ANALYSIS.md R16 / CREATOR_STYLE_GUIDE.md `CitationBadge` row: the compact
 * counterpart to `SourceCitation`'s full-screen evidence card. Reuses the exact same
 * `title`/`subtitle`/`badge`/`narration` `SceneProps` fields `SourceCitation` already threads
 * through generically (see that file's own header comment) — no new `screenToSceneProps`
 * plumbing needed, matching the precedent `AILogicNode`/`FailureSchematic`/
 * `ClaimEvidenceCompare`/`CyberTerminal`/`SponsorSegment` already set.
 *
 * Scoped limitation, stated plainly rather than silently claimed: this renders as its own
 * compact scene (small corner card on an otherwise minimal frame), not a true overlay
 * compositing on top of a *different*, simultaneously-still-animating scene the way the
 * @Cloud-Codes reference frames did (CLOUD_CODES_ANALYSIS.md §2.2 pattern 1). Real concurrent
 * multi-scene track compositing would require changes to `CisSequence.tsx`'s sequencing model
 * — a larger, shared-infrastructure change out of scope for this component. What this DOES
 * demonstrate concretely: a citation presented at a fraction of `SourceCitation`'s visual
 * weight and duration, for a beat that doesn't need the viewer's full attention.
 */
export const CitationBadge: React.FC<SceneProps> = ({
  cues,
  duration_ms,
  accent,
  title,
  subtitle,
  badge,
}) => {
  const frame = useCurrentFrame();
  const { fps, height } = useVideoConfig();
  const t = frame / fps;
  const isVertical = useIsVertical();
  const fs = (kind: "micro" | "body" | "heading", fallbackPx: number) => vtext(kind, height, isVertical, fallbackPx);
  const sp = (px: number) => vspace(px, isVertical);

  if (process.env.NODE_ENV !== "production") {
    for (const warning of checkCueBounds("citation-badge", cues, duration_ms)) {
      console.warn(warning);
    }
  }

  const totalSeconds = duration_ms / 1000;
  const reveal = interpolate(t, [0, Math.min(0.6, totalSeconds * 0.3)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: SCRUTINY_EASING,
  });

  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg[0] }}>
      <div
        style={{
          position: "absolute",
          right: sp(40),
          bottom: sp(40),
          maxWidth: isVertical ? "80%" : "42%",
          opacity: reveal,
          transform: `translateY(${(1 - reveal) * 16}px)`,
          borderRadius: 10,
          border: `1px solid ${colors.border}`,
          backgroundColor: colors.bg[1],
          boxShadow: `0 12px 30px rgba(0,0,0,0.45), 0 0 0 1px ${accent}14`,
          padding: `${sp(14)}px ${sp(18)}px`,
          display: "flex",
          flexDirection: "column",
          gap: sp(4),
        }}
      >
        {badge ? (
          <div
            style={{
              fontFamily: typography.fontFamily.mono,
              fontSize: fs("micro", parseInt(typography.fontSize.xs, 10)),
              fontWeight: typography.fontWeight.bold,
              color: accent,
              letterSpacing: "0.1em",
            }}
          >
            {badge}
          </div>
        ) : null}
        {title ? (
          <div
            style={{
              fontFamily: typography.fontFamily.display,
              fontSize: fs("body", parseInt(typography.fontSize.base, 10)),
              fontWeight: typography.fontWeight.bold,
              color: colors.text.primary,
            }}
          >
            {title}
          </div>
        ) : null}
        {subtitle ? (
          <div
            style={{
              fontFamily: typography.fontFamily.mono,
              fontSize: fs("micro", parseInt(typography.fontSize.xs, 10)),
              color: colors.text.muted,
            }}
          >
            {subtitle}
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};
