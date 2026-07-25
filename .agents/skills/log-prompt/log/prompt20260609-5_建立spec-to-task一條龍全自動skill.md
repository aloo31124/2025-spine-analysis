2026-06-09 17:23:56

## git commit
[refactor][speckit] #755 [spec-to-task] 新增 spec 一條龍到 task 全自動協調 skill（v2）。
- 將原本 speckit 所有文件復原 (specify init)。 
- 新增 .claude/skills/spec-to-task/SKILL.md：串接 specify→clarify→checklist→plan→tasks→analyze 六階段，全程不提問不中斷。
- clarify 與 spec 的 NEEDS CLARIFICATION 改由 agent 自評最佳解並寫回 spec.md。
- 規範所有產出文件繁中（除 FR 等英文標題）、每份頂部「## 目錄」（條目精要說明），plan.md 另加技術樹心智圖。
- 沿用既有 speckit-* skill 方法論，不修改 speckit 本身文檔；多需求導向 speckit-update。
- 於 skills/SKILLS_INDEX.md 新增對應索引條目。

## prompt 1
spec-to-task.v2之skill建立。

/skill-create

### 概述
請建立新 skill 引用多個 speckit 指令步驟，
從 spec.md 文檔製作一次到 task.md，
中間不詢問任何問題，不中斷，一次做好。
並且必須使用 [繁體中文]。

### 流程步驟 workflow
1.下指令 /spec-to-task ， 執行 spec
會依照該 prmpt 指令與相關參考資料，首先產生 spec.md 文件，至少 3~6 user story 確認需求規格。
2.執行一次 clarify ，明確規格的問答請自動評估選擇最佳解法，
並將該選擇撰寫回 spec.md 。
3.執行一次 checklist 比對當前文檔 FR 是否吻合。
4.執行一次 plan , 依照產生的 spec.md , checklist, 詳細檢視後產生一份 plan.md
5.執行一次 task , 詳細檢視所有文件 創建 task.md 。
6.執行一次 analyze , 比對 FR 是否吻合 task , 並明確覆蓋。

### 語言格式
所有文件除了標題使用英文(如：FR)
其他內容[must]必須使用 [繁體中文] 撰寫。
且所有文件都需要有目錄，
並且目錄精要說明該章節的內容，或 check項目數量。
例如：### User Story 1 - 新增第一份創稿並選擇公文格式 (Priority: P1)

### 修改方式
不要修改 speckit 本身的文檔，
將上述需求與 speckit 指令順序都整理在本skill文件中。

## prompt 1 response
- 先探查現有 speckit-* 技能（specify/clarify/checklist/plan/tasks/analyze）與 speckit-update 協調器結構，並讀 SKILLS_INDEX.md、feedback-speckit-doc-format 記憶（spec/plan 需目錄、plan 需技術樹）作為設計依據。
- 確認無既有 spec-to-task v1，決定建立資料夾名 `spec-to-task`（對應 `/spec-to-task` 命令、標題標 v2）。
- 新增 [.claude/skills/spec-to-task/SKILL.md](.claude/skills/spec-to-task/SKILL.md)：約 130 行協調器，僅下「串接順序＋全自動覆寫規則」，方法論留各 speckit-* skill（漸進式揭露），完全不改 speckit 本身文檔。
- 關鍵設計：六階段依序不中斷；覆寫 clarify 提問與 spec `[NEEDS CLARIFICATION]` 為 agent 自評最佳解並寫回文件；硬鐵則（不提問／單一 feature／六階段）用死板規則、其餘講理由；格式規範集中（繁中除英文標題＋每份頂部「## 目錄」含精要說明＋plan.md 技術樹心智圖）；與 speckit-update 明確區隔（單一 vs 多需求）。
- 於 [skills/SKILLS_INDEX.md](skills/SKILLS_INDEX.md) 新增索引條目（文檔路徑、適用情境、關鍵字），沿用既有條目風格。
- 末段附上符合規範的 git commit 區塊。

## prompt 2
/log-prompt（記錄本次對話）

## prompt 2 response
- Glob 當日 log 取得最大流水號 4，遞增為 5。
- 取系統時間 2026-06-09 17:23:56 作為時間戳。
- 寫出本檔 `.claude/skills/log-prompt/log/prompt20260609-5_建立spec-to-task一條龍全自動skill.md`，含 git commit、prompt 1 逐字與精要、prompt 2。
