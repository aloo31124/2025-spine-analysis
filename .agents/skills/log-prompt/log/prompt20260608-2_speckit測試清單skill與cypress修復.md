2026-06-08 14:55:00

## git commit

本次對話依序產生 8 筆 commit（speckit 補件 → 建兩支 skill → 修 cypress 三輪）：

```
[docs] #755 [speckit] 補齊 spec 003/004/005/006/013/014 之 quickstart.md（作為 Cypress 測試步驟參考）
[feature] #755 [skill] 新增 spec-cypress-checklist：定期盤點 spec/quickstart 產出測試步驟清單以優化 Cypress
[docs] #755 [skill] spec-cypress-checklist 首跑：產出 20260608 測試步驟清單（14 spec × 64 it 對照）
[feature] #755 [skill] 新增 spec-cypress-optimize：依測試步驟清單落地 Cypress 待補測試
[test] #755 [cypress] 修正 spec 007/008/009 E2E 選擇器漂移（.desc-area-section → .desc-editor-area）
[test] #755 [cypress] 診斷並修正 document-creation 6 紅（過時按鈕/預設狀態/暴露真 bug）
[fix] #755 [文稿編輯區] 新增創稿前先快照當前創稿內容，修復切換後原稿遺失（R-004/FR-014）
[test] #755 [cypress] 對齊 spec 010 bar 新行為，修正 highlighter/punctuation/underline 10 紅
```

- 產出物：6 份 quickstart.md、2 支 skill（spec-cypress-checklist / spec-cypress-optimize）+ 各自 helper、1 份測試步驟清單、cypress 三輪修正、1 處產品 bug 修復。
- cypress 覆蓋率：48% → 84% →（修完 bar 行為）預期 100%（待本機複跑）。

## prompt 1
speckit 哪份文件適合作為 測試步驟清單?

## prompt 1 response
- 結論：可勾選的測試「執行項目」→ `tasks.md`（checkbox 形式）；完整「手動驗收／操作走查」步驟 → `quickstart.md`。
- 點出專案慣例：tasks.md 以 SC 手動量測驗收；並提醒 spec 003/004/005/006 當時尚無 quickstart。

## prompt 2
後續用於製作 cypress 測試步驟的參考文件

## prompt 2 response
- 推薦組合：① 主要 `spec.md` 的 User Story + Acceptance Scenarios（Given/When/Then→describe/it）；② 判定 `spec.md` 的 Success Criteria（SC→斷言）；③ 步驟細節 `quickstart.md`；④ 範圍勾稽 `tasks.md`。
- 提醒 selector/DOM 需回元件原始碼補（speckit 文件無），quickstart 多數 spec 未產出需補。

## prompt 3
先補上所有 quickstart.md

## prompt 3 response
- 盤點：缺 quickstart 的有 6 份（003/004/005/006/013/014）。
- 依既有範本逐一補齊，重點做成「可轉 Cypress 的對照表」：操作→斷言→對應 AS/SC 三欄 + Cypress 撰寫提示 + selector 基準；誠實標示不可自動化項（視覺回歸/OA 實機）。
- spec 013 以 2026-06-05 修訂（三欄強制純文字貼上）為準，標註 spec.md 舊規範作廢。

## prompt 4
依照上述的規劃，產生一個 skill，定期檢視所有 spec 上述提到的相關文件，
產生一份測試步驟的清單，用於優化 cypress

## prompt 4 response
- 新增 skill `spec-cypress-checklist`（SKILL.md + scripts/spec-cypress-helper.ps1 三模式 inventory/cypress/scenarios，已實測）。
- 定位：診斷工具——掃 spec.md+quickstart.md 對照既有 cypress，逐條標 ✅已覆蓋/⬜待補/🚫不可自動化，產出固定路徑日期檔。
- 遵循 skills 6 原則（確定性交給 script、與 frontend-cypress-e2e-testing 分工、quickstart 修訂版優先、🚫 不計入覆蓋率分母）；同步更新 SKILLS_INDEX.md。

## prompt 5
/spec-cypress-checklist

