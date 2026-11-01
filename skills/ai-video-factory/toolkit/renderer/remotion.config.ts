import { Config } from "@remotion/cli/config";

// Minimal defaults for Phase 1 scaffolding. Phase 5 revisits these once real
// components (and their render-time needs) exist.
Config.setVideoImageFormat("jpeg");
Config.setCodec("h264");
Config.setOverwriteOutput(true);

// KNOWN ISSUE (this dev host, observed during Phase 1 verification): the bundled
// @remotion/compositor-*/ffmpeg.exe crashes (0xC0000005 / ERROR_ACCESS_DENIED) on this
// machine even for a trivial invocation unrelated to any composition content — looks like
// AV/sandbox interference with the large unsigned static binary, not a project bug. Chrome
// frame capture and bundling work correctly; only the final ffmpeg mux step is affected.
// Remotion v4 removed the ability to override the ffmpeg executable (no Config API for it),
// so there is no in-repo workaround — re-test in the actual docker-compose/Linux render
// environment (Phase 6) before assuming this is fixed or still present.
