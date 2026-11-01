// V5-REQ-3.4 / design.md §1.5: quick_hit_sting's backing component — pure playback of a
// referenced `asset_library` clip (mascot reaction / Tier 0-2 licensed sticker), never a
// data-driven diagram. The specific clip (`content.asset_library_id`) is selected upstream at
// the asset-selection layer (§6.1) and threaded through once the CIS build_json extension
// (V5.13/V5.14) lands — this component only owns the bounded entrance/exit chrome around
// whatever clip plays, per its own manifest's `max_animation_duration_ms` (750-2000ms).
import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, typography } from "@ytpipeline/design-tokens";
import type { SceneProps } from "../types";
import { MANIFESTS, checkCueBounds } from "../manifests";

const MANIFEST = MANIFESTS["asset-sting"];
const STING_EASING = Easing.out(Easing.cubic);

export const AssetSting: React.FC<SceneProps & { animation_description?: string }> = ({
  cues,
  duration_ms,
  accent,
  title,
  animation_description,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  if (process.env.NODE_ENV !== "production") {
    for (const warning of checkCueBounds("asset-sting", cues, duration_ms)) {
      console.warn(warning);
    }
  }

  // Entrance is bounded by the manifest's own animation cap (P5-REQ-3.2's clamp against
  // `max_animation_duration_ms`), but the sting VISUAL must persist for the whole screen --
  // the old code also faded out at the cap, leaving a 14-second beat blank after ~2s (the
  // "nonexistent render" defect). Rings expand once during the entrance window; the glyph,
  // glow, and caption hold until a short exit fade at the screen's own end.
  const totalSeconds = duration_ms / 1000;
  const animMs = Math.min(duration_ms, MANIFEST.max_animation_duration_ms ?? duration_ms);
  const animSeconds = animMs / 1000;
  const inProgress = interpolate(t, [0, animSeconds * 0.25], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: STING_EASING,
  });
  const EXIT_SECONDS = 0.6;
  const outProgress = interpolate(t, [totalSeconds - EXIT_SECONDS, totalSeconds], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: STING_EASING,
  });
  const progress = Math.min(inProgress, outProgress);

  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg[0], justifyContent: "center", alignItems: "center" }}>
      {/* Radial burst glow */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(45% 45% at 50% 46%, ${accent}2e 0%, transparent 70%)`,
          opacity: progress,
        }}
      />
      {/* Expanding shockwave rings */}
      {[0, 1, 2].map((ring) => {
        const ringT = Math.min(1, Math.max(0, (t - ring * 0.12) / (animSeconds * 0.6)));
        const size = 160 + ringT * 620;
        return (
          <div
            key={`ring-${ring}`}
            style={{
              position: "absolute",
              left: "50%",
              top: "46%",
              width: size,
              height: size,
              borderRadius: "50%",
              border: `${3 - ring}px solid ${accent}${ring === 0 ? "66" : ring === 1 ? "3d" : "1f"}`,
              transform: "translate(-50%, -50%)",
              opacity: (1 - ringT) * progress,
            }}
          />
        );
      })}
      {/* Accent impact glyph */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "46%",
          transform: `translate(-50%, -50%) scale(${0.7 + 0.3 * progress}) rotate(${progress * 4}deg)`,
          width: 220,
          height: 220,
          borderRadius: 32,
          backgroundColor: colors.bg[1],
          border: `3px solid ${accent}`,
          boxShadow: `0 0 70px ${accent}55, 0 20px 50px rgba(0,0,0,0.6)`,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          opacity: progress,
        }}
      >
        <span style={{ fontSize: 110, color: accent, fontWeight: 900 }}>{"\u26A1"}</span>
      </div>
      {/* Sting caption */}
      {(animation_description || title) && (
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "72%",
            transform: `translateX(-50%) translateY(${(1 - progress) * 24}px)`,
            maxWidth: "72%",
            textAlign: "center",
            fontFamily: typography.fontFamily.display,
            fontSize: typography.fontSize.xl,
            fontWeight: typography.fontWeight.bold,
            color: colors.text.primary,
            textShadow: "0 4px 24px rgba(0,0,0,0.8)",
            opacity: progress,
          }}
        >
          {animation_description || title}
        </div>
      )}
    </AbsoluteFill>
  );
};
