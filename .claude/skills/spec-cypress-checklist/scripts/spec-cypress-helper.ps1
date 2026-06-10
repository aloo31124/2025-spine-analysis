<#
.SYNOPSIS
  spec-cypress-checklist 的盤點輔助工具：把「機械性、易算錯」的盤點交給 script，
  讓 agent 專注於判斷題（哪條情境該寫成 Cypress、覆蓋了沒、能不能自動化）。

.DESCRIPTION
  三種模式：
    inventory  逐一掃描 specs/*/，回報文件齊備度與每份 spec 的
               Acceptance Scenario / SC / FR 數量（markdown 表）。
    cypress    掃描 Frontend/cypress/e2e/*.cy.ts，抽出 describe/context/it 標題與數量。
    scenarios  針對單一 spec（-Spec 003）逐條印出 Acceptance Scenario 與 SC 原文，
               供 agent 對照 quickstart 與 cypress 既有覆蓋。

.EXAMPLE
  pwsh spec-cypress-helper.ps1 -Mode inventory
  pwsh spec-cypress-helper.ps1 -Mode cypress
  pwsh spec-cypress-helper.ps1 -Mode scenarios -Spec 013
#>
param(
  [ValidateSet('inventory', 'cypress', 'scenarios')]
  [string]$Mode = 'inventory',
  [string]$Spec,
  # 專案根：預設為腳本所在往上 4 層（.claude/skills/spec-cypress-checklist/scripts → repo root）
  [string]$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..\..\..')).Path
)

$ErrorActionPreference = 'Stop'
$specsDir = Join-Path $RepoRoot 'specs'
$cypressDir = Join-Path $RepoRoot 'Frontend\cypress\e2e'

function Count-Pattern([string]$text, [string]$pattern) {
  if (-not $text) { return 0 }
  ([regex]::Matches($text, $pattern)).Count
}

function Count-DistinctIds([string]$text, [string]$pattern) {
  if (-not $text) { return 0 }
  ([regex]::Matches($text, $pattern) | ForEach-Object { $_.Value } | Sort-Object -Unique).Count
}

if ($Mode -eq 'inventory') {
  Write-Output "## Spec 文件齊備度與情境數量"
  Write-Output ""
  Write-Output "| spec | spec | quickstart | plan | tasks | AS | SC | FR |"
  Write-Output "|------|:----:|:----------:|:----:|:-----:|:--:|:--:|:--:|"
  Get-ChildItem -Path $specsDir -Directory | Sort-Object Name | ForEach-Object {
    $d = $_.FullName
    $name = $_.Name
    $hasSpec = Test-Path (Join-Path $d 'spec.md')
    $hasQs = Test-Path (Join-Path $d 'quickstart.md')
    $hasPlan = Test-Path (Join-Path $d 'plan.md')
    $hasTasks = Test-Path (Join-Path $d 'tasks.md')
    $specText = if ($hasSpec) { Get-Content (Join-Path $d 'spec.md') -Raw } else { '' }
    # AS 以 "**Then**" 出現次數估算；SC / FR 以 distinct id 計
    $as = Count-Pattern $specText '\*\*Then\*\*'
    $sc = Count-DistinctIds $specText 'SC-\d+'
    $fr = Count-DistinctIds $specText 'FR-\d+'
    $m = { param($b) if ($b) { '✓' } else { '✗' } }
    Write-Output ("| {0} | {1} | {2} | {3} | {4} | {5} | {6} | {7} |" -f `
        $name, (& $m $hasSpec), (& $m $hasQs), (& $m $hasPlan), (& $m $hasTasks), $as, $sc, $fr)
  }
  Write-Output ""
  Write-Output "> AS=Acceptance Scenario（以 **Then** 計）、SC=Success Criteria、FR=Functional Requirement。"
  Write-Output "> quickstart 為 ✗ 者：請先補 quickstart.md（手動驗收/Cypress 對照表）再納入測試步驟清單。"
  return
}

if ($Mode -eq 'cypress') {
  Write-Output "## Cypress 既有覆蓋（Frontend/cypress/e2e）"
  Write-Output ""
  if (-not (Test-Path $cypressDir)) {
    Write-Output "（找不到 $cypressDir）"
    return
  }
  Get-ChildItem -Path $cypressDir -Filter '*.cy.ts' | Sort-Object Name | ForEach-Object {
    $txt = Get-Content $_.FullName -Raw
    $describes = [regex]::Matches($txt, "(?:describe|context)\s*\(\s*['""``]([^'""``]+)") | ForEach-Object { $_.Groups[1].Value }
    $its = [regex]::Matches($txt, "\bit\s*\(\s*['""``]([^'""``]+)") | ForEach-Object { $_.Groups[1].Value }
    Write-Output ("### {0}  （describe/context {1} 組、it {2} 條）" -f $_.Name, $describes.Count, $its.Count)
    foreach ($dsc in $describes) { Write-Output "  - [context] $dsc" }
    foreach ($i in $its) { Write-Output "    - it: $i" }
    Write-Output ""
  }
  return
}

if ($Mode -eq 'scenarios') {
  if (-not $Spec) { throw "scenarios 模式需指定 -Spec（如 -Spec 013）" }
  $dir = Get-ChildItem -Path $specsDir -Directory | Where-Object { $_.Name -like "$Spec*" } | Select-Object -First 1
  if (-not $dir) { throw "找不到 spec 目錄符合 '$Spec*'" }
  $specFile = Join-Path $dir.FullName 'spec.md'
  Write-Output "## $($dir.Name) — Acceptance Scenarios 與 Success Criteria 原文"
  Write-Output ""
  $lines = Get-Content $specFile
  $emit = $false
  foreach ($ln in $lines) {
    if ($ln -match '^\s*\d+\.\s+\*\*Given\*\*' -or $ln -match '^\s*-\s+\*\*SC-\d+\*\*' -or $ln -match '\*\*SC-\d+\*\*') {
      Write-Output $ln.Trim()
    }
  }
  Write-Output ""
  Write-Output "> 以上為斷言來源；對照對應 quickstart.md 之『手動驗收/Cypress 對照表』判斷覆蓋狀態。"
  return
}
