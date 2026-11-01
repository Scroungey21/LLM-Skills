import { writeFileSync } from "node:fs";
import { colors, typography, motion, NICHE_ACCENT_KEY } from "./index";

writeFileSync(
  new URL("./tokens.json", import.meta.url),
  JSON.stringify({ colors, typography, motion, nicheAccentKey: NICHE_ACCENT_KEY }, null, 2),
);
