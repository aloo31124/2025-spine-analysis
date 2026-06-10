---
name: spec-cypress-optimize
description: >
  依「最新一份測試步驟清單」（.claude/skills/spec-cypress-checklist/checklist/{yyyymmdd}_測試步驟清單.md）
  的 ⬜待補項，實際撰寫或擴充 Frontend/cypress/e2e 的 E2E 測試、跑到綠燈，再把清單對應列由 ⬜ 改 ✅。
  一次只落地「一個 spec、一個 commit」，沿用既有自訂指令與選擇器策略，不寫 🚫（OA 實機／視覺回歸／使用者明示不寫）項。
  使用本 skill 的時機：使用者說「優化 cypress 測試 / 依測試步驟清單補測試 / 實作待補的 E2E /
  spec-cypress-optimize / 把 spec 013 的待補測試寫一寫 / 提高 cypress 覆蓋率 / 補 cypress 缺口」，
  或在 spec-cypress-checklist 產出清單後要落地待補項時。
  關鍵字：cypress 優化、補測試、待補 E2E、測試步驟清單、覆蓋率、field-format-gating、keyboard-nav、
  chinese-ordered、spec-cypress-optimize、撰寫 cypress、回填清單、⬜ 改 ✅。
---

## 目的（為什麼）

`spec-cypress-checklist` 產出的是「診斷」——哪些情境 ⬜ 待補。本 skill 是「治療」——把待補項變成真的會跑、會綠的 Cypress 測試，
並把清單對應列由 ⬜ 改 ✅，讓「診斷 → 治療 → 複診」形成閉環。

它**不重新發明怎麼寫 Cypress**：撰寫手法（語意化選擇器、`.ql-editor` 先 click 再 type、自訂指令封裝、已知陷阱）
全部沿用 [frontend-cypress-e2e-testing](../../../skills/business-logic/frontend-cypress-e2e-testing/SKILL.md)；
本 skill 只負責**從清單挑題、落地、跑綠、回填**這條工作流。

「找最新清單、抽 ⬜ 項、列既有 .cy.ts」是機械題，**交給 [scripts/cypress-optimize-helper.ps1](scripts/cypress-optimize-helper.ps1)**；
「這條情境怎麼寫成穩定不 flaky 的測試、selector 取哪個」是判斷題，**由你逐條推理**。

## 為什麼一次只做一個 spec

E2E 測試容易 flaky，且 Quill／Modal／WC 互動的失敗常需逐一 debug。一次塞多個 spec 的測試進一個 commit，
紅燈時難以定位是哪支壞、回退也牽連無辜。**一個 spec ＝ 一支（或擴充一支）.cy.ts ＝ 一個 commit**，
可單獨跑、單獨回退，清單回填也與 commit 一一對應。

## 執行流程

1. **定位待補**：`helper -Mode pending`，取得最新清單檔名、各 spec 的 ⬜ 數量與明細（含建議落點檔）。
   - 若提示「尚無 checklist」→ 先請使用者跑 `/spec-cypress-checklist`，本 skill 不憑空盤點。

2. **挑一個 spec**：預設依清單末尾「## 下一步建議」的優先序（P1 且可自動化者優先）。
   使用者若指定某 spec（如「補 spec 013」）則以使用者為準。**一次一個**。

3. **讀來源**：該 spec 的 `quickstart.md`「手動驗收/Cypress 對照表」（步驟＋斷言＋對應 FR/SC）＋ spec.md 的 Acceptance Scenarios。
   需要斷言原文時用 `spec-cypress-helper.ps1 -Mode scenarios -Spec NNN`。
   - **以 quickstart 的修訂版為準**：若 quickstart 標注某條 spec 規範已作廢（如 spec 013 貼上端 2026-06-05 改強制純文字），
     照 quickstart 現況寫，不照 spec.md 舊文。

4. **決定落點**：`helper -Mode specs` 看既有 .cy.ts。
   - 既有檔已涵蓋該 spec context（如 spec 005 之於 `document-creation.cy.ts`）→ **在該檔加 `it` / context**，不另開檔。
   - 該 spec 尚無對應檔 → 新建 `cypress/e2e/{語意名}.cy.ts`（如 `field-format-gating.cy.ts`、`keyboard-nav.cy.ts`、`chinese-ordered.cy.ts`）。
   - `context` 對應一條 FR/SC 或一個 User Story；`it` 標題嵌入編號（如 `SC-002：…`）以利下次清單比對錨點。

