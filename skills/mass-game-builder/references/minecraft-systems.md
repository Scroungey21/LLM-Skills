# Systems playbook: survival-horde Minecraft modpack

**Genre-specific (survival-horde packs only); other pack types skip this file.** Read this for a modpack with scavenging, zombies or hordes, territory, animals, vehicles or loot. It is the Minecraft counterpart of the genre playbook in `genres.md` plus the implementation patterns that keep a heavy pack inside its performance budget.
**Where the user's vision spec defines a rule, the vision wins.** The patterns below are defaults and ways to build the rule cheaply, not design decisions.

## Contents
1. Genre playbook
2. Noise and sound-driven AI
3. Zombie density and entity budgets
4. The horde director
5. Territory, claims, factions
6. Rebuilding by hand and the Repair Score
7. Economy
8. Animals: threats and working companions
9. Vehicles and fuel
10. Loot: only in blocks and containers
11. Injuries and weapons
12. Audio and provenance
13. HUD and legibility
14. Edge-case list (M-G5)

## 1. Genre playbook
- **Loop:** scout a district, scavenge by building function, rebuild by hand, restore what the district provides, claim, defend the recurring horde, expand.
- **Feel:** vulnerable in tight dark places, clever when reading a district, proud when a ruin becomes a working neighbourhood, tense as the horde approaches along streets the player can see. Ordinary days are slow-burn; danger grows by where you go.
- **Controls and camera:** vanilla first and third person plus a few mod keybinds (map, medical panel, blueprint toggle, claim menu, dog commands); final bindings are cheap decisions, logged.
- **Structure:** custom mods by category (`worldgen`, `buildings`, `horde`, `claims`, `animals`, `vehicles`, `loot`, `repair`), data in the datapack, art per `minecraft-art-direction.md`.
- **Network default:** dedicated server plus singleplayer from the same pack; co-op first.
- **Scope cap:** the largest scope in the skill. Slice = **one district type end to end**, then one more type at a time, each passing its gates; the first release stops at the vision's MUST list. Ask before accepting more.
- **Fun test:** in ten minutes the player has entered a building by reading it from outside, found fitting loot, avoided or fought one zombie, and understood what the district is for.
- **Out of scope by default** (unless the vision lists it): collectible or fantasy creatures, automatic building restoration, real-map reproduction, desecration mechanics.

## 2. Noise and sound-driven AI
- Noise is a **resource the player spends**: footsteps, doors, breaking blocks, gunshots, engines, barking, fighting all emit a noise event with a radius and decay.
- Use one existing mod for the AI layer (sound attraction, mining and climbing) rather than writing it; custom code only for glue (barking and engine noise feed the same system through an adapter). One AI overhaul mod, not two.
- **Event-driven:** zombies re-evaluate on noise events and on slow staggered checks, never every tick. Group behaviour and investigation caps keep it cheap.
- Test: a gunshot attracts N within radius R and not beyond; 200 noise events per second do not drop TPS.

## 3. Zombie density and entity budgets
- Density follows the district's pre-collapse **population density** (high in dense housing and old cores, moderate in business quarters by use, low but trapped or armed with hazards in villa belts and industrial zones). Dark interiors and cellars hold nests. The numbers live in the district card.
- **Entity budget per area** (zombies, animals, vehicles, item entities: 0 from generation). Derive the numbers on the pack's reference device (see `PERF_BUDGET.md`), not on a developer PC, so they are conservative by construction. Spawn lazily as chunks stream in; far or idle entities use cheap behaviour or become data.
- Vanilla spawn rules are tuned or overridden so they do not fight the design (phantoms, creepers, day/night spawns); lock the difficulty so hostile mobs exist.

## 4. The horde director
- Every Nth in-game day (the vision sets N and whether it counts in-game or real time) a horde forms in the densest districts and moves along the **street graph** toward claimed hearths, funnelling through boulevards and gates.
- **Abstract first, entities near players only.** The horde is a few counters (position on the graph, size, speed) advanced cheaply on the server. Within a radius of a player the director materialises a bounded number of real zombies in waves; outside it, they return to counters. Never thousands of loaded entities.
- Size scales with claim size and players online; sleeping through is blocked; thin sprawling claims are punished; special monsters appear rarely and within budget.
- Persist the horde state (`Saved`, versioned) so a restart mid-horde resumes.
- Tests: routing follows the street graph and reaches the hearth; the entity cap holds at the largest horde; TPS stays at 20 with the full horde and the planned player count (M-P3).

