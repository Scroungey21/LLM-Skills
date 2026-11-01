// design.md §7 ("LLM-Authored Animation Validation") / tasks.md V5.14: rendering shell for
// `llm_authored_animation`-category `screens`. §7 defines the *validation* pipeline this
// content goes through — `_check_animation_markup` (deterministic lint), a sandboxed Remotion
// render smoke-test, and a repair loop that falls back to the nearest `template_driven` screen
// type on exhaustion (V5-REQ-6.3) — dispatched from `advance_screen_validation`
// (`screen_validation` step). That entire pipeline is V5.9's job, a later wave; it does not
// exist yet, and no design section defines the wire format `screens.content` will actually
// carry for this category once V5.9 lands (an open surface V5.9 itself resolves, not this
// task). This task's own scope (tasks.md V5.14) is only the *rendering dispatch* — routing a
// screen to this runtime by its `category`, never authoring or validating what it displays.
//
// STUBBED, not real: this component does not execute, sandbox, or interpret any LLM-authored
// markup — there is no validated markup shape to interpret yet, and doing so unsandboxed here
// would be exactly the risk §7's sandboxed-render-smoke-test step exists to police. It renders
// a deterministic, schema-agnostic placeholder card for the screen's full [start, start+
// duration_ms] window so the composition timeline, transitions, and captions around it stay
// structurally correct — the one thing the rendering-dispatch contract actually requires.
import React from "react";
import { AbsoluteFill } from "remotion";
import { colors, typography } from "@ytpipeline/design-tokens";
import type { ScreenSpec } from "../types";

export const LlmAuthoredAnimationRuntime: React.FC<{ screen: ScreenSpec; accent: string }> = ({ screen, accent }) => {
  if (process.env.NODE_ENV !== "production") {
    console.warn(
      `LlmAuthoredAnimationRuntime: screen_id=${screen.screen_id} ` +
        `(screen_type_key="${screen.screen_type_key}") is a stubbed rendering shell — real markup ` +
        "interpretation ships with V5.9's validation pipeline (design.md §7); this only " +
        "satisfies V5.14's rendering-dispatch contract.",
    );
  }

  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg[0], justifyContent: "center", alignItems: "center" }}>
      <div
        style={{
          width: "70%",
          borderRadius: 10,
          border: `1px dashed ${accent}`,
          backgroundColor: colors.bg[1],
          padding: "32px 40px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontFamily: typography.fontFamily.display,
            fontSize: typography.fontSize.xs,
            color: colors.text.muted,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: 8,
          }}
        >
          llm_authored_animation (stub — V5.9 not yet landed)
        </div>
        <div
          style={{
            fontFamily: typography.fontFamily.display,
            fontSize: typography.fontSize.lg,
            color: colors.text.primary,
          }}
        >
          {screen.screen_type_key}
        </div>
      </div>
    </AbsoluteFill>
  );
};
