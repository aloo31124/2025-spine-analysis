---
name: "speckit-update"
description: >
  一次承接「多個需求」的批次更新協調器：先建立暫存 local 分支 {issue號}-temp-{日期}，
  把每條需求依關鍵字分類到既有的 spec 功能（specs/NNN-*），再逐一對該功能執行
  spec → plan → tasks 更新、改程式碼、跑測試到通過、log-prompt 歸檔、commit 進暫存分支，
  完成一條再換下一條，直到所有需求做完。
  觸發語：「多需求更新 spec / 一次有好幾個需求要改 / 批次更新規格與程式碼 /
  speckit-update / 把這幾條需求分類後依序做 / 多筆需求 spec plan task 一起更新」。
  當使用者一口氣丟「多條」要改的需求、要求分類後依 speckit 流程逐條落地時使用；
  單一需求的全新功能請改用 /speckit.specify。
argument-hint: "貼上多條要修改的需求（每條一行），可附 issue 號"
compatibility: "需要 spec-kit 專案結構（.specify/ 與 specs/）"
user-invocable: true
disable-model-invocation: false
---

## 目的（為什麼這樣設計）

使用者一次給「多條」需求時，最容易壞在兩件事：**分類錯**（把屬於 A 功能的需求寫進 B 功能的 spec）
與**做一半失去可追溯性**（全部混成一坨 commit、出錯難回溯、暫存實驗污染正式分支）。

本 skill 把多需求拆成「**一條需求 = 一個完整 speckit 循環 = 一個 commit**」的小步快跑：
每條需求都先落到正確的 feature、走完 spec→plan→tasks→改碼→測試→歸檔→commit，才換下一條。
好處是任何一條出錯都能單獨回退、log 與 commit 一一對應、暫存分支可隨時丟棄不傷正式分支。

「需求該歸到哪個 feature、spec 該怎麼改」是**判斷題，交給你推理**；
「切暫存分支、列出既有 feature 與標題」是**機械題，交給**
[scripts/speckit-update-helper.ps1](scripts/speckit-update-helper.ps1)，避免日期／分支名／漏看 feature 的漂移。

---

## 名詞定義

- **issue 號**：本批需求對應的檔號（本專案慣例 `#755`）。未明示時由 helper 從近期 commit 主旨推測，**務必回報讓使用者確認**。
- **暫存分支**：`{issue號}-temp-{MMdd}` 的 **local** 分支，從目前 HEAD 切出。所有本批 commit 都進這條分支，**不 push**；用途是把實驗性批改與正式分支隔離，做壞了整條丟掉即可。
- **feature**：`specs/NNN-*` 一個目錄，含 `spec.md` / `plan.md` / `tasks.md`。需求「分類」就是把每條需求對應到一個既有 feature；真的沒有對應且屬全新功能者才另開新 feature。
- **一條需求一循環**：每條需求獨立走完 spec→plan→tasks→改碼→測試→log→commit，互不混雜。

---

## 執行流程

> 動 git 狀態（建分支）與「分類結果」**務必先回報並取得使用者確認**再往下做。分類錯會把需求寫進錯的 spec，代價很高。

### 第 0 步：建立暫存分支
1. 確認 issue 號（helper `branch` 模式會推測，仍要請使用者確認）。
2. 執行 helper 建立並切換到暫存分支：
   ```powershell
   pwsh .claude/skills/speckit-update/scripts/speckit-update-helper.ps1 -Mode branch -Issue 755
   ```
   它會切出 `755-temp-{MMdd}` 並切換過去（已存在則沿用）。

### 第 1 步：拆解並分類需求（判斷題，先給使用者確認）
1. 把使用者貼上的需求逐條編號（每條為一個獨立可驗收的修改）。
2. 列出既有 feature 與標題作為分類比對基準：
   ```powershell
   pwsh .claude/skills/speckit-update/scripts/speckit-update-helper.ps1 -Mode features
   ```
   並對照 `skills/SKILLS_INDEX.md` 的關鍵字與適用情境，判斷每條需求歸屬哪個 `specs/NNN-*`。
3. 產出「**需求 → feature**」對照表，同一 feature 的多條需求合併為一組。沒有對應且確屬全新功能者標為「新 feature（走 /speckit.specify）」。
4. **回報對照表與處理順序給使用者確認**後再進第 2 步。順序原則：彼此獨立者先做、互有依賴者依依賴順序、同 feature 的需求集中在同一輪處理。

### 第 2 步：逐條需求循環（依序，做完一條才換下一條）

