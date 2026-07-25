<#
.SYNOPSIS
  /speckit-update 的機械性輔助：建立暫存分支、列出既有 spec 功能。
  判斷題（需求分類、spec 內容）交給 agent；本腳本只做易算錯的確定性工作。

.PARAMETER Mode
  branch   建立暫存 local 分支 {Issue}-temp-{MMdd}（從目前 HEAD 切出，不切換亦不 push）。
  features 列出 specs/ 下每個 feature 目錄與其 spec.md 第一行標題，供需求分類比對。

.EXAMPLE
  pwsh speckit-update-helper.ps1 -Mode branch -Issue 755
  pwsh speckit-update-helper.ps1 -Mode branch            # 未給 Issue 時由最近 commit 推測
  pwsh speckit-update-helper.ps1 -Mode features
#>
param(
  [Parameter(Mandatory = $true)]
  [ValidateSet('branch', 'features')]
  [string]$Mode,

  [string]$Issue,

  # 暫存分支日期後綴，預設今天 MMdd；可覆寫以對齊使用者認定的日期。
  [string]$DateSuffix = (Get-Date -Format 'MMdd')
)

$ErrorActionPreference = 'Stop'
# 確保中文標題輸出不亂碼
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# 定位 repo 根目錄（腳本位於 .claude/skills/speckit-update/scripts/）。
# 不用 `git rev-parse --show-toplevel`：當路徑含中文時 git 會輸出 octal 跳脫而失效，
# 改由腳本實體位置往上推四層取得，對 CJK 路徑穩定。
$repoRoot = (Resolve-Path "$PSScriptRoot\..\..\..\..").Path

function Get-IssueFromGit {
  # 從最近 50 筆 commit 主旨抓第一個 #數字
  $log = & git -C $repoRoot log -50 --pretty=%s 2>$null
  foreach ($line in $log) {
    if ($line -match '#(\d+)') { return $Matches[1] }
  }
  return $null
}

switch ($Mode) {

  'branch' {
    if (-not $Issue) { $Issue = Get-IssueFromGit }
    if (-not $Issue) {
      Write-Error "無法推測 issue 號，請以 -Issue 指定（例：-Issue 755）。"
      exit 1
    }
    $branch = "$Issue-temp-$DateSuffix"

    $exists = & git -C $repoRoot branch --list $branch
    if ($exists) {
      Write-Host "分支已存在，直接沿用：$branch"
      Write-Host "BRANCH_NAME=$branch"
      exit 0
    }

    # 從目前 HEAD 切出新 local 分支並切換過去
    & git -C $repoRoot switch -c $branch | Out-Null
    Write-Host "已建立並切換至暫存分支：$branch（從 $(& git -C $repoRoot rev-parse --short HEAD) 切出）"
    Write-Host "BRANCH_NAME=$branch"
  }

  'features' {
    $specsDir = Join-Path $repoRoot 'specs'
    if (-not (Test-Path $specsDir)) {
      Write-Error "找不到 specs/ 目錄：$specsDir"
      exit 1
    }
    Get-ChildItem -Path $specsDir -Directory | Sort-Object Name | ForEach-Object {
      $specFile = Join-Path $_.FullName 'spec.md'
      $title = '(無 spec.md)'
      if (Test-Path $specFile) {
        $h1 = Get-Content $specFile -TotalCount 40 | Where-Object { $_ -match '^#\s+' } | Select-Object -First 1
        if ($h1) { $title = ($h1 -replace '^#\s+', '').Trim() }
      }
      Write-Host ("{0}`t{1}" -f $_.Name, $title)
    }
  }
}