## prompt 5 response
- 首跑：14 份 spec 全有 quickstart；對照既有 4 支 cypress、64 條 it。
- 產出 `.claude/skills/spec-cypress-checklist/checklist/20260608_測試步驟清單.md`：87 列 → ✅37 / ⬜30 / 🚫20，粗估自動化覆蓋率約 55%。
- 最該先補：spec 013 卡控、spec 012 鍵盤、spec 002 中文編號（P1 且可自動化）。

## prompt 6
產生一分 skills ，
參考
.claude\skills\spec-cypress-checklist\checklist\20260608_測試步驟清單.md
最新的 測試步驟後，
優化
Frontend\cypress 的測試步驟

## prompt 6 response
- 新增 skill `spec-cypress-optimize`（治療端：讀最新清單 ⬜ → 一次一個 spec 寫/擴充 .cy.ts → 跑綠 → 回填 ⬜→✅ → commit）。
- helper `cypress-optimize-helper.ps1`（pending 抽 ⬜ 並小計 / specs 列既有 .cy.ts），已修兩瑕疵（誤抓總覽、落點欄索引）後實測抓出 30 條。
- 三 skill 閉環：checklist 診斷 → optimize 治療 → frontend-cypress-e2e-testing 規範；同步更新 SKILLS_INDEX.md。

## prompt 7
/spec-cypress-optimize

## prompt 7 response
- 執行中讀今早報告 report_20260608_103502.md 發現既有 cypress 僅 48%（31/64），且清單 007/008/009 之 ✅ 為「假綠」。
- 根因：三支 bar-suite beforeEach 用了 App 不存在的 `.desc-area-section`（實際 `.desc-editor-area`，DocumentBody.vue:134）→ 24 skip+3 fail。
- 以 AskUserQuestion 詢問優先序，使用者選「先修選擇器漂移」→ 三檔共 14 處 `.desc-area-section`→`.desc-editor-area`；沙箱 Cypress 無法實跑，記入清單待本機驗證。

## prompt 8
2.先把 document-creation 的 6 紅一起診斷（多為同類漂移，可一併修）

## prompt 8 response
- 診斷 6 紅分三類：🗑 過時按鈕（#31 編號清單、#32 粗體字 已於 EditorToolbar.vue 註解隱藏）→ 刪測試；🔧 適配（#30 中文編號因說明區塊預設即帶中文清單而初始 active、#11 遮罩被 sticky 工具列覆蓋）→ 改測試（bottomLeft / 預設 active 切換）。
- 🐞 真 bug（#27 切換快照、#37 完整流程）：DocumentEditor.onModalConfirm 新增創稿時未先快照當前創稿內容即 addDraft，導致原稿遺失；測試正確，未動測試、回報待修產品碼。

## prompt 9
1.要，順手修掉（我改產品碼讓 #27/#37 應綠，但仍需你本機驗證）

## prompt 9 response
- 修產品碼：DocumentBody 新增並 defineExpose `saveCurrentFields()`（只存不切換，複用 collectCurrentFields）；DocumentEditor.onModalConfirm 於 addDraft 前先呼叫（首份創稿前無 active 則略過）。
- 驗證：DocumentBody 單元測試 14/14 綠、編譯正常；#27/#37 cypress 待本機複跑。
- 清單執行紀錄更新為「已修產品碼」。

## prompt 10
請依照錯誤報告
Frontend\cypress\report\report_20260608_143447.md
修正所有問題

## prompt 10 response
- 新報告 48%→83.87%（上輪修復生效），剩 10 紅。查元件確認全為「測試驗舊行為」：spec 010 需求2 已改 bar 為「選色/插入後不收合、點外不收合、兩 bar 可同時開啟（取消互斥）」，產品端正確無需改碼。
- 更新 10 條測試對齊：highlighter AC2/AC3/AC4/AC5/Edge、punctuation AC2/AC5/連續插入/互斥、underline AC3（部分選取改單一 type 鏈）；保留 Esc/關閉鈕之合法 not.exist 斷言。
- 沙箱 Cypress 仍無法實跑（cachedDataRejected），預期本機 62/62 全綠，待複跑確認。
