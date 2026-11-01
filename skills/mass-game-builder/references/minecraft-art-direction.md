# Minecraft art direction: the contract and how it is enforced

Read this when the style is being set, when any building, texture, model, sound or prop is added, and before every art review.
The goal: every block, building, entity, sound and UI element looks and sounds like the same game, matches the author's direction, and can be **checked**, not just hoped for. "Art directive respecting" means three things: the direction is written down precisely, it is machine-checked wherever it can be, and a human review with fixed procedure covers the rest.

## Contents
1. The art contract (files)
2. From references to a locked direction
3. Palette
4. Block vocabulary and custom blocks
5. Texture rules
6. Architecture grammar and building cards
7. Designed variety
8. Damage and ruin language
9. Lighting and atmosphere
10. Props, signage, graffiti, text
11. Entities, animals, vehicles
12. UI, HUD, fonts
13. Audio feel and provenance
14. Lineup gate and golden screenshots
15. Art director review (checklist)
16. Change control
17. Authoring pipeline for buildings

## 1. The art contract (files)
| File | What it holds | Enforced by |
|---|---|---|
| `_project/STYLE_BIBLE.md` | Mood, rules, grammar, forbidden list, screenshot protocol | Art director review |
| `_project/palette.json` | Global and per-district swatches with roles, tolerance, ramp settings | `scripts/check_palette.py` |
| `_project/block_vocab.json` | Allowed blocks per district (wildcards) | `scripts/check_structures.py` |
| `_project/cards/districts/*.md` | District identity, budgets, palette and vocabulary links | Review, M-G3 budget tests |
| `_project/cards/buildings/*.md` | Per-typology grammar, damage story, containers, variants | Review |
| `_project/evidence/golden/` | Approved reference screenshots per district | Lineup comparison |
| `_project/CREDITS.md` | Source and licence of every asset and sound | `scripts/check_modpack.py` |
Nothing is added to the pack that is not allowed by these files. If something good does not fit, the contract changes first (section 16), never the other way round.

## 2. From references to a locked direction
1. **Art brief.** Ask the author for mood words (three), the one-line look, and what it must never look like. Write them at the top of the style bible. Cheap details (a hex value, a texture size) are decided and logged; the mood, the district identities and the damage story are the author's call.
2. **Reference board.** One folder per district under `_project/reference_board/`. The author supplies or approves the references; the agent may search for more only when asked. A reference is **analysed, never copied**: no reference image, no trace of one, ever enters a texture or ships. Log each source and what it is used for (proportions, colour, window rhythm, roof shape, street width). Real places inspire structure and logic; the game world stays fictional.
3. **Analyse.** For each district note: proportions and storey heights, facade rhythm, opening types, roof forms, wall materials, colour families, street width, clutter and signage language, typical wear. Write it as rules, not as a description of one photo.
4. **Propose, then lock.** Run `palette_from_refs.py` for numbers, assign roles by hand, show the author a swatch sheet, get a yes, and only then write `palette.json`. Same for the block vocabulary. Log the approval in `DECISIONS.md`.
5. **Prove on three test builds** (one per district family) in the lineup before building at volume: if the direction does not hold on three buildings, it will not hold on three hundred.

## 3. Palette
- `palette.json` has global colours (ink, dust, soot, rust, overgrowth) and per-district swatches with roles: wall, trim, roof, accent, ground, damage, signage.
- Minecraft textures shade by stepping lightness, so each swatch is checked as a short **ramp** (`ramp_steps` lighter and darker); tolerance is a CIE Lab distance. Tune the three numbers once, with the author, on real textures.
- `check_palette.py --palette ... --root resourcepack/assets/<ns>/textures` fails any texture with too many off-palette pixels and names the worst colours. Vanilla textures that ship unchanged are not checked (they are not ours); retextured or new ones are. Use `--allow` for deliberate exceptions and log each in `DECISIONS.md`.
- Screenshots can be run through the same script with a looser `--max-off` as a **trend** (lighting shifts colours), never as a verdict.
- Keep the palette small. Fewer, well-chosen colours are what make a pack read as one game.

## 4. Block vocabulary and custom blocks
- `block_vocab.json` lists which blocks each district's buildings may use (wildcards like `minecraft:*_terracotta`). `check_structures.py` fails any structure that uses a block outside its district's list or the global list. Air, jigsaw and structure blocks are always allowed.
- **Prefer vanilla blocks** with the palette in mind; adding a custom block costs a texture, a model, a loot/drop rule, a registry name forever, and an atlas slot. Add one only when no vanilla block carries the look (a specific tile pattern, a plaster finish, a carved screen). Each custom block gets a row in the style bible: why vanilla fails, district, texture file.
- Remember the distinction: **vanilla block, new colour** is a resource-pack retexture (check_palette applies); **new shape** is a model; **new behaviour** is code (and a performance cost).
- Decide early whether the pack **retextures vanilla** or adds only new blocks. A pack that mixes vanilla-looking and retextured blocks in one view fails the lineup.

