import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, motion as motionTokens, typography } from "@ytpipeline/design-tokens";
import type { SceneProps } from "../types";
import { BeatLayer } from "./BeatLayer";
import { MANIFESTS, checkCueBounds } from "../manifests";
import { useIsVertical, vtext, vspace } from "./responsive";

const FORENSIC_EASING = Easing.bezier(...motionTokens.easing.forensic);

const TIMELINE_MILESTONES = [
  { date: "2023 - 2024", title: "RaaS Panel Persistence", desc: "Infiltration of administrative backend infrastructure" },
  { date: "MID 2025", title: "City Forum Campaign", desc: "Industrialized scraping across enterprise portals" },
  { date: "Q1 2026", title: "UNC6671 Operations", desc: "Work Panel automated vishing netting $8M+" },
  { date: "Q2 2026", title: "Ransom Busters Emergence", desc: "Parallel rogue double-extortion scheme" },
];

export const TimelineMarker: React.FC<SceneProps> = ({
  index,
  narration,
  cues,
  duration_ms,
  accent,
  title: propTitle,
  timeline_events: propTimelineEvents,
}) => {
  const frame = useCurrentFrame();
  const { fps, height } = useVideoConfig();
  const t = frame / fps;
  const isVertical = useIsVertical();
  const fs = (kind: "micro" | "body" | "heading", fallbackPx: number) => vtext(kind, height, isVertical, fallbackPx);
  const sp = (px: number) => vspace(px, isVertical);

  if (process.env.NODE_ENV !== "production") {
    for (const warning of checkCueBounds("timeline-marker", cues, duration_ms)) {
      console.warn(warning);
    }
  }

  const totalSeconds = duration_ms / 1000;
  const progress = interpolate(t, [0, Math.min(2.0, totalSeconds * 0.4)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: FORENSIC_EASING,
  });
  const milestones = propTimelineEvents?.length ? propTimelineEvents : TIMELINE_MILESTONES;

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
          gap: sp(28),
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
            CHRONOLOGICAL TIMELINE // 2023 - 2026
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
            {propTitle || "Threat Actor Persistence & Campaign Timeline"}
          </div>
        </div>

        {/* Milestone Progression Cards -- top-to-bottom chronology on a vertical (Shorts)
            frame instead of a left-to-right row, so each milestone keeps a full-width
            reading column instead of squeezing into a quarter of the narrow frame. */}
        <div
          style={{
            display: "flex",
            flexDirection: isVertical ? "column" : "row",
            justifyContent: "space-between",
            width: "100%",
            gap: sp(18),
            marginTop: sp(12),
            position: "relative",
          }}
        >
          {milestones.map((m, idx) => {
            const milestoneReveal = interpolate(t, [idx * 0.35, idx * 0.35 + 0.5], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: FORENSIC_EASING,
            });

            const isCurrent = idx === milestones.length - 1;

            return (
              <div
                key={`milestone-${idx}`}
                style={{
                  flex: isVertical ? undefined : 1,
                  width: isVertical ? "100%" : undefined,
                  backgroundColor: colors.bg[1],
                  border: `1px solid ${isCurrent ? accent : colors.border}`,
                  borderRadius: 12,
                  padding: `${sp(20)}px ${sp(20)}px`,
                  display: "flex",
                  flexDirection: "column",
                  gap: sp(10),
                  opacity: milestoneReveal,
                  transform: `translateY(${(1 - milestoneReveal) * 20}px)`,
                  boxShadow: isCurrent ? `0 0 25px ${accent}35` : "0 6px 20px rgba(0,0,0,0.4)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span
                    style={{
                      fontFamily: typography.fontFamily.mono,
                      fontSize: fs("micro", parseInt(typography.fontSize.sm, 10)),
                      fontWeight: typography.fontWeight.bold,
                      color: isCurrent ? accent : colors.text.muted,
                      backgroundColor: `${colors.bg[0]}aa`,
                      padding: `${sp(4)}px ${sp(10)}px`,
                      borderRadius: 4,
                    }}
                  >
                    {m.date}
                  </span>
                  {isCurrent && (
                    <span
                      style={{
                        fontSize: fs("micro", 10),
                        fontWeight: 700,
                        backgroundColor: accent,
                        color: colors.bg[0],
                        padding: `${sp(2)}px ${sp(6)}px`,
                        borderRadius: 4,
                        fontFamily: typography.fontFamily.mono,
                      }}
                    >
                      CURRENT
                    </span>
                  )}
                </div>
                <div
                  style={{
                    fontFamily: typography.fontFamily.display,
                    fontSize: fs("body", parseInt(typography.fontSize.base, 10)),
                    fontWeight: typography.fontWeight.bold,
                    color: colors.text.primary,
                    lineHeight: typography.lineHeight.snug,
                  }}
                >
                  {m.title}
                </div>
                <div
                  style={{
                    fontFamily: typography.fontFamily.display,
                    fontSize: fs("micro", parseInt(typography.fontSize.sm, 10)),
                    color: colors.text.secondary,
                    lineHeight: typography.lineHeight.normal,
                  }}
                >
                  {m.desc}
                </div>
              </div>
            );
          })}
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
