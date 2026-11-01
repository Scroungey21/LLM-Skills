#!/usr/bin/env python3
"""Check a project against the game-builder standard (gate G0). Exit 1 if any ERROR.

usage: check_project.py [project-root] [--engine godot|unity|unreal] [--release] [--strict]
  --release  release-tier checks: ART_DIRECTION.md may not be the blank template, RELEASE_CHECKLIST.md must exist
  --strict   WARN lines also fail the run
Engine is auto-detected: project.godot = Godot; ProjectSettings/ProjectVersion.txt or Packages/manifest.json = Unity; *.uproject = Unreal.
ERROR = breaks a hard rule.  WARN = look at it, justify it with a comment, or fix it.
Secrets: the scan reports file paths only and never prints a value.
"""
import argparse, pathlib, re, sys

MAX_FILE, MAX_FUNC, AUTOLOADS_WARN, AUTOLOADS_MAX = 300, 20, 3, 8
DOCS = ["GAME_VISION.md", "ART_DIRECTION.md", "DECISIONS.md", "CREDITS.md", "TOOLCHAIN.md", "HANDOFF.md"]
ASSET_EXT = {".glb", ".gltf", ".fbx", ".ogg", ".wav", ".mp3", ".flac", ".png", ".jpg", ".jpeg", ".svg", ".tga", ".exr", ".ttf", ".otf", ".uasset"}
SKIP = {".godot", "addons", ".git", "evidence", ".claude", "Library", "Temp", "Packages", "Intermediate", "Saved", "Binaries",
        "DerivedDataCache", "obj", "Logs", "UserSettings", "ThirdParty", "Plugins", "node_modules", "TextMesh Pro", "Samples",
        "_incoming", ".qa", "builds", "tools"}
PROCEDURAL_AUDIO = re.compile(r"AudioStreamGenerator|\bsfxr\b|jsfxr|bfxr|\bnp\.sin\(.*\*\s*(freq|hz)|waveform\s*=\s*.*square|sawtooth\(", re.I)
# A quoted literal of 8+ characters after a secret-looking name; unquoted key=value only in plain config files.
SECRET_QUOTED = re.compile(r"(password|passwd|secret|client_secret|api[_-]?key|token)\s*[=:]+\s*[\"'][^\"'\s]{8,}[\"']", re.I)
SECRET_PLAIN = re.compile(r"^\s*(password|passwd|secret|client_secret|api[_-]?key|token)\s*=\s*[^\s\"'#;]{8,}\s*$", re.I | re.M)
PLAIN_CONFIG = {".cfg", ".ini", ".env", ".toml"}
SECRET_FILE_EXT = {".cfg", ".ini", ".json", ".env", ".toml", ".yml", ".yaml", ".gd", ".cs", ".cpp", ".h", ".txt"}

ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
ap.add_argument("root", nargs="?", default=".")
ap.add_argument("--engine", choices=["godot", "unity", "unreal"])
ap.add_argument("--release", action="store_true")
ap.add_argument("--strict", action="store_true")
args = ap.parse_args()
root = pathlib.Path(args.root).resolve()
engine = args.engine
if not engine:
    if (root / "project.godot").exists(): engine = "godot"
    elif (root / "ProjectSettings" / "ProjectVersion.txt").exists() or (root / "Packages" / "manifest.json").exists(): engine = "unity"
    elif list(root.glob("*.uproject")): engine = "unreal"
    else: engine = "godot"
SRC = {"godot": (".gd",), "unity": (".cs",), "unreal": (".h", ".cpp")}[engine]
COMMENT = "#" if engine == "godot" else "//"
errors, warns = [], []
def err(m): errors.append(m)
def warn(m): warns.append(m)

def files(exts, skip=SKIP):
    out = []
    for e in exts:
        out += [p for p in root.rglob(f"*{e}") if not (set(p.relative_to(root).parts) & skip)]
    return out

def read(p):
    return p.read_text(errors="ignore")

# 1. required docs
for d in DOCS:
    p = root / "_project" / d
    if not p.exists(): err(f"missing _project/{d}")
    elif "<<FILL" in read(p): warn(f"_project/{d} still has <<FILL>> placeholders")
for d in ["ARCHITECTURE.md", "README.md"]:
    if not (root / d).exists(): err(f"missing {d}")
rc = root / "_project" / "RELEASE_CHECKLIST.md"
if args.release and not rc.exists(): err("missing _project/RELEASE_CHECKLIST.md (release tier)")
ad = root / "_project" / "ART_DIRECTION.md"
if args.release and ad.exists() and "<<FILL" in read(ad): err("_project/ART_DIRECTION.md is still the blank template (release tier)")

# 2. engine-specific hard rules
if engine == "godot":
    pg = root / "project.godot"
    if not pg.exists(): err("no project.godot")
    else:
        m = re.search(r"\[autoload\](.*?)(\n\[|\Z)", read(pg), re.S)
        n = len([l for l in (m.group(1).splitlines() if m else []) if "=" in l])
        if n > AUTOLOADS_MAX: err(f"{n} autoloads (hard max {AUTOLOADS_MAX}): split into plain scripts or justify each in DECISIONS.md")
        elif n > AUTOLOADS_WARN: warn(f"{n} autoloads (default seams: Events, State, Net): each extra one needs a row in DECISIONS.md")