## 5. Texture rules
- **One texel density** for everything we own (default 16x16 per block face to match vanilla and keep the atlas small). Mixing densities is the fastest way to a messy look. If the author wants higher resolution, it applies to the whole pack, including the retextured vanilla blocks, and the memory cost is measured first.
- **One shading rule:** light direction (default: top-left), number of ramp steps, outline yes or no. Write it down and apply it to every texture.
- **Colour count** per texture is capped (for example 12). No photographic textures, no gradients, no per-pixel noise passed off as detail.
- **Animated and translucent textures** are a budget item (water and glass only, unless measured). Particles are capped.
- **Texture naming** is `<category>/<district or shared>/<name>.png`, so `check_palette.py` can infer the district from the path.
- Every texture that is not original has a CREDITS row (source, licence). Reference photos are never textures.

## 6. Architecture grammar and building cards
- Each district has a card (`DISTRICT_CARD.md`): function, density and wealth, street rules, adjacency, lot budget, loot and threat character, vehicle tiers.
- Each building typology has a card (`BUILDING_CARD.md`) **before it is built**: footprint and height, facade grammar, roof, palette slots, interior plan with every room reachable, container positions (each a loot table, never hard-coded items), loot pool, variant targets, allowed ruin states and the damage story, signage, zombie anchors, cultural care. The card is what the art director reviews against.
- Grammar rules are numbers where possible: storey height in blocks, window spacing, wall thickness, parapet height, courtyard proportions. A reviewer can then measure a building instead of arguing taste.
- Cultural and religious buildings (mosques, madrasas, zaouias, cemeteries) are depicted respectfully; no desecration mechanics; whether they hold loot or horde spawns is the author's decision, default none. Signage text in Arabic or other scripts is reviewed by the author before it ships.

## 7. Designed variety
Variety is **designed, not random**: a typology's look = parts x palettes x damage states x interior seeds, all chosen from sets the style bible allows.
- Each typology has a variant target (for example 12 courtyard houses). Count them in the card.
- **Variant spacing rule** (in the style bible): no identical (variant, palette, damage) triple within N blocks. It is a planner rule, so it is tested in JUnit (M-G3), not eyeballed.
- Interiors are seeded permutations of authored room modules, not noise.
- A district must be recognisable from one screenshot by two players who have not been told which it is (the recognition test). If testers cannot name it, the district's grammar is too weak.

## 8. Damage and ruin language
The world is mostly broken; the damage must read as **a real place that died**, not as random holes.
- State shares (default from the vision: about 70% heavily damaged, 25% partly standing, a small share largely intact shells that players rebuild first). Each building card says what each state looks like for that building.
- **Damage follows structure and story:** unsupported spans fail first, upper floors before lower, corners last; a burnt market has soot and ash where stalls were; a looted pharmacy has toppled shelves and forced shutters; a collapsed block has rubble fanned out where the wall fell. Damage is a data-driven grammar (rules and seeded choices), not a noise function.
- **Weathering layers** (dust, soot, rust, overgrowth) each have places they appear and places they never do.
- Hard rules: damage never seals the only entrance, never leaves rubble floating, never produces unreachable loot containers (planner and structure checks).
- Damage must be cheap: baked into structures or applied by a seeded pass per chunk within the chunk budget.

## 9. Lighting and atmosphere
- Use **data, not shaders**, first: sky, fog, water and foliage colours per biome or district through data pack biome effects, light-level rules for interiors, time-of-day mood. These cost nothing at runtime.
- No torch spam: write the interior light-level rule (for example 0 to 4) and place light sources as part of the building card.
- **Shaders** are optional and separate: the performance floor test runs without them; a shader preset is tested on its own and never relied on to make the art work.
- Lighting updates after large block changes are expensive: avoid flooding a chunk with emissive blocks.

## 10. Props, signage, graffiti, text
- A **prop kit** per district (clutter that tells its story: market crates, laundry lines, wrecked carts, ledgers) made of plain blocks or static decoration. No block entity per prop.
- **Fictional brands only.** No real logos or trademarks. Names, slogans and graffiti follow the language rules in the style bible. The author reviews all sign text.
- Clutter is placed by rules per room function (a kitchen reads as a kitchen), seeded, within the block-entity and entity budgets.

