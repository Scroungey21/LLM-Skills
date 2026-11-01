// design.md §5.2/§7 / tasks.md V5.14: per-`screens`-row rendering dispatch — the CIS
// counterpart to `SceneRenderer.tsx`'s niche/component resolution (that file's own header: "the
// ONE place ... never re-derived elsewhere"; this is that same rule's CIS-side twin). Dispatches
// on `screen.category` (§1.5's `SCREEN_TYPE_CATEGORIES`): `template_driven` screens render
// through `SceneRenderer.tsx`'s exported `COMPONENT_MAP`, adapted from `content` into that map's
// existing `SceneProps` contract (see `screenToSceneProps` below); `llm_authored_animation`
// screens defer to `<LlmAuthoredAnimationRuntime>` (§7 — see that file for what's stubbed).
import React from "react";
import type { Cues, ScreenSpec, SceneProps, MangaPanelLayer, AtmosphereBackgroundEntry, WordTimestamp, LoopGaugeSpec } from "../types";
import { COMPONENT_MAP } from "./SceneRenderer";
import { LlmAuthoredAnimationRuntime } from "./LlmAuthoredAnimationRuntime";
import { EvidenceMedia, isEvidenceMedia } from "./EvidenceMedia";

/**
 * `screens.content` (design.md §1.6) is an arbitrary per-screen-type JSON blob — its shape
 * isn't formalized by this addendum beyond `quick_hit_sting`'s `{asset_library_id}` (§1.5). For
 * the five `template_driven` screen types that reuse an existing `SceneProps`-shaped component
 * (`cyber-terminal`/`failure-schematic`/`ai-logic-node`/`claim-evidence-compare`/
 * `sponsor-segment` — the last one's own file already documents "renders the narration string
 * it's handed"), the natural, best-available mapping is the same `narration`/`cues` fields
 * those components already consume under the legacy path, rather than inventing a second,
 * CIS-only prop contract for the same components. Never throws on a missing field (mirrors
 * `checkCueBounds`'s warn-not-throw precedent, RD-58) — an empty `narration`/zeroed `cues` is a
 * valid, renderable (if visually empty) scene, never a crash. `is_hook`/`is_pattern_interrupt`
 * have no CIS analogue (screens are addressed by `narration_beat_ref`, not a hook/pattern-
 * interrupt narrative role) and default `false`. `asset-sting`'s own `content.asset_library_id`
 * (quick_hit_sting's actual per-instance datum) is not yet consumed here — `AssetSting.tsx`
 * itself does not read it either (see that file's own header comment); resolving a real asset
 * clip into a render prop is asset-serving plumbing this task's rendering-dispatch scope does
 * not cover. `manga-panel-composition`'s `background_layer`/`foreground_layer` (v7-addendum,
 * design.md §7/§7.1) and `atmosphere-narration`'s `background_layer`/`foreground_textbox`
 * (v8-addendum, design.md §5.1) ARE forwarded here, unlike asset-sting's still-deferred datum
 * -- both components' entire rendered output IS this content (not an optional enhancement of
 * an otherwise-meaningful narration/cues scene the way asset-sting's clip would be), so
 * leaving either unforwarded would mean every screen of that type renders as an empty
 * placeholder while the pipeline reports success. The two components' `background_layer`
 * shapes are unrelated (one object, one array) despite the shared field name -- the type
 * guards below discriminate which one a given screen's content actually holds.
 */
