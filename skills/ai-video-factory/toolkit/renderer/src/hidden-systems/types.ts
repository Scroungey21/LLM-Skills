export type DoodleLayout = "single" | "journey" | "process" | "loop" | "sources" | "network" | "outro";

export type DoodleVisual = {
  layout: DoodleLayout;
  icons: string[];
  labels: string[];
};

export type EditorialScene = {
  id: string;
  chapter: string;
  headline: string;
  narration: string;
  claim_ids: string[];
  visual: DoodleVisual;
};

export type VideoVariant = {
  title?: string;
  target_seconds: number;
  description?: string;
  scenes: EditorialScene[];
};

export type EditorialPackage = {
  schema_version: string;
  channel: string;
  slug: string;
  topic: string;
  accuracy_scope: string;
  title: string;
  alternate_titles: string[];
  thumbnail: {
    text: string;
    subtext: string;
    accent: string;
    icon: string;
  };
  description: string;
  tags: string[];
  sources: Array<Record<string, unknown>>;
  claims: Array<Record<string, unknown>>;
  voice: Record<string, string | number>;
  variants: {
    long: VideoVariant;
    short: VideoVariant;
  };
};

export type TimedWord = {
  text: string;
  startMs: number;
  endMs: number;
  sceneId: string;
  // True when a real, measured silence (or a scene boundary) follows this word. The caption
  // pager never lets a page span a pauseAfter boundary, so viewers never see words from a
  // future clause/sentence displayed ahead of when they're actually spoken.
  pauseAfter?: boolean;
};

export type TimedScene = {
  id: string;
  startMs: number;
  endMs: number;
};

export type RenderTiming = {
  schema_version: string;
  slug: string;
  variant: "long" | "short";
  audio_path: string;
  audio_duration_ms: number;
  provider_used: string;
  voice_used: string;
  scenes: TimedScene[];
  words: TimedWord[];
};

export type HiddenSystemsVideoProps = {
  content: EditorialPackage;
  timing: RenderTiming;
  variant: "long" | "short";
  // Optional gameplay-background layer ("brainrot" Shorts variant, see
  // hidden-everyday-systems/examples/shorts-brainrot-plan.md). When set, PaperBackground is replaced by
  // this looping video and scene/caption content renders on translucent
  // cards instead of the opaque paper background.
  backgroundVideo?: string; // path relative to renderer/public, via staticFile()
  backgroundStartSec?: number; // deterministic trim offset into the source clip
};
