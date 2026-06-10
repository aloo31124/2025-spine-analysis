---
name: git-commit
description: >
  每當 Claude（或 Copilot）完成任何「實際修改/新增/刪除程式碼或專案檔案」之後，
  必須在回應的最末段，額外輸出一段「可直接複製貼上」的 Markdown 區塊，
  內容包含一行符合本專案規範的 git title，以及該次修改的條列式小總結。
  用途：讓開發者能直接複製貼到 git GUI 或 `git commit` 訊息中，
  確保所有 commit message 風格一致、可追溯（含檔號 #755 等）、且符合 reactor/feature/fix/test/update/docs 等動作分類。
  觸發時機：任何 Edit / Write / NotebookEdit 工具呼叫成功之後（純讀取、純查詢、純對話、產生 plan/tasks 文件時不觸發）。
---

## 目的

統一本專案所有由 AI agent（Claude Code、GitHub Copilot）產生之 commit message 風格，
讓開發者能「不思考、直接複製」即可完成 git commit。

> 本規範與根目錄 `CLAUDE.md` 之「回應格式規範」搭配使用：
> CLAUDE.md 規定「修正/開發完成需說明原因與作法」；本文件規定「該說明結束後，必須再附上一段可複製的 commit message」。

---

## 觸發條件（必須遵守）

只要該次回應**有實際動到原始碼或專案檔案**（任一即觸發）：

- 呼叫了 `Edit` / `Write` / `NotebookEdit` 工具並成功改動檔案。
- 透過 `Bash` / `PowerShell` 執行了會改寫檔案的指令（例如 `mv`、`rm`、`git mv`、產生新檔案的 codegen 指令）。
- 透過 speckit / openspec 等工具產生了新的 spec/plan/tasks 檔案進入版本控制。

**不觸發的情境**（避免噪音）：

- 只讀取檔案、回答問題、做 code review 而未實際改動程式碼。
- 僅執行查詢類指令（`git status`、`git log`、`ls`、`grep`…）。
- 僅輸出計畫（Plan）而未實際落檔。

---

## 輸出規範

### 1. 位置

在該次回應的「最末段」輸出，與前面的「修改原因 / 實作說明」分開。
標題固定使用：

```
### 📋 可複製的 Git Commit
```

> 唯一允許使用 emoji 的位置（其他地方仍維持 CLAUDE.md「除非使用者明確要求否則不使用 emoji」之規範）。

### 2. 內容結構

輸出**一個** fenced code block，語言標記為 `markdown`，內容包含：

1. **第一行**：git title（單行、結尾句點，符合下節「Git Title 規範」）。
2. **空一行**。
3. **小總結**：以條列方式說明本次改了哪些檔案、做了什麼、為什麼，控制在 3–8 條為佳。

範例輸出：

````markdown
### 📋 可複製的 Git Commit

```markdown
[feature] #755 [公文製作] 新增螢光筆 9 色色票常數與選色 bar 元件。

- 新增 `Frontend/src/styles/highlighterPalette.ts`，集中管理 9 色 `#` 色票常數與順序。
- 新增 `Frontend/src/components/HighlighterBar.vue`，提供 roving tabindex 與 click-outside 行為。
- `EditorToolbar.vue` 串接 `apply-highlight-color` / `clear-highlight` 事件鏈。
- 同步更新 `skills/business-logic/highlighter-color-bar/SKILL.md` 之元件契約描述。
- 原因：spec 007 要求螢光筆需可多色切換並以 `#` 編碼歸類。
```
````

> 注意：外層 code fence 使用四個反引號 ```` ```` ````，內層 markdown 區塊使用三個反引號 ``` ```，
> 才能讓使用者「整個內層複製」即為合法的 commit message。

---

## Git Title 規範

格式固定為：

```
[動作] #檔號 於[功能名稱]執行動作一句說明。
```

### 動作（必填，小寫，方括號包圍）

| 動作 | 使用情境 |
| --- | --- |
| `[feature]` | 新增功能、新增 spec/plan/tasks 之後落實成程式碼。 |
| `[fix]` | 修正既有 bug（含編碼問題、UI 異常、後端錯誤）。 |
| `[reactor]` | 重構：邏輯不變、結構/檔案位置/版本控制架構調整（例如改為 submodule）。 |
| `[update]` | 既有功能小幅調整、欄位新增、文案修改、樣式微調。 |
| `[test]` | 新增 / 修改測試（Cypress E2E、Vitest 單元測試…）。 |
| `[docs]` | 純文件變更（`skills/`、`README.md`、`spec.md`、`plan.md`…）。 |
| `[speckit]` | 由 speckit 工作流產生的 spec/clarify/plan/tasks 文件本身。 |
| `[claude]` | Claude Code 相關設定檔變更（`.claude/`、`CLAUDE.md`…）。 |
| `[chore]` | 雜項：相依套件升級、`.vscode/`、`.gitignore`、CI 設定。 |

> 若一次 commit 同時包含多種動作，**擇主要者**填入；不要堆疊多個方括號。

### #檔號（必填）

- 預設使用目前進行中的工單編號：`#755`。
- 若使用者明確指定其他檔號，以使用者指定者為準。
- 若無明確檔號脈絡，輸出 `#?` 並在小總結最後一條提示使用者補上實際檔號。

