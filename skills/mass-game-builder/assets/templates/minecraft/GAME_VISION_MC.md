# Game Vision (one-pager) - {{NAME}}
(Every <<FILL>> must be replaced before building. The long reference is `VISION_SPEC.md`; this page is what every build step reads.)

Pitch:            <<FILL one sentence>>
Fun source:       <<FILL the ONE thing that makes it fun; protect it>>
Platform:         Minecraft Java, {{LOADER}}, version {{MC}} (decided by the version spike, then frozen)
Archetype:        {{ARCHETYPE}}  (see references/minecraft-quality-standards.md section 6)
Players:          <<FILL e.g. singleplayer, co-op, dedicated server with N players>>
Core loop:        <<FILL the repeating cycle in 4 to 6 verbs>>
Goal / fail:      <<FILL>>
World:            <<FILL vanilla / modified vanilla / custom generation (and how: layers, deterministic, streamed)>>
Art direction:    see STYLE_BIBLE.md (palette.json, block_vocab.json). Mood words: <<FILL 3>>
Audio source rule:<<FILL default: existing mods or open libraries only; no AI-generated or synthesized audio>>
Reference device: <<FILL the ONE device the pass is measured on, plus profile P1/P2/P3 from the quality standards>>
Perf standard:    <<FILL the pass line, e.g. 1% low >= N FPS with no dip below N longer than 1 s; server MSPT; see PERF_BUDGET.md>>
Quality bar:      QUALITY_BAR.md rows Q1 to Q10 plus archetype rows are all pass before release
MUST have:        <<FILL>>
WON'T build:      <<FILL>>

30-second test: a new player can state the goal without reading text.   [ ]
60-second test: first moment of fun happens within one minute.          [ ]
Place test:     (packs with distinct areas) two players in different places can name the area from a screenshot.   [ ]
Variety test:   (generated worlds) three seeds give clearly different worlds with the same rules.             [ ]
