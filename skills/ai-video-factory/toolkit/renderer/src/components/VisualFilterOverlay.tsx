// v8-addendum design.md §5.2/§6.6, RD-120/V8-INV-3: `visual_filter` implemented as a plain
// React/CSS layer composed INSIDE the Remotion component tree, never an `ffmpeg -vf` flag in
// the post-render mux step. This is load-bearing, not a style preference: `@remotion/player`
// (the live preview, §6/§7) renders this component tree directly and never sees the ffmpeg
// pass, so an ffmpeg-only filter would make preview and the final export silently diverge the
// moment any project's filter is non-"none" -- exactly the "unfaithful preview" failure mode
// the Player's own use here exists to avoid. Composing this layer around `MasterSequence`'s
// children (rather than a second, ffmpeg-side pass) guarantees both the CLI frame-render and
// the Player see the identical tree, always.
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import type { VisualFilterPreset } from "../types";

export const VisualFilterOverlay: React.FC<{ filter: VisualFilterPreset; children: React.ReactNode }> = ({
  filter,
  children,
}) => {
  if (filter === "none") return <>{children}</>;
  return (
    <AbsoluteFill>
      {children}
      {filter === "crt_scanlines" && <ScanlineLayer />}
      {filter === "vhs_distortion" && <VhsDistortionLayer />}
      {filter === "film_grain" && <FilmGrainLayer />}
    </AbsoluteFill>
  );
};

// A repeating horizontal-line gradient, slowly drifting downward -- the classic CRT scanline
// look. `mixBlendMode: "multiply"` darkens the alternating lines against whatever content sits
// beneath, rather than flattening it under an opaque layer.
const ScanlineLayer: React.FC = () => {
  const frame = useCurrentFrame();
  // One full line-pair (4px) drift every 2 seconds (60 frames @ 30fps) -- slow enough to read
  // as "old CRT phosphor drift," not a distracting strobe.
  const offset = (frame / 60) * 4;
  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        mixBlendMode: "multiply",
        opacity: 0.35,
        backgroundImage:
          "repeating-linear-gradient(to bottom, rgba(0,0,0,0.85) 0px, rgba(0,0,0,0.85) 1px, transparent 1px, transparent 4px)",
        backgroundPosition: `0px ${offset}px`,
      }}
    />
  );
};

// Chromatic-aberration-style RGB channel offset (two tinted copies of a translucent overlay,
// shifted in opposite directions with a `mixBlendMode: "screen"` additive combine) plus a
// scrolling noise-line band -- reads as analog tape-tracking wobble without needing a
// video/canvas post-process pass. The two solid-color tint layers are full-bleed fills, so a
// fixed pixel translation of either one alone is imperceptible (only a sliver at the frame
// edge changes); the motion instead comes from the fringe GAP breathing (the two layers'
// opposing offsets pulse in and out together) and the noise band's `backgroundPosition`
// scrolling continuously -- both are genuinely visible frame-to-frame changes, unlike a static
// solid fill nudged a couple of pixels.
const VhsDistortionLayer: React.FC = () => {
  const frame = useCurrentFrame();
  // Deterministic pseudo-jitter: a couple of summed sine waves at different periods, not a
  // literal RNG (Remotion re-renders every frame independently -- this must stay a pure
  // function of `frame`, never seeded external randomness).
  const jitter = Math.abs(Math.sin(frame * 0.9) * 1.5 + Math.sin(frame * 3.1) * 0.6);
  // A non-integer-per-frame step (matching ScanlineLayer's own fractional-drift precedent
  // above) -- `frame * 3` would divide the 6px gradient period evenly and only ever land on
  // 0 or 3, strobing between two fixed positions instead of scrolling continuously.
  const noiseScrollY = (frame / 5) * 2;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill
        style={{
          mixBlendMode: "screen",
          opacity: 0.18,
          backgroundColor: "#ff2040",
          transform: `translateX(${-2 - jitter}px)`,
        }}
      />
      <AbsoluteFill
        style={{
          mixBlendMode: "screen",
          opacity: 0.18,
          backgroundColor: "#20e0ff",
          transform: `translateX(${2 + jitter}px)`,
        }}
      />
      <AbsoluteFill
        style={{
          opacity: 0.1,
          backgroundImage:
            "repeating-linear-gradient(to bottom, rgba(255,255,255,0.6) 0px, transparent 2px, transparent 6px)",
          backgroundPosition: `0px ${noiseScrollY}px`,
        }}
      />
    </AbsoluteFill>
  );
};

// A subtle, per-frame-flickering noise texture (inline SVG `feTurbulence`, re-seeded each frame
// so the grain visibly dances rather than sitting static). `mixBlendMode: "soft-light"`, not
// "overlay": this layer targets horror_stories, whose content (crt_scanlines-style dark/moody
// screens, near-black backgrounds) sits almost entirely below the 0.5-luminance midpoint where
// "overlay"'s blend formula (`2*base*blend` for base<0.5) barely moves a near-zero base no
// matter how bright the noise pixel is -- the grain would render essentially invisible on
// exactly the content it exists for. "soft-light" lifts bright noise pixels visibly even
// against a near-black base (its blend>0.5 branch adds a real `D(base)`-driven delta) while
// still gently darkening dim noise pixels, without "screen"'s full white-wash on bright specks.
//
// Rasterized at a fixed small physical size (GRAIN_W x GRAIN_H device pixels, NOT "100%")
// then CSS-`transform: scale()`d up to the real frame size: `feTurbulence`'s per-pixel cost
// scales with the filter's rasterized output resolution, so computing it directly at full
// 2560x1440 (or 1440x2560 for a vertical build) every single frame -- Remotion headless-renders
// every frame as its own full capture, so this recomputes from scratch each time -- is the
// classic feTurbulence performance sink. Rasterizing at GRAIN_W x GRAIN_H first and letting a
// GPU-composited CSS transform stretch the already-rendered bitmap cuts filter pixel count by
// >30x while the coarser upscaled grain reads identically at this layer's low opacity.
const GRAIN_W = 320;
const GRAIN_H = 180;

const FilmGrainLayer: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "soft-light", opacity: 0.35, overflow: "hidden" }}>
      <svg
        width={GRAIN_W}
        height={GRAIN_H}
        style={{ transform: `scale(${width / GRAIN_W}, ${height / GRAIN_H})`, transformOrigin: "top left" }}
      >
        <filter id="film-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={frame % 64} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width={GRAIN_W} height={GRAIN_H} filter="url(#film-grain)" />
      </svg>
    </AbsoluteFill>
  );
};
