# Release Catalog (kept desktop app: `release-catalog/`)

A **WPF / .NET 10 desktop app that scans operator-configured release-calendar roots and shows each scheduled package side by side** (title, alternates, description, tags, sources, thumbnail, video variants with
preview, caption transcript, drift status, "uploaded" checkbox) plus a tray reminder for videos not yet marked uploaded. It is a **viewer/reminder tool, not an uploader**; it is cross-channel: adding a channel means
adding its `release-calendar/` root in the app, no code change. The calendar folders it reads are defined in `release-calendar.md`.

Contents: 1 Layout · 2 Build and run · 3 Config and state · 4 How it reads a calendar · 5 UI and behaviour · 6 The companion upload extension · 7 Known issues and open questions

## 1. Layout of `release-catalog/`

| Path | What |
|---|---|
| `README.md` | 20 lines: purpose; says HES uploading is automated elsewhere and the app's reminders are unrelated to that. The only prose doc (there is no `docs/` folder). |
| `ReleaseCatalog/` | The app. `ReleaseCatalog.csproj` (`net10.0-windows`, WinExe, `UseWPF` + `UseWindowsForms` for the tray `NotifyIcon`, with the implicit WinForms/System.Drawing usings removed to avoid WPF type collisions; NuGet `Microsoft.Web.WebView2` 1.0.4191.47). `App.xaml(.cs)`, `MainWindow.xaml(.cs)` (hosts Launcher and Browser views), `AssemblyInfo.cs`. |
| `ReleaseCatalog/Services/` | `CalendarScanner.cs` (folder walk, manifest/heuristic parsing), `ConfigStore.cs` (all persisted state), `HashService.cs` (sha256 with cache), `NotificationService.cs` (tray reminders), `SrtParser.cs` (caption cues). |
| `ReleaseCatalog/Models/` | `AppState`, `CalendarProfile`, `CatalogEntry` (limits: tags 500 chars, warn at 300; title 100), `VideoVariant` (+ `DriftStatus`), `TranscriptCue`. |
| `ReleaseCatalog/Views/`, `Controls/` | `LauncherView` (channel cards), `AddCalendarWindow`, `CalendarBrowserView`, `MonthCalendarControl`, `EntryCardControl`, `VideoPreviewWindow` (WebView2-hosted HTML5 `<video>` player: WPF `MediaElement` could not decode H.264/AAC without codecs; WebView2's Chromium does). `Converters/`, `Themes/Theme.xaml`, `Assets/app.ico` (+ `make_icon.py`). |
| `ScanTest/` | Console project that runs `CalendarScanner` over a root (default: the HES calendar) and prints every entry; use it to verify a new channel's manifests parse. |
| `extension/` | A separate Firefox extension + localhost helper that **uploads** the catalog's ready days (section 6). Own `README.md` (the detailed doc), `package.json`. |
| `synth-test/` | Synthetic calendars for scanner tests (`2026-09`, `2026-09-10`, `no-date-folder`); gitignored. |
| `screenshot.png`, `window-capture.png`, `zoom*.png` | UI captures. |

## 2. Build and run

```powershell
cd release-catalog\ReleaseCatalog
dotnet build -c Release            # .NET SDK 10.x (10.0.400 installed); output: bin\Release\net10.0-windows\ReleaseCatalog.exe
dotnet run -c Release              # or launch the exe
dotnet run --project ..\ScanTest -- <calendar root>     # headless scan check
```

Requires Windows, the .NET 10 SDK/runtime and the WebView2 evergreen runtime (preinstalled on Windows 11). Do not build into the tracked output carelessly: see section 7 (470 files under `bin/`/`obj/`,
including WebView2 profile data, are tracked, which makes every run dirty the git status).

## 3. Config and state (outside the repo, survives moving it)

Everything lives under **`%APPDATA%\ReleaseCatalog\`** (the app never writes into a scanned folder except description edits, section 5):
`config.json` (`AppState`: `Calendars[]` of `CalendarProfile {Id, ChannelName, RootPath, AvatarFile, CreatedUtc, LastScanUtc, LastScanEntryCount}`, `LastOpenedCalendarId`; written via temp file + copy),
`avatars/` (channel avatar copied in so it survives the original moving), `hash-cache.json` (`path|size|mtimeTicks -> sha256`, so unchanged files are never rehashed), `uploaded-state.json`
(`"calendarId|entryPath" -> bool`; legacy per-variant keys are migrated to bundle-wide), `seen-entries.json` (so the reminder only calls videos "new" once). A corrupt file resets silently to defaults.
The companion extension keeps its own data in `%APPDATA%\ReleaseCatalogUploader\`.

## 4. How it reads each channel's calendar (`CalendarScanner`)

1. Walk the root depth-first; skip dot-folders, `_qa-frames`, `node_modules`, `.git`.
2. A directory is an **entry** if it holds `upload-manifest.json` (or `manifest.json` / `release-manifest.json`) -> manifest mode (authoritative; schema tolerant), else if it directly contains a video file
   (`.mp4 .mov .mkv .webm .avi .m4v`) -> heuristic mode (`titles.txt|title.txt`, `description.txt|.md`, `tags.md|.txt|.json`, `sources.md|.txt`, `thumbnail|thumb|cover.*`, sibling `.srt`). **A claimed entry's subtree is not
   descended.** A manifest directory with no recognisable video returns nothing and does **not** fall back to heuristic mode.
3. Manifest keys used: `slug`, `chosen_title`, `status`, `voice_id`, `alt_titles_file`, `description_file`, `tags_file`, `sources`, `thumbnail`, `source_of_truth`, `sha256{}`; **every string key whose underscore-token list
   contains `video` becomes a variant** (label from the other tokens: `long_video` -> Long, `short_video_brainrot` -> Short Brainrot); caption keys pair with variants by token; any string-array property whose name contains
   `recommended` shows as "Recommended upload times (...)".
4. **Date** comes from path segments in this order: `YYYY-MM-DD` (also `_`), `MM-DD-YYYY`, or a `YYYY-MM` folder followed by a day folder with a leading 1-2 digit day (`<DD>` or `<DD> (x)`); otherwise it falls back
   to file/folder modified time and the entry is flagged "date inferred". The raw day-folder label (e.g. `04 (x)`) is kept for display.
5. **Drift check:** on demand ("Verify all", or when a variant is selected) it hashes the variant's file and compares with the manifest's recorded sha256: `verified`, `changed since scheduling` (re-run the channel's
   `schedule_release.py`), `file missing` (common on a fresh clone because media is gitignored), `unverified` (no recorded hash, always so in heuristic mode).

How each channel shows up: HES and technews and Etcherr871 manifests carry `*_video` keys, so they parse. **Material Trials manifests have no `*_video` key** (they use a `files{}` map plus `title.txt`), so the manifest path
yields zero variants and the scanner returns nothing for them: MT days are invisible in the app (not verified by running it; derived from the scanner code and an MT manifest). Fix options: add `"short_video": "video.short.mp4"`
(plus `thumbnail`, `description_file`) to MT's manifest writer, or remove MT's manifest so heuristic mode applies.

## 5. UI and behaviour

- **Launcher:** one card per configured calendar (channel name, avatar, last scan count); "Add calendar" asks for a root folder, display name and avatar.
- **Calendar browser:** month grid plus an agenda of entries per day; each entry card has the title and alternates, description (editable), tags (comma-joined line with a live character counter against 500), sources,
  thumbnail, variant tabs, "copy block" (title + description + tags, ready to paste into Studio), open file / reveal in Explorer, an **uploaded checkbox** (bundle-wide, local only) and the drift dot. Preview opens a
  player (seek slider) with the parsed SRT transcript cues. The browser scans when opened and on the Rescan button; Prev/Next-day-with-content, Today and Tomorrow jump buttons navigate the month grid.
- **Description editing writes files:** Save writes the calendar copy and, when `source_of_truth` resolves to `output/<slug>/description.txt`, mirrors the text there so a later `schedule_release.py --force` does not clobber it.
  This contradicts the `ConfigStore` comment "nothing ever writes into a scanned calendar folder".
- **Tray reminders:** while running, a balloon at **02:00, 11:00 and 17:00 local time** about scanned videos not marked uploaded; slots already past at launch are skipped (no backlog blast); older not-yet-uploaded items still get nagged
  without the "new" label. These times are independent of any channel's release slots.

## 6. The companion upload extension (`release-catalog/extension/`)

Firefox MV2 extension (`ext/`) + Node 22 helper on `127.0.0.1:47831` (`helper/`, `start.bat`) that schedules uploads of the catalog's ready (`(x)`) days into YouTube Studio inside the user's own signed-in Firefox container; the same helper exposes
an MCP endpoint with 16 tools (`plan_run`, `start_run`, `confirm_item`, `mark_item`, ...). Full setup, safety gates (pause before the final click by default), per-channel settings (platforms, slots in 15-minute steps, timezone default `UTC`),
data location and security notes are in `extension/README.md`; the upload rules and the "never upload without explicit authorisation" rule are in `release-calendar.md` section 8. It treats `upload-log.json` as the only truth for
"uploaded"; it does not read or write the app's own files and never writes into channel folders. `npm run check` runs the scanner/metadata/caption/time checks against the real catalog read-only; `npm run lint` is `web-ext lint`; signing
needs AMO credentials (do not store them in the repo).

## 7. Known issues and open questions

- Material Trials entries not shown (section 4).
- `bin/` and `obj/` are tracked (470 files, including `ReleaseCatalog.exe.WebView2/EBWebView/...` profile databases and logs), so launching or building the app modifies tracked files. Consider removing them from the index and ignoring
  them; that is a repo-hygiene decision for the owner, not done here.
- `extension/ext/releastExtension.zip` is a stray packaged build (misspelled name) kept in the tree.
- README says HES uploads are automated by `hidden-everyday-systems/uploader/` and a "managed skill `hidden-everyday-systems-youtube-upload`" that is not in the repo; the extension README describes a newer path. See `release-calendar.md` section 8 for which uploader to trust.
- The README's "3 daily slots" statement does not match the reminder times above or the channels' slots; the reminder times are fixed in `NotificationService.ReminderTimes`.
- Nothing here was executed during documentation (no build or run), so build success under the current SDK is untested.
