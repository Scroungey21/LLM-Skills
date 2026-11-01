// In-process memoization (phase-5-visual/design.md §7, RD-57). Deliberately NOT a persistent
// on-disk cache — Remotion re-evaluates every frame's full component tree regardless of what a
// prior render process cached, so a disk cache would add real complexity (invalidation, storage
// growth across hundreds of videos) for no measurable benefit. This only avoids recomputing the
// same generator call when one entity/id recurs multiple times *within one render* (e.g. a CVE
// ID named in both a hook scene and a later recap scene) — determinism, not caching, is what
// delivers cross-video visual consistency (P5-REQ-4.1/4.3).
const cache = new Map<string, unknown>();

export function cached<T>(key: string, compute: () => T): T {
  if (!cache.has(key)) {
    cache.set(key, compute());
  }
  return cache.get(key) as T;
}

/** Test-only: clears all memoized entries so fixtures don't leak across test cases. */
export function clearAssetCache(): void {
  cache.clear();
}
