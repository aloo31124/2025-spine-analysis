---
name: log-report
description: >
  把「目前分支相對於上一個 branch 的所有 git commit」整理進每季工作報告
  `.claude/skills/log-report/report/Q{季}.工作.md`：先把新 commit 的 git title
  匯入〔待分配 git commit title〕並去重、由新到舊排序，再依序把待分配 title 由舊到新
  補進最舊一筆〔紀錄中〕週回顧的每個工作日（每日上限 5 行），補滿後將該週標籤改為
  〔記錄完畢〕並下週標〔紀錄中〕，最後從上一個 branch 切一條 local 備份分支
  cherry-pick 該週 commit。
  觸發語：「產生工作報告 / 季報 / log-report / 更新 Q2 工作報告 / 整理本週工作回顧 /
  把這週 commit 填進報告 / 收這週的工作紀錄」。每當一週工作收尾要結算、歸檔週報時使用。
---

## 目的（為什麼）

這份報告是「人看的工作週誌」，不是 git log 的翻版。它要回答主管與未來的自己：**這一週、每一天實際在做什麼**。
git log 只有時間與訊息，缺少「歸到哪一天、哪一週、是否已結算」的語意；本 skill 的價值就是把零散 commit
**收斂成有日期、有星期、有小結、可追溯**的週回顧，並在每週收尾時留一條 local 備份分支，避免 rebase／砍分支後
該週的 commit 連同心血一起遺失。

因為「該填哪幾筆、哪天該收、小結怎麼寫」是判斷題，**流程交給你推理**；而「算星期、抽 title、cherry-pick」是機械題，
**交給 [scripts/log-report-helper.ps1](scripts/log-report-helper.ps1)**，避免手算漂移。

---

## 名詞定義

### 上一個 branch
從目前分支往回回溯、**最近一次切出來**的那條分支（不是 remote 分支）。
範例：目前 `755-temp-test-0612`，上一個 branch 為 `755-公文製作-vue框架重寫`。
helper 的 `titles`／`backup` 模式會自動偵測（取與 HEAD 的 merge-base 時間最新的 local 分支）；
**偵測結果一定要先回報給使用者確認**，錯了用 `-PrevBranch` 指定。

### git title（取捨優先序 1→3）
1. 上限 **100 字**（含中英文標點），超過強制切斷。
2. 取到 **第一個條列 `-`**（commit body 的「- 細節」）或 **`[why]` / `[why/how]`** 標示之前 —— 也就是只留 commit 第一行主旨。
3. 若無上述符號，取到第一個句號 `。` 為止。

實務上 commit 第一行（subject）即為 title，細節條列在 body 不會被帶入；helper `titles` 模式已內建此規則，直接採用其輸出即可。

### 週回顧格式
每週一個 `### {月}月第{n}周工作回顧[標籤]` 區塊，其下逐日為「`yyyy-MM-dd 週X`」一行 + 該日工作條列。
標籤三態：無標籤（未開始）→ `[紀錄中]`（本週進行中、可被填入）→ `[記錄完畢]`（已結算、title 後附小結）。
週區塊排序為**新到舊**（最新的週在上）。

```text
### 6月第2周工作回顧[紀錄中]
2026-06-08 週一
2026-06-09 週二
2026-06-10 週三
2026-06-11 週四
2026-06-12 週五
```

---

## 執行流程

> 先讀目前報告全文再動手；所有「改 git 狀態」的步驟（建分支、cherry-pick）**務必先向使用者確認**。

1. **定位當季報告**：由今天日期決定季別（Q1=1–3、Q2=4–6、Q3=7–9、Q4=10–12），
   檔案為 `.claude/skills/log-report/report/Q{季}.工作.md`。不存在則照本檔「週回顧格式」與既有報告結構新建。

2. **匯入待分配 title**：執行 `helper -Mode titles`，把 `上一個branch..HEAD` 範圍每筆 commit 的 git title
   寫入報告頂端〔## 待分配 git commit title〕章節。

3. **去重＋排序**：〔待分配〕內若有與既有條目（含已填入週回顧者）重複的 title 就略過；其餘**由新到舊**（上=最新）排好。

4. **找最舊的〔紀錄中〕週**：掃描所有 `*月第*周工作回顧`，鎖定**最舊一筆**標 `[紀錄中]` 的週區塊，作為本次要填的目標週。

5. **補齊該週日期/星期**：執行 `helper -Mode week -Monday {該週週一}`，比對輸出，補上缺漏的工作日並修正錯誤的星期
   （星期一律以 helper 計算為準，不手填）。

6. **逐日填入**：在該週**由舊到新**逐日檢視——
   - 該日現有工作紀錄**已超過 5 行** → 跳過（視為當日已寫實，不覆蓋人工紀錄）。
   - 該日在 5 行內 → 從〔待分配〕**由舊到新**依序取 title 填入該日（填入後該 title 即從〔待分配〕移除）。

7. **收週**：當該週每個工作日都已補齊，把該週標籤由 `[紀錄中]` 改為 `[記錄完畢]`，並在該週 title 末端寫一句**該週工作小結**
   （綜觀本週各日，濃縮成一行重點，例如主軸功能、出差/請假等）。

8. **建立 local 備份分支**：先確認「上一個 branch」，執行
   `helper -Mode backup -NewBranch {編號}-temp-{該週最後一天MMdd} -Commits "<舊→新 hash 清單>"`
   （例：`755-temp-0605`）。它會從上一個 branch 切一條 **local** 分支、依序 cherry-pick 該週所有 commit、再切回原分支。
   用途是替該週成果留存檔點。

9. **開下一週**：把目標週的下一週標籤補上 `[紀錄中]`；若尚無下一週區塊則新建（同樣以 helper 算出日期/星期，週區塊維持新到舊排序）。

---

## 輔助工具

機械性、易算錯的部分一律走 [scripts/log-report-helper.ps1](scripts/log-report-helper.ps1)，不要手算：

```powershell
# 偵測上一個 branch + 列出待分配 title（新→舊，已套 title 規則）
pwsh .claude/skills/log-report/scripts/log-report-helper.ps1 -Mode titles
# 算某週一～週五的「日期 週X」
pwsh .claude/skills/log-report/scripts/log-report-helper.ps1 -Mode week -Monday 2026-06-08
# 建備份分支並 cherry-pick（會動 git 狀態，先取得使用者確認）
pwsh .claude/skills/log-report/scripts/log-report-helper.ps1 -Mode backup -NewBranch 755-temp-0605 -Commits "<舊hash>,<...>,<新hash>"
```

---

## 邊界情況與原則

- **只動一週**：一次只結算「最舊的〔紀錄中〕週」。即使待分配還有剩，也留到下次（下週已被標〔紀錄中〕）再填，避免把未來的 commit 灌進尚未發生的日子。
- **不覆蓋人工紀錄**：超過 5 行的當日視為已親手寫實，跳過不動；本 skill 只補空、不改寫既有文字。
- **去重以 title 文字為準**：同一 commit 的 title 在報告任一處出現過就算重複；避免 cherry-pick 後 hash 改變造成重覆匯入。
- **備份分支必為 local**：名稱 `{編號}-temp-{MMdd}`，從「上一個 branch」切出，切勿 push 成 remote 分支。
- **日期/星期一律用 helper 算**：跨月、補假日當天仍要列出（內容可寫「放假」），星期錯一格會誤導整週判讀。

完成後依專案規範回報「做了什麼、為什麼這樣收」，並依 `skills/SKILLS_INDEX.md` 更新相關文件。
