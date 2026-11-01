import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, motion as motionTokens, typography } from "@ytpipeline/design-tokens";
import type { SceneProps } from "../types";
import { MANIFESTS, checkCueBounds } from "../manifests";
import { useIsVertical, vtext, vspace } from "./responsive";

const SCRUTINY_EASING = Easing.bezier(...motionTokens.easing.scrutiny);

/**
 * Replaces `engine/app/synthesis/evidence_media.py`'s flat PIL-drawn "SOURCE EVIDENCE" card
 * (a hand-drawn bitmap dumped full-bleed by the legacy `EvidenceMedia.tsx` path). That card was
 * a deliberate stopgap ("Original source-evidence cards used when a literal third-party
 * screenshot is unnecessary") that reads as generic/AI-slop: static text on a flat panel, no
 * real design system, no motion, no browser-chrome cue that this is a citation of a REAL page.
 *
 * This component renders the same underlying data (domain, headline, excerpt/pull-quote, URL)
 * through the project's actual design tokens and a faux browser-chrome frame, so a citation
 * reads as "here is the real page this claim comes from" rather than a text-dump placeholder.
 * `title`/`subtitle`/`badge`/`narration`/`source_url` are the exact SceneProps fields
 * `screenToSceneProps` already threads through generically — no new plumbing beyond
 * `source_url` (types.ts) was needed to wire this component in.
 */
export const SourceCitation: React.FC<SceneProps> = ({
  index,
  cues,
  duration_ms,
  accent,
  title,
  subtitle,
  badge,
  narration,
  source_url,
}) => {
  const frame = useCurrentFrame();
  const { fps, height } = useVideoConfig();
  const t = frame / fps;
  const isVertical = useIsVertical();
  const fs = (kind: "micro" | "body" | "heading", fallbackPx: number) => vtext(kind, height, isVertical, fallbackPx);
  const sp = (px: number) => vspace(px, isVertical);

  if (process.env.NODE_ENV !== "production") {
    for (const warning of checkCueBounds("source-citation", cues, duration_ms)) {
      console.warn(warning);
    }
  }

  const domain = (subtitle || "source").toUpperCase();
  const headline = title || "Primary reporting used for this video";
  const excerpt = narration || "";
  const url = source_url || "";

  const totalSeconds = duration_ms / 1000;
  const reveal = interpolate(t, [0, Math.min(1.4, totalSeconds * 0.3)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: SCRUTINY_EASING,
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.bg[0],
        justifyContent: "center",
        alignItems: "center",
        backgroundImage: `radial-gradient(circle at 50% 30%, ${accent}12 0%, transparent 65%), linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)`,
        backgroundSize: "100% 100%, 50px 50px, 50px 50px",
      }}
    >
      <div
        style={{
          width: isVertical ? "92%" : "78%",
          maxWidth: isVertical ? undefined : 1500,
          opacity: reveal,
          transform: `translateY(${(1 - reveal) * 24}px)`,
          borderRadius: 16,
          overflow: "hidden",
          backgroundColor: colors.bg[1],
          border: `1px solid ${colors.border}`,
          boxShadow: `0 24px 60px rgba(0,0,0,0.5), 0 0 0 1px ${accent}18`,
        }}
      >
        {/* Faux browser chrome — reads unmistakably as "a real page", not a text-dump card. */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: sp(10),
            padding: `${sp(14)}px ${sp(20)}px`,
            backgroundColor: colors.bg[2],
            borderBottom: `1px solid ${colors.border}`,
          }}
        >
          <div style={{ display: "flex", gap: sp(7) }}>
            {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
              <div key={c} style={{ width: sp(11), height: sp(11), borderRadius: "50%", backgroundColor: c, opacity: 0.85 }} />
            ))}
          </div>
          <div
            style={{
              flex: 1,
              marginLeft: sp(8),
              padding: `${sp(6)}px ${sp(14)}px`,
              borderRadius: 6,
              backgroundColor: colors.bg[0],
              border: `1px solid ${colors.border}`,
              fontFamily: typography.fontFamily.mono,
              fontSize: fs("micro", parseInt(typography.fontSize.sm, 10)),
              color: colors.text.muted,
              display: "flex",
              alignItems: "center",
              gap: sp(8),
              overflow: "hidden",
              whiteSpace: "nowrap",
            }}
          >
            <span style={{ color: colors.status.success }}>&#128274;</span>
            <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{url || domain.toLowerCase()}</span>
          </div>
        </div>

        {/* Card body */}
        <div style={{ padding: `${sp(36)}px ${sp(44)}px`, display: "flex", flexDirection: "column", gap: sp(18) }}>
          <div style={{ display: "flex", alignItems: "center", gap: sp(12) }}>
            <div
              style={{
                padding: `${sp(6)}px ${sp(14)}px`,
                borderRadius: 6,
                backgroundColor: `${accent}20`,
                border: `1px solid ${accent}`,
                fontFamily: typography.fontFamily.mono,
                fontSize: fs("micro", parseInt(typography.fontSize.sm, 10)),
                fontWeight: typography.fontWeight.bold,
                color: accent,
                letterSpacing: "0.08em",
              }}
            >
              {badge || "VERIFIED SOURCE"}
            </div>
            <div
              style={{
                fontFamily: typography.fontFamily.mono,
                fontSize: fs("micro", parseInt(typography.fontSize.sm, 10)),
                fontWeight: typography.fontWeight.medium,
                color: colors.text.muted,
                letterSpacing: "0.08em",
              }}
            >
              {domain}
            </div>
          </div>

          <div
            style={{
              fontFamily: typography.fontFamily.display,
              fontSize: fs("heading", parseInt(typography.fontSize["3xl"], 10)),
              fontWeight: typography.fontWeight.bold,
              lineHeight: typography.lineHeight.tight,
              color: colors.text.primary,
            }}
          >
            {headline}
          </div>

          {excerpt ? (
            <div
              style={{
                borderLeft: `4px solid ${accent}`,
                paddingLeft: sp(20),
                fontFamily: typography.fontFamily.display,
                fontSize: fs("body", parseInt(typography.fontSize.lg, 10)),
                lineHeight: typography.lineHeight.relaxed,
                color: colors.text.secondary,
              }}
            >
              {excerpt}
            </div>
          ) : null}
        </div>
      </div>
    </AbsoluteFill>
  );
};