對每一條（或同 feature 的一組）需求：

1. **指定當前 feature**：把 `.specify/feature.json` 指向該 feature 目錄，後續 `/speckit.plan`、`/speckit.tasks` 才會作用在正確的 feature 上：
   ```json
   { "feature_directory": "specs/012-editor-keyboard-nav" }
   ```
2. **更新 spec**：
   - **既有 feature** → **直接編輯**該 feature 的 `spec.md`：把這條需求補成／改寫對應的 User Story、Functional Requirements、驗收情境，並同步更新 `## 目錄`（GFM 錨點，見 speckit-specify 的目錄規則）。**不要**為既有功能新建 feature 目錄。
   - **新 feature** → 改呼叫 `speckit-specify`（它會自動串接 clarify→plan→tasks），完成後跳到本步驟第 5 點。
3. **更新 plan**：呼叫 `speckit-plan`（針對當前 feature 重新評估技術規劃）。speckit-plan 會**自動串接** `speckit-tasks`，因此第 4 步通常一併完成。
4. **更新 tasks**：確認 `tasks.md` 已依新 spec/plan 重拆（若 plan 未自動串接，手動呼叫 `speckit-tasks`）。
5. **改程式碼**：依 `tasks.md` 實作。遵守對應領域 SKILL.md（前端 vue → `vue-coding-style`、後端 → `spring-boot-coding-style`、本批多屬文稿編輯區 → 相關 business-logic SKILL）。**只動需求所述範圍**。
6. **測試到通過**：跑該 feature 對應測試（前端常見 `npm run test:unit`；牽涉 Web Component 封裝則 `npm run build:wc`；必要時 e2e）。**未通過不可進到下一條需求**——先修到綠燈。
7. **log-prompt 歸檔**：呼叫 `log-prompt`，把本條需求的對話與成果存成一份 log。
8. **commit 進暫存分支**：依 `auto-commit-summary` / `git-commit` 規範，將本條需求的修改 commit 到暫存分支（一條需求一個 commit，title 含 `#{issue}`）。
9. **換下一條**：回到第 2 步處理下一條需求，直到全部完成。

### 第 3 步：收尾
所有需求做完後，回報：暫存分支名、處理了哪幾條需求、各自對應的 feature 與 commit、測試結果。
依專案規範，若新增/變動了某功能的行為，評估是否要更新或新增對應 SKILL.md。

---

## 輔助工具

機械性、易算錯的部分走 [scripts/speckit-update-helper.ps1](scripts/speckit-update-helper.ps1)：

```powershell
# 建立並切換暫存分支 {issue}-temp-{MMdd}（未給 -Issue 時由近期 commit 推測）
pwsh .claude/skills/speckit-update/scripts/speckit-update-helper.ps1 -Mode branch -Issue 755
# 列出 specs/ 下每個 feature 目錄與其 spec.md 標題，供需求分類比對
pwsh .claude/skills/speckit-update/scripts/speckit-update-helper.ps1 -Mode features
```

---

## 邊界情況與原則

- **分類先確認再動手**：需求歸到哪個 feature 是判斷題，先把「需求→feature」對照表回報給使用者；分類錯造成的 spec 污染比多問一句昂貴得多。
- **既有功能不新建 feature**：對既有 feature 的修改一律直接編輯該 `spec.md` 並重跑 plan/tasks；只有「確屬全新功能、無任何既有 feature 對應」才走 `/speckit.specify` 開新目錄。
- **切換 feature 必設 feature.json**：`/speckit.plan`、`/speckit.tasks` 以 `.specify/feature.json` 定位目標 feature；換 feature 卻忘了改它，會把規劃與任務改到上一個 feature。
- **一條需求一 commit**：保持 log 與 commit 一一對應、可單獨回退；不要把多條需求合併成一個大 commit。
- **測試紅燈不前進**：某條需求測試未過就停在那條修到綠燈，不要帶著壞測試往下做，避免錯誤累積到難以定位。
- **暫存分支為 local、勿 push**：`{issue}-temp-{MMdd}` 是隔離實驗用，做壞了整條丟棄即可；要正式合併再由使用者決定。
- **一條需求可能跨多 feature**：例如「中文編號 backspace 接續到說明第一行」同時觸及 002（中文編號規則）與 012（跨欄位鍵盤導航）。此時拆成對應各 feature 的子修改、各自走 spec→plan→tasks，仍維持可追溯。

完成後依專案規範回報「做了什麼、為什麼這樣分類與實作」，並依 `skills/SKILLS_INDEX.md` 更新相關文件。
