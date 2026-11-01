<#
.SYNOPSIS
  Gate G9 (network part), PowerShell variant of net_test.sh: runs tests\net_smoke.gd as several real Godot instances.
.DESCRIPTION
  Scenarios: A 4 players + duplicate names + start + late joiner refused; B full room refused; C host leaves the lobby;
  D password room (right password in, wrong password refused) and a hostile oversized hello dropped unread.
  Every instance is bounded by -TimeoutSec and only processes started here are killed.
  Last line: "G9 PASS (net smoke)" or "G9 FAIL (net smoke)". Exit code 0 or 1. Uses UDP port 7777 on loopback.
#>
param(
  [string]$Project = ".",
  [string]$Godot = "",
  [string]$OutDir = "",
  [int]$TimeoutSec = 90
)
$ErrorActionPreference = "Stop"
$Project = (Resolve-Path $Project).Path
if ($Godot -eq "") { $Godot = $env:GODOT }
if ($Godot -eq "" -or $Godot -eq $null) { $Godot = "godot" }
if ($OutDir -eq "") { $OutDir = Join-Path $Project ".qa\net" }
New-Item -ItemType Directory -Force -Path $OutDir | Out-Null
if (-not (Test-Path (Join-Path $Project "tests\net_smoke.gd"))) { Write-Host "no tests\net_smoke.gd (is this a networked project?)"; exit 2 }

function Quote($a) { if ($a -match '\s') { return '"' + $a + '"' } else { return $a } }

function Start-Role($tag, [string[]]$roleArgs) {
  $o = Join-Path $OutDir ("net_" + $tag + ".out.txt"); $e = Join-Path $OutDir ("net_" + $tag + ".err.txt")
  $all = @("--headless", "--path", $Project, "-s", "tests/net_smoke.gd", "--") + $roleArgs
  $argText = ($all | ForEach-Object { Quote $_ }) -join " "
  $p = Start-Process -FilePath $Godot -ArgumentList $argText -NoNewWindow -PassThru -RedirectStandardOutput $o -RedirectStandardError $e -WorkingDirectory $Project
  $null = $p.Handle
  return @{ Tag = $tag; Proc = $p; Out = $o; Err = $e }
}

$script:bad = 0
function Run-Scenario($label, $roles) {
  Write-Host $label
  $started = @()
  foreach ($r in $roles) {
    if ($r.wait) { Start-Sleep -Seconds $r.wait }
    $st = Start-Role $r.tag $r.args
    $st.ignore = [bool]$r.ignore
    $started += $st
  }
  $deadline = (Get-Date).AddSeconds($TimeoutSec)
  foreach ($s in $started) {
    $left = [Math]::Max(1, [int](($deadline - (Get-Date)).TotalMilliseconds))
    if (-not $s.Proc.WaitForExit($left)) { try { $s.Proc.Kill() } catch {}; Write-Host ("  {0}: TIMEOUT" -f $s.Tag); $script:bad++; continue }
    $s.Proc.WaitForExit()
    if ($s.ignore) { continue }                      # clients of a room that never starts: their result is not the test
    $text = ""
    if (Test-Path $s.Out) { $text = [string](Get-Content $s.Out -Raw -ErrorAction SilentlyContinue) }
    $line = ($text -split "`n" | Where-Object { $_ -match '^(PASS|FAIL)' } | Select-Object -First 1)
    if ($text -match 'SCRIPT ERROR' -or $line -eq $null -or $line -match '^FAIL') {
      Write-Host ("  {0}: {1}" -f $s.Tag, $(if ($line) { $line } else { "no PASS line" })); $script:bad++
    }
  }
}

# build the import cache once
$impOut = Join-Path $OutDir "net_import.out.txt"; $impErr = Join-Path $OutDir "net_import.err.txt"
$imp = Start-Process -FilePath $Godot -ArgumentList ((("--headless", "--path", $Project, "--import") | ForEach-Object { Quote $_ }) -join " ") -NoNewWindow -PassThru -RedirectStandardOutput $impOut -RedirectStandardError $impErr -WorkingDirectory $Project
if (-not $imp.WaitForExit(120000)) { try { $imp.Kill() } catch {} }

Run-Scenario "A: 4 players, duplicate names, start, late joiner refused" @(
  @{ tag = "A_host"; args = @("host", "4", "start") },
  @{ tag = "A_bob1"; args = @("client", "Bob"); wait = 2 },
  @{ tag = "A_bob2"; args = @("client", "Bob") },
  @{ tag = "A_carol"; args = @("client", "Carol") },
  @{ tag = "A_late"; args = @("late", "4") })
Run-Scenario "B: full room refuses a 5th player" @(
  @{ tag = "B_host"; args = @("host", "4", "hold") },
  @{ tag = "B_c1"; args = @("client", "Bob"); wait = 2; ignore = $true },
  @{ tag = "B_c2"; args = @("client", "Cy"); ignore = $true },
  @{ tag = "B_c3"; args = @("client", "Di"); ignore = $true },
  @{ tag = "B_full"; args = @("full", "3") })
Run-Scenario "C: host leaves the lobby, client is told" @(
  @{ tag = "C_host"; args = @("host", "2", "leave") },
  @{ tag = "C_c"; args = @("client", "Bob", "expect_host_left"); wait = 2 })
Run-Scenario "D: password room, wrong password, hostile oversized hello" @(
  @{ tag = "D_host"; args = @("host", "2", "hold", "secret") },
  @{ tag = "D_bob"; args = @("joiner", "Bob", "secret", "ok"); wait = 2 },
  @{ tag = "D_eve"; args = @("joiner", "Eve", "wrongpw", "Wrong password") },
  @{ tag = "D_evil"; args = @("evil") })

if ($script:bad -eq 0) { Write-Host "G9 PASS (net smoke)"; exit 0 }
Write-Host "G9 FAIL (net smoke)"; exit 1