5. **沿用既有資產，不重造**（`cypress/support/commands.ts`）：
   - `cy.createDraft(label)`、`cy.typeInField(field, text)`、`cy.readField(field)`、`cy.clickToolbarButton(title)`、`cy.openNewDraftModal()`。
   - 選擇器策略沿用語意化 selector（`button[title="…"]`、`.ql-editor`、`.draft-chip` 等）；
     某元素無語意 selector 且測試必須定位時，才於元件補 `data-*` 並在元件註解標「供 E2E 測試使用」，避免下次重構誤刪。

6. **跑綠**：`cd Frontend; npm run test:e2e`（CI 式：自動起 dev → 等 4200 → 跑 → 收）；
   開發中可 `npm run dev` 一終端 + `npm run cypress:open` 另一終端逐案 debug。
   **紅燈先修不前進**：是測試寫法 flaky 就改測試；若揭露真實 bug，回報使用者決定（修碼或標記），不硬改測試讓它假綠。

7. **回填清單**：把這批已綠的列在最新清單中由 `⬜` 改 `✅`，於「落點」欄標 `檔名 › it 標題` 錨點，
   並更新頂端總覽計數與覆蓋率。（清單是活文件，反映當前真實覆蓋。）

8. **回報＋commit**：回報「補了哪個 spec、新增幾條 it、覆蓋率變化」，附 git commit 區塊（`[test] #755 …`）。

## 不碰的項（🚫）

清單標 🚫 者一律不寫 cypress：
- **OA 實機**（ExtJS↔iframe↔cpaper 雙向綁定，如 spec 006/008/013/014 之 SC-004 等）→ 留人工複驗。
- **視覺回歸**（CSS 逐字斷行／對齊落點，spec 003 SC-001~004）→ 建議 Percy／目視，非 DOM 斷言。
- **建置產物**（產物檔數、IIFE 全域變數，spec 006 SC-001）→ 檔案／載入檢查，非瀏覽器。
- **使用者明示不寫**（spec 010、011，改 Vitest）→ 尊重既定決策，勿違反。

把這些灌進 cypress 只會製造 flaky 或永遠失敗的測試，且違反清單已定義的覆蓋率分母。

## 撰寫要點（沿用，不重述細節）

- **Quill 一律先 `.click()` 再 `.type()`**：`selection-change` 需明確焦點，直接 type 偶爾失焦。
- **貼上類斷言（spec 002/013）**：以 `DataTransfer` + `dispatchEvent(new ClipboardEvent('paste', …))` 模擬，
  同時設 `text/html` 與 `text/plain`；驗證結果用純文字／DOM 結構（`ol` 不存在、`[style*="background"]` 不存在），不比對 Quill 內部 HTML。
- **卡控類斷言（spec 013）**：點按鈕後驗證**沒有**發生格式（`ol` 不存在、無 `indent` class），而非驗證按鈕狀態。
- **鍵盤類（spec 012）**：用 `.type('{enter}')` / `{backspace}` / `{upArrow}`；IME 需 `compositionstart/end` 模擬。
- **WC 類（spec 006/007 雙實例）**：需 `cypress/fixtures` 放 host HTML（引入 dist 產物），`cy.visit` 該頁；前提是已 `npm run build:wc`。

## 輔助工具

```powershell
# 最新清單的 ⬜ 待補項（各 spec 小計 + 明細 + 建議落點）
pwsh .claude/skills/spec-cypress-optimize/scripts/cypress-optimize-helper.ps1 -Mode pending
# 既有 cypress/e2e 檔清單（判斷擴充既有或新建）
pwsh .claude/skills/spec-cypress-optimize/scripts/cypress-optimize-helper.ps1 -Mode specs
# 斷言原文（沿用 spec-cypress-checklist 的 helper）
pwsh .claude/skills/spec-cypress-checklist/scripts/spec-cypress-helper.ps1 -Mode scenarios -Spec 013
```

## 與相鄰 skill 的關係

- **上游** `spec-cypress-checklist`：產清單；本 skill 消費清單並回填。清單不存在時先跑它。
- **撰寫規範** `frontend-cypress-e2e-testing`：選擇器／自訂指令／已知陷阱的權威來源；本 skill 不重複，遇衝突以該文件為準。
- 完成後依 `skills/SKILLS_INDEX.md` 確認索引含本 skill。
