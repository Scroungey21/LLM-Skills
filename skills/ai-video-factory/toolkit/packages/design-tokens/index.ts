// Design token VALUES — fixed by .kiro/specs/tech-news-pipeline/design.md §4 (Phase 0,
// approved) for the original ten color/four motion tokens, extended by
// .kiro/specs/phase-5-visual/design.md §2 (RD-53/54/55/56) for the two tokens the v4
// addendum's fifth/sixth niche and fourth component left unassigned. Both `renderer` (Remotion)
// and `console` (via build-tailwind.ts) import this module directly — the single source of
// truth (P11). No JSX, no CSS, no framework import (P1-INV-3, unchanged).

export interface ColorTokens {
  bg: Record<string, string>;
  text: Record<string, string>;
  niche: Record<string, string>;
  status: Record<string, string>;
  border: string;
}

export interface TypographyTokens {
  fontFamily: Record<string, string>;
  fontSize: Record<string, string>;
  fontWeight: Record<string, string | number>;
  lineHeight: Record<string, string | number>;
}

export interface MotionTokens {
  duration: Record<string, number>;
  easing: Record<string, [number, number, number, number]>;
}

export const colors: ColorTokens = {
  bg: {
    0: "#0A0B0D", // Canvas / video background plate
    1: "#111318", // Surface (cards, panels)
    2: "#1B1E26", // Elevated surface (modals, active kanban column)
  },
  border: "#2A2E3A",
  text: {
    primary: "#E8EAED",
    secondary: "#C7CBD3", // Comfortable body copy on dark video surfaces
    muted: "#9199A8",
    dim: "#6B7280",
  },
  niche: {
    cyberattack: "#E85D75", // Cyberattacks & Zero-Days — editorial coral, legible on dark surfaces
    infra: "#FF8A3D", // Engineering & Infra Failures — rust/amber
    ai: "#5EEAD4", // AI/ML Papers — cyan-teal
    // RD-53 (phase-5-visual/design.md §2.1): the v4 addendum added two niches after Phase 0's
    // token table was fixed. Each niche gets exactly one accent (design.md §4.1's invariant is
    // per-niche, not per-component) even though `corporate` shares `<FailureSchematic>` with
    // `infra` — the component takes its accent as a prop, never hardcodes one (see RD-20).
    corporate: "#D4A537", // Corporate/Startup Autopsies — brass/ledger-gold
    fraud: "#A78BFA", // Scientific Fraud & Retractions — violet, academic scrutiny
    // v7-addendum (design.md §2, RD-99): manga_recap's own accent, chosen for maximum hue
    // separation from the five above (nearest neighbors are cyberattack's red and fraud's
    // violet) rather than for genre-cliche pink.
    manga: "#EC4899", // Manga Recap — magenta
    // P10-REQ (new archetypes/niches): four more accents, hue-gap-computed against all six
    // above (HSL hue extracted per existing color, largest empty arcs identified, new hues
    // placed at each arc's midpoint) rather than picked by eye -- the two biggest gaps
    // (42-171deg and 171-255deg) each get split in two; the third (255-330deg) gets one.
    security: "#4C96F0", // AI Security — trust/shield blue, ~213deg (171-255deg gap midpoint)
    rundown: "#3CDD51", // Weekly Tech Rundown — signal green, ~128deg (42-171deg gap)
    retrospective: "#95C059", // Tech Retrospectives — muted olive/vintage, ~85deg (42-171deg gap)
    verdict: "#D467E4", // Tech Myths Debunked — spotlight orchid, ~292deg (255-330deg midpoint)
    // v8 addendum (design.md §1, task V8.4): eleventh accent, hue-gap-computed against all ten
    // above the same way P10-REQ's four did -- largest remaining empty arc is corporate
    // (42deg) -> retrospective (85deg), 43deg wide, midpoint ~63.5deg. Pulled darker/more
    // desaturated (L=0.38 vs. this palette's usual 0.52-0.76) than a literal midpoint color
    // would be by default -- a muted, sickly bile-yellow-green rather than a bright olive,
    // reading as ominous/muted among otherwise vivid siblings while staying exactly on the
    // mechanically-computed hue.
    horror: "#90962C", // Horror Stories — bile/decay yellow-green, ~63.5deg (42-85deg midpoint)
  },
  status: {
    success: "#3DDC84",
    warning: "#FF8A3D", // reuses infra accent
    error: "#FF3B4E", // reuses cyberattack accent
    info: "#6E9BFF",
  },
};

export const typography: TypographyTokens = {
  fontFamily: {
    // RD-55: both Phase 0 §4.3's own first-listed suggestion, loaded in `renderer` via
    // @remotion/google-fonts (offline-bundled, no runtime network fetch during render).
    display: "Inter Tight, sans-serif",
    mono: "JetBrains Mono, monospace",
  },
  fontSize: {
    // RD-54: modular scale, ratio 1.25 — originally base 16px against a 1080p reference.
    // Delivery renders at native 1440p (queue.py: every final mux is 1440p), where the old
    // 10-49px steps read as sub-caption-sized; the whole ladder is raised ~1.3x so body text
    // sits at comfortable TV-viewing size. Steps remain ratio-1.25 rounded from the new base.
    xs: "14px",
    sm: "17px",
    base: "22px",
    lg: "27px",
    xl: "34px",
    "2xl": "42px",
    "3xl": "52px",
    "4xl": "64px",
  },
  fontWeight: {
    // RD-56: not numerically specified upstream — standard defaults, defined now.
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeight: {
    tight: 1.1,
    snug: 1.25,
    normal: 1.5,
    relaxed: 1.65,
  },
};

export const motion: MotionTokens = {
  duration: {
    incursion: 150, // ms — 120-180ms midpoint — <CyberTerminal>
    forensic: 320, // ms — 280-360ms midpoint — <FailureSchematic>
    synthesis: 230, // ms — 200-260ms midpoint — <AILogicNode>
    ui: 150, // ms — Control Center panel/toast/kanban transitions only
    scrutiny: 300, // ms — 260-340ms midpoint — <ClaimEvidenceCompare> (RD-53)
  },
  easing: {
    incursion: [0.65, 0, 0.35, 1], // Sharp, snap-in/out
    forensic: [0.22, 1, 0.36, 1], // Deliberate build/reveal
    synthesis: [0.4, 0, 0.2, 1], // Smooth, flowing
    ui: [0.16, 1, 0.3, 1], // Calm, deliberately quieter than any pillar's animation
    scrutiny: [0.5, 0, 0.5, 1], // Symmetric, methodical weighing (RD-53)
  },
};

/** niches.key -> color.niche.* token name (renderer/src/types.ts's `resolveAccent`, design.md §6). */
export const NICHE_ACCENT_KEY: Record<string, keyof ColorTokens["niche"]> = {
  "cyberattacks-zerodays": "cyberattack",
  "infra-failures": "infra",
  "ai-ml-papers": "ai",
  "corporate-startup-autopsies": "corporate",
  "scientific-fraud-retractions": "fraud",
  manga_recap: "manga",
  "ai-security": "security",
  "weekly-tech-rundown": "rundown",
  "tech-retrospectives": "retrospective",
  "tech-myths-debunked": "verdict",
  horror_stories: "horror",
};

