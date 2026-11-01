// A stylized article/paper-card layout — pure function of (title, sourceDomain), memoized per §7.
// Fixed to color.niche.ai (this generator's primary caller, <AILogicNode>'s paper references) —
// not a variable accent prop, matching phase-5-visual/design.md §7's literal design.
import React from "react";
import { colors, typography } from "@ytpipeline/design-tokens";
import { cached } from "./cache";

const MAX_TITLE_CHARS = 64;

function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

export const PaperCard: React.FC<{ title: string; sourceDomain: string; width?: number }> = ({
  title,
  sourceDomain,
  width = 360,
}) => {
  return cached(`paper:${title}:${sourceDomain}`, () => (
    <div
      style={{
        width,
        display: "flex",
        flexDirection: "column",
        gap: 6,
        backgroundColor: colors.bg[1],
        border: `1px solid ${colors.border}`,
        borderLeft: `4px solid ${colors.niche.ai}`,
        borderRadius: 8,
        padding: "14px 16px",
      }}
    >
      <div
        style={{
          fontFamily: typography.fontFamily.display,
          fontSize: typography.fontSize.base,
          fontWeight: typography.fontWeight.semibold,
          color: colors.text.primary,
          lineHeight: typography.lineHeight.snug,
        }}
      >
        {truncate(title, MAX_TITLE_CHARS)}
      </div>
      <div
        style={{
          fontFamily: typography.fontFamily.mono,
          fontSize: typography.fontSize.xs,
          color: colors.text.dim,
        }}
      >
        {sourceDomain}
      </div>
    </div>
  ));
};
