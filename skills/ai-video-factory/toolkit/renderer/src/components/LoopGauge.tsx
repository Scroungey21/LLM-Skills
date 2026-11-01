import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, motion as motionTokens, typography } from "@ytpipeline/design-tokens";
import type { SceneProps, LoopGaugeSpec } from "../types";
import { checkCueBounds } from "../manifests";
import { useIsVertical, vtext, vspace } from "./responsive";

const SCRUTINY_EASING = Easing.bezier(...motionTokens.easing.scrutiny);

/**
 * CLOUD_CODES_ANALYSIS.md R11 / CREATOR_STYLE_GUIDE.md `LoopGauge` row: a circular iteration
 * gauge for any "same process repeated N times" beat (a retry loop, a negotiation round, a
 * detection-response cycle) — not an LLM-architecture-specific component. Distinct from
 * `AILogicNode`'s fixed 3-tier topology: this is a composable primitive, not a monolithic
 * scene template, per the R15 direction (prefer small primitives over more fixed templates).
 *
 * The iteration counter and the milestone chips lighting up as the count passes their
 * threshold are R3-refined-Cardinal-Rule-compliant: they advance because they're revealing
 * real information tied to narration (an actual escalating count/cost), never a decorative
 * loop — once the beat's count/cost reaches its final value they hold, matching every other
 * component's "one clean reveal, then hold" convention.
 *
 * `LoopGaugeSpec` lives in types.ts (not here) so `CisScreenRenderer.tsx`'s dispatch-time
 * forwarding can validate/type `screens.content.loop` without a cross-component import — same
 * rationale as `MangaPanelLayer`. Added the same minimal way `chart`/`comparison` were: a
 * single typed object, not a flat prop-per-field.
 */
