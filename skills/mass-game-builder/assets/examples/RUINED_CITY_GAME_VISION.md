# Vision Spec - Ruined City: Survival & Reclamation (working title)

> Working title only; the final game name has not been chosen.
> **Revision 2 (24 Oct 2026).** This is a redefinition, not an addendum. Two things changed the design at the root:
> 1. **Platform is decided: a Minecraft modpack** (Roblox is dropped for this game).
> 2. **The city is no longer a hand-placed "ruined city". It is the output of a generation pipeline** (country plan -> city plan -> district plan -> lots -> buildings), modelled on the urban structure of **Rabat, Marrakech and Salé** (Morocco). Districts have a *function*, and that function now drives loot, zombie density, horde routes, territory value and what "rebuilding" means.
>
> **Revision 3 (24 Oct 2026)** changes four more things at the root:
> 3. **No collectible or fantasy creatures, anywhere.** The creature-collection layer is removed. Animals are **realistic** (dogs, wolves, and similar) and are both threats and adoptable working companions, as in a zombie film (Mechanic H, now MUST).
> 4. **The city is mostly broken and post-apocalyptic, and you rebuild it by hand, Minecraft style.** There is no auto-restore. Reclamation is now manual repair with blueprint guidance (Mechanic C).
> 5. **Nothing is generated all at once.** Country and city exist in the background only as a fast outline; the detailed world streams in chunk by chunk around the player (section 5.2).
> 6. **Performance is a design requirement, not a polish step.** Reference hardware and the floor are in section 15 (originally an RTX 5060 Ti / Ryzen 7 5700G rig at 70 FPS; replaced in Revision 5 by the ROG Xbox Ally X at a 40 FPS floor). No stutter, no quality compromise. The build follows the quality standard in Appendix H.
>
> **Revision 4 (24 Oct 2026)** adds three more root-level rules:
> 7. **Vehicles are part of the world** (Mechanic I): cars, sports cars, trucks, hummers, bikes, dirt bikes, bicycles and similar, spawned randomly, rarer and stronger ones in dealerships and rich districts. Fuel is findable loot and **only about 1 in 5 vehicles is fully functional**.
> 8. **Every building has a loot pool that fits what the building is** (Mechanic J, Appendix I). Loot lives only in **breakable loot blocks or hidden in chests/storage**, **never as dropped items lying in the world**.
> 9. **All audio comes from existing mods or open game-sound libraries, never AI-generated or synthesized** (Appendix K).
>
> **Revision 5 (24 Oct 2026)** changes the performance target and fixes one contradiction:
> 10. **Reference hardware is now the ASUS ROG Xbox Ally X** (AMD Ryzen AI Z2 Extreme, integrated Radeon 890M, 24 GB shared LPDDR5X-8000, 1080p 120 Hz screen). **A performance pass means a floor of 40 FPS (1% low) on that device.** This replaces the RTX 5060 Ti / Ryzen 7 5700G rig and the 70 FPS floor (section 15, Appendix H gates P1 to P4).
> 11. **Vehicles are confirmed MUST.** "Vehicles" is removed from the first-release WON'T-build list (section 17): it was a stale entry that contradicted Mechanic I.
>
> Labels used below:
> - **[Decision]**: chosen by the agent to keep the design moving; revisable by the author.
> - **[Verified]**: confirmed in a source during this revision's research (sources in Appendix D).
> - **[Unverified]**: believed true but not confirmed; must be checked in the spike listed in Appendix E.
> - **Not sure / undecided**: intentionally open.

---

