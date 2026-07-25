---
name: spec-cypress-checklist
description: >
  定期盤點 specs/ 下所有 spec.md 與 quickstart.md，比對 Frontend/cypress/e2e 既有 E2E 覆蓋，
  產出一份「測試步驟清單」——把每條 Acceptance Scenario / Success Criteria 標記為
  ✅已覆蓋 / ⬜待補（可自動化） / 🚫不可自動化（OA 實機、視覺回歸），用於優化與擴充 Cypress。
  使用本 skill 的時機：使用者說「產生測試步驟清單 / 盤點 spec 測試覆蓋 / 檢視 cypress 缺口 /
  spec-cypress-checklist / 哪些 spec 還沒寫 E2E / 更新測試清單 / 定期檢視測試文件」，
  或一輪 spec/quickstart 補件後要盤點該補哪些 Cypress 測試時。
  關鍵字：測試步驟清單、cypress 覆蓋、E2E 盤點、quickstart、Acceptance Scenario、Success Criteria、
  spec-cypress-checklist、測試缺口、覆蓋率、待補測試、不可自動化、OA 實機。
---

## 目的（為什麼）

spec.md 的 Acceptance Scenario / Success Criteria 是「驗收意圖」，Cypress 的 `it()` 是「驗收實作」。
兩者會漂移：新 spec 寫了卻沒補測試、quickstart 改了規範（如 spec 013 貼上端 2026-06-05 由白名單改強制純文字）
但舊測試還照舊規格、或某些驗收項本質上無法在瀏覽器自動化（OA ExtJS 實機、CSS 逐字斷行）。

本 skill 的價值是**定期把這份漂移顯影成一張可勾選的清單**：哪條已被 cypress 覆蓋、哪條可自動化但還沒寫、
哪條只能人工。它不是教怎麼寫 Cypress（那是 [frontend-cypress-e2e-testing](../../../skills/business-logic/frontend-cypress-e2e-testing/SKILL.md)），
而是回答「**接下來該補哪幾條測試、優先序為何**」。

「盤點哪些檔案存在、數幾條情境、列既有 it()」是機械題，**交給 [scripts/spec-cypress-helper.ps1](scripts/spec-cypress-helper.ps1)**；
「這條 it() 是否真的覆蓋那條 SC、缺的能不能自動化」是判斷題，**由你逐條推理**。

## 產出物

固定路徑 `.claude/skills/spec-cypress-checklist/checklist/{yyyymmdd}_測試步驟清單.md`（當日重跑覆寫同檔）。
每次重跑都是全量重生，可與前一份 diff 看缺口是否收斂。

## 執行流程

> 先跑 helper 拿全量盤點，再逐 spec 對照；不要憑記憶判斷覆蓋與否。

1. **盤點文件齊備度**：`helper -Mode inventory`。
   - 任何 spec 之 quickstart 為 ✗ → **先停下來**，提示「該 spec 缺 quickstart.md（手動驗收/Cypress 對照表），
     建議先補再納入清單」。quickstart 是 spec.md（意圖）與 cypress（實作）之間的橋；缺了就只能硬讀 spec 推步驟，品質不穩。

2. **盤點既有 Cypress 覆蓋**：`helper -Mode cypress`，取得每支 `*.cy.ts` 的 describe/context 與 it 標題清單。
   既有 it 標題多半已內嵌 FR/AC/SC 編號（如 `FR-012：…`、`AC2：…`），是對照的主要錨點。

