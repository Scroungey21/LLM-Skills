# Style Bible - {{NAME}}   (v1)
The art contract. Machine-checked parts: `palette.json` (check_palette.py) and `block_vocab.json` (check_structures.py).
Nothing enters the pack that is not allowed here. Changing this file = a DECISIONS.md entry + a full re-lineup of affected assets.

## 0. Art brief
Mood words:        <<FILL 3>>
One-line look:     <<FILL e.g. "a real city that died: sun-bleached, dusty, human-scale, never random">>
Must NEVER look:   <<FILL e.g. random destruction, neon, cartoonish, photo-textured, mixed texel density>>

## 1. Reference board  (`_project/reference_board/<district>/`)
Reference photos are analysed, never copied into textures or shipped. Log each source and what it is used for (proportions, colour, window rhythm, roof shape).
| File / source | District | Used for | Notes |
|---|---|---|---|

## 2. Palette  (source of truth: `_project/palette.json`)
Global ramps + per-district swatches with roles (wall, trim, roof, accent, ground, dirt/damage, signage). Propose with `palette_from_refs.py`, approve by hand.
Tolerance and ramp settings live in the JSON. Max off-palette per texture: <<FILL e.g. 10%>>.

## 3. Block vocabulary  (source of truth: `_project/block_vocab.json`)
Allowed blocks per district (wildcards allowed). Custom blocks only where vanilla has no fit; each custom block is listed here with the reason.
| Custom block | District(s) | Why vanilla does not work | Texture file |
|---|---|---|---|

## 4. Texture rules
Texel density:       <<FILL one value, e.g. 16x for everything; mixing densities is forbidden>>
Shading:             <<FILL light from top-left; ramps of N steps; outline rule yes/no>>
Colours per texture: <<FILL max, e.g. 12>>
Forbidden:           photo textures, gradients, per-pixel noise as "detail", unique shading styles, borrowed textures without a CREDITS row
Animated / translucent textures: <<FILL budget, e.g. none except water and glass>>

## 5. Architecture grammar  (one card per typology: `_project/cards/buildings/`, one per district: `_project/cards/districts/`)
Storey height, facade rhythm, window and door patterns, roof forms, courtyard rules, wall thickness, trims, palette slots.
Variety is designed: parts x palettes x damage states x interior seeds. Variant spacing rule: <<FILL e.g. no identical (variant, palette, damage) within 96 blocks>>.

## 6. Damage and ruin language
Ruin states and shares: <<FILL e.g. heavy 70% / partial 25% / intact shell 5%>>
Collapse grammar:      damage follows structure (unsupported spans fail first, upper floors before lower, corners last) and the building's story (burnt market, looted pharmacy).
Weathering layers:     <<FILL dust, soot, rust, overgrowth: where each appears>>
Never:                 uniform random holes; damage that blocks the only entrance; rubble floating in the air.

## 7. Lighting and atmosphere
Sky / fog / water colours per biome or district (set in data, not shaders): <<FILL>>
Light-level rules inside ruins: <<FILL, e.g. interiors 0-4, no torch spam>>
Shaders: <<FILL default: none in the performance floor test; an optional separate shader preset is tested separately>>

## 8. Props, signage, graffiti, clutter
Fictional brands only (no real logos or trademarks). Text language(s): <<FILL>>. The author reviews all sign text. Graffiti language: <<FILL>>.
Religious and heritage buildings: depicted respectfully; no desecration; <<FILL loot rule>>.

## 9. Entities and animals
Model fidelity (realistic / blocky / retextured vanilla): <<FILL>>. Retexture rules, size, animation limits: <<FILL>>.

## 10. Vehicles
Models come from vehicle packs. Fit rules: <<FILL retexture to palette? rust and damage states? colour limits>>

## 11. UI and HUD
Fonts, colours, icon style, district-name popup style, map style: <<FILL>>

## 12. Audio feel and provenance
Feel: <<FILL>>. Source policy: <<FILL default: existing mods or open libraries (CC0 / CC-BY) only; no AI or synthesized audio>>. Every file has a CREDITS.md row.

## 13. VFX and particle budget
<<FILL e.g. max particles per effect, no per-frame custom renderers without a measurement>>

## 14. Forbidden list
<<FILL>>

## 15. Lineup gate
Every new asset is placed in the lineup world (gen_lineup.py) next to the existing ones and judged. Fixed screenshot protocol: <<FILL camera heights and distances, time of day, FOV, GUI hidden, no shaders>>.
Golden screenshots per district: `_project/evidence/golden/`. A new asset that looks like it came from a different game is rejected or reworked.
