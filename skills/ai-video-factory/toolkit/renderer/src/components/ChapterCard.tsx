import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, typography } from "@ytpipeline/design-tokens";
import type { SceneProps } from "../types";
import { BeatLayer } from "./BeatLayer";
import { MANIFESTS, checkCueBounds } from "../manifests";
import { useIsVertical, vtext } from "./responsive";
import { charsRevealed } from "./mechanics";

const MANIFEST = MANIFESTS["chapter-card"];
const CARD_EASING = Easing.out(Easing.cubic);

export const ChapterCard: React.FC<SceneProps> = ({
  index,
  narration,
  cues,
  duration_ms,
  accent,
  title: propTitle,
  subtitle: propSubtitle,
  category: propCategory,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  const isVertical = useIsVertical();
  const fs = (kind: "micro" | "body" | "heading", fallbackPx: number) => vtext(kind, height, isVertical, fallbackPx);

  if (process.env.NODE_ENV !== "production") {
    for (const warning of checkCueBounds("chapter-card", cues, duration_ms)) {
      console.warn(warning);
    }
  }

  const totalSeconds = duration_ms / 1000;
  const wipeIn = interpolate(t, [0, Math.min(1.2, totalSeconds * 0.25)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: CARD_EASING,
  });
  const wipeOut = interpolate(t, [Math.max(0, totalSeconds - 0.5), totalSeconds], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: CARD_EASING,
  });
  const progress = Math.min(wipeIn, wipeOut);

  const displayTitle = propTitle || narration.slice(0, Math.min(charsRevealed(t, cues, MANIFEST) || narration.length, narration.length));
  const categoryTag = propCategory || "VISUAL EXPLAINER";
  const slideOffset = width * 0.04;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.bg[0],
        justifyContent: "center",
        alignItems: "center",
        backgroundImage: `radial-gradient(circle at 50% 50%, ${accent}15 0%, transparent 70%), linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)`,
        backgroundSize: "100% 100%, 60px 60px, 60px 60px",
      }}
    >
      <div
        style={{
          width: "82%",
          maxWidth: 1500,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: height * 0.025,
          opacity: progress,
          transform: `translateX(${(1 - progress) * -slideOffset}px)`,
        }}
      >
        {/* Category Badge & Chapter Number */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              padding: "6px 14px",
              borderRadius: 6,
              backgroundColor: `${accent}25`,
              border: `1px solid ${accent}`,
              fontFamily: typography.fontFamily.mono,
              fontSize: fs("micro", parseInt(typography.fontSize.sm, 10)),
              fontWeight: typography.fontWeight.semibold,
              color: accent,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            {categoryTag}
          </div>
          <div
            style={{
              fontFamily: typography.fontFamily.mono,
              fontSize: fs("micro", parseInt(typography.fontSize.base, 10)),
              fontWeight: typography.fontWeight.bold,
              color: colors.text.muted,
              letterSpacing: "0.08em",
            }}
          >
            SECTION #{String(index + 1).padStart(2, "0")}
          </div>
        </div>

        {/* Accent Bar */}
        <div
          style={{
            width: "100%",
            height: Math.max(3, height * 0.005),
            background: `linear-gradient(90deg, ${accent} 0%, ${accent}88 60%, transparent 100%)`,
            transform: `scaleX(${progress})`,
            transformOrigin: "left center",
            borderRadius: 2,
          }}
        />

        {/* Main Title */}
        <div
          style={{
            fontFamily: typography.fontFamily.display,
            fontSize: Math.min(116, height * 0.08),
            fontWeight: typography.fontWeight.bold,
            lineHeight: typography.lineHeight.tight,
            color: colors.text.primary,
            textShadow: `0 0 30px ${accent}40`,
            maxWidth: "95%",
          }}
        >
          {displayTitle}
        </div>

        {/* Subtitle / Context Note */}
        {propSubtitle && (
          <div
            style={{
              fontFamily: typography.fontFamily.display,
              fontSize: Math.min(54, height * 0.038),
              lineHeight: typography.lineHeight.normal,
              color: colors.text.secondary,
              backgroundColor: `${colors.bg[1]}cc`,
              padding: "16px 24px",
              borderRadius: 8,
              borderLeft: `4px solid ${accent}`,
              maxWidth: "90%",
            }}
          >
            {propSubtitle}
          </div>
        )}
      </div>
      <BeatLayer holdMs={duration_ms} seed={index} accent={accent} />
    </AbsoluteFill>
  );
};
