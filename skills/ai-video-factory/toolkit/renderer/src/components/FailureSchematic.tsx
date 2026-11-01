import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, motion as motionTokens, typography } from "@ytpipeline/design-tokens";
import type { SceneProps } from "../types";
import { BeatLayer } from "./BeatLayer";
import { MANIFESTS, checkCueBounds } from "../manifests";
import { useIsVertical, vtext, vspace } from "./responsive";

const FORENSIC_EASING = Easing.bezier(...motionTokens.easing.forensic);

const DEFAULT_ATTACK_STEPS = [
  { step: "01", title: "Target Identification", desc: "Harvest active breach victim directory & C-Suite contact points" },
  { step: "02", title: "RaaS Panel Infiltration", desc: "Exploit administrative portal zero-days & command injection" },
  { step: "03", title: "Exfiltration Mirroring", desc: "Duplicate proprietary database dumps before cartel encryption" },
  { step: "04", title: "Parallel Extortion", desc: "Launch rogue 'Ransom Busters' $60,000 data deletion offer" },
];

export const FailureSchematic: React.FC<SceneProps> = ({
  index,
  cues,
  duration_ms,
  accent,
  title: propTitle,
  narration,
  steps: propSteps,
}) => {
  const frame = useCurrentFrame();
  const { fps, height } = useVideoConfig();
  const t = frame / fps;
  const isVertical = useIsVertical();
  const fs = (kind: "micro" | "body" | "heading", fallbackPx: number) => vtext(kind, height, isVertical, fallbackPx);
  const sp = (px: number) => vspace(px, isVertical);

  if (process.env.NODE_ENV !== "production") {
    for (const warning of checkCueBounds("failure-schematic", cues, duration_ms)) {
      console.warn(warning);
    }
  }

  // `status` (e.g. "Critical", "Manual step") is real per-step semantics the story author can
  // opt into -- never inferred from a step's position. Previously the last step in ANY
  // sequence was unconditionally stamped "CRITICAL" regardless of content (a satellite SOS
  // button press, a browser relaunch instruction) purely because it was last; that inversion
  // is gone. No current caller sets `status` yet, so today this renders no badge at all until
  // content generation is updated to supply one deliberately.
  const stepsToRender = propSteps && propSteps.length > 0
    ? propSteps.map((s, i) => ({ step: String(i + 1).padStart(2, "0"), title: s.title, desc: s.desc || "", status: s.status }))
    : DEFAULT_ATTACK_STEPS.map((s) => ({ ...s, status: undefined as string | undefined }));

  const totalSeconds = duration_ms / 1000;
  const progress = interpolate(t, [0, Math.min(2.0, totalSeconds * 0.4)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: FORENSIC_EASING,
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
          gap: sp(28),
        }}
      >
        {/* Header Bar */}
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
            PROCESS FLOW
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
            {propTitle || "Ransomware Infiltration & Double Extortion Architecture"}
          </div>
        </div>

        {/* Step Flowchart Cards -- top-to-bottom with a "↓" connector on a vertical (Shorts)
            frame instead of a left-to-right row of "→"-connected cards, so each stage keeps a
            full-width reading column instead of squeezing into a quarter of the narrow frame. */}
        <div
          style={{
            display: "flex",
            flexDirection: isVertical ? "column" : "row",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            gap: sp(16),
            marginTop: sp(10),
          }}
        >
          {stepsToRender.map((step, idx) => {
            const stepReveal = interpolate(t, [idx * 0.35, idx * 0.35 + 0.5], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: FORENSIC_EASING,
            });

            return (
              <React.Fragment key={`step-${idx}`}>
                <div
                  style={{
                    flex: isVertical ? undefined : 1,
                    width: isVertical ? "100%" : undefined,
                    backgroundColor: colors.bg[1],
                    border: `1px solid ${step.status ? accent : colors.border}`,
                    borderRadius: 12,
                    padding: `${sp(20)}px ${sp(20)}px`,
                    display: "flex",
                    flexDirection: "column",
                    gap: sp(10),
                    opacity: stepReveal,
                    transform: `translateY(${(1 - stepReveal) * 20}px)`,
                    boxShadow: step.status ? `0 0 25px ${accent}30` : "0 8px 20px rgba(0,0,0,0.4)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span
                      style={{
                        fontFamily: typography.fontFamily.mono,
                        fontSize: fs("micro", parseInt(typography.fontSize.sm, 10)),
                        fontWeight: typography.fontWeight.bold,
                        color: step.status ? accent : colors.text.muted,
                        backgroundColor: `${colors.bg[0]}aa`,
                        padding: `${sp(3)}px ${sp(8)}px`,
                        borderRadius: 4,
                      }}
                    >
                      STAGE {step.step}
                    </span>
                    {step.status && (
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
                        {step.status.toUpperCase()}
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
                    {step.title}
                  </div>
                  <div
                    style={{
                      fontFamily: typography.fontFamily.display,
                      fontSize: fs("micro", parseInt(typography.fontSize.sm, 10)),
                      color: colors.text.secondary,
                      lineHeight: typography.lineHeight.normal,
                    }}
                  >
                    {step.desc}
                  </div>
                </div>

                {idx < stepsToRender.length - 1 && (
                  <div
                    style={{
                      color: accent,
                      fontSize: fs("heading", 24),
                      opacity: progress,
                      fontWeight: "bold",
                    }}
                  >
                    {isVertical ? "\u2193" : "\u2192"}
                  </div>
                )}
              </React.Fragment>
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
