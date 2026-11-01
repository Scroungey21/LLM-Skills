// Original, deterministic geometric entity marks — never a real third-party logo (P5-REQ-4.2).
// Pure function of `entityName` alone (P5-INV-7): a deterministic hash selects a shape family,
// rotation, and accent-dot placement, all purely from the hash — never Math.random()/Date.now().
// Intentionally accent/niche-independent (a fixed neutral palette) so the same entity looks
// pixel-identical everywhere it appears, across every niche and every video (phase-5-visual/
// design.md §7).
import React from "react";
import { colors } from "@ytpipeline/design-tokens";
import { cached } from "./cache";

const SHAPE_FAMILIES = ["ring", "chevron-stack", "notched-circle", "triangle-cluster"] as const;
type ShapeFamily = (typeof SHAPE_FAMILIES)[number];

/** djb2 string hash — deterministic, no external dependency. */
function hashString(input: string): number {
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 33) ^ input.charCodeAt(i);
  }
  return hash >>> 0; // unsigned 32-bit
}

interface LogoGeometry {
  family: ShapeFamily;
  rotationDeg: number;
  dotAngleDeg: number;
}

function deriveGeometry(entityName: string): LogoGeometry {
  const hash = hashString(entityName);
  return {
    family: SHAPE_FAMILIES[hash % SHAPE_FAMILIES.length],
    rotationDeg: (hash >> 8) % 360,
    dotAngleDeg: (hash >> 16) % 360,
  };
}

function ShapeByFamily({ family }: { family: ShapeFamily }): React.ReactElement {
  const stroke = colors.text.muted;
  switch (family) {
    case "ring":
      return <circle cx={0} cy={0} r={28} fill="none" stroke={stroke} strokeWidth={5} />;
    case "chevron-stack":
      return (
        <g stroke={stroke} strokeWidth={5} fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M -20 -10 L 0 -26 L 20 -10" />
          <path d="M -20 10 L 0 -6 L 20 10" />
          <path d="M -20 30 L 0 14 L 20 30" />
        </g>
      );
    case "notched-circle":
      return (
        <path
          d="M 28 0 A 28 28 0 1 1 8 -26.7 L 8 -8 L 28 -8 Z"
          fill={stroke}
        />
      );
    case "triangle-cluster":
      return (
        <g fill={stroke}>
          <polygon points="0,-30 17,0 -17,0" />
          <polygon points="0,4 17,34 -17,34" opacity={0.55} />
        </g>
      );
  }
}

export const AbstractedLogo: React.FC<{ entityName: string; size?: number }> = ({ entityName, size = 64 }) => {
  const geometry = cached(`logo:${entityName}`, () => deriveGeometry(entityName));
  const dotX = 34 * Math.cos((geometry.dotAngleDeg * Math.PI) / 180);
  const dotY = 34 * Math.sin((geometry.dotAngleDeg * Math.PI) / 180);

  return (
    <svg width={size} height={size} viewBox="-40 -40 80 80">
      <g transform={`rotate(${geometry.rotationDeg})`}>
        <ShapeByFamily family={geometry.family} />
      </g>
      <circle cx={dotX} cy={dotY} r={4} fill={colors.text.dim} />
    </svg>
  );
};
