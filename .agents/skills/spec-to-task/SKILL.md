---
name: "spec-to-task"
description: >
  spec-to-task（v2）：把單一需求一條龍從 spec.md 一路做到 tasks.md 的全自動協調器，
  中途不詢問、不中斷，串接 specify → clarify → checklist → plan → tasks → analyze 六個 speckit 階段。
  clarify 的所有問題由你自動評估最佳解並寫回 spec.md，全程不向使用者提問。
  所有產出文件除英文專有標題（FR、User Story…）外一律繁體中文，且每份文件頂部都要有「## 目錄」。
  觸發語：「spec-to-task / spec 一次做到 task / 從需求一條龍產生 spec plan task /
  自動跑完 speckit 全流程不要問我 / 一次把規格到任務做好 / specify 到 analyze 全自動」。
  使用者丟「單一」需求、要求不中斷一次產出整套規格與任務時使用；
  「多條」需求的批次分類更新請改用 /speckit-update。
argument-hint: "用一句到一段話描述你要規格化的單一功能需求"
compatibility: "需要 spec-kit 專案結構（.specify/ 與 specs/）"
user-invocable: true
disable-model-invocation: false
---

## 目錄

- [目的（為什麼這樣設計）](#目的為什麼這樣設計)
- [鐵則（先讀，貫穿全程）](#鐵則先讀貫穿全程)
- [文件格式規範（每份產出都套用）](#文件格式規範每份產出都套用)
- [執行流程（六階段，依序不中斷）](#執行流程六階段依序不中斷)
  - [階段 1：specify — 產生 spec.md](#階段-1specify--產生-specmd)
  - [階段 2：clarify — 自動釐清並寫回 spec.md](#階段-2clarify--自動釐清並寫回-specmd)
  - [階段 3：checklist — 比對 FR 是否吻合](#階段-3checklist--比對-fr-是否吻合)
  - [階段 4：plan — 產生 plan.md](#階段-4plan--產生-planmd)
  - [階段 5：tasks — 產生 tasks.md](#階段-5tasks--產生-tasksmd)
  - [階段 6：analyze — 覆蓋核對 FR↔task](#階段-6analyze--覆蓋核對-frtask)
- [收尾報告](#收尾報告)

---

## 目的（為什麼這樣設計）

預設的 speckit 管線會在 clarify 階段停下來逐題問使用者，這對「我已經想清楚、只想要一份完整規格與任務」
的情境是多餘的中斷。本 skill 把 **specify → clarify → checklist → plan → tasks → analyze** 串成一條龍：
每一階段沿用既有 `speckit-*` skill 的方法論，但**改寫掉它們「向使用者提問」的行為**，改由你依需求脈絡、
產業慣例與本專案既有規格自動選最佳解，並把決策直接寫回文件。這樣使用者一次發話就能拿到可審閱的整套
spec／plan／tasks，省去六次來回。

把「方法論」留在各 `speckit-*` skill（漸進式揭露，避免在此重複數百行），本檔只負責**串接順序**與
**全自動的覆寫規則**。**不修改 speckit 本身的任何文檔**——所有覆寫只存在於本流程的執行約定中。

---

## 鐵則（先讀，貫穿全程）

這些是不可商量的硬約束，違反會讓本 skill 失去存在意義：

- **全程不提問、不中斷**：任何階段冒出「該問使用者」的點（NEEDS CLARIFICATION 標記、clarify 問題、
  plan 的技術抉擇），一律**自己做決定**。把你選的答案與「為什麼選它」寫進對應文件，不要停下來等回覆。
- **單一需求、單一 feature**：本流程只處理一條需求、只在一個 `specs/NNN-*` 目錄內運作。多條需求請改用
  `/speckit-update`。
- **依序跑滿六階段**：specify → clarify → checklist → plan → tasks → analyze，前一階段產物是後一階段輸入，
  不可跳階段、不可提前收工。
- **沿用既有 skill 的方法論**：各階段的「怎麼做」以對應 `speckit-*` skill 為準（見下方各階段引用），
  本檔只下達覆寫指令，不複製其內文。

---

## 文件格式規範（每份產出都套用）

spec.md、plan.md、tasks.md、checklist、analyze 報告，**每一份**都必須符合：

- **語言**：除英文專有標題與術語（`FR`、`NFR`、`User Story`、`Priority`、`P1`、`Acceptance`…）外，
  **所有內文一律繁體中文**。不要用簡體、不要整段英文。
- **頂部必有「## 目錄」**：放在頂部說明段之後、第一個實質章節之前。依該檔實際 Markdown 標題
  （`##` / `###` / `####` …）逐層產生條列式目錄，層級不截斷；每條 `-` 開頭、每層縮排 2 空白、
  以 `[標題](#錨點)` 連到同檔。
- **目錄條目要「精要說明」**：每個目錄條目除標題外，補一句該章節重點，或該章節的 check 項目數量。
  範例：`- [User Story 1 - 新增第一份創稿並選擇公文格式 (Priority: P1)](#...) — 首次進入空白編輯區、選格式後落筆`
  或 `- [內容品質檢核](#...) — 共 4 項`。
- **plan.md 另需「## 技術樹（心智圖）」**：緊接目錄之後，同時給 Mermaid `mindmap` 與條列式 fallback
  （兩者內容一致），只列本功能用到的技術，葉節點寫具體名稱與版本（未定標 `TBD`）。
- 細節對齊 [[feedback-speckit-doc-format]] 與 `.specify/templates/` 既有模板，不要破壞模板既有區塊。

---

## 執行流程（六階段，依序不中斷）

> 開跑前先把使用者的需求敘述當作 specify 的輸入。全程只在「收尾報告」時與使用者對話一次。

### 階段 1：specify — 產生 spec.md

依 `speckit-specify` 的方法論建立 feature 目錄與 `spec.md`，但覆寫如下：

- **至少 3～6 條 User Story**（含 Priority P1/P2…），充分覆蓋需求面向，確認需求規格輪廓。
- **不得殘留 `[NEEDS CLARIFICATION]`**：specify 流程允許最多 3 個標記，本流程改為**全部當場自填**——
  依需求脈絡與本專案既有 spec 慣例做有依據的最佳猜測，把決定寫進 Assumptions，不留待 clarify。
- 套用上方「文件格式規範」（繁中＋目錄）。

### 階段 2：clarify — 自動釐清並寫回 spec.md

依 `speckit-clarify` 的方法論掃出規格中模糊／未定之處，但覆寫其「逐題問使用者」行為：

- 對每個本會提問的點，**自己評估最佳解**（衡量需求脈絡、產業慣例、本專案既有格式與最小驚訝原則），
  選定後**直接把答案編碼寫回 `spec.md`** 對應章節，並在該處或 Assumptions 標明選了什麼、為什麼。
- 完全不向使用者提問、不等待回覆。寫回後同步更新 spec 的目錄。

### 階段 3：checklist — 比對 FR 是否吻合

依 `speckit-checklist` 的方法論，針對「需求書寫品質」產生檢核清單（注意：checklist 是 FR 的「單元測試」，
驗的是需求寫得清不清楚、完不完整，不是驗程式行為）：

- 逐項比對當前 `spec.md` 的 **FR** 是否吻合、可測試、無歧義、邊界明確。
- 發現不吻合或缺漏，**當場回頭修 `spec.md`** 補齊，再重核到通過，不停下詢問。
- checklist 檔本身也套用繁中＋目錄（目錄精要可標各分類的 check 項目數量）。

### 階段 4：plan — 產生 plan.md

依 `speckit-plan` 的方法論，詳讀已定稿的 `spec.md` 與 checklist 後產出 `plan.md`：

- 技術抉擇有多種合理解時**自己拍板**並寫明理由，不要停下來問。
- 必含「## 目錄」與「## 技術樹（心智圖）」（見文件格式規範）。

### 階段 5：tasks — 產生 tasks.md

依 `speckit-tasks` 的方法論，詳閱所有既有文件（spec／checklist／plan）後建立 `tasks.md`：

- 任務需可對應回 FR，顆粒度可執行、可驗收。
- 套用繁中＋目錄（目錄精要可標各任務群組的任務數量）。

### 階段 6：analyze — 覆蓋核對 FR↔task

依 `speckit-analyze` 的方法論，跨文件一致性核對：

- 逐條確認每個 **FR 都有對應 task 覆蓋**，且無孤兒任務、無相互矛盾。
- 有缺口就**回補對應文件**（多半是 `tasks.md`，必要時回溯 spec/plan）直到完全覆蓋，全程不詢問。
- 產出的 analyze 報告同樣繁中＋目錄。

---

## 收尾報告

六階段跑完後，一次性向使用者回報（這是全程唯一一次對話）：

1. feature 目錄路徑，以及 `spec.md` / `plan.md` / `tasks.md`（與 checklist、analyze 報告）位置。
2. clarify 階段你**自動做了哪些關鍵決策、各自的理由**（讓使用者能快速覆核）。
3. checklist 與 analyze 的結論：FR 是否全數覆蓋、有無殘留風險。
4. 依專案規範評估是否需更新 `skills/SKILLS_INDEX.md` 或相關 SKILL.md。
