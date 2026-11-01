import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, motion as motionTokens, typography } from "@ytpipeline/design-tokens";
import type { SceneProps } from "../types";
import { BeatLayer } from "./BeatLayer";
import { MANIFESTS, checkCueBounds } from "../manifests";
import { charsRevealed } from "./mechanics";
import { useIsVertical, vtext } from "./responsive";

const MANIFEST = MANIFESTS["verdict-card"];
const SCRUTINY_EASING = Easing.bezier(...motionTokens.easing.scrutiny);
const TRANSITION_SECONDS = motionTokens.duration.scrutiny / 1000;

function splitClaimJustification(narration: string): { claim: string; justification: string } {
  const sentences = (narration.match(/[^.!?]+[.!?]*/g) ?? [narration]).map((s) => s.trim()).filter(Boolean);
  if (sentences.length >= 2) {
    const mid = Math.ceil(sentences.length / 2);
    return { claim: sentences.slice(0, mid).join(" "), justification: sentences.slice(mid).join(" ") };
  }
  const words = narration.split(" ");
  const mid = Math.ceil(words.length / 2);
  return { claim: words.slice(0, mid).join(" "), justification: words.slice(mid).join(" ") };
}

type VerdictTag = "TRUE" | "FALSE" | "PARTIALLY TRUE" | "ASSESSMENT" | "KEY METRIC" | "EXTORTION TELEMETRY" | "DEFENDER MANDATE" | "SCALE ANALYSIS";

function classifyVerdict(text: string): VerdictTag {
  const lower = text.toLowerCase();
  if (/partiall?y true|partly true|half.?true/.test(lower)) return "PARTIALLY TRUE";
  if (/\bfalse\b|\bbusted\b|\bdebunked\b|\bincorrect\b/.test(lower)) return "FALSE";
  if (/\btrue\b|\bconfirmed\b|\baccurate\b|\bcorrect\b/.test(lower)) return "TRUE";
  if (/metric|surge|average|cost|percent|payout|\$|million|thousand/.test(lower)) return "KEY METRIC";
  if (/mandate|rule|takeaway|protocol|advice/.test(lower)) return "DEFENDER MANDATE";
  return "ASSESSMENT";
}

const VERDICT_COLOR: Record<string, string> = {
  TRUE: colors.status.success,
  FALSE: colors.status.error,
  "PARTIALLY TRUE": colors.status.warning,
  ASSESSMENT: colors.status.info,
  "KEY METRIC": "#FF3B4E",
  "EXTORTION TELEMETRY": "#FF8A3D",
  "DEFENDER MANDATE": "#5EEAD4",
  "SCALE ANALYSIS": "#38BDF8",
};