function screenToSceneProps(
  screen: ScreenSpec,
  accent: string,
): SceneProps & {
  background_layer?: MangaPanelLayer | AtmosphereBackgroundEntry[];
  foreground_layer?: MangaPanelLayer;
  foreground_textbox?: { words: WordTimestamp[] };
  animation_description?: string;
} {
  // The screen generator authors prose as `content.text` (verdict-card/chapter-card/
  // cyber-terminal/ai-logic-node beats in every real build.json), while the legacy SceneProps
  // contract names the same datum `narration`. `text` is the primary lookup with `narration`
  // as the fallback — never the reverse, or every `text`-authored screen renders empty.
  const narrationSource = typeof screen.content.text === "string" ? screen.content.text : screen.content.narration;
  const narration = typeof narrationSource === "string" ? narrationSource : "";
  const cues = isCues(screen.content.cues) ? screen.content.cues : { typing_chars: 0, node_count: 0 };
  const background_layer = isMangaPanelLayer(screen.content.background_layer)
    ? screen.content.background_layer
    : isAtmosphereBackgroundEntries(screen.content.background_layer)
      ? screen.content.background_layer
      : undefined;
  const foreground_layer = isMangaPanelLayer(screen.content.foreground_layer)
    ? screen.content.foreground_layer
    : undefined;
  const foreground_textbox = isForegroundTextbox(screen.content.foreground_textbox)
    ? screen.content.foreground_textbox
    : undefined;

  const c = screen.content;
  const title = typeof c.title === "string" ? c.title : undefined;
  const subtitle = typeof c.subtitle === "string" ? c.subtitle : undefined;
  const category = typeof c.category === "string" ? c.category : undefined;
  const metric = typeof c.metric === "string" ? c.metric : undefined;
  const metric_label = typeof c.metric_label === "string" ? c.metric_label : undefined;
  const metric_change = typeof c.metric_change === "string" ? c.metric_change : undefined;
  const badge = typeof c.badge === "string" ? c.badge : undefined;
  const source_url = typeof c.source_url === "string" ? c.source_url : undefined;
  const steps = Array.isArray(c.steps) ? c.steps as any : undefined;
  const nodes = Array.isArray(c.nodes) ? c.nodes as any : undefined;
  const connections = Array.isArray(c.connections) ? c.connections as any : undefined;
  const comparison = typeof c.comparison === "object" && c.comparison !== null ? c.comparison as any : undefined;
  const timeline_events = Array.isArray(c.timeline_events) ? c.timeline_events as any : undefined;
  const code_snippet = typeof c.code_snippet === "string" ? c.code_snippet : undefined;
  const command = typeof c.command === "string" ? c.command : undefined;
  const logs = Array.isArray(c.logs) ? c.logs as string[] : undefined;
  const chart = typeof c.chart === "object" && c.chart !== null ? c.chart as any : undefined;
  const loop = isLoopGaugeSpec(c.loop) ? c.loop : undefined;

  return {
    index: screen.screen_id,
    is_hook: false,
    is_pattern_interrupt: false,
    narration,
    word_budget: narration.length > 0 ? narration.trim().split(/\s+/).length : 0,
    duration_ms: screen.duration_ms,
    cues,
    start: screen.start,
    end: screen.start + screen.duration_ms / 1000,
    accent,
    title,
    subtitle,
    category,
    metric,
    metric_label,
    metric_change,
    badge,
    source_url,
    steps,
    nodes,
    connections,
    comparison,
    timeline_events,
    code_snippet,
    command,
    logs,
    chart,
    loop,
    ...(typeof c.animation_description === "string" ? { animation_description: c.animation_description } : {}),
    ...(background_layer !== undefined ? { background_layer } : {}),
    ...(foreground_layer !== undefined ? { foreground_layer } : {}),
    ...(foreground_textbox !== undefined ? { foreground_textbox } : {}),
  };
}

function isCues(value: unknown): value is Cues {
  if (typeof value !== "object" || value === null) return false;
  if (!("typing_chars" in value) || !("node_count" in value)) return false;
  return typeof value.typing_chars === "number" && typeof value.node_count === "number";
}

function isMangaPanelLayer(value: unknown): value is MangaPanelLayer {
  if (typeof value !== "object" || value === null) return false;
  if (!("image_path" in value) || !("blur_pct" in value)) return false;
  return typeof value.image_path === "string" && typeof value.blur_pct === "number";
}

function isAtmosphereBackgroundEntry(entry: unknown): entry is AtmosphereBackgroundEntry {
  if (typeof entry !== "object" || entry === null) return false;
  if (!("asset_library_id" in entry) || !("hold_ms" in entry)) return false;
  return typeof entry.asset_library_id === "number" && typeof entry.hold_ms === "number";
}

function isAtmosphereBackgroundEntries(value: unknown): value is AtmosphereBackgroundEntry[] {
  return Array.isArray(value) && value.every(isAtmosphereBackgroundEntry);
}

function isForegroundTextbox(value: unknown): value is { words: WordTimestamp[] } {
  if (typeof value !== "object" || value === null || !("words" in value)) return false;
  return Array.isArray(value.words);
}

function isLoopGaugeSpec(value: unknown): value is LoopGaugeSpec {
  if (typeof value !== "object" || value === null) return false;
  if (!("in_label" in value) || !("out_label" in value) || !("max_iterations" in value)) return false;
  return (
    typeof value.in_label === "string" &&
    typeof value.out_label === "string" &&
    typeof value.max_iterations === "number"
  );
}

export const CisScreenRenderer: React.FC<{ screen: ScreenSpec; accent: string }> = ({ screen, accent }) => {
  if (isEvidenceMedia(screen.content.media)) {
    return <EvidenceMedia media={screen.content.media} accent={accent} />;
  }
  if (screen.category === "template_driven") {
    if (!screen.backing_component) {
      throw new Error(
        `CisScreenRenderer: screen_id=${screen.screen_id} (screen_type_key="${screen.screen_type_key}") ` +
          "is category=\"template_driven\" but has no backing_component — check screen_types seed data.",
      );
    }
    const Component = COMPONENT_MAP[screen.backing_component];
    if (!Component) {
      throw new Error(
        `CisScreenRenderer: unknown backing_component "${screen.backing_component}" for ` +
          `screen_id=${screen.screen_id}.`,
      );
    }
    return <Component {...screenToSceneProps(screen, accent)} />;
  }

  if (screen.category === "llm_authored_animation") {
    return <LlmAuthoredAnimationRuntime screen={screen} accent={accent} />;
  }

  throw new Error(
    `CisScreenRenderer: unknown screen category "${screen.category}" for screen_id=${screen.screen_id}.`,
  );
};
