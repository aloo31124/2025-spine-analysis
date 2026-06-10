2026-06-01 14:00:00

## git commit

[docs] [skills] #755 新增 [log-report] skill：每季工作報告 / 週回顧結算自動化，並執行 6月第1週結算。

- 新增 `.claude/skills/log-report/SKILL.md`：季報定位（Q1–Q4）、待分配 title 匯入去重、最舊〔紀錄中〕週逐日填入（每日上限 5 行）、收週改〔記錄完畢〕補小結、下週標〔紀錄中〕、local 備份分支 cherry-pick 流程；含名詞定義與邊界情況。
- 新增 `.claude/skills/log-report/scripts/log-report-helper.ps1`：titles（偵測上一個 branch + 抽 git title 新→舊）、week（算日期/星期）、backup（建 local 備份分支 cherry-pick）三模式；git title 抽取以 ` - ` 條列破折號與 `[why]/[why/how]` 為切點、取首個「。」、上限 100 字，排除 `->` 箭頭誤判。
- `.claude/skills/SKILLS_INDEX.md`、`skills/SKILLS_INDEX.md`：各新增〔每季工作報告 / 週回顧結算（log-report）〕索引條目。
- `.claude/skills/log-report/report/Q2.工作.md`：執行 6月第1週結算——待分配清單重建（10筆新→舊）；週三/週四/週五各補 1/5/1 行；6月第1周改〔記錄完畢〕並附週小結；6月第2周〔紀錄中〕建立（2026-06-08 ～ 06-12）。

## prompt 1

產生log-report之skills。 

/skill-create 

### 概述
請在如下 skill
.claude\skills\log-report\SKILL.md
產生每季報告:
.claude\skills\log-report\report\Q2.工作.md
產生如下步驟:
- 依照當前日期找當季報告如: "Q2.工作.md" 若找無請依照格式產生。
- 於當前branch到最近的分支(上一個branch)這範圍之所有 git title 移到該報告的 [待分配 git commit title] 章節下，依序排好。參考 上一個branch 
- 檢視 [待分配 git commit title] ，若有重複跳過，並將 git title 依照時間順序由上到下排序新到舊。git title定義參考如下。
- 檢視該 Q2.工作.md 公 作中  *月第*周工作回顧 中最舊一筆有標註 [紀錄中] 的工作回顧。
- 找到 [紀錄中] 該週後，請檢視該週每一日工作天日期，若無則補上日期，並確保日期與星期正確，參考 週回顧格式 。
-  [紀錄中] 該週 檢查每一日之工作紀錄，順序由舊到新，若該日已紀錄項目超過5行則跳過。若該日記錄5行內則將 [待分配 git commit title] 一樣順序由舊到新取 git title 填入該日。
-  若該週所有日期已補充完畢，則在該週 title 標籤改為 [記錄完畢]，並在該週 title 做該週工作小結。
-  於當前分支 往之前回朔，找到 最近切出的上一個branch再切一個 local 端的 branch，注意非 remote branch！命名為 {編號}-temp-{最後一天日期}，如 755-temp-0605。並將該週的所有 git commit 全部依序 git cherry pick 於此，用於備份。參考 上一個branch 。
-  將下一週標籤補上 [紀錄中]，若無下一週週回顧則自動補上日期與標籤，注意該週回顧排序也是由 新到舊排序。

### 週回顧格式
```text
### 6月第2周工作回顧
2026-06-08 週一
2026-06-09 週二
2026-06-10 週三
2026-06-11 週四
2026-06-12 週五

### 6月第2周工作回顧[紀錄中]
2026-06-08 週一
2026-06-09 週二
2026-06-10 週三
2026-06-11 週四
2026-06-12 週五
```

### git title 定義
如下優先順序1~3
- 1.git title 限制在 100字內，包含中英文標點符號，不包含空格，超過強制切斷。
- 2.取至 第一個 "-" 符號 或 [why]、[why/how] 標示之前。
- 3.若無上述符號，至第一句句號 "。" 取為 git title。 
範例1：
- 只取 [feature] #755 [公文製作] 新增文稿編輯區 DI 檔匯入／匯出（凸排 icon 右側兩 icon，僅新專案，spec 011）。
- 完整 git commit:
```text
[feature] #755 [公文製作] 新增文稿編輯區 DI 檔匯入／匯出（凸排 icon 右側兩 icon，僅新專案，spec 011）。
- Frontend 新增 `src/docRules/di/`：DI 匯入匯出核心邏輯抽離（types/diSchema/deltaBridge/diSerializer/diParser/index），與 UI 解耦、純函式可單元測試。
```
### git 上一個branch 
如下範例:
當前branch: 755-temp-test-0612
往前回朔，最近切出的 branch 即為上一個 branch
上一個branch: 755-公文製作-vue框架重寫

## prompt 1 response

- 探索既有 skill 目錄結構（log-prompt、skill-create 六原則），參考格式後建立三產物：
- 新增 `.claude/skills/log-report/SKILL.md`（~130行）：frontmatter description 含完整觸發語；流程9步驟（定位報告→匯入title→去重排序→找紀錄中週→補日期→逐日填入→收週→backup→開下週）；名詞定義（上一個branch/git title/週回顧格式）；邊界情況（只動一週、不覆蓋人工、去重以文字為準、backup必為local）。
- 新增 `.claude/skills/log-report/scripts/log-report-helper.ps1`（PowerShell）：titles/week/backup 三模式。關鍵修正：git title 以 ` - `（前後空格）為切點、排除 `->` 箭頭誤判，與 spec 範例1 輸出吻合（實機驗證）。
- 更新 `.claude/skills/SKILLS_INDEX.md` 與 `skills/SKILLS_INDEX.md`：各新增 log-report 索引條目。
- 實機測試：week 模式輸出正確；titles 模式自動偵測誤判 worktree branch，SKILL.md 明確要求「偵測結果先確認，錯了用 -PrevBranch 指定」。

## prompt 2

/log-report

## prompt 2 response

- 執行 log-report skill 流程：
- 確認上一個 branch：自動偵測誤判 `claude/determined-johnson-be8a1b`（worktree）→ 改用 `-PrevBranch 755-公文製作-vue框架重寫` 執行。
- helper titles 抽出 24 筆 commit（含去重後 17 筆唯一 title）；week 模式確認 6月第1週與第2週日期正確。
- 去重分析：原待分配4筆（已填入週一/週二）全部移除；17筆新 title 中，7筆消耗於填日：週三+1（`[claude] 開啟 powerShell 權限。`）、週四+5（auto-commit/web-component/PaperNew.js等）、週五+1（`[claude] 更新其他 [skills]文件`）；剩餘10筆留待分配。
- 更新 Q2.工作.md：待分配清單重建10筆（新→舊）；6月第1周 → `[記錄完畢]`+小結；6月第2周 `[紀錄中]` 插入（2026-06-08~12）。
- 備份分支計畫（待使用者確認）：從 `755-公文製作-vue框架重寫` 切 `755-temp-0605`，cherry-pick 503d47e3b/c44c23edb/74933510c（5/31~6/1 的 DI 提交）。

## prompt 3

Continue from where you left off.

## prompt 3 response

- 接續執行 /log-prompt（流水號查詢發現今日已有 prompt20260601-1_...，本次為第2份）。

## prompt 4

/log-prompt

## prompt 4 response

- 寫入本份 log：`prompt20260601-2_建立log-report季報Skill並執行6月第1週週回顧.md`。