## 5. Territory, claims, factions
- Use one claims mod through an adapter; the **Hearth** block is custom glue (claim hook, respawn, horde target, upkeep).
- Claim size scales horde size; restored districts inside a claim give benefits; failed defence damages (de-restores) rather than deletes.
- Raids, offline protection, claim caps and grief limits are vision decisions; defaults to propose: raids only on defined nights, claims shrink instead of vanishing.
- Test: every claim action validated on the server; a player cannot claim through a payload they should not be able to send.

## 6. Rebuilding by hand and the Repair Score
- **Nothing is rebuilt for the player.** Players repair blocks by hand. The mod offers only: an optional **blueprint ghost** of the intact shape, a **Repair Score** (sound, sealed, lit, plus function needs), and **function unlocks** at thresholds (a repaired bakery runs, a repaired clinic heals, a repaired stall trades).
- Full freedom: the player may tear down and build something else on a claimed lot; the building then simply stops qualifying for its original function.
- Cost: score on request or for loaded claimed chunks, incremental, bounded (see `minecraft-worldgen.md` section 9). Ghost rendering is measured before it ships.

## 7. Economy
- One server currency; player shops and trader NPCs. **Traders exist only in restored markets**; prices follow district wealth; selling scavenged goods funds reclamation.
- Daily sell caps and claim upkeep prevent runaway wealth. Everything is server-authoritative.
- Use one economy mod through an adapter; custom glue ties the "restored" state (from the Repair Score) to trader existence.

## 8. Animals: threats and working companions
- **Realistic animals only** (dogs, wolves and a small set of others). No collectible, evolving or fantasy creatures, no capture devices.
- **Threat:** wild wolf packs with a leader on the outskirts; feral dog packs scavenging ruined districts at night; both react to noise and blood.
- **Companion:** adopt a dog (or tame a wolf) and give it a job. **Stay:** guard the base and defend it. **Follow:** come on runs, warn of zombies by barking or growling, sniff out nearby loot caches, fight alongside. Later jobs: alarm at the gate, carry light loads. They eat, rest, can be hurt and saved, and can be lost.
- **Trade-off, not a free defence:** barking and fighting make noise that attracts zombies. Cap companions per player. Pack AI stays inside the entity budget.
- Build order: take what the dog and wolf mods give (taming, commands, packs) and build only the missing roles (guard territory, scavenge with loot sniffing, feral packs, noise coupling) as `animals` code. Check first which roles the mods already provide.
- Companion safety: keep pets from being lost across dimensions and chunk unloads (an existing mod or a small adapter).
- Tests: Stay defends within a radius and stops; Follow keeps up and teleports sensibly; noise events fire; caps hold; a companion survives a chunk unload and a server restart.

