// Centralized font loading (design.md §2.2/RD-55) — imported once for its side effects.
// loadFont() internally calls delayRender()/continueRender(), so Remotion blocks rendering
// until both fonts are ready; weights/subsets are narrowed to this project's actual token
// usage (fontWeight: 400/500/600/700, English-only v1 scope) to avoid the documented
// "loads every weight/subset" timeout risk of calling loadFont() with no arguments.
import { loadFont as loadInterTight } from "@remotion/google-fonts/InterTight";
import { loadFont as loadJetBrainsMono } from "@remotion/google-fonts/JetBrainsMono";

const WEIGHTS = ["400", "500", "600", "700"] as const;

loadInterTight("normal", { weights: [...WEIGHTS], subsets: ["latin"] });
loadJetBrainsMono("normal", { weights: [...WEIGHTS], subsets: ["latin"] });
