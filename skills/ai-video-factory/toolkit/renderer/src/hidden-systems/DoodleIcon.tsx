import React from "react";
import {Img, interpolate, staticFile} from "remotion";

type Props = {
  name: string;
  accent: string;
  size?: number;
  progress?: number;
};

/** Reviewed raster assets generated locally with the locked ComfyUI workflow. */
export const DoodleIcon: React.FC<Props> = ({name, size = 220, progress = 1}) => {
  const reveal = Math.max(0, Math.min(1, progress));
  return (
    <Img
      src={staticFile(`hidden-systems/assets/${name}.png`)}
      alt={name}
      style={{
        width: size,
        height: size,
        objectFit: "contain",
        opacity: reveal,
        transform: `scale(${interpolate(reveal, [0, 1], [0.88, 1])})`,
        filter: "drop-shadow(5px 6px 0 rgba(23,23,23,.08))",
      }}
    />
  );
};
