// The BuildJson contract — phase-5-visual/design.md §6, the Phase 5/6 handoff shape. Phase 6's
// future generator queries scripts/audio_assets/alignments and serializes directly into this
// shape (P5-REQ-6.2); this phase's own verification (tasks.md 5.15) hand-constructs values
// against it, following Phase 4 task 4.16's "no fabrication, ground in real data" precedent.
import { z } from "zod";
import { colors, NICHE_ACCENT_KEY } from "@ytpipeline/design-tokens";

export type ComponentName =
  | "cyber-terminal"
  | "failure-schematic"
  | "ai-logic-node"
  | "claim-evidence-compare"
  | "asset-sting"
  | "sponsor-segment"
  | "manga-panel-composition"
  | "chapter-card"
  | "timeline-marker"
  | "verdict-card"
  | "atmosphere-narration"
  | "source-citation"
  | "loop-gauge"
  | "citation-badge";

// design.md §1.5 (`ScreenType.category`) — mirrors `app.models.screen_type.SCREEN_TYPE_CATEGORIES`
// exactly (P6-REQ-5.7 "field-for-field" discipline, extended to this new enum).
export const SCREEN_TYPE_CATEGORIES = ["template_driven", "llm_authored_animation"] as const;
export type ScreenCategory = (typeof SCREEN_TYPE_CATEGORIES)[number];

// v8-addendum design.md §5.2/§6.6, RD-120/V8-INV-3 — mirrors `requirements.md` V8-REQ-6.6's
// four preset values exactly. General-purpose, not niche-locked (any niche's `strategy_bundle.
// visual_filter` may set one), though only `horror_stories` defaults to a non-"none" value.
export const VISUAL_FILTER_PRESETS = ["none", "crt_scanlines", "vhs_distortion", "film_grain"] as const;
export type VisualFilterPreset = (typeof VISUAL_FILTER_PRESETS)[number];

export const COMPONENT_NAMES: readonly ComponentName[] = [
  "cyber-terminal",
  "failure-schematic",
  "ai-logic-node",
  "claim-evidence-compare",
  "asset-sting",
  "sponsor-segment",
  "manga-panel-composition",
  "chapter-card",
  "timeline-marker",
  "verdict-card",
  "atmosphere-narration",
  "source-citation",
  "loop-gauge",
  "citation-badge",
];

export interface Cues {
  typing_chars: number;
  node_count: number;
}

export interface WordTimestamp {
  word: string;
  start: number; // seconds, absolute within the concatenated audio
  end: number;
  score: number; // WhisperX confidence, 0-1 (P4-REQ-4.1's floor already applied upstream)
  scene_index: number; // RD-51's corrected, timestamp-resolved mapping
}

export interface SceneSpec {
  index: number;
  is_hook: boolean;
  is_pattern_interrupt: boolean;
  narration: string;
  word_budget: number;
  duration_ms: number; // RD-64: real measured (end - start) * 1000, never scripts.scenes[i]'s
                        // pre-TTS draft-time estimate verbatim — see phase-5-visual/design.md §10.
  cues: Cues;
  start: number; // seconds — derived from Phase 4's word_timestamps, grouped by scene_index (RD-64)
  end: number;
}

export interface BuildJson {
  script_id: number;
  niche_key: string; // resolves accent via resolveAccent() below
  component: ComponentName; // resolved once upstream from strategy_bundle.component_set
  // P10-REQ (auto-shorts): optional, defaults "full" -- absent on any build.json generated
  // before this field existed. Drives calculateMasterSequenceMetadata's composition dims
  // (1080x1920 for "shorts" vs the existing 1920x1080), nothing else reads it.
  variant?: "full" | "shorts";
  scenes: SceneSpec[];
  audio: { wav_path: string; duration_seconds: number };
  words: WordTimestamp[];
}

// design.md §5.2: `screens.elements` entry — the named-element registry `transitions.from_element`
// /`to_element` target (§1.7). Mirrors `_validate_element` (build_json.py) field-for-field.
export interface ElementSpec {
  name: string;
  description: string;
}

// design.md §5.2 — one entry per `screens` row (§1.6), as assembled by `_build_screen_specs`
// (build_json.py). `content` is an arbitrary per-screen-type JSON blob (§1.5/§1.6); `backing_component`
// is only ever non-null for `category === "template_driven"` (§1.5's manifest note).
export interface ScreenSpec {
  screen_id: number;
  screen_type_key: string;
  category: ScreenCategory;
  backing_component: ComponentName | null;
  content: Record<string, unknown>;
  elements: ElementSpec[];
  start: number; // seconds — Pass-3-resolved `screens.resolved_start_time`, never re-derived here
  duration_ms: number; // Pass-3-resolved `screens.resolved_duration_ms`
}

