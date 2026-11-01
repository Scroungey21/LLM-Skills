<#
  Validate news-explainer deliverables (long video + Short + metadata + thumbnail) with ffprobe.
  Checks per slug: required files, CTA line, source URLs present in both descriptions, H.264/AAC/48 kHz,
  long = landscape, Short = portrait, thumbnail = 1280x720, and prints SHA-256 per video.
  Usage: pwsh -File validate-deliverables.ps1 -OutputRoot technews\output\test-productions -Slugs a,b,c
#>
[CmdletBinding()]
param(
    [string]$OutputRoot = 'technews\output\test-productions',
    [Parameter(Mandatory)][string[]]$Slugs,
    [string]$RepositoryRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
)

$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $RepositoryRoot

$expectedCta = 'if you want more details, check the full video in the description'
$required = @('video.mp4', 'short.mp4', 'meta.json', 'thumbnail.png', 'full-script.json', 'short-script.json')
$failures = [System.Collections.Generic.List[string]]::new()

foreach ($slug in $Slugs) {
    $dir = Join-Path $OutputRoot $slug
    foreach ($name in $required) {
        $path = Join-Path $dir $name
        if (-not (Test-Path -LiteralPath $path)) { $failures.Add("$slug missing $name") }
        elseif ((Get-Item -LiteralPath $path).Length -le 0) { $failures.Add("$slug empty $name") }
    }
    if (-not (Test-Path -LiteralPath (Join-Path $dir 'meta.json'))) { continue }

    $meta = Get-Content -LiteralPath (Join-Path $dir 'meta.json') -Raw | ConvertFrom-Json
    if ($meta.short.cta -cne $expectedCta) { $failures.Add("$slug Short CTA mismatch") }
    foreach ($source in $meta.sources) {
        if ($meta.video.description -notlike "*$($source.url)*") { $failures.Add("$slug full description missing $($source.url)") }
        if ($meta.short.description -notlike "*$($source.url)*") { $failures.Add("$slug Short description missing $($source.url)") }
    }

    foreach ($name in @('video.mp4', 'short.mp4')) {
        $file = Join-Path $dir $name
        if (-not (Test-Path -LiteralPath $file)) { continue }
        $path = (Resolve-Path $file).Path
        $probe = & ffprobe -v error -show_entries 'format=duration:stream=codec_type,codec_name,width,height,sample_rate,channels' -of json $path | ConvertFrom-Json
        $video = $probe.streams | Where-Object codec_type -eq 'video' | Select-Object -First 1
        $audio = $probe.streams | Where-Object codec_type -eq 'audio' | Select-Object -First 1
        if ($video.codec_name -ne 'h264') { $failures.Add("$slug/$name video codec is $($video.codec_name)") }
        if ($audio.codec_name -ne 'aac') { $failures.Add("$slug/$name audio codec is $($audio.codec_name)") }
        if ([int]$audio.sample_rate -ne 48000) { $failures.Add("$slug/$name audio rate is $($audio.sample_rate)") }
        if ($name -eq 'video.mp4' -and [int]$video.width -le [int]$video.height) { $failures.Add("$slug full is not landscape") }
        if ($name -eq 'short.mp4' -and [int]$video.height -le [int]$video.width) { $failures.Add("$slug Short is not portrait") }
        $hash = (Get-FileHash -LiteralPath $path -Algorithm SHA256).Hash.ToLower()
        Write-Output "$slug/$name|$([math]::Round([double]$probe.format.duration,2))s|$($video.width)x$($video.height)|$hash"
    }

    $thumb = Join-Path $dir 'thumbnail.png'
    $python = Join-Path $RepositoryRoot '.venv\Scripts\python.exe'
    if ((Test-Path -LiteralPath $python) -and (Test-Path -LiteralPath $thumb)) {
        $dimensions = & $python -c "from PIL import Image; im=Image.open(r'$thumb'); print(f'{im.width}x{im.height}')"
        if ($dimensions -ne '1280x720') { $failures.Add("$slug thumbnail is $dimensions") }
    }
}

if ($failures.Count) {
    $failures | ForEach-Object { Write-Error $_ }
    exit 1
}
Write-Output 'deliverables=valid'
