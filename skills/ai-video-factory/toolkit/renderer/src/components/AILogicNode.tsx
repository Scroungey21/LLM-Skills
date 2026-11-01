import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, motion as motionTokens, typography } from "@ytpipeline/design-tokens";
import type { SceneProps } from "../types";
import { BeatLayer } from "./BeatLayer";
import { MANIFESTS, checkCueBounds } from "../manifests";
import { useIsVertical, vtext, vspace } from "./responsive";

const SYNTHESIS_EASING = Easing.bezier(...motionTokens.easing.synthesis);

const DEFAULT_TIERS = [
  {
    tier: "ACCESS LAYER",
    nodes: [
      { name: "Executive Vishing", tag: "UNC6671", status: "Active" },
      { name: "MFA Intercept Relay", tag: "Teams / TURN", status: "Infiltrated" },
    ],
  },
  {
    tier: "ORCHESTRATION & C2",
    nodes: [
      { name: "Work Panel Console", tag: "Web C2", status: "Armed" },
      { name: "RaaS Backend APIs", tag: "DragonForce / Settra", status: "Targeted" },
    ],
  },
  {
    tier: "MONETIZATION LAYER",
    nodes: [
      { name: "Primary Cartel Ransom", tag: "Syndicate Share", status: "Stalled" },
      { name: "Ransom Busters Deletion", tag: "$60K Parallel Cut", status: "Exfiltrating" },
    ],
  },
];

export const AILogicNode: React.FC<SceneProps> = ({
  index,
  cues,
  duration_ms,
  accent,
  title: propTitle,
  narration,
  nodes: propNodes,
}) => {
  const frame = useCurrentFrame();
  const { fps, height } = useVideoConfig();
  const t = frame / fps;
  const isVertical = useIsVertical();
  const fs = (kind: "micro" | "body" | "heading", fallbackPx: number) => vtext(kind, height, isVertical, fallbackPx);
  const sp = (px: number) => vspace(px, isVertical);

  if (process.env.NODE_ENV !== "production") {
    for (const warning of checkCueBounds("ai-logic-node", cues, duration_ms)) {
      console.warn(warning);
    }
  }

  const totalSeconds = duration_ms / 1000;
  const progress = interpolate(t, [0, Math.min(2.0, totalSeconds * 0.4)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: SYNTHESIS_EASING,
  });
  // Content-authored nodes rarely carry an explicit `tier`, so without assignment every node
  // matched "ACCESS" and the OPERATE/OUTCOME columns rendered empty (the collapsed single-
  // column defect). Distribute unassigned nodes round-robin across all three tiers.
  const TIER_KEYS = ["ACCESS", "OPERATE", "OUTCOME"];
  const tiers = propNodes?.length
    ? TIER_KEYS.map((tier) => ({
        tier,
        nodes: propNodes
          .filter((node, nodeIdx) => (node.tier || TIER_KEYS[nodeIdx % 3]) === tier)
          .map((node) => ({ name: node.label, tag: node.id, status: node.status || "Observed" })),
      })).filter((tier) => tier.nodes.length > 0)
    : DEFAULT_TIERS;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.bg[0],
        justifyContent: "center",
        alignItems: "center",
        backgroundImage: `radial-gradient(circle at 50% 50%, ${accent}14 0%, transparent 70%), linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px)`,
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
            TOPOLOGY & SYSTEM ARCHITECTURE
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
            {propTitle || "Threat Infrastructure & Double-Extortion Topology"}
          </div>
        </div>

        {/* 3-Tier Multi-Node Architecture Canvas -- stacked top-to-bottom (ACCESS then
            OPERATE then OUTCOME) on a vertical (Shorts) frame instead of 3 side-by-side
            columns, each of which would otherwise be squeezed to under 1/3 of the narrow
            frame's width. */}
        <div
          style={{
            display: "flex",
            flexDirection: isVertical ? "column" : "row",
            justifyContent: "space-between",
            width: "100%",
            gap: sp(24),
            marginTop: sp(10),
          }}
        >
          {tiers.map((tierData, tierIdx) => {
            const tierReveal = interpolate(t, [tierIdx * 0.4, tierIdx * 0.4 + 0.6], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: SYNTHESIS_EASING,
            });

            return (
              <div
                key={`tier-${tierIdx}`}
                style={{
                  flex: isVertical ? undefined : 1,
                  width: isVertical ? "100%" : undefined,
                  display: "flex",
                  flexDirection: "column",
                  gap: sp(14),
                  opacity: tierReveal,
                  transform: `translateY(${(1 - tierReveal) * 20}px)`,
                }}
              >
                {/* Tier Label */}
                <div
                  style={{
                    fontFamily: typography.fontFamily.mono,
                    fontSize: fs("micro", parseInt(typography.fontSize.xs, 10)),
                    fontWeight: typography.fontWeight.bold,
                    color: colors.text.muted,
                    letterSpacing: "0.12em",
                    paddingBottom: sp(8),
                    borderBottom: `2px solid ${colors.border}`,
                  }}
                >
                  {tierData.tier}
                </div>

                {/* Nodes in this tier */}
                {tierData.nodes.map((node, nodeIdx) => (
                  <div
                    key={`node-${nodeIdx}`}
                    style={{
                      backgroundColor: colors.bg[1],
                      borderRadius: 10,
                      border: `1px solid ${colors.border}`,
                      padding: sp(12),
                      display: "flex",
                      flexDirection: "column",
                      gap: sp(6),
                      boxShadow: "0 6px 15px rgba(0,0,0,0.3)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span
                        style={{
                          fontSize: fs("micro", 15),
                          color: accent,
                          padding: `${sp(2)}px ${sp(8)}px`,
                          borderRadius: 4,
                          fontFamily: typography.fontFamily.mono,
                        }}
                      >
                        {node.tag}
                      </span>
                      <span
                        style={{
                          fontSize: fs("micro", 13),
                          fontWeight: 600,
                          color: colors.text.muted,
                          fontFamily: typography.fontFamily.mono,
                        }}
                      >
                        {node.status}
                      </span>
                    </div>
                    <div
                      style={{
                        fontFamily: typography.fontFamily.display,
                        fontSize: fs("body", parseInt(typography.fontSize.base, 10)),
                        fontWeight: typography.fontWeight.bold,
                        color: colors.text.primary,
                      }}
                    >
                      {node.name}
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>

        {/* Narrative Bottom Callout — hidden entirely when the beat carries no prose;
         * rendering an empty box here was the black bar with a pink left edge (images 2-3). */}
        {narration ? (
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
        ) : null}
      </div>
      <BeatLayer holdMs={duration_ms} seed={index} accent={accent} />
    </AbsoluteFill>
  );
};
