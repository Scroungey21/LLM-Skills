// Shared typing/reveal mechanics (phase-5-visual/design.md §3.1) — pure functions of
// `t` (seconds since scene start), deterministic and re-evaluated every frame. No component-
// local mutable state, no useEffect/timers — Remotion's server-side rendering model may render
// frames out of order or in parallel worker processes, so per-frame state must be derivable
// from (frame, fps, props) alone.
import type { Cues } from "../types";
import type { ComponentManifest } from "../manifests";

/**
 * Characters revealed at time t, never exceeding either the component's own manifest bound
 * (P5-REQ-3.2's clamp) or the scene's actual cued character count (P5-INV-3).
 */
export function charsRevealed(t: number, cues: Cues, manifest: ComponentManifest): number {
  const capped = Math.min(cues.typing_chars, manifest.max_typing_speed_cps * t);
  return Math.floor(Math.max(0, capped));
}

/** All nodes finish appearing by this fraction of the scene's duration, leaving a deliberate
 * beat for the viewer to read the completed diagram before the scene cuts. */
export const REVEAL_FRACTION = 0.7;

/** Nodes revealed at time t, never exceeding the scene's actual cued node count (P5-INV-3). */
export function nodesRevealed(t: number, cues: Cues, durationMs: number): number {
  const revealWindowSeconds = (durationMs / 1000) * REVEAL_FRACTION;
  if (revealWindowSeconds <= 0) return cues.node_count;
  const raw = (cues.node_count * t) / revealWindowSeconds;
  return Math.min(cues.node_count, Math.floor(Math.max(0, raw)));
}