# 3. scripts: header, size, function length (GDScript only)
sources = files(SRC)
for p in sources:
    rel = p.relative_to(root)
    lines = read(p).splitlines()
    first = next((l for l in lines if l.strip()), "")
    is_test = "tests" in [x.lower() for x in rel.parts]
    if not (first.startswith(COMMENT) or first.startswith("/*")):
        err(f"{rel}: no header comment (WHAT / TALKS TO / SIBLINGS)")
    elif not any("WHAT" in l for l in lines[:8]) and not is_test:
        warn(f"{rel}: header lacks a WHAT: line")
    if len(lines) > MAX_FILE and not any("WHY LONG" in l for l in lines[:10]):
        warn(f"{rel}: {len(lines)} lines (cap ~{MAX_FILE}); split into <name>_impl parts or add a 'WHY LONG:' header line")
    if engine == "godot" and not is_test:
        start = None
        for i, l in enumerate(lines + ["end"]):
            top = l and not l[0].isspace() and not l.startswith("#")
            if top and start is not None:
                body = [x for x in lines[start[1]:i] if x.strip() and not x.strip().startswith("#")]
                if len(body) > MAX_FUNC + 1: warn(f"{rel}: func {start[0]}() is {len(body)-1} lines (cap ~{MAX_FUNC})")
                start = None
            if l.startswith("func ") or l.startswith("static func "):
                start = (re.sub(r"^(static )?func (\w+).*", r"\2", l), i)

# 4. folders documented
arch = read(root / "ARCHITECTURE.md") if (root / "ARCHITECTURE.md").exists() else ""
scan = {"godot": root, "unity": root / "Assets" / "Game", "unreal": root / "Content"}[engine]
if scan.exists():
    for d in sorted(p for p in scan.iterdir() if p.is_dir() and p.name not in SKIP and not p.name.startswith(".") and p.name != "_project"):
        if f"{d.name}/" not in arch: warn(f"folder {d.relative_to(root)}/ is not described in ARCHITECTURE.md")
    if engine == "godot" and (root / "tools").is_dir() and "tools/" not in arch:
        warn("folder tools/ is not described in ARCHITECTURE.md (say it is QA and generator code, excluded from export)")
elif engine != "godot":
    warn(f"expected folder {scan.relative_to(root)}/ not found")

# 5. credits coverage: every asset file is named in CREDITS.md (by file name, path or folder), and the table has a licence column
base = {"godot": root, "unity": root / "Assets" / "Game", "unreal": root / "Content"}[engine]
credits = root / "_project" / "CREDITS.md"
ctext = read(credits) if credits.exists() else ""
assets = [p for e in ASSET_EXT for p in base.rglob(f"*{e}")
          if base.exists() and not (set(p.relative_to(root).parts) & SKIP) and p.relative_to(root).parts[0] not in ("_project", "shared")] if base.exists() else []
rows = len([l for l in ctext.splitlines() if l.startswith("|")]) - 2 if credits.exists() else 0
if assets and rows < 1: warn(f"{len(assets)} asset files but CREDITS.md has no rows (log source + licence for each)")
elif assets:
    if not re.search(r"\|\s*licen[cs]e", ctext, re.I): warn("CREDITS.md has no licence column")
    low = ctext.lower()
    missing = [p for p in assets if p.name.lower() not in low and p.stem.lower() not in low
               and not any(part.lower() in low and part not in (base.name,) for part in p.relative_to(root).parts[-3:-1])]
    if missing:
        warn(f"{len(missing)} asset files are not named in CREDITS.md (by file, folder or pack), for example: " + ", ".join(m.name for m in missing[:5]))

# 6. audio: no procedural sound markers unless a scoped exception is written down
exc = (root / "_project" / "audio_exception.md").exists()
if not exc:
    hits = [p.relative_to(root) for p in files(SRC + (".py",), SKIP - {"tools"}) if PROCEDURAL_AUDIO.search(read(p))
            and p.name not in ("check_project.py",)]
    for h in hits[:5]:
        warn(f"{h}: looks like synthesised audio (audio.md: recorded sounds only unless the user asked; if they did, write _project/audio_exception.md)")

# 7. export presets exclude QA tools; secrets scan (paths only)
ep = root / "export_presets.cfg"
if ep.exists():
    t = read(ep)
    if not re.search(r"exclude_filter\s*=\s*\"[^\"]*tools", t): warn("export_presets.cfg does not exclude tools/* (QA and generator code must not ship)")
    if not re.search(r"exclude_filter\s*=\s*\"[^\"]*_incoming", t): warn("export_presets.cfg does not exclude _incoming/*")
gi = root / ".gitignore"
if gi.exists() and not re.search(r"credential|secret|\.env", read(gi), re.I): warn(".gitignore has no entry for credential or secret files")
leaks = []
for p in files(tuple(SECRET_FILE_EXT), SKIP - {"tools"}):
    if p.stat().st_size > 400_000 or p.name.endswith(".example.cfg") or p.name == "check_project.py": continue
    txt = read(p)
    if SECRET_QUOTED.search(txt) or (p.suffix in PLAIN_CONFIG and SECRET_PLAIN.search(txt)): leaks.append(p.relative_to(root))
for l in leaks[:5]:
    warn(f"{l}: may contain a password, secret or key (value not shown). Move it to a git-ignored config file.")

print(f"Checked {root} [{engine}]: {len(sources)} scripts, {len(assets)} assets")
for e in errors: print("ERROR:", e)
for w in warns:  print("WARN: ", w)
if not errors and not warns: print("All good.")
sys.exit(1 if errors or (args.strict and warns) else 0)
