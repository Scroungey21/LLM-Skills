<#
.SYNOPSIS
  Gate runner for a Godot project (PowerShell 5.1). Runs the gates in quality-gates.md that can run unattended.

.DESCRIPTION
  G0 lint (check_project.py)     G1 import under a lock     G2 boot (+ optional walker)
  G3 unit tests (GUT)            G4..G8 project hooks       G9 net smoke (-Net) + security hook
  G10..G12 need a window or a person: reported as SKIPPED (manual), never as passed.

  Project hooks are Godot scripts the project provides under tools/qa/. A hook that does not exist is
  SKIPPED with the reason, never silently passed. Each hook must print its PASS line:
    walker.gd         WALK_DONE problems=0            (G2, loads every scene and resource)
    level_check.gd    LEVEL_CHECK <name> items=N problems=0   (G4, one line per unit; any problems>0 fails)
    clip_check.gd     CLIP_DONE problems=0            (G5)
    anim_check.gd     ANIM_DONE problems=0            (G6)
    sfx_check.gd      SFX_CHECK problems=0            (G7)
    balance_report.gd BALANCE_DONE ... problems=0     (G8, run again with -- --greedy)
    security_check.gd SECURITY_DONE problems=0        (G9)
  Hooks run as: godot --headless --path <project> -s res://tools/qa/<hook>.gd

  Every process is bounded by a timeout and only processes started here are killed.
  Pictures never come from this script (headless has no renderer).

.PARAMETER Project   project root (default: current folder)
.PARAMETER Godot     path to the Godot CONSOLE executable (default: $env:GODOT, then "godot" on PATH)
.PARAMETER OutDir    where logs go (default: <project>\.qa\gate). Give each agent its own folder.
.PARAMETER Tier      prototype | release (release: any SKIPPED gate makes the run INCOMPLETE, exit 2)
.PARAMETER Net       also run the multi-instance net smoke (tests\net_smoke.gd)
.PARAMETER TimeoutSec  per-process timeout (default 300)
.PARAMETER Owner     label written in the import lock

  Exit code: 0 all run gates passed, 1 a gate failed, 2 release tier incomplete. Last line: GATE_RUN ...
#>
param(
  [string]$Project = ".",
  [string]$Godot = "",
  [string]$OutDir = "",
  [ValidateSet("prototype", "release")][string]$Tier = "prototype",
  [switch]$Net,
  [int]$TimeoutSec = 300,
  [string]$Owner = "gate"
)

$ErrorActionPreference = "Stop"
$Project = (Resolve-Path $Project).Path
if ($OutDir -eq "") { $OutDir = Join-Path $Project ".qa\gate" }
New-Item -ItemType Directory -Force -Path $OutDir | Out-Null
if ($Godot -eq "") { $Godot = $env:GODOT }
if ($Godot -eq "" -or $Godot -eq $null) { $Godot = "godot" }
$script:passed = 0; $script:failed = 0; $script:skipped = 0
if ($null -eq (Get-Command $Godot -ErrorAction SilentlyContinue)) {
  Write-Host "G1 FAIL godot not found: pass -Godot <path to the console exe> or set `$env:GODOT"
  Write-Host "GATE_RUN tier=$Tier passed=0 failed=1 skipped=0"; exit 1
}

function Say($gate, $state, $msg) { Write-Host ("{0} {1} {2}" -f $gate, $state, $msg) }
function Pass($gate, $msg) { $script:passed++; Say $gate "PASS" $msg }
function Fail($gate, $msg) { $script:failed++; Say $gate "FAIL" $msg }
function Skip($gate, $msg) { $script:skipped++; Say $gate "SKIPPED" $msg }

function Quote($a) { if ($a -match '\s') { return '"' + $a + '"' } else { return $a } }

