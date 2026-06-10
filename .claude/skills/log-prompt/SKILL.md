---
name: log-prompt
description: >
  將「一段已完成的 chat / 工作對話」整理成一份 prompt 紀錄 log（*.md），
  內容含本次 git commit、依序列出的所有使用者 prompt 與對應的回復精要。
  產出路徑固定為 `.claude/skills/log-prompt/log/`，檔名格式
  `prompt{yyyymmdd}-{當日流水號}_{繁中工作精要}.md`。
  觸發時機：使用者說「記錄這次對話 / 產生 prompt log / log 這個 chat /
  把這次工作存成紀錄 / 對話完成請存檔」，或在一段工作收尾、要求歸檔 prompt 與成果時。
---

## 目的

把一段已完成對話的「輸入（prompt）、產出精要、版本成果（git commit）」固化成一份可追溯的 Markdown 紀錄，
讓開發者日後能回顧「當時下了什麼指令、agent 做了什麼、最後 commit 了什麼」，
而不必翻 chat 逐字稿。**只在該段對話的工作已告一段落時才產出**，避免記到半成品。

---

## 觸發條件

使用者表達「要把這次對話 / 這段工作存成紀錄」時觸發，常見措辭：

- 「記錄這次對話」「log 這個 chat」「產生 prompt log」「把這次工作存檔」「對話完成請歸檔」。
- 一段功能 / 規劃 / 測試工作收尾後，要求保存指令與成果。

**不觸發**：對話仍在進行、工作尚未完成、或使用者只是要 git commit（那是 [git-commit](../git-commit/SKILL.md) 的職責，本 skill 是把 commit 連同 prompt 一起歸檔）。

---

## 產出規格

### 1. 路徑

固定輸出到：`.claude/skills/log-prompt/log/`（此目錄已存在，直接寫入）。

### 2. 檔名格式

```
prompt{yyyymmdd}-{當日流水號}_{繁中工作精要}.md
```

- `{yyyymmdd}`：今日日期，例如 `20260529`。
- `{當日流水號}`：當天第幾份，從 `1` 起算。**寫檔前先用 Glob 查 `log/prompt{今日}-*.md`，取現有最大號 +1**；查無則為 `1`。流水號是機械性計數，務必用工具實算，不要憑印象填。
- `{繁中工作精要}`：用繁體中文一句濃縮本次主題，10～20 字內、不含空白與路徑分隔字元，方便日後一眼辨識。

範例：

```
prompt20260529-1_標點符號新舊專案串接speckit規劃.md
prompt20260529-2_Vue3框架使用Cypress建立E2E測試.md
```

### 3. 內容格式

依下列順序組裝（對照 `log/` 內既有兩份範本）：

1. **第一行**：時間戳 `yyyy-MM-dd HH:mm:ss`。
2. `## git commit`：本次對話對應的 git commit（title + 條列總結）。若該對話已實際 commit，貼上實際訊息；若尚未 commit，沿用 [git-commit](../git-commit/SKILL.md) 規範產生的 commit 區塊內容。無任何程式碼變更則此段留標題即可。
3. 依序為每一則使用者 prompt 輸出一組：
   - `## prompt {n}`：**逐字**貼上該則使用者輸入（含其中的 `/slash 指令`、概述、清單），不要改寫或濃縮——這是日後可重跑的原始指令。
   - `## prompt {n} response`：**回復精要**，用條列濃縮 agent 當時的產出與結論（產出了哪些檔、關鍵決策、回報數字），不是逐字複製整段回應。

範本骨架：

```markdown
2026-05-29 14:00:00

## git commit
[feature] #755 [公文製作] …一句說明。

- 條列總結一
- 條列總結二

## prompt 1
（逐字貼上第一則使用者輸入）

## prompt 1 response
- 回復精要條列一
- 回復精要條列二

## prompt 2
（逐字貼上第二則使用者輸入）

## prompt 2 response
- 回復精要條列
```

---

## 流程

1. 確認該段對話的工作已完成（否則先問使用者是否真要現在歸檔）。
2. 從本次對話**從頭**蒐集：所有使用者 prompt（逐字）、各自的回復精要、本次 git commit。
3. Glob `log/prompt{今日}-*.md` 算出當日流水號。
4. 與使用者確認 / 自訂 `{繁中工作精要}`（取對話主題即可）。
5. 以上述內容格式 Write 出 `.md` 檔。

---

## 撰寫原則

- **prompt 逐字、response 精要**：prompt 是要能重現的原始輸入，故保留原文；response 重點在「做了什麼、結論為何」，故濃縮。兩者粒度刻意不同。
- **單一對話對單一檔**：一段對話產一份 log；不要把多段不相干工作塞進同檔。
- **流水號用實算**：同一天可能產多份，務必 Glob 後遞增，避免覆蓋既有檔。
- 與 [git-commit](../git-commit/SKILL.md) 互補：該 skill 管「commit 訊息怎麼寫」，本 skill 把 commit 連同 prompt 脈絡一起留存。
