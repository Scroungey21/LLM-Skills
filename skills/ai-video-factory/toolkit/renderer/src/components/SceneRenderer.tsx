// P5-REQ-2.6 / design.md §3.6: the ONE place niche/component identity resolves to a React
// component — never re-derived from scene content, never a hardcoded switch elsewhere.
// `COMPONENT_MAP` is additionally exported so `CisScreenRenderer.tsx` (design.md §5.2/tasks.md
// V5.14) can dispatch `screens.backing_component` (`category === "template_driven"`) through
// the exact same six-entry map, rather than a second, independently-maintained copy.
import React from "react";
import type { ComponentName, SceneSpec } from "../types";
import { CyberTerminal } from "./CyberTerminal";
import { FailureSchematic } from "./FailureSchematic";
import { AILogicNode } from "./AILogicNode";
import { ClaimEvidenceCompare } from "./ClaimEvidenceCompare";
import { AssetSting } from "./AssetSting";
import { SponsorSegment } from "./SponsorSegment";
import { MangaPanelComposition } from "./MangaPanelComposition";
import { ChapterCard } from "./ChapterCard";
import { TimelineMarker } from "./TimelineMarker";
import { VerdictCard } from "./VerdictCard";
import { AtmosphereNarration } from "./AtmosphereNarration";
import { SourceCitation } from "./SourceCitation";
import { LoopGauge } from "./LoopGauge";
import { CitationBadge } from "./CitationBadge";

export const COMPONENT_MAP: Record<ComponentName, React.FC<SceneSpec & { accent: string }>> = {
  "cyber-terminal": CyberTerminal,
  "failure-schematic": FailureSchematic,
  "ai-logic-node": AILogicNode,
  "claim-evidence-compare": ClaimEvidenceCompare,
  "asset-sting": AssetSting,
  "sponsor-segment": SponsorSegment,
  "manga-panel-composition": MangaPanelComposition,
  "chapter-card": ChapterCard,
  "timeline-marker": TimelineMarker,
  "verdict-card": VerdictCard,
  "atmosphere-narration": AtmosphereNarration,
  "source-citation": SourceCitation,
  "loop-gauge": LoopGauge,
  "citation-badge": CitationBadge,
};

export const SceneRenderer: React.FC<{ scene: SceneSpec; component: ComponentName; accent: string }> = ({
  scene,
  component,
  accent,
}) => {
  const Component = COMPONENT_MAP[component];
  if (!Component) {
    throw new Error(`SceneRenderer: unknown component "${component}" — check BuildJson.component`);
  }
  return <Component {...scene} accent={accent} />;
};
