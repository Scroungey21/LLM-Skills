// Baseline `transitions` application (design.md §1.7/§5.2) between consecutive CIS `screens` —
// pure functions of `t` (seconds since the *screen's own* Sequence start), same determinism
// discipline as `mechanics.ts`'s typing/reveal helpers: no component-local mutable state, no
// timers, since Remotion may render frames out of order or in parallel worker processes.
//
// `transitions.transition_type` is a free-form string authored server-side
// (`transitions.transition_type: str`, not a fixed enum, design.md §1.7) and is authored/
// validated for real by V5.10 ("transition authoring/validation", a later wave — see
// tasks.md's Wave 6). This module is deliberately only a reasonable baseline ahead of that:
// any recognized fade-family name crossfades over `TRANSITION_DURATION_SECONDS`; anything else
// (including the literal `"cut"` baseline and any type this baseline doesn't recognize yet)
// renders as a clean, instant cut. Never throws on an unrecognized type — an unauthored/
// unvalidated transition must never block a screen from rendering at all, mirroring
// `manifests.ts`'s `checkCueBounds` warn-not-throw defense-in-depth precedent (RD-58).
export const TRANSITION_DURATION_SECONDS = 0.4;

const FADE_TRANSITION_TYPES: Record<string, true> = {
  fade: true,
  crossfade: true,
  dissolve: true,
};

/**
 * Opacity for a screen at time `t` (seconds since its own Sequence's local frame 0), combining
 * its incoming transition's fade-in (if `transitionInType` names a recognized fade) with its
 * outgoing transition's fade-out (if `transitionOutType` does). Each fade window is clamped to
 * at most half of `screenDurationSeconds`, so a short screen's fade-in and fade-out never
 * overlap past full transparency. A `null`/`undefined` type (no linked `transitions` row on
 * that edge — e.g. the first screen has no incoming transition) behaves exactly like an
 * unrecognized type: no fade, full opacity on that edge.
 */
export function transitionOpacity(
  t: number,
  screenDurationSeconds: number,
  transitionInType: string | null | undefined,
  transitionOutType: string | null | undefined,
): number {
  const window = Math.min(TRANSITION_DURATION_SECONDS, screenDurationSeconds / 2);
  if (window <= 0) return 1;

  const fadeIn = transitionInType && FADE_TRANSITION_TYPES[transitionInType] ? Math.max(0, Math.min(1, t / window)) : 1;
  const timeToEnd = screenDurationSeconds - t;
  const fadeOut =
    transitionOutType && FADE_TRANSITION_TYPES[transitionOutType] ? Math.max(0, Math.min(1, timeToEnd / window)) : 1;

  return Math.min(fadeIn, fadeOut);
}
