<#
  ai-video-factory preflight (read-only). Checks the shared toolchain and the kept channel folders.
  Run from anywhere:  pwsh -File ai-video-factory/scripts/preflight.ps1 [-RepositoryRoot <repo>]
  Edit $channels / $python only if the repo layout changes.
#>
[CmdletBinding()]
param(
    [string]$RepositoryRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
)

$ErrorActionPreference = "Continue"
Set-Location -LiteralPath $RepositoryRoot
$toolkit = "ai-video-factory/toolkit"

Write-Output "ai-video-factory preflight"
Write-Output "Repository: $RepositoryRoot"
Write-Output ""

$required = @(
    "$toolkit/docker-compose.yml",
    "$toolkit/tts-dots/server.py",
    "$toolkit/tts-dots/voices/hidden-systems-informational.wav",
    "$toolkit/renderer/package.json",
    "hidden-everyday-systems/renderer-public/hidden-systems/fonts",
    "hidden-everyday-systems/hidden_systems_production.py",
    "material-trials/weekly.py",
    "etcherr871/clips.py",
    "ambient-channel/HANDOFF.md",
    "release-catalog/ReleaseCatalog",
    ".venv/Scripts/python.exe",
    "material-trials/.venv/Scripts/python.exe"
)
Write-Output "Required files / folders"
foreach ($item in $required) {
    $exists = Test-Path -LiteralPath $item
    Write-Output ("[{0}] {1}" -f ($(if ($exists) { "OK" } else { "MISSING" })), $item)
}
Write-Output ""
Write-Output "(optional) renderer node_modules: run 'pnpm install' or 'npm install' in $toolkit/renderer before rendering Remotion videos"
Write-Output ("[{0}] {1}/renderer/node_modules" -f ($(if (Test-Path "$toolkit/renderer/node_modules") { "OK" } else { "ABSENT" })), $toolkit)

Write-Output ""
Write-Output "Tool versions"
try { & ".venv/Scripts/python.exe" --version } catch { Write-Output "Shared Python (.venv) unavailable" }
try { & "material-trials/.venv/Scripts/python.exe" --version } catch { Write-Output "Material Trials Python unavailable" }
try { node --version } catch { Write-Output "Node unavailable" }
$ff = (Get-Command ffmpeg -ErrorAction SilentlyContinue)
if ($ff) { & $ff.Source -version | Select-Object -First 1 } elseif (Test-Path "C:/bin/ffmpeg.exe") { & "C:/bin/ffmpeg.exe" -version | Select-Object -First 1 } else { Write-Output "FFmpeg unavailable" }
try { docker --version } catch { Write-Output "Docker CLI unavailable" }

Write-Output ""
Write-Output "TTS containers (never run tts and tts-hidden at the same time)"
try {
    Push-Location $toolkit
    docker compose ps -a tts tts-hidden
    $running = & docker compose ps --status running --format '{{.Service}}' 2>$null
    if (($running -contains "tts") -and ($running -contains "tts-hidden")) {
        Write-Warning "Both tts and tts-hidden are running -- stop one; this doubles VRAM usage."
    }
    Pop-Location
} catch { Write-Output "Docker daemon or Compose unavailable" }

Write-Output ""
Write-Output "TTS API (hidden-systems, port 8005 / technews, port 8004)"
foreach ($port in 8005, 8004) {
    try { Invoke-RestMethod -Uri "http://localhost:$port/api/model-info" -TimeoutSec 3 | ConvertTo-Json -Depth 4 }
    catch { Write-Output "port ${port}: unavailable (expected when the service is stopped or loading)" }
}

Write-Output ""
Write-Output "GPU"
try { nvidia-smi } catch { Write-Output "nvidia-smi unavailable" }

Write-Output ""
Write-Output "Scheduled job (Material Trials)"
try { Get-ScheduledTask -TaskName "MaterialTrials-Weekly" | ForEach-Object { $_.TaskName + ": " + ($_.Actions | ForEach-Object { $_.Execute + " " + $_.Arguments }) } }
catch { Write-Output "MaterialTrials-Weekly task not registered" }

Write-Output ""
Write-Output "Preflight is read-only. Resolve missing dependencies and GPU conflicts before expensive production."
