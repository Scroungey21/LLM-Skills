import React from "react";
import { AbsoluteFill, Img, Video, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Gif } from "@remotion/gif";

type EvidenceMediaSpec = {
  kind: "image" | "gif" | "video";
  src: string;
  source_label?: string;
  title?: string;
};

export const isEvidenceMedia = (value: unknown): value is EvidenceMediaSpec => {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return ["image", "gif", "video"].includes(String(candidate.kind)) && typeof candidate.src === "string";
};

export const EvidenceMedia: React.FC<{ media: EvidenceMediaSpec; accent: string }> = ({ media, accent }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const scale = interpolate(frame, [0, 180], [1.02, 1.09], { extrapolateRight: "clamp" });
  const visualStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transform: `scale(${scale})`,
  };
  return (
    <AbsoluteFill style={{ backgroundColor: "#05080f", overflow: "hidden" }}>
      {media.kind === "gif" ? <Gif src={media.src} width={width} height={height} fit="cover" style={{ transform: visualStyle.transform }} /> :
        media.kind === "video" ? <Video src={media.src} muted style={visualStyle} /> :
          <Img src={media.src} style={visualStyle} />}
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(2,5,12,.05) 45%, rgba(2,5,12,.94) 100%)" }} />
      {media.title ? <div style={{ position: "absolute", left: 80, bottom: 82, color: "white", fontSize: 50, fontWeight: 800, maxWidth: "76%" }}>{media.title}</div> : null}
      {media.source_label ? <div style={{ position: "absolute", right: 46, bottom: 32, color: "rgba(255,255,255,.75)", fontSize: 22, borderLeft: `4px solid ${accent}`, paddingLeft: 14 }}>{media.source_label}</div> : null}
    </AbsoluteFill>
  );
};
