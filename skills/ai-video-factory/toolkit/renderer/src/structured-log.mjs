// Structured logging for the renderer CLI (P9-REQ-2.4/2.5, design.md §2.2). One JSON object
// per line, written to stderr ONLY -- render-cli.mjs's stdout carries the single load-bearing
// success/failure JSON line `engine/app/render/remotion_client.py::_run_render_cli` parses via
// `stdout.splitlines()[-1]`; every diagnostic/progress line MUST stay off stdout entirely so it
// needs zero coordination with that parser. Zero new npm dependency (P9-REQ-2.5) -- a small
// local helper around `process.stderr.write`, mirroring the engine's own JSON-line log shape
// (`engine/app/logging_config.py`'s `timestamp`/`level`/`logger`/`message` fields) without
// depending on anything from that Python module.

export function logEvent(level, message, extra = {}) {
  process.stderr.write(JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    logger: "render-cli",
    message,
    ...extra,
  }) + "\n");
}
