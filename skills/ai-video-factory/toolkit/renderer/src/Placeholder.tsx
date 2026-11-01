import { AbsoluteFill } from "remotion";

// Trivial stub composition. Phase 5 replaces this with the real archetype
// components once packages/design-tokens has real values (design.md P1-INV-3).
export const Placeholder: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#111111",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          color: "#ffffff",
          fontSize: 64,
          fontFamily: "sans-serif",
          textAlign: "center",
        }}
      >
        Renderer scaffold — Phase 5 replaces this
      </div>
    </AbsoluteFill>
  );
};