export const VerdictCard: React.FC<SceneProps> = ({
  index,
  narration,
  cues,
  duration_ms,
  accent,
  title: propTitle,
  metric: propMetric,
  metric_label: propMetricLabel,
  metric_change: propMetricChange,
  badge: propBadge,
  chart: propChart,
}) => {
  const frame = useCurrentFrame();
  const { fps, height } = useVideoConfig();
  const t = frame / fps;
  const isVertical = useIsVertical();
  const fs = (kind: "micro" | "body" | "heading", fallbackPx: number) => vtext(kind, height, isVertical, fallbackPx);

  if (process.env.NODE_ENV !== "production") {
    for (const warning of checkCueBounds("verdict-card", cues, duration_ms)) {
      console.warn(warning);
    }
  }

  // Check if narration has obvious prominent numbers/metrics if propMetric is not explicitly passed
  let autoMetric = propMetric;
  let autoMetricLabel = propMetricLabel;
  if (!autoMetric) {
    if (narration.includes("one hundred and seventy-six percent") || narration.includes("176%")) {
      autoMetric = "+176% SURGE";
      autoMetricLabel = "AVERAGE RANSOM SURGE (Q1 -> Q2 2026)";
    } else if (narration.includes("one point eight eight million") || narration.includes("$1.88M") || narration.includes("1,880,612")) {
      autoMetric = "$1,880,612";
      autoMetricLabel = "AVERAGE CORPORATE RANSOM PAYOUT";
    } else if (narration.includes("sixty thousand dollars") || narration.includes("$60,000")) {
      autoMetric = "$20,000 - $60,000";
      autoMetricLabel = "RANSOM BUSTERS EXTORTION FEE";
    } else if (narration.includes("seventy-six major enterprises") || narration.includes("76")) {
      autoMetric = "76 ENTERPRISES ($8M+)";
      autoMetricLabel = "UNC6671 VISHING VICTIMS EXTORTED";
    } else if (narration.includes("fifty-seven percent") || narration.includes("57%")) {
      autoMetric = "57% (DOWN FROM 72%)";
      autoMetricLabel = "TOP 10 SYNDICATE MARKET SHARE";
    } else if (narration.includes("ninety-three active") || narration.includes("93")) {
      autoMetric = "93 ACTIVE GROUPS";
      autoMetricLabel = "RANSOMWARE ECOSYSTEM FRAGMENTATION";
    }
  }

  const { claim, justification } = splitClaimJustification(narration);
  const justificationVerdict = classifyVerdict(justification);
  const verdict = propBadge || (justificationVerdict !== "ASSESSMENT" ? justificationVerdict : classifyVerdict(narration));

  const totalSeconds = duration_ms / 1000;
  const revealProgress = interpolate(t, [0, Math.min(1.5, totalSeconds * 0.35)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: SCRUTINY_EASING,
  });

  const badgeColor = accent;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.bg[0],
        justifyContent: "center",
        alignItems: "center",
        backgroundImage: `radial-gradient(circle at 50% 40%, ${badgeColor}18 0%, transparent 65%)`,
      }}
    >
      <div
        style={{
          width: "82%",
          maxWidth: 1400,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: 20,
          opacity: revealProgress,
          transform: `scale(${0.94 + 0.06 * revealProgress})`,
        }}
      >
        {/* Badge */}
        <div
          style={{
            display: "inline-block",
            padding: "8px 22px",
            borderRadius: 8,
            backgroundColor: badgeColor,
            color: colors.bg[0],
            fontFamily: typography.fontFamily.mono,
            fontSize: fs("micro", parseInt(typography.fontSize.base, 10)),
            fontWeight: typography.fontWeight.bold,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            boxShadow: `0 0 25px ${badgeColor}60`,
          }}
        >
          {propTitle ? propTitle : verdict}
        </div>

        {/* Bar chart -- CLOUD_CODES_ANALYSIS.md-style escalation reveal, wired up for the
            first time via the `chart` prop that was already plumbed through screenToSceneProps
            but never rendered. Bars grow in sequence, tallest-relative-to-max scaled linearly
            (not log) so an escalating-but-underestimated pattern reads as visually dramatic. */}
        {propChart && propChart.bars && propChart.bars.length > 0 ? (
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "center",
              gap: isVertical ? 14 : 28,
              height: isVertical ? 260 : 340,
              width: "100%",
              padding: "0 12px",
            }}
          >
            {(() => {
              const bars = propChart.bars!;
              const maxValue = Math.max(...bars.map((b) => b.value));
              return bars.map((bar, i) => {
                const barStart = 0.25 + i * 0.22;
                const barProgress = interpolate(t, [barStart, barStart + 0.45], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                  easing: SCRUTINY_EASING,
                });
                const heightPct = Math.max(0.05, bar.value / maxValue) * barProgress;
                const barColor = bar.color || badgeColor;
                return (
                  <div
                    key={bar.label}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "flex-end",
                      height: "100%",
                      flex: 1,
                      maxWidth: 170,
                    }}
                  >
                    <div
                      style={{
                        fontFamily: typography.fontFamily.mono,
                        fontSize: fs("micro", 22),
                        fontWeight: typography.fontWeight.bold,
                        color: barColor,
                        marginBottom: 8,
                        opacity: barProgress,
                        whiteSpace: "nowrap",
                      }}
                    >
                      ${bar.value.toLocaleString()}
                    </div>
                    <div
                      style={{
                        width: "100%",
                        height: `${heightPct * 100}%`,
                        backgroundColor: barColor,
                        borderRadius: "6px 6px 0 0",
                        boxShadow: `0 0 24px ${barColor}50`,
                      }}
                    />
                    <div
                      style={{
                        fontFamily: typography.fontFamily.mono,
                        fontSize: fs("micro", 15),
                        color: colors.text.muted,
                        marginTop: 10,
                        letterSpacing: "0.05em",
                        textTransform: "uppercase",
                        textAlign: "center",
                      }}
                    >
                      {bar.label}
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        ) : autoMetric ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", margin: "10px 0" }}>
            <div
              style={{
                fontFamily: typography.fontFamily.mono,
                fontSize: Math.min(156, height * 0.105),
                fontWeight: 900,
                color: colors.text.primary,
                letterSpacing: "-0.02em",
                textShadow: `0 0 40px ${badgeColor}80`,
                lineHeight: 1,
              }}
            >
              {autoMetric}
            </div>
            {autoMetricLabel && (
              <div
                style={{
                  fontFamily: typography.fontFamily.mono,
                fontSize: fs("micro", parseInt(typography.fontSize.base, 10)),
                  color: badgeColor,
                  fontWeight: typography.fontWeight.semibold,
                  letterSpacing: "0.12em",
                  marginTop: 12,
                }}
              >
                {autoMetricLabel}
              </div>
            )}
          </div>
        ) : (
          <div
            style={{
              fontFamily: typography.fontFamily.display,
              fontSize: Math.min(104, height * 0.072),
              fontWeight: typography.fontWeight.semibold,
              color: colors.text.primary,
              lineHeight: typography.lineHeight.snug,
              maxWidth: "90%",
            }}
          >
            {claim}
          </div>
        )}

        {/* Analysis / Justification Banner -- suppressed in chart mode: the chart's own bar
            labels/values plus the burned-in caption bar already carry the narration, so a third
            copy of the same sentence stacked underneath would duplicate it (the exact pattern
            AtmosphereNarration.tsx's own header comment calls out and avoids). */}
        {!(propChart && propChart.bars && propChart.bars.length > 0) && (
          <div
            style={{
              fontFamily: typography.fontFamily.display,
              fontSize: Math.min(50, height * 0.035),
              lineHeight: typography.lineHeight.normal,
              color: colors.text.secondary,
              backgroundColor: `${colors.bg[1]}ee`,
              border: `1px solid ${badgeColor}40`,
              padding: "20px 32px",
              borderRadius: 12,
              maxWidth: "92%",
              boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
            }}
          >
            {justification || narration}
          </div>
        )}
      </div>
      <BeatLayer holdMs={duration_ms} seed={index} accent={accent} />
    </AbsoluteFill>
  );
};