### [功能名稱]（建議）

以方括號包住功能或模組名稱，例如：
`[公文管理]`、`[公文製作]`、`[螢光筆]`、`[中文編碼]`、`[說明欄位]`、`[cypress]`、`[E2E測試]`、`[speckit]`。

可在一句說明中出現多個方括號子詞，用以強調關鍵字（見下方範例）。

### 句子（必填）

- **一句話、繁體中文、句點結尾。**
- 動詞優先，描述「做了什麼 / 為什麼」。
- 不超過 80 個中日韓字（含標點）為佳。

### 官方範例（直接對照本專案歷史 commit）

```
[reactor] #755 [公文管理] 調整版本控制架構，將 [公文製作] 舊專案 Frontend-old 設為 submodule。
[feature] #755 [speckit]依文件開發，前端[公文製作] Frontend。螢光筆可有多種顏色，並使用 # 顏色編碼歸類。
[test]    #755 創建[cypress]針對[公文製作]Frontend Vue3框架的[E2E測試]腳本。
[fix]     #755 [中文編碼]問題:1.[中文編碼]刪行無法被偵測。2.[中文編碼]中文數字無法被刪除。
[update]  #755 [說明欄位]下方新增[說明區塊]並容納條例[中文編碼]。
```

> 動作後的空白僅為對齊閱讀用，實際 commit 寫一個半形空白即可。

---

## 小總結撰寫原則

- **條列式**：每條一個動作或一個檔案群組，使用 `-` 開頭。
- **檔案路徑**用反引號包住（` `` `），方便讀者點擊定位。
- 至少包含 **一條「原因（Why）」** ：對應 CLAUDE.md「說明評估原因」之要求。
- 若同步更新了 `skills/` 下對應 SKILL.md，**必須額外列一條**標註已同步。
- 不要重複 git title 已說過的事；總結是補充細節，不是重述。

---

## 不應該做的事（反例）

1. ❌ 沒有外層 ```` ```` 包住內層 ``` `markdown` 區塊 → 使用者無法一鍵複製完整 commit message。
2. ❌ git title 寫成「修改了某某檔案」之類的「what」描述 → 應該是動作 + 功能 + 為什麼。
3. ❌ 一次回應只回答問題、沒改任何檔案，卻仍輸出本區塊 → 屬於噪音，禁止。
4. ❌ 把多個 commit message 並列輸出 → 一次修改只給一個 commit message；若使用者要求分多次 commit，再分多個 code block。
5. ❌ 使用英文 commit message → 一律繁體中文（與 CLAUDE.md 一致）。
6. ❌ 在 commit message 中加上「🤖 Generated with Claude Code」「Co-Authored-By」之類預設簽名 → 本專案 commit 風格不需要。

---

## 與其他規範的關係

- **CLAUDE.md**：總體回應格式規範；本文件是它的延伸落地工具。
- **`skills/business-logic/speckit-directory-overview/SKILL.md`**：speckit auto_commit 由 `.specify/extensions/git/` 自動產生時，仍須遵循本文件之 git title 格式。
- **`skills/design-style/skill-design-6-principles/SKILL.md`**：本 skill 本身也遵循該文件「description 決定一切」「具體觸發條件」之原則。

---

## 自我檢核清單（每次輸出前對照）

- [ ] 本次回應有實際改動檔案？沒有 → 不要輸出 commit 區塊。
- [ ] 標題使用 `### 📋 可複製的 Git Commit`？
- [ ] 外層 ```` ``` ```` markdown + 內層 ``` markdown 兩層 fence？
- [ ] git title 含 `[動作]`、`#檔號`、`[功能名稱]`、繁體中文一句話、句點結尾？
- [ ] 小總結 3–8 條，含至少一條「原因」？
- [ ] 若同步更新 SKILL.md，已列出？
- [ ] 無多餘簽名、無英文 commit、無多個 commit 並列？
