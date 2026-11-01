# Building card - <<FILL typology>>
A building is not built until its card is filled. The card is what the art director reviews against.

District(s):         <<FILL>>
Function:            <<FILL what it is; drives its loot pool and what restoring it unlocks>>
Footprint / height:  <<FILL e.g. 1 lot (16x16), 2-4 storeys, storey height N blocks>>
Facade grammar:      <<FILL rhythm of windows/doors, trims, balconies, ground-floor shopfront>>
Roof:                <<FILL form, parapet, terrace use>>
Materials / palette slots: <<FILL slot -> palette key, all blocks inside block_vocab.json>>
Interior plan:       <<FILL rooms, stairs, courtyard; every room reachable>>
Containers:          <<FILL where loot blocks (B) and chests/storage (C) sit; each uses a loot table, never hard-coded items>>
Loot pool:           <<FILL loot table id(s), tier by wealth>>
Variants (target):   <<FILL count>> = parts x palettes x damage x interior seeds
Ruin states allowed: <<FILL intact shell / partial / heavy, and what each looks like for THIS building>>
Damage story:        <<FILL e.g. looted pharmacy: shelves toppled, shutters forced, medicine crates empty>>
Signage / props:     <<FILL fictional names, clutter set>>
Mob anchors:         <<FILL nests or spawn points and counts (delete if none)>>
Reference notes:     <<FILL source, what it was used for>>
Cultural care:       <<FILL any respect rules>>

Checks (tick when done):  check_structures.py clean [ ]  check_palette.py clean [ ]  lineup screenshot saved [ ]  perf cost recorded [ ]  CREDITS row [ ]  ARCHITECTURE row [ ]
