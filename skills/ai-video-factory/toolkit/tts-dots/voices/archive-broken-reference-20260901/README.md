This directory archives the previously-promoted `warm-informational` reference
pair, which was discovered on 2026-09-01 to be corrupted: ASR (faster-whisper
small.en and medium.en) transcribes it as unintelligible garbage that does not
match `warm-informational.txt`, and using it as a dots.tts voice-cloning prompt
causes the model to degenerate and echo garbled reference-adjacent content
instead of the requested target text (reproduced with a trivial two-word probe
"Hello there." -> 8.48s of bled reference content, 0 words of the actual
target). See references/current-handoff.md for the full diagnosis.

Do not restore this file as the active reference without first verifying with
an ASR round-trip that it transcribes back to its own transcript.
