// P5-REQ-5.2 / design.md §5.2: caption burn-in. Exported SRT/VTT remains the archival subtitle
// track; this renderer deliberately repaginates the same word timestamps into shorter kinetic
// pages for watchability. It is not reset at scene boundaries, so highlighting stays continuous.
import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, typography } from "@ytpipeline/design-tokens";
import type { WordTimestamp } from "../types";

// Reference videos turn captions into a kinetic reading aid, not a six-second
// subtitle paragraph. Keep each page to one glance (usually 3-7 words).
const MAX_CUE_CHARS = 42;
const MAX_CUE_SECONDS = 1.6;

export interface Cue {
  start: number;
  end: number;
  words: WordTimestamp[];
}

export function chunkIntoCues(words: WordTimestamp[]): Cue[] {
  if (words.length === 0) return [];

  const cues: Cue[] = [];
  let current: WordTimestamp[] = [words[0]];

  for (const word of words.slice(1)) {
    const candidateText = `${current.map((w) => w.word).join(" ")} ${word.word}`;
    const candidateDuration = word.end - current[0].start;
    if (candidateText.length > MAX_CUE_CHARS || candidateDuration > MAX_CUE_SECONDS) {
      cues.push({ start: current[0].start, end: current[current.length - 1].end, words: current });
      current = [word];
    } else {
      current.push(word);
    }
  }
  cues.push({ start: current[0].start, end: current[current.length - 1].end, words: current });
  return cues;
}

export const Captions: React.FC<{ words: WordTimestamp[]; accent: string }> = ({ words, accent }) => {
  const frame = useCurrentFrame();
  const { fps, height } = useVideoConfig();
  const t = frame / fps;

  const cues = React.useMemo(() => chunkIntoCues(words), [words]);
  const activeCue = cues.find((cue) => t >= cue.start && t <= cue.end);
  if (!activeCue) return null;

  const enter = interpolate(t, [activeCue.start, activeCue.start + 0.18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  const captionFontSize = Math.min(76, Math.max(52, Math.round(height * 0.042)));

  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: height > 1800 ? 170 : 82, pointerEvents: "none" }}>
      <div
        style={{
          maxWidth: "76%",
          textAlign: "center",
          fontFamily: typography.fontFamily.display,
          fontSize: captionFontSize,
          fontWeight: typography.fontWeight.bold,
          lineHeight: 1.15,
          color: colors.text.primary,
          backgroundColor: "rgba(7, 9, 12, 0.72)",
          border: `1px solid ${accent}3d`,
          borderRadius: 18,
          padding: "14px 24px 16px",
          boxShadow: "0 14px 46px rgba(0,0,0,0.58)",
          opacity: enter,
          translate: `0px ${(1 - enter) * 18}px`,
          scale: 0.97 + enter * 0.03,
        }}
      >
        {activeCue.words.map((word, i) => {
          const isActive = t >= word.start && t <= word.end;
          return (
            <span
              key={`${word.start}-${i}`}
              style={{
                display: "inline-block",
                color: isActive ? colors.bg[0] : colors.text.primary,
                backgroundColor: isActive ? accent : "transparent",
                borderRadius: 8,
                padding: "1px 5px 3px",
                scale: isActive ? 1.04 : 1,
              }}
            >
              {word.word}
              {i < activeCue.words.length - 1 ? " " : ""}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