# Run a process with a timeout. Returns @{ Code; Text; TimedOut }.
function Run-Proc($exe, [string[]]$argv, $logName) {
  $o = Join-Path $OutDir ($logName + ".out.txt"); $e = Join-Path $OutDir ($logName + ".err.txt")
  $argText = ($argv | ForEach-Object { Quote $_ }) -join " "
  $p = Start-Process -FilePath $exe -ArgumentList $argText -NoNewWindow -PassThru `
        -RedirectStandardOutput $o -RedirectStandardError $e -WorkingDirectory $Project
  $null = $p.Handle   # keep the handle so ExitCode is readable (Windows PowerShell 5.1 quirk)
  $timedOut = $false
  if (-not $p.WaitForExit($TimeoutSec * 1000)) { $timedOut = $true; try { $p.Kill() } catch {} }
  else { $p.WaitForExit() }
  $text = ""
  if (Test-Path $o) { $text += (Get-Content $o -Raw -ErrorAction SilentlyContinue) }
  if (Test-Path $e) { $text += "`n" + (Get-Content $e -Raw -ErrorAction SilentlyContinue) }
  $code = 124
  if (-not $timedOut) { $code = $p.ExitCode }
  return @{ Code = $code; Text = [string]$text; TimedOut = $timedOut }
}

# Engine error lines at the START of a line only (a bare "ERROR:" anywhere would false-fail on harmless text).
$ErrPattern = '(?m)^(SCRIPT ERROR|ERROR: |USER ERROR: )|Parse Error|Failed to load'

function Godot-Run($name, [string[]]$extra) {
  $a = @("--headless", "--path", $Project) + $extra
  return Run-Proc $Godot $a $name
}

function Take-Lock($path, $waitSec) {
  New-Item -ItemType Directory -Force -Path (Split-Path $path) | Out-Null
  $deadline = (Get-Date).AddSeconds($waitSec)
  while ($true) {
    try {
      $fs = [IO.File]::Open($path, [IO.FileMode]::CreateNew, [IO.FileAccess]::Write, [IO.FileShare]::None)
      $b = [Text.Encoding]::UTF8.GetBytes("$Owner pid=$PID " + (Get-Date -Format s))
      $fs.Write($b, 0, $b.Length); $fs.Close(); return $true
    } catch {
      $item = Get-Item $path -ErrorAction SilentlyContinue
      if ($item -ne $null -and ((Get-Date) - $item.LastWriteTime).TotalMinutes -gt 30) { Remove-Item $path -Force -ErrorAction SilentlyContinue; continue }
      if ((Get-Date) -gt $deadline) { return $false }
      Start-Sleep -Seconds 2
    }
  }
}

# ---------------- G0 lint ----------------
$py = (Get-Command python -ErrorAction SilentlyContinue)
if ($py -eq $null) { $py = (Get-Command py -ErrorAction SilentlyContinue) }
if ($py -eq $null) { Skip "G0" "python not found, lint not run" }
else {
  $r = Run-Proc $py.Source @("-I", (Join-Path $PSScriptRoot "check_project.py"), $Project) "g0"
  if ($r.TimedOut) { Fail "G0" "timed out" }
  elseif ($r.Code -eq 0) { Pass "G0" "check_project.py has no errors" }
  else { Fail "G0" "check_project.py reported errors (see $OutDir\g0.out.txt)" }
}

# ---------------- G1 import ----------------
if (-not (Test-Path (Join-Path $Project "project.godot"))) { Fail "G1" "no project.godot in $Project"; }
else {
  $importHook = Join-Path $Project "tools\qa\import.ps1"
  if (Test-Path $importHook) {
    $r = Run-Proc "powershell.exe" @("-NoProfile", "-File", $importHook, "-Owner", $Owner) "g1"
    if ($r.TimedOut) { Fail "G1" "import timed out" } elseif ($r.Code -eq 0) { Pass "G1" "import through tools\qa\import.ps1" } else { Fail "G1" "import failed (see g1.out.txt)" }
  } else {
    $lock = Join-Path $Project ".qa\import.lock"
    if (-not (Take-Lock $lock 300)) { Fail "G1" "could not take the import lock $lock within 300 s" }
    else {
      try {
        $r = Godot-Run "g1" @("--import")
        if ($r.TimedOut) { Fail "G1" "import timed out" }
        elseif ($r.Text -match $ErrPattern) { Fail "G1" "import printed engine errors (see g1.out.txt)" }
        else { Pass "G1" "import clean" }
      } finally { Remove-Item $lock -Force -ErrorAction SilentlyContinue }
    }
  }
}

