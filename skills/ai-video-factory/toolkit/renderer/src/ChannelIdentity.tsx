// Channel identity (avatar + banner) for the technews channel "LITMUS" -- built as real
// Remotion output (packages/design-tokens, ./fonts.ts), not a static image tool, so type and
// color stay a single source of truth with every produced video.
//
// v2 mark: a "litmus strip" -- a single tilted rounded bar that changes color along its length
// from amber (colors.status.warning, "claim as stated / unverified") to green
// (colors.status.success, "verified true"), with a glowing reaction dot at the transition.
// This directly dramatizes the channel's own name and tagline ("Every claim, traced to the
// source" -- a literal litmus test for a claim) instead of an abstract git-diff glyph, and
// reads as a clean two-tone silhouette at an 88px avatar instead of two thin text characters
// that go illegible at that size. It also deliberately does NOT reuse the dark-grid/
// radial-glow-wash background every in-video screen template uses (ChapterCard,
// ClaimEvidenceCompare, SourceCitation, ...) -- at avatar scale that grid is invisible noise,
// and reusing a video-screen background makes the channel mark read as "a screenshot from one
// of the videos" rather than a distinct brand identity. The avatar instead sits on a plain
// near-black field with a tight glow directly behind the strip, so the mark itself is what
// reads, not the frame around it.
//
// YouTube masks every channel avatar to a circle client-side -- the SVG border below IS that
// circle (not a rounded square whose corners would sit outside the mask), and every other
// element is kept well inside it (see the `safeR` margin) so nothing gets clipped.
import React from "react";
import { AbsoluteFill } from "remotion";
import { colors, typography } from "@ytpipeline/design-tokens";
import "./fonts";

const CLAIM_COLOR = colors.status.warning; // "as stated" -- unverified/claimed
const VERIFIED_COLOR = colors.status.success; // "verified true" -- the channel's one brand color

/** Plain near-black field with a tight radial glow (no grid, no full-canvas wash) so the mark
 * itself reads clearly rather than blending into "another video screen." `focusRatio` sizes
 * the glow relative to the canvas -- tight behind an avatar's centered mark, wider but still
 * strip-hugging on the banner's off-center lockup. */
const IDENTITY_BG = (focusX: string, focusY: string, focusRatio: string) => ({
  backgroundColor: colors.bg[0],
  backgroundImage: `radial-gradient(ellipse ${focusRatio} at ${focusX} ${focusY}, ${VERIFIED_COLOR}1c 0%, transparent 70%)`,
});

/** The litmus-strip brand mark, sized by `size` so avatar and banner draw the identical glyph
 * at different scales instead of two hand-tuned copies drifting apart. Circle-safe: everything
 * lives inside `safeR` (0.82 * the outer circle's own radius) so a client-side circular avatar
 * mask never clips it. */
const Mark: React.FC<{ size: number; circleBorder?: boolean }> = ({ size, circleBorder = true }) => {
  const cx = size / 2;
  const cy = size / 2;
  const outerR = size / 2;
  const stroke = Math.max(5, size * 0.028);
  const safeR = outerR * 0.82;

  const stripLen = safeR * 1.7;
  const stripH = safeR * 0.34;
  const rx = stripH / 2;
  const rotationDeg = -10;
  const dotR = stripH * 0.42;

  const gradientId = `litmus-strip-${size}`;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={CLAIM_COLOR} />
          <stop offset="46%" stopColor={CLAIM_COLOR} />
          <stop offset="58%" stopColor={VERIFIED_COLOR} />
          <stop offset="100%" stopColor={VERIFIED_COLOR} />
        </linearGradient>
      </defs>
      {circleBorder && (
        <circle cx={cx} cy={cy} r={outerR - stroke} fill="none" stroke={colors.border} strokeWidth={stroke} />
      )}
      <g transform={`rotate(${rotationDeg} ${cx} ${cy})`}>
        <rect
          x={cx - stripLen / 2}
          y={cy - stripH / 2}
          width={stripLen}
          height={stripH}
          rx={rx}
          fill={`url(#${gradientId})`}
          stroke={colors.bg[0]}
          strokeWidth={stroke * 0.5}
        />
        {/* Reaction dot at the color-change boundary -- the "moment of verification". */}
        <circle cx={cx} cy={cy} r={dotR} fill={colors.bg[0]} />
        <circle cx={cx} cy={cy} r={dotR * 0.62} fill={VERIFIED_COLOR} />
      </g>
    </svg>
  );
};

export const ChannelAvatar: React.FC = () => (
  <AbsoluteFill style={{ ...IDENTITY_BG("50%", "50%", "70% 70%"), justifyContent: "center", alignItems: "center" }}>
    <Mark size={720} />
  </AbsoluteFill>
);

export const ChannelBanner: React.FC<{ channelName?: string; tagline?: string }> = ({
  channelName = "LITMUS",
  tagline = "Every claim, traced to the source",
}) => {
  const CW = 2560;
  const CH = 1440;
  const SAFE_W = 1546;
  const SAFE_H = 423;
  const safeX = (CW - SAFE_W) / 2;
  const safeY = (CH - SAFE_H) / 2;
  const markSize = 340;
  const gap = 48;

  return (
    <AbsoluteFill style={IDENTITY_BG("38%", "50%", "55% 90%")}>
      <div
        style={{
          position: "absolute",
          left: safeX,
          top: safeY,
          width: SAFE_W,
          height: SAFE_H,
          display: "flex",
          alignItems: "center",
          gap,
        }}
      >
        <Mark size={markSize} circleBorder={false} />
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div
            style={{
              fontFamily: typography.fontFamily.display,
              fontWeight: 900,
              fontSize: 108,
              letterSpacing: "-0.01em",
              lineHeight: 1,
              color: colors.text.primary,
            }}
          >
            {/* Wordmark echoes the mark's own claim -> verified color change instead of sitting
                next to it as an unrelated flat-white label. */}
            <span style={{ color: CLAIM_COLOR }}>{channelName.slice(0, 3)}</span>
            <span style={{ color: VERIFIED_COLOR }}>{channelName.slice(3)}</span>
          </div>
          <div
            style={{
              fontFamily: typography.fontFamily.mono,
              fontWeight: 600,
              fontSize: 30,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: colors.text.secondary,
            }}
          >
            {tagline}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
