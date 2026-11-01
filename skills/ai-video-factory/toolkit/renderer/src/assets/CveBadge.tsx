// A CVE-identifier badge — pure function of `cveId` (P5-REQ-4.1), memoized per §7.
import React from "react";
import { colors, typography } from "@ytpipeline/design-tokens";
import { cached } from "./cache";

export const CveBadge: React.FC<{ cveId: string }> = ({ cveId }) => {
  return cached(`cve:${cveId}`, () => (
    <span
      style={{
        display: "inline-block",
        fontFamily: typography.fontFamily.mono,
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.semibold,
        color: colors.niche.cyberattack,
        backgroundColor: colors.bg[1],
        border: `1px solid ${colors.niche.cyberattack}`,
        borderRadius: 6,
        padding: "4px 10px",
        letterSpacing: "0.02em",
      }}
    >
      {cveId}
    </span>
  ));
};