# ---------------- G2 boot + walker ----------------
$r = Godot-Run "g2" @("--quit-after", "120")
if ($r.TimedOut) { Fail "G2" "boot timed out" }
elseif ($r.Text -match $ErrPattern) { Fail "G2" "boot printed script errors:"; ($r.Text -split "`n" | Where-Object { $_ -match $ErrPattern } | Select-Object -First 10) | ForEach-Object { Write-Host "    $_" } }
else {
  $walker = Join-Path $Project "tools\qa\walker.gd"
  if (-not (Test-Path $walker)) { Pass "G2" "booted, no script errors (no tools\qa\walker.gd: scenes not walked)" }
  else {
    $w = Godot-Run "g2walk" @("-s", "res://tools/qa/walker.gd")
    if ($w.TimedOut) { Fail "G2" "walker timed out" }
    elseif ($w.Text -match 'WALK_DONE[^\r\n]*problems=0') { Pass "G2" "booted and walked every scene" }
    else { Fail "G2" "walker did not print WALK_DONE ... problems=0 (see g2walk.out.txt)" }
  }
}

# ---------------- hook gates ----------------
function Hook-Gate($gate, $file, $passRegex, $extra) {
  $path = Join-Path $Project ("tools\qa\" + $file)
  if (-not (Test-Path $path)) { Skip $gate "no tools\qa\$file (the project has not provided this check)"; return }
  $args1 = @("-s", ("res://tools/qa/" + $file))
  if ($extra) { $args1 += @("--") + $extra }
  $h = Godot-Run ($gate.ToLower() + "_" + $file) $args1
  if ($h.TimedOut) { Fail $gate "$file timed out" }
  elseif ($h.Text -match $passRegex -and $h.Text -notmatch 'problems=[1-9]') { Pass $gate "$file" }
  else { Fail $gate "$file did not print its PASS line ($passRegex); see $OutDir" }
}

# G3 unit tests
$gut = Join-Path $Project "addons\gut\gut_cmdln.gd"
if (-not (Test-Path $gut)) { Skip "G3" "GUT not installed (addons\gut)" }
else {
  $t = Godot-Run "g3" @("-s", "addons/gut/gut_cmdln.gd", "-gdir=res://tests", "-gexit")
  if ($t.TimedOut) { Fail "G3" "tests timed out" } elseif ($t.Code -eq 0) { Pass "G3" "GUT exit 0" } else { Fail "G3" "GUT exit $($t.Code) (see g3.out.txt)" }
}

Hook-Gate "G4" "level_check.gd" 'LEVEL_CHECK' $null
Hook-Gate "G5" "clip_check.gd" 'CLIP_DONE[^\r\n]*problems=0' $null
Hook-Gate "G6" "anim_check.gd" 'ANIM_DONE[^\r\n]*problems=0' $null
Hook-Gate "G7" "sfx_check.gd" 'SFX_CHECK[^\r\n]*problems=0' $null
Hook-Gate "G8" "balance_report.gd" 'BALANCE_DONE[^\r\n]*problems=0' $null
if (Test-Path (Join-Path $Project "tools\qa\balance_report.gd")) { Hook-Gate "G8" "balance_report.gd" 'BALANCE_DONE[^\r\n]*problems=0' @("--greedy") }

# G9 network + security
if ($Net) {
  $smoke = Join-Path $Project "tests\net_smoke.gd"
  if (-not (Test-Path $smoke)) { Fail "G9" "-Net given but tests\net_smoke.gd is missing" }
  else { & (Join-Path $PSScriptRoot "net_test.ps1") -Project $Project -Godot $Godot -OutDir $OutDir -TimeoutSec 90 | ForEach-Object { Write-Host $_ }; if ($LASTEXITCODE -eq 0) { Pass "G9" "net smoke" } else { Fail "G9" "net smoke (see $OutDir)" } }
} else { Skip "G9" "net smoke not requested (-Net)" }
Hook-Gate "G9" "security_check.gd" 'SECURITY_DONE[^\r\n]*problems=0' $null

# G10-G12 are not unattended
Skip "G10" "needs a window and a person to read the screenshots (ui-and-camera.md)"
Skip "G11" "needs the named reference machine at native resolution (performance.md)"
Skip "G12" "release checklist is signed by the user (release-and-legal.md)"

$incomplete = ($Tier -eq "release" -and $script:skipped -gt 0)
Write-Host ("GATE_RUN tier={0} passed={1} failed={2} skipped={3}{4}" -f $Tier, $script:passed, $script:failed, $script:skipped, $(if ($incomplete) { " INCOMPLETE" } else { "" }))
if ($script:failed -gt 0) { exit 1 }
if ($incomplete) { exit 2 }
exit 0
