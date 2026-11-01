// design.md §6.1 (RD-121) — the console's `@remotion/player`-embedding live-preview surface
// (V8.19/V8.20) cannot import `./index.ts` directly: that module's own `registerRoot()` call is
// a Remotion-Studio/CLI-only side effect, invalid inside a Next.js React tree. This module is
// the side-effect-free composition export surface both entry points funnel through — `index.ts`
// (CLI/bundler, calls `registerRoot`) and the console's Player component (no `registerRoot` at
// all) — so there is exactly one real implementation of each component/type, never a forked
// second copy kept in sync by hand. No `registerRoot()` call belongs in this file.
export { MasterSequence, calculateMasterSequenceMetadata } from "./components/MasterSequence";
export type { MasterSequenceProps } from "./components/MasterSequence";
export { CisSequence } from "./components/CisSequence";
export type { BuildJson, CisBuildJson, AnyBuildJson } from "./types";
export { BuildJsonSchema } from "./types";
