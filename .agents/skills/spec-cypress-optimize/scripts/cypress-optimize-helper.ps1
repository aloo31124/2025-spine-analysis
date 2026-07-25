<#
.SYNOPSIS
  cypress-test-optimize 的輔助工具：把「找最新清單、抽出 ⬜ 待補項、列既有 cy 檔」這類
  機械性盤點交給 script，讓 agent 專注於「怎麼把這條情境寫成穩定的 Cypress」。

.DESCRIPTION
  模式：
    pending  找出最新一份 .claude/skills/spec-cypress-checklist/checklist/*_測試步驟清單.md，
             逐 spec 區塊抽出所有 ⬜（待補、可自動化）列，並印出每 spec 的 ⬜ 數量小計。
             找不到清單時提示先跑 /spec-cypress-checklist。
    specs    列出 Frontend/cypress/e2e 既有 *.cy.ts（供判斷該擴充既有檔或新建）。

.EXAMPLE
  pwsh cypress-optimize-helper.ps1 -Mode pending
  pwsh cypress-optimize-helper.ps1 -Mode specs
#>
param(
  [ValidateSet('pending', 'specs')]
  [string]$Mode = 'pending',
  [string]$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..\..\..')).Path
)

$ErrorActionPreference = 'Stop'
$checklistDir = Join-Path $RepoRoot '.claude\skills\spec-cypress-checklist\checklist'
$e2eDir = Join-Path $RepoRoot 'Frontend\cypress\e2e'

if ($Mode -eq 'specs') {
  Write-Output "## Frontend/cypress/e2e 既有 spec 檔"
  if (-not (Test-Path $e2eDir)) { Write-Output "（找不到 $e2eDir）"; return }
  Get-ChildItem $e2eDir -Filter '*.cy.ts' | Sort-Object Name | ForEach-Object {
    Write-Output ("- {0}" -f $_.Name)
  }
  return
}

# pending
if (-not (Test-Path $checklistDir)) {
  Write-Output "（尚無 checklist 目錄，請先執行 /spec-cypress-checklist 產生測試步驟清單）"
  return
}
$latest = Get-ChildItem $checklistDir -Filter '*_測試步驟清單.md' |
  Sort-Object Name -Descending | Select-Object -First 1
if (-not $latest) {
  Write-Output "（checklist 目錄無清單檔，請先執行 /spec-cypress-checklist）"
  return
}

Write-Output "## 最新清單：$($latest.Name)"
Write-Output ""
$lines = Get-Content $latest.FullName
$curSpec = ''
$specPending = [ordered]@{}
$rows = New-Object System.Collections.Generic.List[string]
foreach ($ln in $lines) {
  if ($ln -match '^##\s+(spec\s+\S.*)$') {
    $curSpec = $Matches[1].Trim()
    continue
  }
  # ⬜ 列（markdown 表列）；僅計入已進入某 spec 區塊者，排除頂端總覽表
  if ($curSpec -and $ln -match '⬜' -and $ln -match '^\s*\|') {
    if (-not $specPending.Contains($curSpec)) { $specPending[$curSpec] = 0 }
    $specPending[$curSpec]++
    # 欄位：['', #, 操作, 對應, 狀態, 落點, '']；取操作(2)與落點(5)
    $cells = ($ln -split '\|') | ForEach-Object { $_.Trim() }
    $desc = if ($cells.Count -ge 3) { $cells[2] } else { $ln.Trim() }
    $落點 = if ($cells.Count -ge 6) { $cells[5] } else { '' }
    $rows.Add(("  - [{0}] {1}  → {2}" -f $curSpec, $desc, $落點))
  }
}

if ($specPending.Count -eq 0) {
  Write-Output "🎉 此清單已無 ⬜ 待補（可自動化）項。"
  return
}

Write-Output "### 各 spec ⬜ 待補數量"
foreach ($k in $specPending.Keys) {
  Write-Output ("- {0}：{1} 條" -f $k, $specPending[$k])
}
Write-Output ""
Write-Output ("### ⬜ 待補明細（共 {0} 條）" -f $rows.Count)
$rows | ForEach-Object { Write-Output $_ }
Write-Output ""
Write-Output "> 一次挑「一個 spec」落地：寫/擴充對應 .cy.ts → 跑綠 → 回填清單將 ⬜ 改 ✅ → commit。"