3. **逐 spec 對照**（每份有 quickstart 的 spec）：
   - 讀該 spec 的 `quickstart.md`「手動驗收/Cypress 對照表」與 spec.md 的 Acceptance Scenarios / SC
     （需要原文時用 `helper -Mode scenarios -Spec NNN`）。
   - 把 quickstart 對照表的**每一列**（一個操作＋斷言＋對應 AS/SC）逐條判定狀態：
     - **✅已覆蓋** — 在第 2 步的 it 清單找得到對應驗收（標出 `檔名 › it 標題`）。
     - **⬜待補** — 可在瀏覽器自動化、但無對應 it。標出建議落點（哪支 .cy.ts 的哪個 context）。
     - **🚫不可自動化** — 標明原因類別：`OA 實機`（ExtJS/cpaper 雙向綁定，如 spec 006/013/014 之 FR-008/009、SC-004）、
       `視覺回歸`（CSS 逐字斷行/對齊落點，如 spec 003 SC-001~004）、`建置產物`（檔案數/IIFE 全域變數，如 spec 006 SC-001）。
       這類不灌進 cypress，改建議人工複驗或 Percy/檔案檢查。

4. **彙整清單**：依下方「清單格式」寫入產出檔；表頭放總覽（covered/待補/不可自動化 計數與粗估覆蓋率），
   其後逐 spec 一節。

5. **給待補項排優先序**：在檔末「## 下一步建議」用一句話排序——優先補
   **P1 User Story 且可自動化** 的待補項；🚫 項只列出供人工驗收，不計入「待補」。

6. **回報**：依專案規範回報「掃了幾份 spec、覆蓋率、最該先補的 3 條」，並附 git commit 區塊。

## 清單格式

```markdown
# 測試步驟清單（{yyyymmdd}）

| 總覽 | 數量 |
|------|-----:|
| spec 總數 / 有 quickstart | 14 / 14 |
| 對照列總數 | NN |
| ✅ 已覆蓋 | NN |
| ⬜ 待補（可自動化） | NN |
| 🚫 不可自動化 | NN |
| 粗估自動化覆蓋率 | 已覆蓋 ÷（已覆蓋＋待補） |

## spec 003 — 標點避頭尾／左右對齊
| # | 操作＋斷言（摘自 quickstart） | 對應 | 狀態 | 落點 / 原因 |
|---|------------------------------|------|------|-------------|
| 1 | `.ql-editor` text-align=justify、末行靠左 | SC-003 | ⬜ 待補 | punctuation-symbol.cy.ts 可加 context |
| 2 | 200 字逐字斷行落點 | SC-001 | 🚫 不可自動化 | 視覺回歸（建議 Percy） |
...
```

## 輔助工具

```powershell
# 文件齊備度 + 每份 spec 的 AS/SC/FR 數量
pwsh .claude/skills/spec-cypress-checklist/scripts/spec-cypress-helper.ps1 -Mode inventory
# 既有 cypress describe/context/it 清單
pwsh .claude/skills/spec-cypress-checklist/scripts/spec-cypress-helper.ps1 -Mode cypress
# 單一 spec 的 AS/SC 原文（對照斷言來源）
pwsh .claude/skills/spec-cypress-checklist/scripts/spec-cypress-helper.ps1 -Mode scenarios -Spec 013
```

## 邊界情況與原則

- **本 skill 不寫 cypress、不改程式碼**：只產出清單。實際撰寫測試時才切換到 frontend-cypress-e2e-testing，
  並沿用其選擇器策略（語意化 selector、`.ql-editor` 先 click 再 type）。
- **quickstart 是必要前置**：缺 quickstart 的 spec 先補再盤點；不要跳過 quickstart 直接從 spec.md 硬讀，
  那會重複 quickstart 已做的「意圖→步驟」轉譯，且品質不一致。
- **以 quickstart 的修訂版為準**：若 quickstart 標注了某條 spec 規範已作廢（如 spec 013 的貼上端修訂），
  以 quickstart 現況判定覆蓋，不要照已作廢的 spec.md 舊文。發現既有 cypress 仍測舊規範 → 標為「⬜ 待修正」。
- **🚫 不灌進覆蓋率分母**：自動化覆蓋率只算「可自動化」的母體；把 OA 實機/視覺回歸項算進去會永遠不滿分、失去意義。
- **編號錨點優先、語意其次**：對照時先用 it 標題裡的 FR/AC/SC 編號比對；找不到編號再以操作語意人工判斷，避免誤判已覆蓋。

完成後依 `skills/SKILLS_INDEX.md` 規範確認索引已含本 skill。
