2026-05-29 14:00:00

## git commit
[feature] #755 [公文製作] 新增上方選單「符號」icon 與標點符號水平選擇 bar，串接舊專案 cpaper 雙向綁定。

- Frontend `EditorToolbar.vue`：中文編號與縮排之間插入新「符號」按鈕（`bi-chat-square-quote` + `title`/`aria-label="符號"` + `aria-haspopup` + `aria-expanded`），新增 3 個 emit（`toggle-symbol-bar` / `insert-symbol { char }` / `close-symbol-bar`）；展開符號 bar 時自動收合螢光筆 bar（同時間僅一條 bar）。
- Frontend `PunctuationSymbolBar.vue`（新增）：W3C ARIA Toolbar Pattern + roving tabindex（71 項）+ `useClickOutside` 收合；首位「關閉」+ 70 個符號項目 + 5 個 group 分隔線；`Esc` / 外部點擊 emit `request-close`；視覺與 `HighlighterBar.vue` 範式對齊。
- Frontend `styles/punctuationSymbolList.ts`（新增）：70 個 `PunctuationSymbolEntry` 常數陣列，逐字元等同 `Frontend-old/oa/app/controller/Work.js:7369` `action='symbol'` 字串 + `:7387` 原住民羅馬字段（去除 `、` 視覺分隔）。
- Frontend `DocumentBody.vue`：新增 `insertSymbol(char)` 方法（`getSelection` → `deleteText`（如有 selection）→ `insertText` → `setSelection` 校正游標）；對主旨 / 說明 / 擬辦純文字 Quill 與說明區塊 Quill 一視同仁適用（符號為文字字元、非格式屬性）；defineExpose 對外揭露。


## prompt 1
標點符號新舊專案串接speckit規劃。 

/speckit-specify

### 概述
請先詳細參考 舊專案 Frontend-old  [上方選單] 的符號icon 之
所有 [標點符號]，後續只以此為準。
在新專案 Frontend 上方選單創建 符號icon。
下方會產生與螢光筆相同的 [水平選擇bar] 可選擇符號，
選擇後，
可在 [文稿編輯區]  產生全型符號的效果。
並可與 舊專案 Frontend-old [符號] 文字 [雙向綁定]。

## prompt 1 response
Tasks 完成回報:

輸出檔：specs/009-punctuation-symbol-bar/tasks.md
總任務數：37 項（T001-T037）
各 user story 拆解：
Setup（T001-T002）：2 項
Foundational（T003-T005）：3 項
US1（T006-T016）：11 項 — MVP，含 9 implementation + 2 unit test
US2（T017-T021）：5 項（含 PaperNew.js 勘查 / 字串一致性 / round-trip E2E）
US3（T022-T026）：5 項（3 個 .ce.vue 平行 + build:wc + 多實例 E2E）
US4（T027-T031）：5 項（鍵盤 / a11y 單元 + E2E）
Polish（T032-T037）：6 項（全測 / build:wc / quickstart 手動 / skill 文件 / commit）
平行機會：Phase 2 全平行、各 US 內測試任務多平行、Phase 5 三個 .ce.vue 並行、Phase 7 三條建置指令並行
各 story 獨立驗收標準皆於 tasks.md 對應 phase 開頭明列 "Independent Test"
格式驗證：✅ 所有任務皆遵循 - [ ] T### [P?] [USx?] 描述 + 檔案路徑 規範
MVP 建議範圍：Phase 1 + Phase 2 + Phase 3（T001-T016）即可獨立交付符號 bar 插入功能至 dev server 完整版 toolbar。

是否要繼續執行 /speckit.implement？（y/n）

## prompt 2
y





