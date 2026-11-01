import React from "react";
import {AbsoluteFill} from "remotion";
import {DoodleIcon} from "./DoodleIcon";

const ICONS = [
  "toilet", "pipe", "sewer", "pump", "plant", "screen", "grit", "clarifier", "aeration",
  "sludge", "uv", "lab", "river", "wind", "solar", "transformer", "pad-transformer", "tower",
  "substation", "pole", "pole-transformer", "house", "houses", "meter", "panel", "outlet",
  "bird-wire", "bird-wire-closeup", "bin", "truck", "transfer-station", "landfill",
  "crossing-button", "signal-cabinet", "walk-sign", "p-trap", "vent-stack",
  "water-tower", "streetlight", "incinerator",
  "refrigerator", "compressor-coil", "gas-burner", "odorant-injector", "router",
  "radio-waves", "elevator-car", "elevator-panel", "traffic-light", "smoke-detector",
  "smoke-wisp",
];

export const IconAtlas: React.FC = () => (
  <AbsoluteFill style={{background: "#F7F4EA", padding: 42, fontFamily: "Arial, sans-serif"}}>
    <div style={{fontSize: 38, fontWeight: 900, letterSpacing: 1}}>ICON QA ATLAS</div>
    <div style={{fontSize: 17, color: "#555", marginTop: 4}}>Every reusable drawing must read correctly without its scene.</div>
    <div style={{display: "grid", gridTemplateColumns: "repeat(9, 1fr)", gap: 16, marginTop: 26}}>
      {ICONS.map((name, index) => (
        <div key={name} style={{height: 270, border: "3px solid #171717", borderRadius: 18, background: "#FFFEF8", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"}}>
          <DoodleIcon name={name} accent={index < 13 ? "#43B9D2" : "#FFD447"} size={170}/>
          <div style={{fontSize: 15, lineHeight: 1.05, width: "94%", textAlign: "center", fontWeight: 900, marginTop: -9, textTransform: "uppercase"}}>{name.replace("-", " ")}</div>
        </div>
      ))}
    </div>
  </AbsoluteFill>
);
