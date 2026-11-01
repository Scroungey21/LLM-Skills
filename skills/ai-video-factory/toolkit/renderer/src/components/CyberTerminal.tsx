import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, motion as motionTokens, typography } from "@ytpipeline/design-tokens";
import type { SceneProps } from "../types";
import { BeatLayer } from "./BeatLayer";
import { MANIFESTS, checkCueBounds } from "../manifests";
import { charsRevealed } from "./mechanics";
import { useIsVertical, vtext, vspace } from "./responsive";

const MANIFEST = MANIFESTS["cyber-terminal"];
const INCURSION_EASING = Easing.bezier(...motionTokens.easing.incursion);

export const CyberTerminal: React.FC<SceneProps> = ({
  index,
  narration,
  cues,
  duration_ms,
  accent,
  title: propTitle,
  command: propCommand,
  logs: propLogs,
  badge: propBadge,
}) => {
  const frame = useCurrentFrame();
  const { fps, height } = useVideoConfig();
  const t = frame / fps;
  const isVertical = useIsVertical();
  const fs = (kind: "micro" | "body" | "heading", fallbackPx: number) => vtext(kind, height, isVertical, fallbackPx);
  const sp = (px: number) => vspace(px, isVertical);

  if (process.env.NODE_ENV !== "production") {
    for (const warning of checkCueBounds("cyber-terminal", cues, duration_ms)) {
      console.warn(warning);
    }
  }

  // CIS-authored beats carry no typing cues (typing_chars = 0), so the manifest-capped
  // typewriter would reveal nothing forever — the "empty terminal" defect. With cues present
  // (legacy path) keep the faithful typewriter; without them show the full output at once.
  const revealed = cues.typing_chars > 0 ? charsRevealed(t, cues, MANIFEST) : narration.length;
  const visibleText = narration.slice(0, Math.min(revealed, narration.length));
  const cursorOn = Math.floor(t / 0.5) % 2 === 0;

  const mountProgress = interpolate(frame, [0, (motionTokens.duration.incursion / 1000) * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: INCURSION_EASING,
  });

  const displayCommand = propCommand || "echo \"no command specified for this beat\"";
  const displayLogs = propLogs?.slice(0, 3) || [];

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
          width: isVertical ? "94%" : "92%",
          maxWidth: isVertical ? undefined : 1760,
          borderRadius: 14,
          backgroundColor: colors.bg[1],
          border: `1px solid ${accent}60`,
          opacity: mountProgress,
          transform: `scale(${0.96 + 0.04 * mountProgress})`,
          overflow: "hidden",
          boxShadow: `0 0 35px ${accent}25, 0 15px 40px rgba(0,0,0,0.6)`,
        }}
      >
        {/* Terminal Title Bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: `${sp(16)}px ${sp(22)}px`,
            borderBottom: `1px solid ${colors.border}`,
            backgroundColor: `${colors.bg[0]}cc`,
          }}
        >
          <div style={{ display: "flex", gap: sp(8), alignItems: "center" }}>
            <div style={{ width: sp(12), height: sp(12), borderRadius: "50%", backgroundColor: colors.status.error }} />
            <div style={{ width: sp(12), height: sp(12), borderRadius: "50%", backgroundColor: colors.status.warning }} />
            <div style={{ width: sp(12), height: sp(12), borderRadius: "50%", backgroundColor: colors.status.success }} />
            <span
              style={{
                marginLeft: sp(12),
                fontFamily: typography.fontFamily.mono,
                fontSize: fs("micro", parseInt(typography.fontSize.xs, 10)),
                color: colors.text.muted,
              }}
            >
              litmus@research: ~/analysis
            </span>
          </div>

          <div
            style={{
              padding: `${sp(3)}px ${sp(10)}px`,
              borderRadius: 4,
              fontSize: fs("micro", 14),
              border: `1px solid ${accent}`,
              fontFamily: typography.fontFamily.mono,
              fontWeight: 700,
              color: accent,
            }}
          >
            {propBadge || "LIVE OUTPUT"}
          </div>
        </div>

        {/* Command Line & Forensics Content */}
        <div
          style={{
            padding: `${sp(32)}px ${sp(36)}px`,
            fontFamily: typography.fontFamily.mono,
            fontSize: fs("body", parseInt(typography.fontSize.base, 10)),
            lineHeight: 1.6,
            color: colors.text.primary,
            minHeight: 280,
            display: "flex",
            flexDirection: "column",
            gap: sp(16),
          }}
        >
          {/* Active Command */}
          <div style={{ color: colors.text.secondary }}>
            <span style={{ color: accent, fontWeight: "bold" }}>$ </span>
            <span style={{ color: accent }}>{displayCommand}</span>
          </div>
          {displayLogs.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: sp(6), color: colors.text.muted, fontSize: fs("micro", parseInt(typography.fontSize.sm, 10)) }}>
              {displayLogs.map((log, logIndex) => (
                <div key={`${log}-${logIndex}`}>
                  <span style={{ color: accent }}>›</span> {log}
                </div>
              ))}
            </div>
          )}

          {/* Typewriter Output */}
          <div
            style={{
              backgroundColor: `${colors.bg[0]}99`,
              padding: `${sp(18)}px ${sp(20)}px`,
              borderRadius: 8,
              borderLeft: `3px solid ${accent}`,
              fontSize: fs("body", parseInt(typography.fontSize.lg, 10)),
              fontFamily: typography.fontFamily.display,
              color: colors.text.primary,
              lineHeight: typography.lineHeight.normal,
            }}
          >
            {visibleText}
            <span style={{ color: accent, opacity: cursorOn ? 1 : 0, fontWeight: "bold" }}>{"\u2588"}</span>
          </div>
        </div>
      </div>
      <BeatLayer holdMs={duration_ms} seed={index} accent={accent} />
    </AbsoluteFill>
  );
};