// design.md §5.2/§1.7 — one entry per `transitions` row, as assembled by `_build_transition_specs`
// (build_json.py). `transition_type` is a free-form string authored server-side, not a fixed
// enum (validated/authored for real by V5.10, a later wave) — see `components/transitions.ts`.
export interface TransitionSpec {
  from_screen_id: number;
  to_screen_id: number;
  transition_type: string;
  from_element: string | null;
  to_element: string | null;
  parameters: Record<string, unknown>;
}

// design.md §5.2 — the CIS-mode `BuildJson` shape: a parallel `screens`/`transitions` array
// REPLACES the legacy `scenes`+top-level `component` fields; `audio`/`words` are shared
// verbatim with the legacy shape. Never merged into `BuildJson` itself (V5-REQ-9.1: the legacy
// interface above stays byte-for-byte unchanged).
export interface CisBuildJson {
  script_id: number;
  niche_key: string;
  rendering_mode: "cis";
  variant?: "full" | "shorts"; // see BuildJson.variant's identical doc comment above
  // v8-addendum design.md §1.5/§6.3, RD-133: OPTIONAL, CisBuildJson-only -- never added to
  // `BuildJson`/`LegacyBuildJsonSchema` below (V5-REQ-9.1's byte-for-byte guarantee). "9:16"
  // when this build derives from a vertical-recap project (`generate_build_json` sets it from
  // `project.derived_from_project_id is not None`, threaded through by its caller per
  // V5-INV-10 -- never re-derived by a Project join inside build_json.py itself); absent for
  // every ordinary CIS build, defaulting to the existing 16:9 landscape frame.
  aspect_ratio?: "16:9" | "9:16";
  // v8-addendum design.md §5.2/§6.6, RD-120 -- optional, defaults "none" (matches `variant`'s
  // own present-but-defaulted pattern), CisBuildJson-only like `aspect_ratio` above. Resolved
  // server-side from `niche.strategy_bundle.get("visual_filter", "none")` at build.json
  // generation time -- never re-derived client-side.
  visual_filter?: VisualFilterPreset;
  screens: ScreenSpec[];
  transitions: TransitionSpec[];
  audio: { wav_path: string; duration_seconds: number };
  words: WordTimestamp[];
}

// The Remotion composition side's own dispatch key (design.md §5.2/tasks.md V5.14): "does this
// BuildJson carry a `screens` array (CIS) or the legacy `scenes`+`component` shape".
export type AnyBuildJson = BuildJson | CisBuildJson;

// A scene's own component + accent, threaded down to <SceneRenderer> (design.md §3.6).
export type SceneProps = SceneSpec & {
  accent: string;
  title?: string;
  subtitle?: string;
  category?: string;
  metric?: string;
  metric_label?: string;
  metric_change?: string;
  badge?: string;
  steps?: Array<{ title: string; desc?: string; status?: string }>;
  nodes?: Array<{ id: string; label: string; tier?: string; status?: string }>;
  connections?: Array<{ from: string; to: string; label?: string }>;
  comparison?: {
    left_title: string;
    left_points: string[];
    right_title: string;
    right_points: string[];
  };
  timeline_events?: Array<{ date: string; title: string; desc?: string }>;
  code_snippet?: string;
  command?: string;
  logs?: string[];
  // source-citation's own datum (this component only): the URL text burned into the card's
  // footer so a claim traces to an exact reachable page, not just a bare domain in `subtitle`.
  source_url?: string;
  chart?: {
    type?: string;
    bars?: Array<{ label: string; value: number; color?: string }>;
  };
  // loop-gauge's own datum (this component only, CLOUD_CODES_ANALYSIS.md R11): the iteration
  // count/milestone data an escalating "same process repeated N times" beat needs, added the
  // same minimal way `chart`/`comparison` were -- a single typed object, not a flat
  // prop-per-field.
  loop?: LoopGaugeSpec;
};

