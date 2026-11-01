import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, motion as motionTokens, typography } from "@ytpipeline/design-tokens";
import type { SceneProps } from "../types";
import { BeatLayer } from "./BeatLayer";
import { MANIFESTS, checkCueBounds } from "../manifests";
import { useIsVertical, vtext, vspace } from "./responsive";

const SCRUTINY_EASING = Easing.bezier(...motionTokens.easing.scrutiny);

const DEFAULT_COMPARISON = {
  left_title: "THREAT ACTOR CLAIMS",
  left_badge: "ALLEGED WHITE-HAT",
  left_points: [
    "Claims to be securing exposed systems",
    "Says the operation is ethical hacking",
    "Frames the incident as a public service",
  ],
  right_title: "FORENSIC REALITY",
  right_badge: "CONFIRMED ADVERSARY",
  right_points: [
    "Encrypted and exfiltrated production data",
    "Demanded payment before any disclosure",
    "Matches known ransomware-as-a-service tooling",
  ],
};

export const ClaimEvidenceCompare: React.FC<SceneProps> = ({
  index,
  cues,
  duration_ms,
  accent,
  title: propTitle,
  narration,
  comparison: propComparison,
}) => {
  const frame = useCurrentFrame();
  const { fps, height } = useVideoConfig();
  const t = frame / fps;
  const isVertical = useIsVertical();
  const fs = (kind: "micro" | "body" | "heading", fallbackPx: number) => vtext(kind, height, isVertical, fallbackPx);
  const sp = (px: number) => vspace(px, isVertical);

  if (process.env.NODE_ENV !== "production") {
    for (const warning of checkCueBounds("claim-evidence-compare", cues, duration_ms)) {
      console.warn(warning);
    }
  }

  const compData = propComparison || DEFAULT_COMPARISON;
  // Content-authored comparisons may carry badges that the SceneProps.comparison type doesn't
  // name; `in`-narrow against the union instead of casting, so the read stays compiler-checked.
  //
  // Left/right column position carries NO truth value by itself -- most real comparisons here
  // are neutral splits (e.g. "office compromise" vs "controller compromise", "3.6 Flash" vs
  // "3.7 Flash", "model memory" vs "external retrieval"), not a claim being debunked. Stamping
  // an unconditional red "CLAIMED [X]" on the left and green "VERIFIED [✓]" on the right
  // regardless of which fact landed where has previously branded a confirmed, in-the-wild
  // zero-day as a false "CLAIMED" claim simply because it was placed in the left column. A side
  // only gets the strong claim/verdict treatment (colored badge pill + X/check icon) when the
  // caller *explicitly* supplies that side's badge, signalling "this really is a claim being
  // weighed against evidence" (see redo_ransom_busters_lesson.py's UNVERIFIED/CONFIRMED pairs).
  // Every other comparison renders as a plain, valence-free side-by-side split.
  const leftBadge =
    "left_badge" in compData && typeof compData.left_badge === "string" ? compData.left_badge : undefined;
  const rightBadge =
    "right_badge" in compData && typeof compData.right_badge === "string" ? compData.right_badge : undefined;
  const isForensicClaim = leftBadge !== undefined || rightBadge !== undefined;
  const totalSeconds = duration_ms / 1000;
  const progress = interpolate(t, [0, Math.min(1.8, totalSeconds * 0.35)], [0, 1], {
    easing: SCRUTINY_EASING,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.bg[0],
        justifyContent: "center",
        alignItems: "center",
        backgroundImage: `radial-gradient(circle at 50% 50%, ${accent}12 0%, transparent 70%), linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px)`,
        backgroundSize: "100% 100%, 50px 50px, 50px 50px",
      }}
    >
      <div
        style={{
          width: isVertical ? "94%" : "90%",
          maxWidth: isVertical ? undefined : 1600,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: sp(24),
        }}
      >
        {/* Header Badge */}
        <div style={{ display: "flex", flexDirection: isVertical ? "column" : "row", alignItems: "center", gap: sp(16) }}>
          <div
            style={{
              padding: `${sp(6)}px ${sp(16)}px`,
              borderRadius: 6,
              backgroundColor: `${accent}20`,
              border: `1px solid ${accent}`,
              fontFamily: typography.fontFamily.mono,
              fontSize: fs("micro", parseInt(typography.fontSize.sm, 10)),
              fontWeight: typography.fontWeight.bold,
              color: accent,
              letterSpacing: "0.1em",
            }}
          >
            {isForensicClaim ? "FORENSIC COMPARISON MATRIX" : "SIDE-BY-SIDE COMPARISON"}
          </div>
          <div
            style={{
              fontFamily: typography.fontFamily.display,
              fontSize: fs("heading", parseInt(typography.fontSize.xl, 10)),
              fontWeight: typography.fontWeight.bold,
              color: colors.text.primary,
              textAlign: "center",
            }}
          >
            {propTitle || "Comparing the Two Sides"}
          </div>
        </div>

        {/* Comparison cards -- stacked top-to-bottom on a vertical (Shorts) frame instead of
            side-by-side, so each card keeps a full-width reading column rather than squeezing
            into half the narrow frame's width. */}
        <div
          style={{
            display: "flex",
            flexDirection: isVertical ? "column" : "row",
            justifyContent: "space-between",
            width: "100%",
            gap: sp(32),
            marginTop: sp(8),
          }}
        >
          {/* Left Column */}
          <div
            style={{
              flex: 1,
              backgroundColor: colors.bg[1],
              border: `1px solid ${colors.border}`,
              borderRadius: 14,
              padding: `${sp(24)}px ${sp(28)}px`,
              display: "flex",
              flexDirection: "column",
              gap: sp(16),
              opacity: progress,
              transform: isVertical
                ? `translateY(${(1 - progress) * -30}px)`
                : `translateX(${(1 - progress) * -30}px)`,
              boxShadow: "0 10px 25px rgba(0,0,0,0.4)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${colors.border}`, paddingBottom: sp(12) }}>
              <div style={{ fontFamily: typography.fontFamily.display, fontSize: fs("heading", parseInt(typography.fontSize["2xl"], 10)), fontWeight: typography.fontWeight.bold, color: colors.text.primary }}>
                {compData.left_title}
              </div>
              {leftBadge && (
                <span style={{ fontSize: fs("micro", parseInt(typography.fontSize.sm, 10)), fontWeight: 700, backgroundColor: colors.bg[2], color: colors.text.secondary, padding: `${sp(5)}px ${sp(12)}px`, borderRadius: 4, fontFamily: typography.fontFamily.mono }}>
                  {leftBadge}
                </span>
              )}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: sp(12) }}>
              {compData.left_points.map((pt, i) => (
                <div key={`left-pt-${i}`} style={{ display: "flex", alignItems: "flex-start", gap: sp(10), fontFamily: typography.fontFamily.display, fontSize: fs("body", parseInt(typography.fontSize.lg, 10)), color: colors.text.secondary }}>
                  <span style={{ color: colors.text.muted, fontWeight: "bold" }}>{leftBadge ? "✕" : "•"}</span>
                  <span>{pt}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column */}
          <div
            style={{
              flex: 1,
              backgroundColor: colors.bg[1],
              border: `1px solid ${isForensicClaim ? accent : colors.border}`,
              borderRadius: 14,
              padding: `${sp(24)}px ${sp(28)}px`,
              display: "flex",
              flexDirection: "column",
              gap: sp(16),
              opacity: progress,
              transform: isVertical
                ? `translateY(${(1 - progress) * 30}px)`
                : `translateX(${(1 - progress) * 30}px)`,
              boxShadow: isForensicClaim ? `0 0 30px ${accent}25` : "0 10px 25px rgba(0,0,0,0.4)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${isForensicClaim ? `${accent}40` : colors.border}`, paddingBottom: sp(12) }}>
              <div style={{ fontFamily: typography.fontFamily.display, fontSize: fs("heading", parseInt(typography.fontSize["2xl"], 10)), fontWeight: typography.fontWeight.bold, color: colors.text.primary }}>
                {compData.right_title}
              </div>
              {rightBadge && (
                <span style={{ fontSize: fs("micro", parseInt(typography.fontSize.sm, 10)), fontWeight: 700, backgroundColor: `${accent}25`, color: accent, padding: `${sp(5)}px ${sp(12)}px`, borderRadius: 4, fontFamily: typography.fontFamily.mono }}>
                  {rightBadge}
                </span>
              )}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: sp(12) }}>
              {compData.right_points.map((pt, i) => (
                <div key={`right-pt-${i}`} style={{ display: "flex", alignItems: "flex-start", gap: sp(10), fontFamily: typography.fontFamily.display, fontSize: fs("body", parseInt(typography.fontSize.lg, 10)), color: colors.text.primary }}>
                  <span style={{ color: rightBadge ? accent : colors.text.muted, fontWeight: "bold" }}>{rightBadge ? "✓" : "•"}</span>
                  <span>{pt}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Narrative Bottom Callout */}
        <div
          style={{
            width: "100%",
            backgroundColor: `${colors.bg[1]}dd`,
            borderLeft: `4px solid ${accent}`,
            padding: `${sp(16)}px ${sp(24)}px`,
            borderRadius: 8,
            fontFamily: typography.fontFamily.display,
            fontSize: fs("body", parseInt(typography.fontSize.base, 10)),
            color: colors.text.primary,
            lineHeight: typography.lineHeight.normal,
            boxShadow: "0 6px 20px rgba(0,0,0,0.3)",
          }}
        >
          {narration}
        </div>
      </div>
      <BeatLayer holdMs={duration_ms} seed={index} accent={accent} />
    </AbsoluteFill>
  );
};