export const LoopGauge: React.FC<SceneProps> = ({
  cues,
  duration_ms,
  accent,
  title,
  loop,
}) => {
  const frame = useCurrentFrame();
  const { fps, height } = useVideoConfig();
  const t = frame / fps;
  const isVertical = useIsVertical();
  const fs = (kind: "micro" | "body" | "heading", fallbackPx: number) => vtext(kind, height, isVertical, fallbackPx);
  const sp = (px: number) => vspace(px, isVertical);

  if (process.env.NODE_ENV !== "production") {
    for (const warning of checkCueBounds("loop-gauge", cues, duration_ms)) {
      console.warn(warning);
    }
  }

  const spec: LoopGaugeSpec = loop ?? { in_label: "IN", out_label: "OUT", max_iterations: 10 };
  const totalSeconds = duration_ms / 1000;

  const reveal = interpolate(t, [0, Math.min(1.2, totalSeconds * 0.25)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: SCRUTINY_EASING,
  });

  // The count climbs across the beat's remaining runtime after the initial card reveal,
  // then holds at max_iterations — real information tied to duration, not a decorative loop.
  const countStart = Math.min(1.2, totalSeconds * 0.25);
  const countEnd = Math.max(countStart + 0.4, totalSeconds * 0.9);
  const progress = interpolate(t, [countStart, countEnd], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const currentCount = Math.round(progress * spec.max_iterations);
  const angle = progress * 360;
  const isInSide = currentCount % 2 === 0;

  const ringSize = isVertical ? 260 : 300;
  const radius = ringSize / 2 - 18;
  const markerX = ringSize / 2 + radius * Math.sin((angle * Math.PI) / 180);
  const markerY = ringSize / 2 - radius * Math.cos((angle * Math.PI) / 180);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.bg[0],
        justifyContent: "center",
        alignItems: "center",
        backgroundImage: `radial-gradient(circle at 50% 40%, ${accent}10 0%, transparent 60%)`,
      }}
    >
      <div
        style={{
          opacity: reveal,
          transform: `translateY(${(1 - reveal) * 20}px)`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: sp(28),
          width: isVertical ? "90%" : "70%",
        }}
      >
        {title ? (
          <div
            style={{
              fontFamily: typography.fontFamily.display,
              fontSize: fs("heading", parseInt(typography.fontSize["2xl"], 10)),
              fontWeight: typography.fontWeight.bold,
              color: colors.text.primary,
              textAlign: "center",
            }}
          >
            {title}
          </div>
        ) : null}

        <div style={{ position: "relative", width: ringSize, height: ringSize }}>
          <svg width={ringSize} height={ringSize} style={{ position: "absolute", top: 0, left: 0 }}>
            <circle
              cx={ringSize / 2}
              cy={ringSize / 2}
              r={radius}
              fill="none"
              stroke={colors.border}
              strokeWidth={2}
              strokeDasharray="1 7"
            />
            <circle
              cx={ringSize / 2}
              cy={ringSize / 2}
              r={radius}
              fill="none"
              stroke={accent}
              strokeWidth={3}
              strokeDasharray={`${2 * Math.PI * radius}`}
              strokeDashoffset={`${2 * Math.PI * radius * (1 - progress)}`}
              strokeLinecap="round"
              transform={`rotate(-90 ${ringSize / 2} ${ringSize / 2})`}
              opacity={0.85}
            />
          </svg>
          <div
            style={{
              position: "absolute",
              left: markerX - 9,
              top: markerY - 9,
              width: 18,
              height: 18,
              borderRadius: "50%",
              backgroundColor: accent,
              boxShadow: `0 0 16px ${accent}`,
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: sp(6),
            }}
          >
            <div
              style={{
                fontFamily: typography.fontFamily.mono,
                fontSize: fs("heading", 56),
                fontWeight: typography.fontWeight.bold,
                color: colors.text.primary,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {currentCount}
            </div>
            <div
              style={{
                fontFamily: typography.fontFamily.mono,
                fontSize: fs("micro", parseInt(typography.fontSize.xs, 10)),
                letterSpacing: "0.12em",
                color: colors.text.muted,
              }}
            >
              {spec.unit_label ?? "ITERATIONS"}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: sp(48), alignItems: "center" }}>
          <div
            style={{
              padding: `${sp(6)}px ${sp(16)}px`,
              borderRadius: 6,
              border: `1px solid ${isInSide ? accent : colors.border}`,
              backgroundColor: isInSide ? `${accent}20` : "transparent",
              fontFamily: typography.fontFamily.mono,
              fontSize: fs("micro", parseInt(typography.fontSize.sm, 10)),
              fontWeight: typography.fontWeight.bold,
              color: isInSide ? accent : colors.text.muted,
              letterSpacing: "0.08em",
              transition: "none",
            }}
          >
            {spec.in_label}
          </div>
          <div style={{ width: 40, height: 1, backgroundColor: colors.border }} />
          <div
            style={{
              padding: `${sp(6)}px ${sp(16)}px`,
              borderRadius: 6,
              border: `1px solid ${!isInSide ? accent : colors.border}`,
              backgroundColor: !isInSide ? `${accent}20` : "transparent",
              fontFamily: typography.fontFamily.mono,
              fontSize: fs("micro", parseInt(typography.fontSize.sm, 10)),
              fontWeight: typography.fontWeight.bold,
              color: !isInSide ? accent : colors.text.muted,
              letterSpacing: "0.08em",
            }}
          >
            {spec.out_label}
          </div>
        </div>

        {spec.milestones && spec.milestones.length > 0 ? (
          <div style={{ display: "flex", gap: sp(14), flexWrap: "wrap", justifyContent: "center" }}>
            {spec.milestones.map((m) => {
              const lit = currentCount >= m.at;
              return (
                <div
                  key={`${m.at}-${m.label}`}
                  style={{
                    padding: `${sp(8)}px ${sp(14)}px`,
                    borderRadius: 6,
                    border: `1px solid ${lit ? accent : colors.border}`,
                    backgroundColor: lit ? colors.bg[1] : "transparent",
                    opacity: lit ? 1 : 0.35,
                    fontFamily: typography.fontFamily.mono,
                    fontSize: fs("micro", parseInt(typography.fontSize.xs, 10)),
                    color: lit ? colors.text.primary : colors.text.muted,
                  }}
                >
                  {m.label}
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};