// loop-gauge's own content sub-shape (CLOUD_CODES_ANALYSIS.md R11) -- shared here (not local
// to LoopGauge.tsx) so CisScreenRenderer.tsx's dispatch-time forwarding (screenToSceneProps)
// can validate/type it without a cross-component import, same rationale as MangaPanelLayer
// below.
export interface LoopGaugeSpec {
  in_label: string;
  out_label: string;
  max_iterations: number;
  unit_label?: string;
  milestones?: Array<{ at: number; label: string }>;
}
// manga-panel-composition's own content sub-shape (design.md §7/§7.1, v7-addendum) — shared
// here (not local to MangaPanelComposition.tsx) so CisScreenRenderer.tsx's dispatch-time
// forwarding (screenToSceneProps) can validate/type it without a cross-component import.
export interface MangaPanelLayer {
  image_path: string;
  blur_pct: number;
  scale?: string; // background_layer: "fill" (full-bleed, design.md §7)
  scale_pct?: number; // foreground_layer: 60-80, `_SCENE_ENERGY_TO_SCALE` (design.md §7)
}

// atmosphere-narration's own content sub-shapes (v8-addendum design.md §5.1/V8-REQ-6.1-6.3) --
// shared here (not local to AtmosphereNarration.tsx), same rationale as MangaPanelLayer above.
//
// `background_layer` entries carry `asset_library_id`, not a literal `clip_path` string:
// `AssetLibraryItem` has no playable-media path field yet (its `source` column is a provenance
// description/URL, not a servable file -- unlike MangaPanel's real on-disk `cropped_image_path`
// this codebase's own MangaPanelLayer above draws on). Resolving `asset_library_id` into an
// actual loadable clip is separate, not-yet-built asset-serving plumbing (the same explicit,
// already-established gap AssetSting.tsx's own header comment documents for
// `content.asset_library_id`) -- `AtmosphereBackground` renders a neutral placeholder per
// entry until that plumbing exists, never a broken `<Video src>` pointed at an unloadable URL.
export interface AtmosphereBackgroundEntry {
  asset_library_id: number;
  hold_ms: number;
}

const CuesSchema = z.object({
  typing_chars: z.number().int().nonnegative(),
  node_count: z.number().int().nonnegative(),
});

const WordTimestampSchema = z.object({
  word: z.string().min(1),
  start: z.number().nonnegative(),
  end: z.number().nonnegative(),
  score: z.number().min(0).max(1),
  scene_index: z.number().int().nonnegative(),
});

const SceneSpecSchema = z.object({
  index: z.number().int().nonnegative(),
  is_hook: z.boolean(),
  is_pattern_interrupt: z.boolean(),
  narration: z.string().min(1),
  word_budget: z.number().int().positive(),
  duration_ms: z.number().positive(),
  cues: CuesSchema,
  start: z.number().nonnegative(),
  end: z.number().nonnegative(),
});

/**
 * Runtime schema check (P5-REQ-6.3, RD-61) — Phase 6 constructs BuildJson values from a live
 * database at runtime, where a schema/column drift must fail loudly with a specific field name,
 * never a blank or partially-rendered video. TypeScript's compile-time typing alone cannot catch
 * this, since it does not survive past compilation into the render process. Legacy shape,
 * unchanged field-for-field from before this parameter existed (V5-REQ-9.1) except for one
 * later, optional addition (`variant`, P10-REQ) that every pre-existing payload simply omits
 * and gets defaulted -- only its export name changed originally, to make room for
 * `BuildJsonSchema` below becoming the shared any-shape dispatcher both `render-cli.mjs` and
 * `MasterSequence.tsx` already call `.safeParse` against.
 */
export const LegacyBuildJsonSchema = z
  .object({
    script_id: z.number().int().positive(),
    niche_key: z.string().min(1),
    component: z.enum(COMPONENT_NAMES as [ComponentName, ...ComponentName[]]),
    variant: z.enum(["full", "shorts"]).optional().default("full"),
    scenes: z.array(SceneSpecSchema).min(1),
    audio: z.object({
      wav_path: z.string().min(1),
      duration_seconds: z.number().positive(),
    }),
    words: z.array(WordTimestampSchema),
  })
  .strict();

// design.md §5.2/§1.5 — mirrors `_validate_element` (build_json.py) field-for-field.
const ElementSpecSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
});