## 9. Vehicles and fuel
- Vehicles are **found objects**: they spawn randomly as the area streams in (streets, garages, car parks, jams on boulevards and highways); **rarer, stronger ones cluster in dealerships and rich districts** (tier table below as a default; the vision's table wins).
- Categories (author's list): bicycles, scooters, dirt bikes and motorcycles, small and family cars, vans, pickups, trucks and buses, SUVs, sports cars, hummer-style military 4x4s, ATVs or go-karts if wanted.
- **Condition roll:** a pure function of (seed, position, tier) so it is testable. Default mix: about **1 in 5 fully functional**; the rest have one or more faults (empty or leaking tank, flat tyres, dead battery, damaged engine, missing part) or are scrap that yields parts. Starting fuel is random (default range 0 to 60%, skewed low, functional ones skew higher).
- **Fuel and parts are loot only in blocks and containers** (pumps and tanks, garages, depots, jerrycans in storage, siphoning wrecks), never lying on the ground.
- Engines are loud (feed the noise system). Bikes and bicycles need no fuel. Vehicles can be locked or garaged inside claims; cap per area; recovery command for stuck vehicles; cleanup rules for abandoned ones.
- **Budget:** parked vehicles are data when idle or unloaded and spawn lazily near players; no vehicle ticks work when nobody is near.
- Most vehicle frameworks add no random spawning, no fuel loot and no condition rolls: that is the custom `Wreck Spawner` plus fuel/condition glue. Check the framework's licence for modpack use (some are All Rights Reserved).
- Default tiers: T0 bicycles (common, everywhere); T1 scooters, dirt bikes, small motorbikes; T2 small and family cars, vans, pickups, ATVs; T3 trucks, buses, delivery vehicles (depots, industrial zones, highways); T4 sports and luxury cars (luxury dealerships, rich garages); T5 hummer-style military or police 4x4s (compounds). Narrow old-core lanes admit only T0 and T1.
- Tests (M-G3): over 100,000 sampled spawns the functional share is within tolerance of 20%; tier by zone matches the table; no vehicle spawns inside buildings or blocks; the cap holds.

## 10. Loot: only in blocks and containers
- Every building type has **its own loot pool that fits what it is** (pharmacy medicine, garage tools and parts, villa valuables, school stationery and first aid, mall goods per unit), tiered by district wealth. Pools are data-pack loot tables per building function; the same pool never appears in the wrong building.
- **Two legal forms only:** (1) **breakable loot blocks** (crates, cabinets, appliances, vending machines, registers, rubble and debris piles, wreck parts) that yield their contents when broken; (2) **chests and storage** (chests, barrels, lockers, wardrobes, safes, shelves). **Never loose items on the ground**, and generation never creates an item entity.
- Containers in structures carry a `LootTable` reference (optionally a seed), never hard-coded items: `check_structures.py` fails hard-coded items and baked item entities.
- Custom loot blocks need block entities or loot-table-driven drops: keep them few, plain and cheap, and measured.
- Refill only through restored trade or rare scripted events. Religious and heritage buildings hold no loot by default.
- Tests (M-G3): after generating a large area, item entities created by generation equal 0; every container is reachable; each pool matches its building; zombie drops are not part of loot pools unless the vision says so.

## 11. Injuries and weapons
- One injury system (limbs, bleeding, fractures, tourniquets) through its config and an adapter; pharmacies, clinics and hospitals feed it through their loot pools.
- Firearms are scarce and loud by design (noise is the cost). If a gun mod is used, check its licence, version and any port status; guns arrive through building loot pools like everything else.

## 12. Audio and provenance
- All audio comes from existing mods or open libraries with a licence that allows modpack distribution; **never AI-generated, never synthesized** (default policy; the vision may change it). Basic editing is allowed and logged.
- Categories to source: zombie vocals and footsteps, doors, rubble and glass, collapses, vehicles (engines, failed starts, horns, crashes), fuel pumps and jerrycans, bikes, dog and wolf sounds, ambience, UI, music beds. Build the source list in spike S6 before authoring.
- Gate M-A: `check_modpack.py` compares audio files to the CREDITS ledger.

## 13. HUD and legibility
District name on entry (the zoning must be legible), a small day and horde indicator, medical panel, map with claims, compass to landmarks. All styled by the style bible. First safe street teaches scavenge, rebuild, claim.

## 14. Edge-case list (M-G5)
Enter a labyrinthine old core unprepared (map, landmark gates, compass); away from the claim when the horde starts (warnings, respawn at the hearth); raiding or griefing (windows, shrink-not-delete); gaming the Repair Score; exploiting trader prices; stuck in ruins (generator keeps stairs and paths clear, unstuck command); disconnect during a horde or while carrying loot or driving; vehicle stuck in rubble, driven into void or water, abandoned in unloaded chunks, stolen from a claim, used to ram claims; a loot container generated inside a wall or unreachable; an item entity spawned loose by a generation step; a sound of unknown source entering the pack; companion lost, killed or left in an unloaded chunk; noise storms (many events at once); entity cap reached mid-horde; players on different sides of a claim during a raid; world updated mid-season. Tick or log each.
