<#
.SYNOPSIS
  log-report skill 的確定性輔助工具。把「容易算錯／每次手算會漂移」的機械性工作交給 script，
  讓 agent 專注在判斷該填哪幾筆、何時收週等需要推理的部分。

.DESCRIPTION
  三種模式（-Mode）：
    titles  偵測「上一個 branch」並列出 `上一個branch..HEAD` 範圍的 git title（新→舊），
            title 已套用定義規則（去 [why]/[why/how] 之後、上限 100 字）。
    week    給一個「週一」日期，輸出該週一～週五的「yyyy-MM-dd 週X」（週別由系統算，不靠手填）。
    backup  從「上一個 branch」切一條 local 備份分支並依序 cherry-pick 指定 commit（會改動 git 狀態，
            僅在使用者確認後執行）。

.EXAMPLE
  pwsh scripts/log-report-helper.ps1 -Mode titles
  pwsh scripts/log-report-helper.ps1 -Mode titles -PrevBranch 755-公文製作-vue框架重寫
  pwsh scripts/log-report-helper.ps1 -Mode week -Monday 2026-06-08
  pwsh scripts/log-report-helper.ps1 -Mode backup -NewBranch 755-temp-0605 -Commits "<舊hash>,<...>,<新hash>"
#>
param(
  [Parameter(Mandatory = $true)][ValidateSet('titles', 'week', 'backup')]
  [string]$Mode,
  [string]$PrevBranch = '',   # 留空則自動偵測
  [string]$Monday = '',       # week 模式：該週週一 yyyy-MM-dd
  [string]$NewBranch = '',    # backup 模式：要建立的備份分支名
  [string]$Commits = ''       # backup 模式：逗號分隔的 commit hash，順序「舊→新」
)
$ErrorActionPreference = 'Stop'
$cur = (git rev-parse --abbrev-ref HEAD).Trim()

# 自動偵測「上一個 branch」：在所有 local 分支（排除目前分支）中，
# 取與 HEAD 的 merge-base「時間最新」者 —— 即最近一次從它切出來的分支。
function Resolve-PrevBranch {
  param([string]$Current)
  $best = $null; $bestTime = 0
  foreach ($b in (git for-each-ref --format='%(refname:short)' refs/heads)) {
    if ($b -eq $Current) { continue }
    $mb = (git merge-base HEAD $b 2>$null)
    if (-not $mb) { continue }
    $t = [int](git show -s --format=%ct $mb)
    if ($t -gt $bestTime) { $bestTime = $t; $best = $b }
  }
  return $best
}

# git title 定義（取捨優先序 1→3）：以 commit 第一行（subject）為基礎。
#  規則2：取到第一個「條列 - 」（前後有空格的破折號，不誤判 "->" 箭頭）或 [why]/[why/how] 之前。
#  規則3：若無上述符號，取到第一個句號「。」為止。
#  規則1：最後一律以 100 字為上限切斷。
function Get-GitTitle {
  param([string]$Subject)
  $s = $Subject
  $cut = -1
  $b = $s.IndexOf(' - ')               # 條列破折號（前後空格），不會命中 "->" 箭頭
  if ($b -ge 0) { $cut = $b }
  $w = $s.IndexOf('[why')              # 同時涵蓋 [why] 與 [why/how]
  if ($w -ge 0 -and ($cut -lt 0 -or $w -lt $cut)) { $cut = $w }
  if ($cut -ge 0) {
    $s = $s.Substring(0, $cut)         # 規則2
  }
  elseif ($s.Contains([char]0x3002)) {
    $s = $s.Substring(0, $s.IndexOf([char]0x3002) + 1)   # 規則3：取到第一個「。」
  }
  $s = $s.Trim()
  if ($s.Length -gt 100) { $s = $s.Substring(0, 100) }   # 規則1
  return $s
}

switch ($Mode) {
  'titles' {
    if (-not $PrevBranch) { $PrevBranch = Resolve-PrevBranch $cur }
    if (-not $PrevBranch) { throw '找不到上一個 branch，請用 -PrevBranch 指定。' }
    Write-Host "# current=$cur  prev=$PrevBranch  range=$PrevBranch..HEAD"
    Write-Host "# 欄位：日期`tshort-hash`tgit-title （新→舊）"
    $US = [char]0x1f
    git log "$PrevBranch..HEAD" --format="%H$US%cI$US%s" | ForEach-Object {
      $p = $_ -split $US
      $title = Get-GitTitle $p[2]
      '{0}{3}{1}{3}{2}' -f $p[1].Substring(0, 10), $p[0].Substring(0, 9), $title, "`t"
    }
  }
  'week' {
    if (-not $Monday) { throw 'week 模式需 -Monday yyyy-MM-dd（該週週一）。' }
    $d = [datetime]::ParseExact($Monday, 'yyyy-MM-dd', $null)
    $w = @('週日', '週一', '週二', '週三', '週四', '週五', '週六')
    0..4 | ForEach-Object {
      $cd = $d.AddDays($_)
      '{0} {1}' -f $cd.ToString('yyyy-MM-dd'), $w[[int]$cd.DayOfWeek]
    }
  }
  'backup' {
    if (-not $NewBranch -or -not $Commits) { throw 'backup 模式需 -NewBranch 與 -Commits。' }
    if (-not $PrevBranch) { $PrevBranch = Resolve-PrevBranch $cur }
    if (-not $PrevBranch) { throw '找不到上一個 branch，請用 -PrevBranch 指定。' }
    Write-Host "從 $PrevBranch 切出備份分支 $NewBranch ..."
    git switch -c $NewBranch $PrevBranch
    foreach ($h in ($Commits -split ',')) {
      $h = $h.Trim(); if (-not $h) { continue }
      Write-Host "cherry-pick $h"
      git cherry-pick $h
    }
    git switch $cur
    Write-Host "完成：備份分支 $NewBranch 已建立並 cherry-pick 該週 commit；已切回 $cur。"
  }
}
