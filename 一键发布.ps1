$ErrorActionPreference = "Stop"
Set-Location -LiteralPath $PSScriptRoot

$repoName = "quzhan-local-player"
$package = Get-Content -LiteralPath ".\package.json" -Raw | ConvertFrom-Json
$version = $package.version
$tag = "v$version"
$setupFile = ".\release\Quzhan-Setup-$version-x64.exe"
$portableFile = ".\release\Quzhan-Portable-$version-x64.exe"
$checksumFile = ".\release\SHA256SUMS.txt"

Write-Host "曲栈 GitHub 一键发布" -ForegroundColor Cyan
Write-Host "====================" -ForegroundColor DarkCyan

if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
  throw "未找到 GitHub CLI。请先安装 GitHub CLI：https://cli.github.com/"
}

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  throw "未找到 Git。请先安装 Git：https://git-scm.com/"
}

$authCheck = & gh auth status 2>&1
if ($LASTEXITCODE -ne 0) {
  Write-Host ""
  Write-Host "第一次发布需要登录 GitHub。浏览器会自动打开。" -ForegroundColor Yellow
  Write-Host "请在浏览器中授权，然后回到这个窗口。" -ForegroundColor Yellow
  & gh auth login --hostname github.com --git-protocol https --web
  if ($LASTEXITCODE -ne 0) {
    throw "GitHub 登录未完成，发布已停止。"
  }
}

$login = (& gh api user --jq .login).Trim()
if (-not $login) {
  throw "无法读取 GitHub 用户名，请重新运行 gh auth login。"
}
$fullRepo = "$login/$repoName"

$forbidden = git ls-files | Where-Object {
  $_ -match "(^|/)(library\.json|work/|covers/)" -or
  $_ -match "\.(mp3|flac|m4a|aac|wav|ogg|opus|aiff|aif)$"
}
if ($forbidden) {
  throw "检测到可能包含本地音乐数据的文件已经进入 Git，发布已停止：`n$($forbidden -join "`n")"
}

Write-Host ""
Write-Host "检查并提交最新源码..." -ForegroundColor Cyan
git add .
$pending = git status --porcelain
if ($pending) {
  git commit -m "Release Quzhan $version"
}

$remoteUrl = git remote get-url origin 2>$null
if ($LASTEXITCODE -ne 0 -or -not $remoteUrl) {
  Write-Host "创建公开仓库 $fullRepo ..." -ForegroundColor Cyan
  & gh repo create $fullRepo --public --source=. --remote=origin --push
  if ($LASTEXITCODE -ne 0) {
    throw "创建 GitHub 仓库失败。请确认仓库名未被占用，或检查网络和登录状态。"
  }
} else {
  $remoteMatches = $remoteUrl -match "github\.com[/:]$([regex]::Escape($login))/$([regex]::Escape($repoName))(\.git)?$"
  if (-not $remoteMatches) {
    throw "当前 origin 不是预期的 $fullRepo：$remoteUrl"
  }
  Write-Host "推送源码到 GitHub..." -ForegroundColor Cyan
  git push -u origin main
}

& gh repo edit $fullRepo `
  --description "A local-first Windows music player with persistent queues, round-aware shuffle, synchronized lyrics, and a real-time spectrum." `
  --add-topic electron `
  --add-topic windows `
  --add-topic music-player `
  --add-topic local-music `
  --add-topic lyrics

$releaseAssets = @()
if (Test-Path -LiteralPath $setupFile) { $releaseAssets += $setupFile }
if (Test-Path -LiteralPath $portableFile) { $releaseAssets += $portableFile }
if (Test-Path -LiteralPath $checksumFile) { $releaseAssets += $checksumFile }
if ($releaseAssets.Count -eq 0) {
  throw "release 目录中找不到 $version 的安装包。"
}

& gh release view $tag --repo $fullRepo *> $null
if ($LASTEXITCODE -eq 0) {
  Write-Host "Release $tag 已存在，更新安装包..." -ForegroundColor Yellow
  & gh release upload $tag @releaseAssets --repo $fullRepo --clobber
} else {
  Write-Host "创建 Release $tag 并上传安装包..." -ForegroundColor Cyan
  & gh release create $tag @releaseAssets `
    --repo $fullRepo `
    --title "曲栈 $version" `
    --notes-file ".\RELEASE_NOTES.md"
}

if ($LASTEXITCODE -ne 0) {
  throw "GitHub Release 上传失败。"
}

Write-Host ""
Write-Host "发布完成。" -ForegroundColor Green
Write-Host "仓库：https://github.com/$fullRepo"
Write-Host "Release：https://github.com/$fullRepo/releases/tag/$tag"
Write-Host ""
Write-Host "按回车键打开 GitHub 仓库。"
Read-Host | Out-Null
Start-Process "https://github.com/$fullRepo"
