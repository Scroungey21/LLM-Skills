// Loads the same /manifests/*.json files Phase 3's engine/app/synthesis/cue_validator.py
// already reads (top-level design.md §6: "one manifest file, two consumers") — static JSON
// imports (bundler-resolved at build time), never a hand-duplicated TS constant
// (phase-5-visual/design.md §4, P5-REQ-3.1).
import cyberTerminal from "../../manifests/cyber-terminal.json";
import failureSchematic from "../../manifests/failure-schematic.json";
import aiLogicNode from "../../manifests/ai-logic-node.json";
import claimEvidenceCompare from "../../manifests/claim-evidence-compare.json";
import assetSting from "../../manifests/asset-sting.json";
import sponsorSegment from "../../manifests/sponsor-segment.json";
import mangaPanelComposition from "../../manifests/manga-panel-composition.json";
import chapterCard from "../../manifests/chapter-card.json";
import timelineMarker from "../../manifests/timeline-marker.json";
import verdictCard from "../../manifests/verdict-card.json";
import atmosphereNarration from "../../manifests/atmosphere-narration.json";
import sourceCitation from "../../manifests/source-citation.json";
import loopGauge from "../../manifests/loop-gauge.json";
import citationBadge from "../../manifests/citation-badge.json";
import type { ComponentName, Cues } from "./types";

export interface ComponentManifest {
  component_name: string;
  max_typing_speed_cps: number;
  max_nodes: number;
  min_scene_ms: number;
  max_scene_ms: number;
  // Additive, design.md §1.11 — mirrors `component_manifest.py`'s `elements` field. Default
  // `[]`; per-component element names are out of scope here (requirements.md OQ5-3).
  // `checkCueBounds` below never consumes it — transition validation does, server-side (§6).
  elements: Array<{ name: string; description: string }>;
  // Component-specific manifest extensions (design.md §1.5) — optional, a component that
  // doesn't bound a given field simply omits it.
  max_animation_duration_ms?: number;
  copy_source?: string;
}

export const MANIFESTS: Record<ComponentName, ComponentManifest> = {
  "cyber-terminal": cyberTerminal,
  "failure-schematic": failureSchematic,
  "ai-logic-node": aiLogicNode,
  "claim-evidence-compare": claimEvidenceCompare,
  "asset-sting": assetSting,
  "sponsor-segment": sponsorSegment,
  "manga-panel-composition": mangaPanelComposition,
  "chapter-card": chapterCard,
  "timeline-marker": timelineMarker,
  "verdict-card": verdictCard,
  "atmosphere-narration": atmosphereNarration,
  "source-citation": sourceCitation,
  "loop-gauge": loopGauge,
  "citation-badge": citationBadge,
};

/**
 * P5-REQ-3.2: defense-in-depth check against the manifest a scene's `cues` should already
 * satisfy (Phase 3's cue-validator, RD-5/RD-39, is the authoritative gate — this never throws,
 * only warns; RD-58). Returns a list of human-readable violation strings, empty when compliant.
 */
export function checkCueBounds(component: ComponentName, cues: Cues, durationMs: number): string[] {
  const manifest = MANIFESTS[component];
  const warnings: string[] = [];

  if (manifest.max_typing_speed_cps > 0) {
    const maxChars = manifest.max_typing_speed_cps * (durationMs / 1000);
    if (cues.typing_chars > maxChars) {
      warnings.push(
        `${component}: typing_chars ${cues.typing_chars} exceeds manifest bound ${maxChars.toFixed(0)} ` +
          `(max_typing_speed_cps=${manifest.max_typing_speed_cps} * duration_ms=${durationMs}/1000)`,
      );
    }
  }

  if (manifest.max_nodes > 0 && cues.node_count > manifest.max_nodes) {
    warnings.push(`${component}: node_count ${cues.node_count} exceeds manifest max_nodes ${manifest.max_nodes}`);
  }

  if (durationMs < manifest.min_scene_ms || durationMs > manifest.max_scene_ms) {
    warnings.push(
      `${component}: duration_ms ${durationMs} outside manifest range ` +
        `[${manifest.min_scene_ms}, ${manifest.max_scene_ms}]`,
    );
  }

  return warnings;
}