// design.md §5.2/§1.6 — mirrors `_validate_screen` (build_json.py) field-for-field, including
// its `.strict()` no-extra-keys discipline at this nesting level.
const ScreenSpecSchema = z.object({
  screen_id: z.number().int().positive(),
  screen_type_key: z.string().min(1),
  category: z.enum(SCREEN_TYPE_CATEGORIES),
  backing_component: z.enum(COMPONENT_NAMES as [ComponentName, ...ComponentName[]]).nullable(),
  content: z.record(z.string(), z.unknown()),
  elements: z.array(ElementSpecSchema),
  start: z.number().nonnegative(),
  duration_ms: z.number().positive(),
}).strict();

// design.md §5.2/§1.7 — mirrors `_validate_transition` (build_json.py) field-for-field.
const TransitionSpecSchema = z.object({
  from_screen_id: z.number().int().positive(),
  to_screen_id: z.number().int().positive(),
  transition_type: z.string().min(1),
  from_element: z.string().min(1).nullable(),
  to_element: z.string().min(1).nullable(),
  parameters: z.record(z.string(), z.unknown()),
}).strict();

// design.md §5.2 — mirrors `_validate_cis_build_json` (build_json.py) field-for-field.
export const CisBuildJsonSchema = z
  .object({
    script_id: z.number().int().positive(),
    niche_key: z.string().min(1),
    rendering_mode: z.literal("cis"),
    variant: z.enum(["full", "shorts"]).optional().default("full"),
    aspect_ratio: z.enum(["16:9", "9:16"]).optional(),
    visual_filter: z.enum(VISUAL_FILTER_PRESETS).optional().default("none"),
    screens: z.array(ScreenSpecSchema).min(1),
    transitions: z.array(TransitionSpecSchema),
    audio: z.object({
      wav_path: z.string().min(1),
      duration_seconds: z.number().positive(),
    }),
    words: z.array(WordTimestampSchema),
  })
  .strict();

/** Result shape of `BuildJsonSchema.safeParse` — named here (not `z.SafeParseReturnType<...>`
 * inlined at the call site) since this module owns the `BuildJsonSchema` contract. */
export type BuildJsonParseResult =
  | { success: true; data: AnyBuildJson }
  | { success: false; error: z.ZodError };

// True when `value` carries `rendering_mode: "cis"` — the one field that distinguishes a CIS
// value from a legacy one (legacy's `.strict()` schema has no such key at all, so there is no
// shape this could ambiguously match). Narrows via `in`, never an inline cast.
function isCisShaped(value: unknown): boolean {
  if (typeof value !== "object" || value === null) return false;
  if (!("rendering_mode" in value)) return false;
  return value.rendering_mode === "cis";
}

/**
 * The canonical any-shape `BuildJson` validator — `render-cli.mjs` and `MasterSequence.tsx` both
 * already call `BuildJsonSchema.safeParse(value)` expecting this exact `{success, data}` /
 * `{success, error}` shape (RD-61's "single, frozen source of truth" contract), so this stays
 * that same name rather than becoming a second, differently-named export those callers would
 * both need updating for. Dispatches on `rendering_mode === "cis"` *before* picking a schema
 * branch — mirrors `validate_build_json`'s own dispatch-then-validate shape (design.md §5.2) —
 * rather than a bare `z.union`, whose merged "invalid_union" error would blur exactly which
 * field is wrong for the far more common case (a malformed legacy value). Legacy-shaped input's
 * validation path is untouched: it always resolves to `LegacyBuildJsonSchema.safeParse` directly
 * (V5-REQ-9.1).
 */
export const BuildJsonSchema = {
  safeParse(value: unknown): BuildJsonParseResult {
    const schema = isCisShaped(value) ? CisBuildJsonSchema : LegacyBuildJsonSchema;
    return schema.safeParse(value) as BuildJsonParseResult;
  },
  parse(value: unknown): AnyBuildJson {
    const result = BuildJsonSchema.safeParse(value);
    if (!result.success) throw result.error;
    return result.data;
  },
};

/**
 * niches.key -> the resolved color.niche.* hex value (design.md §6) — the only place niche
 * identity maps to a color, mirroring <SceneRenderer>'s equally singular niche -> component
 * mapping (§3.6).
 */
export function resolveAccent(nicheKey: string): string {
  const tokenName = NICHE_ACCENT_KEY[nicheKey];
  if (!tokenName) {
    throw new Error(`resolveAccent: no color.niche.* token mapped for niche_key "${nicheKey}"`);
  }
  const hex = colors.niche[tokenName];
  if (!hex) {
    throw new Error(`resolveAccent: token "${tokenName}" (niche_key "${nicheKey}") has no color value`);
  }
  return hex;
}