## 11. Entities, animals, vehicles
- Decide the **model fidelity** once: realistic, blocky, or retextured vanilla. Realistic animals mean no fantasy or collectible creatures. Retexture rather than remodel where the mod allows it, so animals match the palette.
- Third-party models (dog mods, vehicle packs) are checked in the lineup too. If they clash, options in order: retexture (resource pack override), restrict which models ship, then custom assets; log the choice and respect the licence (a retexture of an All Rights Reserved asset may not be allowed).
- Vehicles carry the district's wear: rust, dust and damage states from the palette, not showroom colours, except in dealerships.
- Custom models are made in Blockbench (free), exported to the format the pinned loader and mod need, and measured for cost.

## 12. UI, HUD, fonts
- One font set, one colour set from the palette, one icon style. The district-name popup, the day/horde indicator, the medical panel, the map and the claim menu share it.
- UI textures obey the texture rules. UI never covers the action; check at 1080p and 1440p.

## 13. Audio feel and provenance
- The style bible has an **audio feel** line (for example dry, close, sparse, nothing musical during scavenging).
- **Source policy (default, change only in the vision):** sounds come from existing mods or open libraries (CC0, CC-BY) whose licence allows distribution in a modpack. No AI-generated audio. No synthesized audio. No CC-BY-NC. No unknown licence. Basic editing (trim, pitch, EQ, layering of sourced sounds) is allowed and noted in the ledger.
- Every audio file has a CREDITS row (file, source, licence, author, category, edits). `check_modpack.py` fails a file without a row or with a disallowed licence (gate M-A).
- Some free sound bundles allow use inside a finished game but not redistribution of the raw files: a modpack ships the sounds inside a pack, so check whether that counts as redistribution before using them.
- Gaps are filled by searching the libraries, not by generating audio. Listening review is the author's.

## 14. Lineup gate and golden screenshots
- **Lineup world:** a flat creative world with the datapack. `scripts/gen_lineup.py` writes a function that force-loads and places every authored structure side by side, one row per district, spaced by real footprint, plus `lineup_manifest.json` with positions. Run it once in the pinned version and fix command syntax if the game rejects a line (it was not run against a live game when written).
- **Screenshot protocol** (fixed, written in the style bible): camera heights and distances (street level, 20 m, 60 m), time of day, FOV, GUI hidden, no shaders, same resource pack. Save to `_project/evidence/`.
- **Golden screenshots** per district (`_project/evidence/golden/`) are the approved look. A new asset is judged next to them: different game, rejected or reworked.
- **Silhouette test:** at distance the building must still read as its typology.
- **District recognition test:** two people name the district from a screenshot.
- Re-run the whole lineup after any contract change (section 16).

## 15. Art director review (checklist)
Run it per asset and again per district. A fresh reader (a separate agent, or the author) who has seen only the style bible, the card and the screenshots gives the verdict; the agent that built the asset does not grade itself.
- [ ] The card is complete and the asset matches it.
- [ ] `check_structures.py` clean (vocabulary, no loose items, loot tables only).
- [ ] `check_palette.py` clean for new or changed textures.
- [ ] Lineup screenshots saved from the protocol; looks like the same game as the golden shots.
- [ ] Silhouette and proportions match the grammar numbers.
- [ ] Damage reads as a real place that died, follows structure, and blocks nothing important.
- [ ] Signage and props follow the language and brand rules; text reviewed by the author.
- [ ] Cultural care rules respected.
- [ ] Cost recorded in `PERF_BUDGET.md`; CREDITS rows added.
- [ ] Verdict: accept / rework (with specific reasons) / reject.

## 16. Change control
The style bible is versioned. A change to the palette, vocabulary, texel density, shading rule or grammar is an expensive-to-reverse decision: ask the author, log it in `DECISIONS.md`, bump the version, re-run the lineup and the checks over everything affected, refresh the golden screenshots, and only then continue. No "just this once" exceptions: an exception is logged with a reason, allow-listed in the check, and reviewed at handover.

## 17. Authoring pipeline for buildings
1. Card filled. 2. Build in an authoring world on the **pinned Minecraft version** with a structure block, Litematica or WorldEdit (candidates; pin whichever the loader supports). 3. Containers are placed with a loot table reference, never filled by hand; no item entities, no mobs. 4. Export NBT to `structures_src/`, copy into `datapack/data/<ns>/structure/<district>/<typology>/<name>.nbt` (folders are singular since 1.21). 5. `check_structures.py --data-version <pinned>`. 6. `gen_lineup.py`, screenshot, review. 7. If a world generator with its own asset format is used (for example Lost Cities' JSON parts, palettes and buildings), convert through its documented format and keep the same cards and checks on the source structures.