## 1. The pitch
- **One sentence: what is this game?** A multiplayer zombie-survival modpack set in a procedurally generated, Moroccan-inspired country, where you spawn in a fallen city whose districts (medina, new town, villa belts, popular housing, business quarters, markets, industrial zones) each behave differently, and where you and your friends scavenge them, reclaim buildings, restore the district's services, claim territory, and survive a massive horde every seven days.
- **Reference games you love (and what exactly you love about each):**
  - **Project Zomboid:** slow-burn danger on ordinary days; the world's *layout* (suburbs, shops, warehouses) tells you what loot and risk to expect; noise attracts the dead.
  - **7 Days to Die:** a recurring, telegraphed horde that you prepare for with building and traps.
  - **Zombie films (dogs as survivors' companions and wolves/feral dogs as threats):** animals that guard a camp, come on a scavenging run, raise the alarm, or turn on you in a pack. No fantasy or collectible creatures (Mechanic H).
  - Other references: **Not sure / undecided.**
- **What makes this different from them (the ONE twist):** **The city's real-world-style zoning is the game's rule system.** A rich villa belt, a labyrinthine medina, a dense popular-housing quarter and a boulevard business district each have different loot, danger, horde behaviour and rebuild value, because the generator produces them from an urban plan, not from random buildings. Reclaiming a district restores something useful (trade, medicine, water, defence), so "rebuilding the city" is a strategic map with differences between places, not just placing blocks.

## 2. Core fantasy and feel
- **What should the player FEEL while playing?** Vulnerable in tight, dark, crowded places; clever when reading a district and knowing what is inside; proud when a ruined block becomes a working, defended neighbourhood; invested in territory; tense as the horde approaches along streets they can see on their own map.
- **Three words for the mood:** Tense, strategic, rewarding. (unchanged)
- **What should players tell friends about it?** "We spawned in a collapsed city that was generated like a real one. The medina was a death maze, the villa district was empty but trapped, the souk had food. We reclaimed a market street, claimed the block, and had to hold the boulevard against a huge horde every seven days."

## 3. Core loop
The unit of play is now the **district**, not "the city".
- **The moment-to-moment action (every few seconds):** Move through streets and buildings, read the district for what is likely inside, listen (noise attracts zombies), loot, fight or avoid, retreat. Vanilla Minecraft first/third person. [Decision]
- **The loop around it (every minute / every session):**
  1. **Scout** a district: its type tells you the likely loot and threat.
  2. **Scavenge** it by function (food in markets, medicine in business/pharmacy streets, tools and materials in industrial zones, valuables in villa belts, density-driven zombie risk in popular housing and medina).
  3. **Rebuild** a building or block **by hand**: clear rubble, repair walls and floors, seal and light it; the Repair Score tells you when it is sound enough to work (see Mechanic C).
  4. **Restore** what the district provides (market trade, clinic, water, workshop) and claim the territory around it.
  5. **Prepare** for the seven-day horde: it enters along the street hierarchy, so choke points are readable.
  6. **Defend, recover, expand** to the next district, then the next town, then the next city.
- **What is the reward for finishing one loop, and what pulls the player back in?** A restored district gives a lasting benefit (a working market, clinic, workshop, safe route) and more claimable land. The pull is the unexplored district type with unknown risk, plus the next horde. Long-term objectives: see section 4.

## 4. Goal, win and fail conditions
- **What is the player trying to achieve?** Survive, then turn the spawn city from a ruin into a network of defended, functioning districts, then push out along the country's roads to other towns and cities.
- **How do they win (or is it endless)?** Endless/persistent world with **milestones** [Decision, proposal]: restore N districts of the spawn city -> the city "stabilises" (reduced ordinary zombie spawns inside the claimed area) -> unlock convoy/expedition travel to the next city on the national plan. No hard final victory. Not confirmed by the author.
- **How do they lose or fail, and what happens then?** Proposed default [Decision, revisable]: death drops the backpack at the death location (hotbar slot kept), respawn at your hearth; a failed horde defence damages and de-restores part of the claimed block rather than deleting the base. Final numbers: **Not sure / undecided.**

## 5. World generation: how the world is built (new, core section)
Everything below happens deterministically from the world seed. The player never sees the plan layers; they see consequences.

| Layer | Question it answers | Output | Built by |
|---|---|---|---|
| **1. Country plan** | Where are cities, towns, villages, rivers/coast, the main road/rail links? How big is each? | A national graph: nodes (city / town / village / kasbah-fort), edges (highways, secondary roads), terrain regions | **Custom: Nation Planner** (informed by Lost Cities' inter-city hub/highway planner) |
| **2. City plan** | For the city the player spawned in (planned first, with priority): old core or not, river/sea edge, size, shape, wall/gates | City footprint, core location, arterial axes, gates, river crossings | Custom (Nation Planner) feeding the generator |
| **3. District plan** | Which zone goes where, obeying adjacency and access rules (e.g. a medina sits inside walls and next to a souk spine; a villa belt sits away from industry; business sits on the main boulevard) | A zone map: each lot assigned a district type and a wealth/density value | **Custom: District Planner** |
| **4. Street network** | How are zones linked? | Hierarchy: primary boulevards, secondary streets, tertiary access roads; irregular derbs inside medinas | Lost Cities hierarchical road system for grids [Verified]; **custom Medina Fabric** for irregular cores |
| **5. Lot and building program** | What goes on each lot, in what quantity, respecting the district's budget | Building list per district (Appendix C budgets) | District Planner picks from the asset pack |
| **6. Building** | What does each building look like, inside and out? | Parts, palettes, buildings, multibuildings | **Custom: Moroccan Architecture Pack** (data assets) on the Lost Cities asset system [Verified] |
| **7. Collapse** | How is it ruined, what is inside? | Damage, rubble, zombie nests, loot by building function | Lost Cities damage + custom loot/mob conditions |

**Spawn rule [Decision]:** the world's spawn is placed in a city of the national plan; that city's layers 2-6 are generated with priority and the player is placed at a survivable edge (not in the medina maze, not in a villa compound). Other cities generate lazily when approached, from the same deterministic plan, so they look identical no matter who finds them first. Minecraft generates chunk by chunk, so "generate the city around the spawn" means "resolve its plan before its chunks".

**Scale [Decision, tune later]:** one chunk (16x16 blocks) = one lot. A district is about 40-80 lots; a large city is about 12-20 districts. The real cities are far larger than playable Minecraft space, so each is compressed into districts that keep the *relationships and proportions* (core -> new town -> suburbs, rich vs popular housing, river edge) and not the real distances.

**What is real and what is invented:** the country is **fictional** and Moroccan-*inspired*. We copy urban structure and architecture logic from Rabat, Marrakech and Salé; we do not reproduce real maps, real named landmarks, or real addresses. Every generated city borrows a template (see below) but is randomised.

### 5.2 Streaming generation (nothing loads all at once) [Decision, core requirement]
The world is never generated in full, and neither is a city. Two cheap layers exist ahead of the player; everything detailed is made on demand.

| Layer | When it runs | Size of work | Budget [Decision, to be measured] |
|---|---|---|---|
| **Outline** (country graph, city footprint, district zone map, street skeleton) | In the background, asynchronously, a region ahead of the player. The spawn city's outline resolves first, before the player's first chunk. | Coarse: nodes, polygons, axes, district labels. No blocks. | Country outline under ~1 s on the reference CPU; city outline under ~1 s; both off the main thread |
| **Lot plan** (which building on which lot, from the district budget) | When a district's chunks come within a few chunks of the player | One decision per lot, deterministic from seed + position | Microseconds per lot; cached |
| **Chunk build** (blocks, damage, loot, mob anchors) | Per chunk, as the player's view reaches it, by the usual chunk pipeline | One 16x16 column set | Main-thread share under ~2 ms per chunk; heavy work off-thread |
| **Unload** | When chunks leave the view | n/a | No retained geometry for far districts; only the outline persists |

Rules:
- **Deterministic and order-independent:** a chunk's content depends only on seed and position, never on what the player loaded first. This is how Lost Cities already works [Verified], and it must hold for our District Planner and Medina Fabric.
- **No lookahead beyond the outline:** never generate "the whole district" to decide one lot. A lot decides from the zone map and its neighbours' *plans*, not their blocks.
- **Hard limits:** no gameplay system may require a full district, city or country to be loaded (the horde director, claims and markets use the outline plus loaded chunks only).
- **Infinite feel, bounded cost:** variety comes from combining a large authored asset pack with seeded variation (palettes, damage, loot, interiors), not from heavier chunks.
- This also replaces "resolve its plan before its chunks" from the spawn rule above: only the **outline** resolves first.

### 5.1 City templates (one per reference city)
- **Dual-city "Protectorate" template (Rabat-style)** [Verified]: a walled medina plus a planned *ville nouvelle* beside it, joined by one main axis that runs narrow-and-commercial near the medina and wide-and-monumental further out; institutions (post, station, courts, bank, ministries), hotels and apartment buildings with shops below along that axis; then villa and garden districts (Souissi/Agdal-style) and a modern business/administrative district (Hay Riad-style); a river/estuary with a twin city across it; a kasbah on the water edge.
- **Radial "red city" template (Marrakech-style)** [Verified]: a large walled medina with souks, a central public square, a kasbah and a mellah inside it; a wide-street ville nouvelle (Guéliz-style, Art Deco, avenues) and a planned garden/hotel wedge (Hivernage-style) between them; dense popular housing outside the walls; a palm-grove villa belt on the outskirts; an old industrial/design quarter.
- **Commuter-city template (Salé-style)** [Verified]: a smaller historic walled medina on a river bank with gates, a great mosque, a madrasa and a sea-side cemetery; very dense popular housing in large blocks of quarters; a few better-off residential quarters; new planned town on the edge with villa subdivisions; a tram corridor; roughly **twice the density** of the Rabat template (about 8,700 vs 4,400 inhabitants/km^2 in the 2024 census) [Verified], which is the basis for doubling zombie population pressure in this template.
- Towns and villages: **Not sure / undecided** (Appendix E).

## 6. Mechanics (one block per mechanic)

### Mechanic A: District scouting and scavenging
- **Name:** Read the district, loot by function.
- **What the player does (inputs) and what happens (rules):** Enter districts, read building types from the outside, loot interiors. Loot tables come from the *building's function* (pharmacy, bakery, hanout shop, school, workshop, villa bedroom), and the district's wealth value scales quality.
- **Limits and edge cases (cooldowns, caps, what breaks it):** Loot is finite per building; respawn only through restored trade (Mechanic E). Exact numbers: **Not sure / undecided.**
- **How it interacts with the other mechanics:** District type -> loot -> reclaim costs -> economy -> defences.

### Mechanic B: Density-driven slow-burn zombies
- **Name:** Population-weighted undead.
- **What the player does (inputs) and what happens (rules):** Zombie density follows the district's *pre-collapse population density* [Decision]: popular housing and medina are packed (high), business quarters by day-pattern (moderate), villa belts and industrial zones (low but trapped/armed with security-type hazards). Dark interiors and cellars have nests. Sound attracts them (Attract to Sound) and they mine/climb (Enhanced AI). Occasional daytime wanderers.
- **Limits and edge cases (cooldowns, caps, what breaks it):** Firearms are scarce and loud; noise is a resource you spend. Exact spawn numbers: **Not sure / undecided.**
- **How it interacts with the other mechanics:** Makes dense districts the high-risk/high-supply places; makes horde routes predictable.

### Mechanic C: Rebuilding by hand (replaces automatic reclamation)
- **Name:** Rebuild the ruin.
- **What the player does (inputs) and what happens (rules):** Most of the city is broken: collapsed floors, missing walls, rubble, burnt interiors, overgrown streets. Players repair and rebuild it **manually, block by block, as in normal Minecraft**: clear rubble, shore up walls, replace windows and doors, relight, barricade. Nothing is rebuilt for them. The mod only helps in three ways: (1) an optional **blueprint ghost** that shows the building's intact shape (toggle, per building), (2) a **Repair Score** that measures how much of a building is sound, sealed and lit, and (3) function unlocks when the score passes a threshold (a repaired bakery can be run, a repaired clinic heals, a repaired stall can trade).
- **Limits and edge cases (cooldowns, caps, what breaks it):** Players may also tear down and build something completely different on a claimed lot (full freedom); a building then simply no longer qualifies for its original function. Score computation must be cheap and only run on request or for loaded, claimed chunks.
- **How it interacts with the other mechanics:** Turns scavenged materials into lasting territory value; ties a district's type to what you gain; the Repair Score is what the Hearth, economy and horde read.

### Mechanic D: Territory, hearths and factions
- **Name:** Claimed blocks and district control.
- **What the player does (inputs) and what happens (rules):** A faction plants a **Hearth** (claim core) which anchors claimed chunks via a chunk-claim system; claims give protection, a respawn point and the horde's target. Neighbouring factions can contest claims through limited raids.
- **Limits and edge cases (cooldowns, caps, what breaks it):** Offline protection, raid windows, claim caps and grief limits: **Not sure / undecided**; proposal: raids only on defined nights, claims shrink instead of vanishing.
- **How it interacts with the other mechanics:** Claim size scales horde size; restored districts inside the claim give benefits.

### Mechanic E: District economy
- **Name:** Trade follows what you restore.
- **What the player does (inputs) and what happens (rules):** One server currency [Decision]; player shops and server-style traders. Traders only exist in a *restored* market, souk or shop street, and prices reflect district wealth. Selling scavenged goods funds reclamation.
- **Limits and edge cases (cooldowns, caps, what breaks it):** Daily sell caps and upkeep for claims prevent runaway wealth. Values: **Not sure / undecided.**
- **How it interacts with the other mechanics:** Restored markets are strategic assets that others may raid.

### Mechanic F: Seven-day horde (on the street hierarchy)
- **Name:** The seven-night horde.
- **What the player does (inputs) and what happens (rules):** Every seventh **in-game** day [Decision], a horde forms in the densest districts and **moves along the generated street network toward claimed hearths**, funnelling through boulevards and gates. Occasionally a new monster type appears.
- **Limits and edge cases (cooldowns, caps, what breaks it):** Size scales with claim size and the number of players. Sleeping through is blocked. In-game vs real days, duration, damage rules: revisit after playtests.
- **How it interacts with the other mechanics:** Makes street layout and walls into defensive map features; punishes thin, sprawling claims.

### Mechanic G: Street-level defence
- **Name:** Chokepoints, barricades, traps.
- **What the player does (inputs) and what happens (rules):** Use generated features (gates, narrow derbs, boulevard ends, walls) plus barricades and traps to hold the horde. The medina is easy to defend and hard to hold; a boulevard is the opposite.
- **Limits and edge cases (cooldowns, caps, what breaks it):** Trap/turret set is small and custom (Appendix C). Placement limits: **Not sure / undecided.**
- **How it interacts with the other mechanics:** Rebuilt buildings become fortified anchor points.

### Mechanic H: Animals (threats and working companions) - MUST
- **Name:** Dogs, wolves and other real animals.
- **What the player does (inputs) and what happens (rules):** The world has **realistic, normal animals** only: dogs, wolves, and a small set of others. They play two roles.
  - **Threat:** wild wolf packs with a pack leader on the outskirts and in ruined country; feral dog packs that scavenge in ruined districts and attack at night; both react to noise and to blood.
  - **Companion:** you can **adopt** a dog (or tame a wolf) and give it a job: **Stay** (guard your base or territory and defend it), **Follow** (come with you on scavenging runs: warn of zombies by barking/growling, sniff out loot caches nearby, fight beside you), or other tasks later (alarm at the gate, carry light loads). Dogs can be hurt, injured and, with care, saved; they eat, need rest, and can be lost.
- **Limits and edge cases (cooldowns, caps, what breaks it):** Barking and fighting make noise, which attracts zombies (ties into Attract to Sound); a dog is a trade-off, not a free defence. Cap on companions per player. Pack AI must stay within the entity budget (section 15). Everything is animal-grounded: no collectible, evolving or fantasy creatures, no capture devices.
- **How it interacts with the other mechanics:** Guard dogs strengthen a claim against the horde (Mechanic F) but make it noisier; follow dogs speed up scavenging (Mechanic A); wild packs add open-world danger beside zombies (Mechanic B).

### Mechanic I: Vehicles and fuel - MUST
- **Name:** Wrecks, rides and fuel.
- **What the player does (inputs) and what happens (rules):** Vehicles exist in the world as found objects. They spawn **randomly** as the area streams in (parked on streets, in garages and car parks, abandoned in traffic jams on boulevards and highways), and **rarer, more powerful vehicles cluster in dealerships and rich neighbourhoods** (see Appendix J for the rarity tiers and the zone-to-vehicle table). Categories to include: **cars, sports cars (and go-karts / "sport carts" if the author means those; to confirm), trucks, hummer-style military 4x4s, motorcycles, dirt bikes, bicycles, and similar.**
  - **Condition model [Decision]:** each spawned vehicle rolls a fuel level and a condition. **About 1 in 5 (20%) spawn fully functional** (all required parts sound, can drive, normally with part of a tank). The other four in five have one or more faults: empty or leaking tank, flat tyres, dead battery, damaged engine, missing parts, or are unrecoverable scrap that yields parts only. Faults are repaired with parts and tools the player finds (garage, workshop, dealership, fuel-station loot).
  - **Fuel in vehicles:** every vehicle starts with a random fuel percentage (design range: 0-60%, most low; functional ones skew higher). Exact curve: **Not sure / undecided.**
  - **Fuel as loot:** found in fuel stations (pump and tank blocks), garages and workshops (jerrycans in storage), warehouses and depots, and by siphoning wrecks. Never lying loose on the ground (Mechanic J).
- **Limits and edge cases (cooldowns, caps, what breaks it):** Engines are loud, which attracts zombies (Attract to Sound); fuel is scarce on purpose; vehicles take damage from zombies and crashes; vehicles can be stolen, so claims must be able to lock or garage them; **vehicle count is capped by the entity budget** (section 15): parked vehicles must stay cheap when unloaded and near-free when idle. Bikes and bicycles need no fuel.
- **How it interacts with the other mechanics:** Vehicles speed scavenging and escape (Mechanic A), tie into district wealth (rich districts and dealerships hold the strongest), make noise (Mechanic B), and can be used as mobile defence or barricades (Mechanic G); dogs can ride along (Mechanic H, if the dog mod allows).

### Mechanic J: Building-appropriate loot, hidden or in breakable blocks - MUST
- **Name:** Loot that makes sense.
- **What the player does (inputs) and what happens (rules):** Every building type has its **own loot pool, fitting what the building is** (a pharmacy has medicine, a garage has tools and parts, a villa bedroom has valuables and clothes, a school has stationery and a first-aid kit, a mall has shop goods per unit). Pools are tiered by district wealth (Appendix I). Loot is **only** found in two forms:
  1. **Breakable loot blocks:** crates, cabinets, appliances, vending machines, registers, rubble and debris piles, wrecked-vehicle parts, and similar; breaking one yields its contents.
  2. **Hidden in chests and storage:** chests, barrels, lockers, wardrobes, safes, shelves and other containers.
- **Never loose items on the ground.** No item entity is placed by world generation, and no building drops pre-placed items. Items appear only when a player breaks a loot block, or opens a container. (Items dropped by players, deaths and zombies are a separate matter; zombie drops are **not** part of loot pools [Decision, to confirm].)
- **Limits and edge cases (cooldowns, caps, what breaks it):** Finite per building; refill only through restored trade (Mechanic E) or rare scripted events. The same pool must not appear in the wrong building (no medicine in a warehouse crate unless the warehouse is a pharmacy depot). Quantity numbers: **Not sure / undecided.**
- **How it interacts with the other mechanics:** Loot is what makes district type matter (Mechanic A); it feeds repair and fuel (Mechanics C, I); and removing loose items also helps performance (fewer item entities).

## 7. Controls and camera
- **Camera:** Vanilla Minecraft first/third person. [Decision]
- **Every action and its key / button:** Vanilla controls plus mod keybinds (map, medical panel, blueprint toggle, claim menu, dog commands). Final bindings: **Not sure / undecided**; cheap, to be logged when mods are chosen.

## 8. Progression and difficulty
- **What gets unlocked or improved over time?** Rebuilt buildings and their functions; claim size; trade tiers; defences; access to the next town/city.
- **How does difficulty grow? How do you avoid frustration and boredom?** Ordinary days stay slow-burn. Danger grows by *where you go* (denser, darker districts) and by horde size tied to claim size. Frustration control: horde damage de-restores rather than deletes; first district gives a safe, readable tutorial street. Exact scaling: **Not sure / undecided.**
- **Length of one session and of the whole game:** Persistent world, many sessions. Session length: **Not sure / undecided.**

## 9. Content list
- **Levels / maps / modes:** One generated country per world seed; a persistent spawn city plus lazily generated cities, towns, villages, highways. No hand-made map.
- **Districts (the content that matters most):** Medina, souk spine, kasbah/fort, ville-nouvelle commercial boulevard, institutional/administrative, business quarter, rich villa belt, luxury apartment district, popular housing, middle-class apartment district, market district, industrial/warehouse zone, campus, waterfront/marina, cemetery, palm-grove/garden belt. Composition budgets in Appendix C.
- **Enemies / obstacles / opponents:** Walkers, sound-triggered groups, miners/climbers, nests in cellars, the horde, rare mutated types; other factions.
- **Items / powerups / upgrades / shops:** Scavenged goods, medical items (injuries/bleeding), improvised weapons, scarce firearms, building materials, currency, traps. Specific lists: **Not sure / undecided.**
- **Vehicles (Mechanic I):** bicycles, scooters/dirt bikes and motorcycles, small and family cars, pickups, vans, trucks and buses, SUVs, sports cars, hummer-style military 4x4s, ATVs/go-karts if wanted. Tiers and zone placement in Appendix J.
- **Fuel and vehicle parts:** fuel (jerrycans, pump/tank blocks), tyres, batteries, engines, tools; only as loot in blocks and containers.
- **Characters and abilities:** Players and factions; dog companions; traders in restored markets.

## 10. Story and world
- **Setting and tone:** A fictional Maghreb-inspired country after the collapse: sun-bleached ramparts, white and terracotta blocks, courtyards full of dust, broken Art Deco boulevards, palm groves gone wild. Survival tension plus pride in restoring a place that used to work.
- **Characters and plot beats:** Not sure / undecided. No scripted plot.
- **How is the story told?** Environmental storytelling is natural because every district *was* something; shop signs, schools, mosques, markets and offices tell the story. Final choice: Not sure / undecided.
- **Cultural care [Decision]:** Religious and heritage buildings (mosques, madrasas, zaouias, cemeteries) are depicted respectfully as part of the setting; no desecration mechanics, and they are not used as loot or horde-spawn locations without author sign-off.

## 11. Players and multiplayer
- **Single player / local / LAN / online rooms / web:** Online dedicated server plus singleplayer from the same pack. Co-op first. [Decision]
- **Number of players, co-op or versus, roles:** Small factions (target 2-8), several factions per server; limited PvP via contested claims. Exact limits: **Not sure / undecided.**
- **What happens when someone leaves or lags?** Claims persist with offline protection (design TBD); the horde still arrives, scaled by who is online. Disconnect while carrying loot: **Not sure / undecided.**

## 12. Look and style
- **2D or 3D, and the art style:** Minecraft blocks, with a Moroccan-inspired palette direction: terracotta/red-earth for Marrakech-style cities; white/cream with accent colours for Rabat/Salé-style medinas; concrete and render for popular housing; Art Deco facades on new-town boulevards. Confirm each against the photo references (Appendix D) before building palettes.
- **Colors, mood, any references or images to attach:** Reference photo set listed in Appendix D.
- **Characters and world look:** Block-based, **mostly broken and post-apocalyptic**. [Decision, tune in playtests] Roughly 70% of buildings are heavily damaged (collapsed roofs and floors, gaps, rubble, burnt interiors), about 25% are partly standing, and only a small share are largely intact shells (these are the first things players rebuild). Streets are cracked, overgrown, blocked by wrecked vehicles-as-props and rubble. The city must read as *a real place that died*, not as random destruction: damage follows the building's structure and the district's story (a burnt market, a collapsed block, a looted pharmacy). Palette, signage, graffiti and clutter are authored in the style bible (Appendix H), not left to chance. Exact resource-pack choices: **Not sure / undecided.**

## 13. Audio
- **Music style and when it plays:** Sparse ambience; separate horde-night layer. Not sure / undecided. **Source rule: all music and sound comes from existing mods or open game-sound libraries, never AI-generated or synthesized (Appendix K).**
- **Key sound effects the player must hear:** Noise carries (footsteps, doors, gunshots) because zombies listen; horde warning cue; looting/restoring feedback. Final design: Not sure / undecided.

## 14. UI and menus
- **Main menu, pause, settings, HUD:** Vanilla UI plus mods: medical/injury panel, map with claims, a small "day X / horde in N days" indicator, district name on entry (custom). Final: Not sure / undecided.
- **Tutorial or onboarding:** First safe street at the spawn city's edge teaches scavenge -> rebuild -> claim, with the district-name popup explaining what that district type contains.

## 15. Platform and performance
- **Platform [Decision, provisional]:** Minecraft Java modpack on **NeoForge**, with a dedicated server built from the same pack. **Version: 1.21.1 for now, but this is reopened.** The creature-collection mod was the main reason to pin 1.21.1, and it is gone. 1.21.1 still has the key mods verified so far (Enhanced AI, Med System, Attract to Sound, the TaCZ port, claims, the animal mods in Appendix B, and the whole performance set), while the newest Lost Cities features (hierarchical streets, highway network) are confirmed only for 1.21.11 and 26.1.2 [Verified]. **Spike 1 now decides the version**: check Lost Cities on 1.21.1, then check that every key mod exists on 1.21.11 or 26.x before moving. Minecraft moved to year-based version numbers in 2026 (26.1+) [Verified].
- **Reference hardware [Decision, from the author, Revision 5]:** ASUS ROG Xbox Ally X: AMD Ryzen AI Z2 Extreme (8 cores, 3 Zen 5 + 5 Zen 5c), integrated AMD Radeon 890M, **24 GB LPDDR5X-8000 shared between CPU and GPU** (default split 16 GB system / 8 GB graphics), 7-inch 1080p 120 Hz VRR screen, 80 Wh battery, Windows 11 with the Xbox full screen experience [Verified: published review specs, 24 Oct 2026]. Default power limit is 17 W, with 13 W and 25 W profiles and a 35 W maximum on the 65 W charger [Verified: same review].
  - **Test settings [Decision, proposal, tuned by the performance spike]:** native 1080p, no shaders, **the default 17 W profile for the pass test** (25 W and 35 W recorded for information), render distance starting at 10 chunks and simulation distance at 6, JVM heap sized for the shared pool (start around 4 to 6 GB and tune). The pack ships the render and simulation distances that hold the floor as its defaults. These numbers are the dials; art quality and variety are not.
  - **Handheld consequences:** the GPU shares memory bandwidth with the CPU, so texture atlas size, entity count, particles and translucent textures are real costs; the integrated server (singleplayer) runs on the same chip as the client, so the full-horde test is run as singleplayer on the device. **Input is an open question:** Minecraft Java has no built-in controller support, so decide whether the pack targets keyboard and mouse docked, a controller layer, or both (Not sure / undecided).
- **Performance standard (the pack's promise):** low latency, **at least 40 FPS at all times in normal play on the ROG Xbox Ally X (the pass criterion), no stutter, with no compromise in art quality or variety.** Concretely: a run **passes** when its **1% low FPS is at least 40** and there is **no continuous dip below 40 FPS longer than 1 second** on the benchmark route. Everything else in the table is a budget that serves that floor [Decision, to be validated; the 40 FPS floor itself is the author's]:

| Metric | Target on the ROG Xbox Ally X (default 17 W profile) | Measured how |
|---|---|---|
| **1% low FPS (the pass)** | **at least 40** | Frame capture while walking the benchmark route |
| Sustained dips | no continuous stretch below 40 FPS longer than 1 second | Same capture |
| Average FPS in a dense ruined district | informational: 50 or more (not a gate) | Same capture |
| Worst frame | no single frame over ~50 ms in normal play; **no hitching when chunks stream in** | Same capture, plus in-game profiler |
| Chunk-generation main-thread cost | provisional: under ~2 ms per chunk, heavy work off-thread; **re-derived on the Z2 Extreme in the performance spike** | Profiler on a fresh-world flight |
| Outline planning (country, city) | provisional: each under ~1 s, off-thread, on the Z2 Extreme | Timer in the planner |
| Server tick | 20 TPS with the full horde active, measured as the **integrated server on the Ally X** (client and server share the device); the 4-player dedicated-server test runs on the server host, whose hardware is not decided | Profiler on the device |
| Loading to playable | provisional: a few seconds for the spawn area | Timed fresh-world join |
| Memory | Java heap, graphics allocation and Windows fit in the 24 GB shared pool with no GC stalls | Heap graph plus total memory in Task Manager |
| Power and thermals | pass at 17 W; 25 W and 35 W results recorded for information; optionally a battery-drain sample over a 30-minute run | Power profile noted in every capture |

- **Design rules that make the targets reachable:**
  1. **Streaming generation** (section 5.2) with the budgets above; a variation system instead of heavier chunks.
  2. **Entity budget:** zombie and animal counts are capped per area; far or idle entities use cheap behaviour; sound-driven AI only re-evaluates on events, not every tick; the horde is a **director that spawns in waves along the street graph**, never thousands of loaded entities at once.
  3. **Block-entity and decoration discipline:** the architecture pack uses plain blocks; no per-building block entities for decoration; ruin props are static.
  4. **Draw-cost discipline:** one atlas style, limited transparent/animated textures, no custom per-frame renderers without a measurement behind them.
  5. **Vehicles are budgeted:** parked vehicles are cheap entities (or stored data) when idle or unloaded, spawned lazily as chunks stream in, capped per area; no vehicle ticks work when nobody is near.
  6. **No loose items:** generation never creates item entities (also removes a common source of lag).
  7. **Every new content addition is measured before it is merged** on the Ally X (Appendix H gate P1-P4).
  8. **Integrated-GPU discipline:** one texel density, a bounded atlas, no shaders in the floor test, capped particles, few translucent or animated textures; shared memory bandwidth is the constraint to protect.
- **Performance mod stack (verified to list NeoForge 1.21.1 on Modrinth, 24 Oct 2026; compatibility with our worldgen and AI is [Unverified] and is tested in the performance spike):** Sodium (rendering), Lithium (game logic), FerriteCore (memory), ModernFix, ImmediatelyFast, Entity Culling, C2ME NeoForge (concurrent chunk handling; **risk: may clash with custom worldgen, test early**), plus spark (profiler, a development tool). Lazy Chunk Load and Immersive Optimization (entity tick scheduling) are candidates [Unverified]. On an integrated GPU the rendering and entity-culling mods are the likeliest big wins, but that is a guess until measured. Final selection comes only from measured results on the ROG Xbox Ally X.
- **Risk:** Lost Cities city generation and many AI zombies are the heaviest things in the pack. They are measured first, in the spike, not at the end.

## 16. Edge cases: what can a clumsy, hostile or unlucky player do?
- Enter a medina maze unprepared and be lost; mitigation: map and landmark gates, compass to the main souk spine.
- Be away from the claim when the horde starts; mitigation: warnings and a "caravan" respawn at the Hearth.
- Raid or grief another faction; mitigation: raid windows, shrink-not-delete claims.
- Game the Repair Score by sealing a building with cheap blocks; mitigation: the score also checks structure, light and function-specific needs, not just walls.
- Exploit district shops or trader prices; mitigation: daily sell caps, restored-market requirement.
- Get stuck in ruins; mitigation: generator keeps stairs/paths clear; unstuck command.
- Disconnect during a horde: Not sure / undecided.
- Vehicles: stuck in rubble or ruins, driven into the void/water, abandoned in unloaded chunks, stolen from a claim, or used to ram claims; mitigation: recovery command, drivable-route rules from the street graph, vehicle ownership/lock, cap and cleanup rules.
- Loot: a loot block or container placed by the generator in a wrong place (inside a wall, unreachable); an item entity accidentally spawned loose by a generation step; mitigation: generator tests for reachability and a test that asserts zero loose item entities after generation.
- Audio: a sound whose licence or source is unknown enters the pack; mitigation: no file merges without a CREDITS.md row (Appendix K).- Exact handling for death, respawn, inventory loss, anti-griefing, offline protection: Not sure / undecided.

## 17. Scope
- **MUST have:**
  - **Vehicles and fuel** (Mechanic I): at least bicycles, a motorbike or dirt bike, a car, a truck and a rare sports car or hummer-class vehicle, spawning by the rarity rules, with the 1-in-5 functional rule and fuel as container loot.
  - **Building-appropriate loot** (Mechanic J), loot only in breakable blocks and containers, zero loose items.
  - **Audio provenance rule** (Appendix K) from day one.
  - **Animals:** realistic wild wolf/dog packs and adoptable dog companions with at least Stay/guard and Follow/scavenge roles.
  - **Streaming generation** and the performance standard of section 15 (this is a release blocker, not a polish item).
  - **Manual rebuilding** with blueprint guidance and a Repair Score for at least one building type.
  - The generation pipeline for **one** city template with **at least five district types** (medina, new-town boulevard, rich villa district, popular housing, market/industrial) generated from a zone plan and connected by a street hierarchy.
  - Moroccan architecture pack large enough that no district looks repeated (target counts in Appendix C).
  - Collapse state, district-based loot and population-weighted zombies.
  - Claims with a Hearth, and the seven-day horde on the street network.
  - Injuries/medical, sound-driven mob AI, economy tied to restored markets.
- **SHOULD have:** the country plan with several cities and towns; Salé-style and Marrakech-style templates; richer faction competition; trap/turret set.
- **WON'T build (first release) [Decision, proposal; vehicles removed from this list in Revision 5 because they are MUST]:** real-world map reproduction, a hand-made story campaign, collectible or fantasy creatures of any kind, automatic building restoration, desecration or "loot the mosque" mechanics.
- **Time and tools you have:** Not sure / undecided (hours per week, budget, team). Required skills: Java/NeoForge modding, datapack/JSON, structure building (Blender/Litematica-style tools are candidates, [Unverified]).

## 18. Success tests
- **30-second test:** You are in a ruined Moroccan-style city, the district name shows, you can tell from the buildings that it is housing/market/industry, and you know noise is dangerous.
- **60-second test:** Within a minute at the spawn edge you enter a small shop or home, find useful loot, and meet one manageable zombie. Must be playtested.
- **District test:** Two players in different districts can describe it without help ("this is the medina, tight and dark", "this is the villa belt, big and quiet").
- **Variety test:** Three worlds from three seeds produce clearly different cities with the same district logic.
- **"It is done when..." (MVP):** one generated city with five district types; a faction can scavenge, rebuild one building by hand, claim a block, and survive one horde that comes down the street network.

## 19. Anything else
- The central loop is now: **Scout -> Scavenge -> Rebuild -> Restore -> Claim -> Defend -> Expand.**
- The pipeline is the product. Everything else (mods) is plumbing around it.
- The modpack must be fun alone and with friends, not only on a server.
- Separate future discussion (unchanged): after this game vision is documented, revisit the distinct **Mol Stormers** idea and its Roblox-first release strategy. Do not mix Mol Stormers into this game's design.

---

# Appendix A: What changed from Revision 1 (so nothing is lost)
| Revision 1 | Revision 2 |
|---|---|
| "An existing, mostly ruined city", handcrafted/generated undecided | Fully procedurally generated country and city, deterministic from the seed |
| Platform: Minecraft modpack OR Roblox | Minecraft modpack only, NeoForge 1.21.1 [Decision] |
| City treated as one ruined area | City divided into functional districts with budgets and adjacency rules |
| Loot generic | Loot by building function and district wealth |
| Zombies low/moderate everywhere | Zombie density by pre-collapse population density |
| "Rebuilding" = placing blocks | Still manual Minecraft building, now with a blueprint ghost and Repair Score that unlock a building's function (no auto-restore, Revision 3) |
| Horde from nowhere | Horde follows the street hierarchy to claimed hearths |
| Economy undefined | Currency plus traders that exist only in restored markets |
| Creature collection idea | **Removed (collectible creatures).** Realistic animals only: wild wolf/dog packs and adoptable guard/scavenging dogs (Mechanic H, MUST) |
| Reclamation: automatic restoration | Manual rebuilding with blueprint ghost and Repair Score; nothing is auto-built |
| Detailed world pre-generated | Streaming generation: outline in the background, detail chunk by chunk (5.2) |
| Performance unspecified | Reference hardware (ROG Xbox Ally X since Revision 5), 40 FPS floor, budgets, measured gates (section 15, Appendix H) |

# Appendix B: Mod map (verified evidence only)
Fit column states what the source actually says. "Spike" means checked in Appendix E.

| Requirement | Mod | Evidence | Verdict |
|---|---|---|---|
| City/world generation engine | **The Lost Cities** (McJty) | Modrinth: large procedural cities with streets, buildings, parks, highways, bridges, railways, subways; datapack assets for buildings, palettes, city styles, world styles; supports MC 1.20.1, 1.21.1, 1.21.11, 26.1.2; "feel free to use in any modpack"; repository is MIT licensed | **Use as the engine and fork where needed** |
| City world autoload | Lost Cities Autoloader | Applies a configured profile to new worlds automatically | Use, spike 1 |
| Zone-aware building choice | none found | Lost Cities picks buildings by weighted selectors, distance-from-spawn bands and city styles; no district/zoning layer is documented; a datapack note says Lost Cities cannot merge city styles from several datapacks | **Build ourselves (District Planner)** |
| More danger in cities | Lost Souls (Lost Cities companion) | Described as adding challenge to Lost Cities buildings; version support [Unverified] | Candidate, spike 1 |
| Sound-driven zombie AI | **Attract to Sound** | Forge/NeoForge/Fabric, MC 1.18.2-1.21.11 incl. 1.21.1; mobs investigate sounds, follow footsteps, react to gunshots, group AI, TaCZ decibels, voice chat | **Use** |
| Mining/climbing zombies | **Enhanced AI** (Insane96) | NeoForge 1.21.1, release 4.2.0.1 (9 Jul 2026): zombies mining, sniping skeletons | Use (pick one AI-overhaul between this and Zombie Tactics) |
| Alternative zombie AI | Zombie Tactics | NeoForge/Fabric 1.21/1.21.1; breaks blocks; author warns of incompatibility with other AI mods | Alternative only |
| Seven-day horde | Blood Moon mods | "Blood Moon" and "7 Days To Blood Moon" are for 1.21.8-1.21.10 / 1.21.4 per their pages, not NeoForge 1.21.1; none routes hordes along streets | **Build ourselves (Seven Nights)** |
| Base-defence waves | Invasion (fork), Nightfall Siege, Orcinvasion | Invasion fork is a Fabric build; Nightfall Siege NeoForge builds listed only for 1.20.5 and 1.21.2; Orcinvasion is orc-themed | Not suitable as-is |
| Chunk claims and parties | **Open Parties and Claims** | Beta; claims and forceloading, parties, API, FTB Teams support, Xaero map integration; NeoForge | **Use** |
| Raids over claims | OPaC: Warfare (unofficial addon) | NeoForge addon with chunk wars and raid rules, tested baseline 1.21.1 | Candidate; unofficial |
| Faction claims | Terrabounds Faction Claims | NeoForge 1.21.1, siege mechanics, author calls it a first, work-in-progress mod | Too immature |
| Economy | **EconomyCraft** | Server-side, Fabric and NeoForge, player shops, server shop, orders board, daily sell limit; needs Architectury API; 1.7.0 builds exist for 1.21.11 and 26.x [1.21.1 build: Unverified] | Use if 1.21.1 build exists, else Modern /Shop or MMO Econ (1.21.1 NeoForge) |
| Injuries and medicine | **Med System** (NeoForge 1.21.1, v2.9.1, Jun 2026): limbs, bleeds, fractures, tourniquets; also **FieldCare** (beta), **Keep It Healthy** (wounds, temperature; modpack terms apply) | Pick **one** injury system | Use Med System; test with the others |
| Firearms | **Timeless and Classics Guns: Zero** (unofficial 1.21.1 NeoForge port, plus gun-pack upgrader) | Unofficial port; gun packs need upgrading; official line is on 1.20.1 | SHOULD; adopt cautiously |
| Dog companions | **Doggy Talents Next** | Modrinth: NeoForge, MC 1.21-1.21.1, client+server, LGPL-3.0; whistle commands, tracking, teleport-to-you, breeds, can be ridden, dogs navigate cliffs/lava/water and can recover from death; the page does **not** name guard/follow/loot roles | **Use; test which roles exist, build the rest** |
| Wild wolf behaviour | **RevampedWolf** | Modrinth: NeoForge 1.21-1.21.1, LGPL-3.0; wild packs with a leader, hunting AI, wolves pick up food and heal by eating meat, new wolf armor; no mention of taming | **Use for the wild-pack threat** |
| Pet safety | **Companion** (slug `companion`) and **Followers Teleport Too** | Modrinth listings: keeps pets from being lost; teleports pets/mounts along with you | Candidates [Unverified in detail] |
| Dog posing | Let Sleeping Dogs Lie | Dogs can lie down instead of only sitting | Cosmetic candidate |
| Vehicle framework | **Immersive Vehicles** (+ content packs, e.g. the Official Content Pack: cars, trucks, buses, planes, tanks) | Modrinth: Forge/NeoForge, listed for 1.21.1, **licence All Rights Reserved**; the mod itself ships no vehicles, packs add them; any liquid can be fuel; engine life, blown tyres and gauges; the page does not confirm NeoForge for 1.21.1 specifically or natural spawning | **Strong candidate; check licence for modpack use and the NeoForge 1.21.1 file** |
| Bikes and motorcycles | **C.M.A pack for Immersive Vehicles** (`cmatransportpack`) | Modrinth description: military and civilian cars, planes, helicopters, **motorcycles and bicycles**; pack covers 1.12.2-1.21.1; exact vehicle list and dirt-bike coverage [Unverified] | Candidate; verify contents and licence |
| Simple vehicle set | **MrCrayfish's Vehicle Unofficial** | CurseForge: unofficial port, GPLv3, NeoForge 1.21.1 file, ATVs and go-karts; fuel/parts/spawning not covered on the page | Fallback or add-on |
| Customisable cars | **Automobility** | Modrinth: MIT, NeoForge 1.21.1 (alpha), cars built from frame/engine/wheels via a mechanic table, datapack-extendable; no fuel system mentioned | Possible parts-based model; does not meet fuel needs alone |
| Military vehicles | Superb Warfare (+ AshVehicle) | Modrinth: tanks, helicopters, heavy weapons, GPL-3.0 code with all-rights-reserved assets; block destruction **on by default** | **Not recommended** as a base: wrong tone and balance. A hummer-class vehicle must come from a vehicle pack or be custom |
| Fuel, spawning, 1-in-5 rule | none found | None of the pages checked mention random world spawning, fuel loot or condition rolls | **Build ourselves (Wreck Spawner + Fuel/Condition glue)** |
| Loot weapons in structures | TaCZ Structure Loot | Modrinth: adds TaCZ guns/ammo to chests, optional Lost Cities support, 1.21.1 | Candidate; must follow our "no loose items, building-appropriate" rule |
| Lost Cities addons on 1.21.1 | **Lost Cities Modern Tweaks** (and a Lights Off variant), **Lost Souls** | Modrinth: Lost Cities, Modern Tweaks and its variant list 1.21.1; Lost Souls lists 1.21.1 in one place but its description of versions is inconsistent, check the file | The core mod is confirmed for 1.21.1; hierarchical streets and the highway network on 1.21.1 are **still unconfirmed** || Voice chat | Simple Voice Chat | Not researched; Attract to Sound states it reacts to voice chat | Candidate, [Unverified] for 1.21.1 |
| Terrain/biomes, performance, furniture, decoration | not researched this pass | n/a | Spike 5 |

# Appendix C: What we must build ourselves
## C.1 Custom mods (code)
| # | Mod | What it does | Why nothing existing works | Priority |
|---|---|---|---|---|
| 1 | **District Planner** | Generates the zone map per city (district type per lot, adjacency, wealth, density) and tells the generator which building program each lot gets | Lost Cities has no district layer; style merging across datapacks is unsupported | **P0, core** |
| 2 | **Nation Planner** | Seed -> country graph: cities, towns, villages, roads/rail, size and template per node; spawn-city-first resolution | Lost Cities' hub/highway planner links *cities*, but there is no national plan or per-city templates | P0 (minimal), P1 (full) |
| 3 | **Medina Fabric** | Irregular, non-grid old-city street and block generator (derbs, courtyards, gates, ramparts) | Lost Cities is a 16x16-chunk grid; its hierarchical roads are straight lines | P0 (pragmatic version: medina "block" parts with internal lanes) |
| 4 | **Seven Nights** | In-game-day counter, horde director routing along the street graph to Hearths, scaling, special monsters | No 1.21.1 NeoForge horde mod found that routes by street layout | P0 |
| 5 | **Repair Tracker** | Blueprint ghost per building, Repair Score (sound/sealed/lit), function unlocks; **never builds anything for the player** | No such mod exists | P1 |
| 6 | **Hearth (Claim Core)** | Faction anchor block: claim hook into Open Parties and Claims, respawn, horde target, upkeep | Glue between claims, hordes and economy | P0 |
| 7 | **District Markets** | Trader NPCs that exist only in restored markets with district-based prices; hooks EconomyCraft | Economy mods have no concept of districts | P1 |
| 8 | **Street Defence kit** | Small set of barricades, traps, and (maybe) turrets with wear and repair | Candidate mods found were Fabric or unverified | P1 |
| 9 | **District HUD/Compass** | Shows district name/type on entry; compass to souk spine/landmarks | Needed to make zoning legible | P1 |
| 10 | **Working Animals** | Roles beyond what the dog mods give (Stay-guard a territory, Follow-scavenge with loot sniffing and warning barks), feral dog packs, noise/blood reactions wired into Attract to Sound, entity-budget limits | Dog mods cover taming and commands but not (verified) scavenging, territory guarding or horde interaction | **P1 (MUST)** |
| 11 | **Wreck Spawner** | Places randomly spawned vehicles as chunks stream in, by district/zone rarity table; rolls fuel % and condition (20% fully functional); cheap when idle or unloaded | No mod found does zone-aware, condition-rolled vehicle spawning | **P0 (MUST)** |
| 12 | **Loot Container System** | Block-entity loot blocks (crates, cabinets, appliances, vending machines, rubble piles) and container hookup to building-aware loot tables; asserts zero loose item entities | Vanilla chests take loot tables, but breakable loot blocks tied to building function need custom blocks; not found in a mod | **P0 (MUST)** |
| 13 | **Fuel and Parts Glue** | Jerrycans, pump/tank blocks, siphoning, repair parts, noise on engine start | Glue between the vehicle mod, loot tables and Attract to Sound | P1 |
Implementation note [Decision]: mods 1-3 are most likely one **Lost Cities fork** (MIT) so the district layer sits *inside* the building-selection step. Whether a clean API hook is enough instead is spike 2.

## C.2 Content we must author (data, not code)
- **Moroccan Architecture Pack**: parts, palettes, buildings, multibuildings, city styles and a world style on the Lost Cities asset system. This is the largest workload. Targets for v1 (unique variants):

| Typology | Variants (v1 target) |
|---|---|
| Medina courtyard house (dar / riad) | 12 |
| Souk shop strip, fondouk, hammam, communal oven, fountain square, madrasa/zaouia, mosque, gate and rampart pieces | 4 / 3 / 2 / 2 / 3 / 2 / 3 / 6 |
| Villa (small, large, walled compound) | 6 / 6 / 4 |
| Luxury apartment block | 5 |
| Popular self-built house (2-4 storey, concrete infill) | 10 |
| Apartment block (mid-range) | 8 |
| Art Deco mixed-use boulevard block, hotel, civic/administrative, bank/post | 8 / 3 / 4 / 3 |
| Office tower, mixed office | 5 / 4 |
| Mall (multibuilding with plaza), supermarket | 2 / 3 |
| Fast-food/cafe/snack, hanout shop, pharmacy, bakery | 5 / 6 / 2 / 2 |
| School, university building, hospital/clinic, police station | 3 / 3 / 2 / 2 |
| Warehouse, workshop, garage, factory, fuel station | 6 / 4 / 3 / 2 / 2 |
| Park/garden, cemetery, palm-grove plot | 4 / 2 / 3 |

- **Loot and mob conditions** (data): per-building loot tables by function and district wealth (Appendix I); mob tables by zone; vehicle spawn tables by zone (Appendix J).
- **New building types for vehicles and fuel:** car dealership (two tiers: mass-market and luxury), large garage/car park, motorbike/bike shop, fuel station (already budgeted), truck depot, police and military compound with hummer-class vehicles.
- **Animal assets:** companion dog breeds/skins, wild wolf and feral dog variants, sounds (bark, growl, whimper), armor and gear for working dogs, all realistic.
- **Ruin kit:** damage patterns, rubble, wrecked street props, burnt interiors, overgrowth, signage and graffiti sets per district (see Appendix H style bible).
- **Recipes, advancements/quests, tutorials, sounds, textures** for the above.

# Appendix D: Urban research (Rabat, Marrakech, Salé)
**Method and limits.** Sources were planning/heritage documents, census releases, district guides and photo searches, **plus a first OpenStreetMap measurement pass (Appendix F)** run through the author's browser on 24 Oct 2026. Google Maps and Google Earth were still not used. The measured counts are rough: the district boxes are my approximate guesses, and most buildings in OSM carry no type tag. The budgets in D.5 are design targets informed by those counts and the qualitative sources; Appendix F lists the adjustments the data suggests. Calibrate further before locking them (Appendix E, spike 4).

## D.1 Rabat (dual city; sets the template for "planned capital")
- Planning logic [Verified: UNESCO nomination and heritage summaries]: the 1914 Prost plan built a *new town* south of the medina inside the old Almohad enclosure, kept separate from it; a main axis (today's Mohammed V boulevard) is narrow and commercial near the medina, then wide and monumental, carrying the post office, railway station, courts, treasury, bank, hotels and rows of shops under apartments; the axis continues to the royal and residence districts; the new town had sewers, green spaces, squares and wide alleys.
- Districts [Verified]: **Agdal** (upscale, university and expatriates, orange-grove gardens, a large mall, cafes, a railway station); **Hay Riad** (modern planned administrative/business district: offices, ministries, embassies, apartments, schools, green space); **Souissi** (most exclusive, villas on 600-1,500+ m^2 plots, embassies, international schools); **Hassan** (historic centre, renovated 1950-70s buildings, mixed shops and housing, corniche); **Yacoub El Mansour** and **Youssoufia** (large, more affordable popular quarters).
- Census (2024) [Verified]: Rabat 509,916 inhabitants on 116.5 km^2 (about 4,400/km^2). Arrondissements: Yacoub El Mansour 168,391; Youssoufia 157,587; Hassan 92,454; Agdal-Riyad 70,435; Souissi 21,049. Of ~300 villa purchases in 2023, about 80% were in Agdal-Riyad and Souissi.
- Use in game: Souissi/Agdal -> villa belt and luxury apartments; Hay Riad -> business quarter; Hassan -> mixed core next to the medina; Yacoub El Mansour/Youssoufia -> popular housing; Kasbah and river edge -> fort and waterfront.

## D.2 Marrakech (radial walled core; sets the "red city")
- Medina [Verified: urban morphology sources]: the fabric is organised around the **derb** (usually dead-end residential street); houses wrap a courtyard open to the sky, typically **2-4 storeys with few external openings**; several derbs form a neighbourhood, each with a **mosque, communal bread oven and hammam**; also madrasas, fondouks (merchant hostels/warehouses), palaces and a kasbah, public squares and fountains, and souks; red clay is the characteristic material in Marrakech. The mellah (1558) has taller, narrower houses, often with wooden balconies.
- Ville nouvelle **Guéliz** [Verified]: planned 1913 (Landais and Prost), built from the 1919 period; wide streets, Art Deco, Avenue Mohammed V with shops, cafes, hotels and administration; colonial villas largely replaced by apartment buildings.
- **Hivernage** [Verified]: planned wedge between medina and Guéliz, broad boulevards, gardens, five-star hotels, nightlife, spacious and legible instead of labyrinthine.
- **Palmeraie** [Verified]: palm-grove belt of luxury villas, resorts and golf, on the outskirts. **Sidi Youssef Ben Ali** [Verified]: dense authentic residential quarter just outside the walls. **Sidi Ghanem** [Verified]: former industrial quarter turned design district. The urban agency's current plans cover Sidi Youssef Ben Ali, Mechouar-Kasbah, Médina, the former industrial quarter and Guéliz-East [Verified].
- Use in game: the red-city template; medina and mellah variants; Hivernage-style planned wedge as the rich hotel/garden district.

## D.3 Salé (dense commuter city; sets the "twin town")
- Facts [Verified]: city on the right bank of the Bou Regreg opposite Rabat, serving as its commuter town; 945,101 inhabitants on 108.4 km^2 (about 8,700/km^2; 2024). Arrondissements: Tabriquet 237,385; Hssaine 234,326; Layayda 229,838; Bab Lamrissa 167,319; Bettana 76,233. Medina founded by the Almohads in the early 12th century; Bab Mrisa gate (1260) with carved inscriptions and two square turrets; Merinid madrasa with a carved cedar canopy; great Almohad mosque; ramparts with named gates (Bab Maalaq, Bab Jdid, Bab Sidi Bou Haja, Bab Ferran, Bab Fès, Bab Sebta, Bab Chaafa); a large sea-side cemetery around the saint's tomb; Bettana and Hay Salam are the better-off residential quarters; Sala Al Jadida is the new planned town with villa subdivisions; Tabriquet is the biggest popular area and has an integrated market complex; growth runs toward Kénitra and toward Meknès; tram and marina on the river.
- Use in game: the densest template; popular housing dominates; strong medina-to-river relationship; doubled zombie pressure.

## D.4 National housing mix (priors for generator weights)
[Verified: HCP 2024 census reports] In Moroccan cities, "modern Moroccan houses" (self-built, multi-storey) are about **65%** of dwellings; **villas about 2.7%** (down from 4.5%); **traditional houses about 2.6%** (down from 5.5%); precarious/slum housing about **3.3%** nationally; apartments make up most of the rest (exact city-level figure: Unverified). Marrakech-Safi has the highest share of traditional houses in the 2014 data (12.7%). Rabat-Salé-Kénitra urban slum share 2.7% (2024).
Use: these are *city-wide* priors. District budgets below intentionally exaggerate villas and traditional houses (they are concentrated in a few districts and are what players want to see).

## D.5 District composition budgets (design targets, calibrate in spike 4)
Per 64-lot district; **[Decision]**, built from the qualitative sources above and the user's brief.

| Building type | Rich villa/luxury district (Souissi/Agdal) | Popular housing (Tabriquet/Youssoufia) | Medina | New-town boulevard (Guéliz/Mohammed V) | Business quarter (Hay Riad) | Industrial/market (Sidi Ghanem) |
|---|---|---|---|---|---|---|
| Houses/villas | 26 villas | 30 self-built houses | 34 dar/riad | n/a | n/a | n/a |
| Apartment blocks | 10 luxury | 18 standard | n/a | 8 | 10 | n/a |
| Shops | 5 boutiques | 4 hanouts | souk strips 8 | 30 mixed-use blocks with ground shops | n/a | n/a |
| Food/leisure | 3 cafes/fast food | 3 snack/cafe | n/a | 8 cafes/restaurants | 5 cafes | 2 canteens |
| Civic/religious | 2 embassy/institution compounds, 1 school | 1 school, 1 mosque, 1 hammam, 1 bakery/oven | 2 mosques, 2 hammams, 1 madrasa/zaouia, 2 ovens, 2 fountain squares, 3 fondouks, 2 gates/ramparts | 5 civic/bank/post, 1 cinema/theatre, station/square 4 lots | 6 ministries/institutions, 3 banks, 1 school, 2 clinics | n/a |
| Business/industrial | n/a | 3 small workshops, 2-lot neighbourhood market | 6 artisan workshops | 4 hotels | 16 towers, 12 mixed offices, 3 hotels | 28 warehouses, 14 workshops, 8 garages, 4 wholesale, 4 yards, 2 factories, 2 fuel |
| Large set pieces | Mall with big plaza (3x3 multibuilding, 9 lots) | n/a | n/a | n/a | n/a | n/a |
| Green/open | 8 gardens | 0 | 2 courtyards | 4 | 6 | 0 |
| Total | 64 | 64 | 64 | 64 | 64 | 64 |

Street rules: medina = irregular derbs, one souk spine from gate to central mosque, dead ends; new town = straight boulevards, primary axis wider with arcaded shops; villa belt = tree-lined streets and walls with gates; popular housing = dense tertiary grid with a market street; business = wide primary axis, plazas; industrial = wide access roads and yards.

**Vehicle-related additions to D.5 [Decision, design targets]:** the new-town boulevard gets 1-2 mass-market dealerships and a motorbike/bike shop; the business quarter gets multi-level car parks; the rich villa/apartment districts get 1 luxury dealership plus private garages; the industrial zone gets truck depots and extra garages and fuel stations; police and military compounds are single-lot set pieces. Streets and car parks carry parked and abandoned vehicles per Appendix J.

## D.6 Reference photos
I pulled reference photos by type (shown in the chat for this session; open the source titles to download): Marrakech medina riads/courtyard houses (three sources); Rabat Hay Riad apartments and business district (three sources); Souissi villas (three listings); Salé Hay Karima/Tabriquet housing and the Tabriquet planning page; Guéliz Avenue Mohammed V Art Deco facades (travel and local-history pages); Marrakech souk streets. Use them for façade proportions, roof terraces, window and balcony patterns, tile and colour. **Legal note:** these are reference only; do not copy images into the pack's textures; build original blocks and builds.

# Appendix E: Open questions and verification spikes
1. **Version spike:** does Lost Cities for 1.21.1 include hierarchical streets and the inter-city highway network, or only 1.21.11/26.x? Decides 1.21.1 vs 1.21.11.
2. **Hook spike:** can a District Planner attach to Lost Cities via its API/datapacks (city-style per chunk, predefined cities/multibuildings) or must we fork? Also test that a custom city style plus a custom world style fully replaces the defaults (no merging).
3. **Repair Tracker spike:** can the Repair Score (sound/sealed/lit) be computed cheaply for a ruined generated building from its design, and can a blueprint ghost render without hurting frame time?
4. **Calibration spike (partly done):** first OpenStreetMap pass is in Appendix F with rough hand-placed boxes and under-mapped Salé. Still to do: real district polygons, Salé re-measure, Google Maps/Earth imagery for the medinas, villa belts and popular housing.
5. **Mod-gap spike:** terrain/biome mods for a Maghreb look, furniture/decoration, performance mods, voice chat, KubeJS-style scripting for glue, trap/turret mods, Lost Souls version support, EconomyCraft 1.21.1 build.
8. **Vehicle spike:** confirm the Immersive Vehicles NeoForge 1.21.1 build, its licence terms for modpacks, which packs supply cars, trucks, sports cars, hummer-class vehicles, motorbikes, dirt bikes and bicycles, whether vehicle entities can be spawned from our code, and the cost of N parked vehicles on the reference machine.
9. **Loot spike:** confirm how Lost Cities parts and our own structures attach loot tables to chests, whether custom block entities can carry per-instance loot tables cheaply, and that nothing spawns loose item entities.
10. **Audio spike:** build the audio source list per category (zombies, footsteps, doors, vehicles, animals, ambience, UI) from existing mods and the libraries in Appendix K, and record each file's licence before it is used.6. **Author decisions needed:** in-game vs real days for the horde; death/loss rules; faction size and PvP limits; whether Mechanic H stays; village/town templates; whether the medina is playable at v1 or a later milestone.
7. **Licensing:** confirm each mod's modpack redistribution terms (several are "all rights reserved with modpack allowance"; the animal mods found are LGPL-3.0), keep a credits file.

# Appendix F: OpenStreetMap measurement pass (24 Oct 2026)
**What this is.** Counts of OSM building footprints, typed buildings, shops and amenities inside rectangles I placed by hand over 11 districts (Overpass API, data timestamp 2026-10-24). **Read with these caveats:**
- The rectangles are approximate guesses from district locations, not official boundaries, and differ in area. Compare *mixes and ratios*, not absolute totals across districts.
- Most buildings are tagged only `building=yes`, so typed counts (apartments, houses, retail) are **lower bounds**; footprint totals are the better density signal.
- OSM coverage is uneven. Salé Tabriquet returned only 585 footprints for a district of about 237,000 people, so it is almost certainly under-mapped or the box missed the dense core. Treat Salé numbers as unreliable.
- The "Rabat medina" and "Salé medina" rectangles clearly overlap neighbouring modern fabric (apartments, towers, banks). Use the Marrakech medina rectangle as the only close medina measurement.
- This is not Google Maps/Earth research and I did not look at imagery.

| District box | Footprints | Typed buildings (top) | Services (top, counts) |
|---|---|---|---|
| Souissi (Rabat) | 2,750 | residential 79, house 51, apartments 11, commercial 10 | schools 19, banks 18, restaurants 16, pharmacies 7, cafes 6, worship 6, universities 5, clinics 4, supermarkets 4 |
| Agdal (Rabat) | 2,241 | apartments 870, residential 464, house 109, semi-detached 81, retail 39 | restaurants 94, cafes 81, fast food 49, clothes shops 48, banks 45, pharmacies 34, schools 30, convenience 26 |
| Hay Riad (Rabat) | 2,751 | house 43, apartments 41, public 20, commercial 16, university 15 | restaurants 44, cafes 31, pharmacies 21, schools 15, banks 14, fast food 13, supermarkets 8 |
| "Rabat medina" box | 1,266 | apartments 33, tower 11, house 9 | restaurants 43, cafes 37, fast food 22, banks 21, worship 23, convenience 15, bakeries 7, fountains 6 |
| Salé Tabriquet | 585 (under-mapped) | residential 200, apartments 43 | banks 29, pharmacies 26, worship 24, schools 14, cafes 13, marketplaces 3, supermarkets 3 |
| "Salé medina" box | 1,034 | apartments 254, residential 27, house 14 | schools 16, banks 9, worship 9, cafes 7, pharmacies 6 |
| Marrakech medina | 7,949 | residential 2,227, retail 93, house 58 | restaurants 222, cafes 78, pharmacies 45, worship 40, fast food 30, clothes shops 32, weaver shops 28 |
| Guéliz | 2,262 | apartments 101, house 21, residential 16 | restaurants 126, cafes 48, banks 40, pharmacies 39, clothes 24, bars 20, fast food 18, car rental 18, fuel 12 |
| Hivernage | 761 | hotels 10, apartments 10, residential 13 | restaurants 49, banks 16, bars 14, cafes 13, pharmacies 13, fountains 8, fast food 7 |
| Sidi Youssef Ben Ali | 3,005 | residential 729, house 26, terrace 15, school 6, mosque 3 | pharmacies 26, worship 6, schools 5, restaurants 4, hospitals 3 |
| Palmeraie | 1,631 | residential 11, house 2, industrial 2, hotel 1 | essentially none: 1 restaurant, 1 shop, 1 repair shop |

**Readings that change the design (and what I applied or recommend):**
1. **Rich is not one thing.** Agdal is apartment-led (870 apartments vs 109 houses, plus the most cafes, restaurants and fast food of any residential box), while Souissi is a villa-and-institution district with few eateries but many schools and banks. Recommendation: split the old "rich" district into **Villa belt** (Souissi/Palmeraie style: few services, schools/embassies/clubs) and **Luxury apartment district with high street** (Agdal style: apartments, cafes, fast food, shops, a mall). This matches your brief of a rich area with villas, luxury apartments, fast-food chains and a mall, but spreads it across two linked districts.
2. **Popular housing is service-poor.** Sidi Youssef Ben Ali has about 3,000 footprints and only 4 mapped restaurants but 26 pharmacies and several schools and mosques. Keep eateries to a handful, with pharmacies, bakeries, schools and a mosque as the anchors. (This supports the snack/shop minimums in D.5.)
3. **Dining density ranks:** Guéliz (about 5.6 restaurants per 100 footprints) > Agdal (about 4.2) > Marrakech medina (about 2.8) > Hay Riad (about 1.6) > Souissi (about 0.6) > Sidi Youssef (about 0.1) > Palmeraie (about 0). Use these as relative weights for restaurant/cafe/fast-food spawning by district type.
4. **Business districts are about parking and institutions:** Hay Riad has 77 parking amenities, 15 universities/20 public buildings and mainly untyped footprints. Add multi-level car parks and campus buildings to the business-quarter list.
5. **The Marrakech medina is very large and mostly residential with a dense tourist-commercial layer:** about 2,200 typed residential and 7,900 footprints in one box, with 222 restaurants and 93 retail. In game, one medina district needs far more tiny lots than other districts, so the "64 lots" budget should be treated as a *sampled* medina, not a scaled one.
6. **Palm-grove belt:** 1,631 footprints with near-zero services means large estates/villas in gardens, with almost no commerce. Zombie population should be low, hazards high (walls, gates, dogs/guards).

**Still open:** a proper pass with true district boundaries (OSM relations or drawn polygons), Salé re-measured, and Google Earth imagery for roof and street patterns. Spike 4 is now **partly done** (counts), imagery and boundaries remain.

# Appendix G: Agentic tooling for building this pack with Claude Code (researched 24 Oct 2026)
**Scope and caution.** These are third-party repos; I read their public pages, not their code. Before installing any, read it, pin a commit, and treat skill and MCP text as untrusted input. The `game-builder` skill's own scripts (scaffold, gates) are Godot-specific and do **not** apply to Minecraft; only its principles are adopted (Appendix H).

| Tool | What it gives | Fit and limits |
|---|---|---|
| **Minecraft Dev MCP** (`MCDxAI/minecraft-dev-mcp`, MIT) | MCP server with 21 tools: download, remap, decompile and search Minecraft source; analyze mod JARs (Fabric/Quilt/Forge/NeoForge); validate Mixins and access transformers; compare versions; Yarn/Mojmap/Intermediary mapping lookup. Minecraft 1.14-1.21.11 (Yarn or Mojmap) and 26.1+ (Mojmap). Install: `npx -y @mcdxai/minecraft-dev-mcp`; needs Java 17+. | **Adopt first.** Lets the agent read vanilla and third-party code (e.g. Lost Cities internals) instead of guessing APIs. Does not list 1.21.1 explicitly in what I read, but 1.14-1.21.11 spans it. |
| **Minecraft MCP (in-game)** (`s00d/minecraft-mcp`, MIT, fork of ArclightPowered) | A mod that runs an MCP server inside the game client and dedicated server; NeoForge/Forge/Fabric jars for 1.21.1 through 26.3. Reads state, sends input, takes screenshots and contact sheets, records mp4 via ffmpeg, runs commands, controls tick/time, records packets, runs scenario files with expected results, headless mode. | **Best candidate for automated playtests and evidence screenshots** (Appendix H gates). Small fork with no stars, so unproven; the loopback endpoint has no auth token by default. Vet and sandbox before use. Source of the claims is its README only. |
| `InventivetalentDev/minecraft-mcp` (MIT) | Paper/Spigot server MCP and a Fabric client mod; Fabric client targets MC 26.1.2. | **Not suitable:** Paper plugins cannot run NeoForge mods. Idea source only. |
| **Minecraft agent skills** (`Jahrome907/minecraft-agent-skills`, MIT) | 13 skills incl. `minecraft-modding` (NeoForge, Fabric, Forge 1.20.1), `minecraft-datapack`, `minecraft-world-generation`, `minecraft-server-admin`; reviewed against MC 26.3 (11 Oct 2026). Install: copy `.claude/skills/` or `claude --plugin-dir ./plugins/minecraft-codex-skills` (not both). | **Adopt for datapack and worldgen guidance.** No dedicated performance skill. Check which skills assume 26.x instead of 1.21.1. |
| `AIKUSAN/minecraft-agent-skills-bundle` (MIT) | Similar bundle: world generation, datapacks (1.21-1.21.11), server admin. | Overlaps the above; pick one bundle to avoid duplicate skills. |
| `chouzz/minecraft-mod-dev` | Claude Code plugin: fetches current NeoForge/Fabric docs, covers Data Components, data generation, convention tags, inter-mod integration (JEI/AE2/Create). Install: `/plugin marketplace add chouzz/minecraft-mod-dev`. | Useful for NeoForge conventions. License not stated on its page; versions not stated. |
| `mrquentin/minecraft-skills` | Forge/NeoForge/GregTech Modern/NeoGradle/Bedrock GameTest skills (title only; the site blocked reading). | Unverified; check manually. |
| `shrimpwagon/ai-minecraft-mobs-creator` | NeoForge 1.21.1 scaffold for custom mobs/blocks/items driven by Claude Code, with Blender models (title and description only). | Relevant to our animal models; unverified. |
| **Blender MCP** (`ahujasid/blender-mcp`, MIT) via the `game-builder` references | Agent drives Blender; Poly Haven CC0 integration. | For authoring animal and prop models; Minecraft needs block/entity-model export, which is not covered. |
| **`awesome-gamedev-agent-skills`** discipline skills (`procedural-gen`, `performance-optimization`, `survival-crafting`, `level-design`, `game-ai`, `game-feel`, `create-game-assets`) | Cross-engine design disciplines. | Take the principles; its engine routers do not know Minecraft. |
| **spark** profiler (Modrinth, NeoForge 1.21.1 listed) | CPU/tick/entity profiling for client and server. | Core of the performance gates. |
| **Frame capture, mod packaging, datagen, game tests** | A frame-time capture tool (for example Intel PresentMon), a pack manifest tool (for example packwiz), NeoForge data generation and GameTests. | **From my own knowledge, not verified in this session;** confirm current versions in the toolchain spike. |

Suggested agent roles for this build (adapted from the skill's roster to this project): `architect` (owns the repo tree and ARCHITECTURE.md), `worldgen-engineer` (District/Nation Planner, streaming), `architecture-builder` (Moroccan pack and ruin kit), `animal-ai-engineer`, `horde-engineer`, `performance-profiler` (owns Appendix H gates P1-P4), `qa-edge-hunter`, `handover-reviewer` (reads the repo as a newcomer).

# Appendix H: Quality standard (adapted from the game-builder skill)
Purpose: the pack must feel authored and polished, not generated. Principles taken from the skill, applied to a Minecraft modpack.

**Repo layout [Decision]:** `_project/` holds `GAME_VISION.md` (this file), `STYLE_BIBLE.md`, `DECISIONS.md`, `TOOLCHAIN.md` (pinned versions), `ARCHITECTURE.md`, `CREDITS.md`, and `evidence/` (screenshots, profiler captures). Mod code and datapacks live by category (worldgen, buildings, animals, horde, claims, economy), each folder self-contained, with `ARCHITECTURE.md` always matching the tree.

**Rules:**
1. **Vision before code.** No feature without a line in this file.
2. **One look.** `STYLE_BIBLE.md` fixes palette per district type, block vocabulary, signage and graffiti language, damage language (how a building collapses and why), lighting mood, and the animal look. Every building, prop and animal passes a **lineup test**: placed side by side in a test world, it must look like the same game.
3. **Variety is designed, not random.** Each building typology has a defined set of variants; damage, palette, loot and interiors vary by seed within style-bible rules. A district can be recognised by two players from a screenshot (success test in section 18).
4. **Simple code, small seams.** Prefer engine/mod built-ins, then a vetted pinned mod, then short custom code. Header comment (what, talks to, siblings) on every class; tunables in config, not magic numbers.
5. **Licenses and credits.** Every external asset, mod and reference gets a `CREDITS.md` row when it enters the repo. Photos are reference only, never copied into textures.
6. **Edge cases are first-class** (section 16), written before implementation.
7. **Evidence over claims.** "Done" means the gate passed and was seen running, with an artifact in `evidence/`. A successful compile is not a test.

**Gates (a build is not "done" until these pass):**
| Gate | Check | Evidence |
|---|---|---|
| **G1 Boot** | Pack and dedicated server start; fresh world joins | Log and timed join |
| **G2 Look** | Lineup world and a district fly-through screenshot set match the style bible | Screenshots |
| **G3 Rules** | Tests for planner determinism (same seed gives same chunk regardless of load order), zone budgets, horde routing, animal roles | Test output |
| **G4 Multiplayer** | Two clients and the server play the loop; animals and claims sync | Scenario run |
| **P1 Frame** | ROG Xbox Ally X, default 17 W profile: 1% low at least 40 FPS (the pass) and no dip below 40 FPS longer than 1 s in the dense-district route; average reported | Frame capture with the power profile noted |
| **P2 Stream** | Fresh-world flight on the Ally X: no hitch over ~50 ms during chunk streaming; main-thread chunk cost within the budget derived in the performance spike (provisionally ~2 ms) | Profiler capture |
| **P3 Horde** | Full horde as singleplayer on the Ally X (integrated server): 20 TPS and the 40 FPS floor hold; separately, the 4-player dedicated-server run on the server host | Profiler capture |
| **P4 Memory** | No GC stalls and no memory exhaustion in the 24 GB shared pool over a long session on the Ally X | Heap graph |
| **A Audio provenance** | Every audio file matches a CREDITS.md row with source and licence; none AI-generated or synthesized (Appendix K) | Ledger check |
| **G3b Loot and vehicles** | Zero loose item entities after generation; loot only in blocks/containers; ~20% of vehicles functional over a large sample; vehicle count within budget | Test output |
| **G5 Edge cases** | Section 16 list exercised | Notes and clips |
Every content addition (a building, an animal, a district type) runs G2 and P1-P2 before merge.

**Where the skill does not fit and what replaces it:** its Godot scripts, autoload cap and GDScript size limits do not apply to Java/NeoForge; the equivalent limits (small classes, one responsibility per class, documented folders) are enforced by review and by the `handover-reviewer` agent instead.

# Appendix I: Loot pools per building (Mechanic J)
Rule: each building type draws **only** from its own pool. Loot sits in **breakable loot blocks (B)** or **hidden in chests/storage (C)**, never loose on the ground. Quality scales with district wealth (poor < middle < rich). Amounts: **Not sure / undecided**. These are design pools to be turned into loot tables; they are not measured.

| Building | Where loot sits | Pool (what belongs here) |
|---|---|---|
| Popular self-built house / apartment | C: wardrobes, kitchen cupboards, drawers; B: broken appliances, crates in stairwells | Canned and dry food, bottled water, clothes, blankets, basic medicine (painkillers, bandages), candles/batteries, small tools, cooking gas bottles |
| Middle-class apartment | C: wardrobes, desks, medicine cabinets; B: appliances | As above plus better clothes, electronics, first-aid kits, books, small tools |
| Villa / luxury apartment | C: safes, wardrobes, home bars, garage cabinets, study desks; B: art/decor pieces | Valuables (cash, jewellery), premium food and drink, quality clothes and medicine, tools, **car keys/parts if the villa has a garage** |
| Medina dar / riad | C: carved chests, kitchen jars, storerooms; B: pottery, stacked crates | Staple food, spices, cloth, lamps/candles, hand tools, copperware, rare valuables in the best houses |
| Hanout (corner shop) | B: shelf units, fridges, register; C: back-room boxes | Packaged food, drinks, cleaning goods, cigarettes/lighters, batteries, phone credit cards (as items) |
| Supermarket / mall units | B: shelves, registers, vending machines; C: stockrooms, lockers | Per unit: food, clothing, electronics, toys, tools; mall security room holds batons/radios |
| Bakery / communal oven | B: flour sacks, ovens; C: counters | Flour, bread, fuel wood, kitchen tools |
| Restaurant / cafe / fast food | B: fridges, fryers, registers; C: kitchens, walk-in stores | Cooking supplies, packaged and canned food, drinks, kitchen knives and tools |
| Pharmacy / clinic / hospital | C: medicine cabinets, locked drug stores; B: vending machines, carts | Medicines, bandages, antiseptic, splints, tourniquets (ties into the injury mod), surgical tools; hospitals hold the best |
| School / university | C: classroom cupboards, staff rooms, labs; B: desks | Stationery, books, basic first aid, lab chemicals (hazard), sports gear, canteen food |
| Police station | C: lockers, evidence room, armoury (locked); B: desks | Batons, radios, body armour, rare ammunition, **hummer-class or patrol vehicle keys/parts** |
| Mosque / religious sites | **No loot by default [Decision; cultural care, see section 10]** | None, or only incidental charity stores if the author approves |
| Bank / office / ministry | C: safes, desks, filing rooms; B: ATMs | Cash, documents, office electronics, stationery; vault is rare and defended |
| Warehouse / wholesale | B: pallets, crates; C: office lockers | Bulk goods by type of warehouse (food, tools, building materials, clothing); no mixed random stock |
| Workshop / garage / car park kiosk | C: toolboxes, parts shelves; B: tyre stacks, engine blocks, oil drums | **Vehicle parts (tyres, batteries, engines), tools, oil, jerrycans of fuel** |
| Fuel station | B: pump/tank blocks, shop shelves; C: back room | **Fuel** (pumps and tanks), oil, snacks and drinks, jerrycans |
| Car dealership | C: office safe, parts store; B: showroom stock crates | Keys, parts, a few vehicles on the floor (tier by dealership type, Appendix J) |
| Factory / industrial yard | B: material piles, machine parts; C: foreman office | Materials, tools, chemicals, machine parts |
| Hotel | C: rooms' wardrobes and safes, kitchen, reception safe; B: minibars, linen carts | Clothes, toiletries, minibar drinks, valuables in suites |
| Cemetery / park / garden | B: tool sheds' crates; C: caretaker hut | Hand tools, seeds, little else |

**Loose-item rule, restated and testable:** after any chunk finishes generating, the number of item entities created by generation must be **zero**. This is a G3 test (Appendix H).

# Appendix J: Vehicle catalogue and rarity (Mechanic I)
Categories are the author's list; vehicle models depend on what the vehicle spike (Appendix E, spike 8) confirms. Rarity and power are design tiers.

| Tier | Vehicles | Rarity | Where they appear | Condition notes |
|---|---|---|---|---|
| **T0** | Bicycles | Common | Everywhere: streets, courtyards, shops, schools | No fuel; flat tyre or broken chain faults |
| **T1** | Scooters, dirt bikes, small motorbikes | Common to uncommon | Streets, garages, bike shops, popular districts | Low fuel, battery/tyre faults |
| **T2** | Small and family cars, vans, pickups, ATVs/go-karts | Uncommon | Streets, car parks, garages, mass-market dealerships, traffic jams | Mixed faults |
| **T3** | Trucks, buses, delivery vehicles | Rare | Truck depots, industrial zones, boulevards, highways | Large tanks, heavy, loud |
| **T4** | Sports cars, luxury cars and SUVs | Very rare | **Luxury dealerships and rich neighbourhoods/garages** | Fast, fragile, high fuel use |
| **T5** | Hummer-style military/police 4x4s | Very rare | Police and military compounds, rarely rich compounds | Strongest, heaviest fuel use, noisiest |

**Zone rules [Decision]:** poor and popular districts mostly T0-T2, with rusted, stripped and mostly broken stock; medina streets are too narrow for cars (only T0-T1); rich districts add T3-T4 behind gates; dealerships hold a showroom set of their tier; highways carry abandoned T2-T3 in jams.

**Condition roll (target mix across all spawns):** about **20% fully functional**, the rest split between repairable faults (empty tank, flat tyres, dead battery, damaged engine, missing part) and scrap that only yields parts. Fuel on spawn is random (design range 0-60%, mostly low). Exact weights per tier: **Not sure / undecided**, tuned by playtest and by the performance budget.

# Appendix K: Audio policy (author rule: existing mods or open libraries only, never AI-generated)
**Rule.** Every sound and music track in the pack comes from (a) **existing mods** whose licence allows it in a modpack, or (b) **open game-sound libraries and resources** with a licence that permits use in a distributed game. **No AI-generated audio. No algorithmically synthesized audio** (this overrides the `game-builder` skill's mention of jsfxr-style generators). Own recordings are **not** a listed source: not used unless the author approves. Basic editing (trim, pitch, EQ, layering of sourced sounds) is allowed and logged. Record the source, URL, licence and attribution in `CREDITS.md` the moment a file enters the repo.

**Sources, with licence notes as listed by a third-party guide I checked; confirm each on the source site before use:**
| Source | Licence as reported | Use |
|---|---|---|
| **Existing mods:** Attract to Sound, the vehicle packs, TaCZ and its guns, the dog and wolf mods, injury mods | Per mod; check each for modpack redistribution | Use their bundled sounds and resource packs first; saves work and keeps consistency |
| Kenney audio | CC0 | Safe, no attribution |
| Freesound | Per file: CC0, CC-BY, or CC-BY-NC | **CC0 and CC-BY only**; never CC-BY-NC; keep CC-BY credits |
| OpenGameArt | Per item: CC0, CC-BY, OGA-BY, GPL | Prefer CC0/CC-BY; avoid GPL audio |
| Sonniss GDC bundles | Royalty-free | The guide says finished-game use is allowed but **standalone redistribution of the files is not**; a modpack ships the sound inside a pack, so **check whether our packaging counts as redistribution** before using |
| itch.io sound packs | Per pack, often CC0 | Read each pack's terms |
| **Not allowed:** BBC Sound Effects (non-commercial), Jamendo free downloads, Uppbeat free plan, anything of unknown licence | | Excluded |

**Categories to source (audio spike, Appendix E spike 10):** zombie vocals and footsteps, doors/rubble/glass, building collapse, vehicles (engines, starts that fail, horns, crashes), fuel pumps and jerrycans, bikes and bicycles (chain, tyres), dog and wolf sounds (bark, growl, whine, howl), ambient city/dust/wind, UI, music beds. Gaps are filled by searching the libraries above, not by generating audio.

**Gate:** a new `A` gate (audio provenance) is added to Appendix H: no sound merges without a `CREDITS.md` row showing source, licence and (if needed) attribution; the check is a script or review that compares the pack's audio files to the credits ledger.
