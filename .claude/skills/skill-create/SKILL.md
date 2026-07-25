----
name: skill-create
description: >
  本文件說明了創建 skills 文件時需要遵循的六個原則。
----

## 來源網路文章
https://www.termdock.com/zh/blog/good-skill-design-principles


## 參考 reference
> **Eval Loop：如何真正測試一個 Skill**：Skill產生完成後，測試步驟。 [eval-loop-test.md](eval-loop-test.md)。


## 基本創建規則
- 首次創建請一律使用繁體中文創建文件。
- 首次創建繁體中文讓開發者較快速理解閱讀，後續再讓開發者評估是否需要翻譯成英文。
- 創建完成 skill 後須同步在 `skills\SKILLS_INDEX.md` 中新增對應說明，包含：
  * 技能名稱，文檔路徑
  * 補充參考
  * 適用情境
  讓操作 copilot、agent 等工具的開發者能快速找到對應技能說明文件，並且知道什麼情境下需要參考該技能說明文件。


## 六原則

### 原則一：Description 決定一切
SKILL.md frontmatter 裡的 description 欄位是主要觸發機制。
使用者發 prompt 時，agent 讀每個已安裝 skill 的 description 來決定載入哪些。

差的寫法：
````
description: Helps with code review.
````

「Helps with」毫無意義。Agent 無法判斷這 skill 什麼時候比內建的 code review 行為更適合。沒有觸發條件、沒有特異性、沒有訊號。

好的寫法：
````
description: >
  Performs comprehensive code review after writing or modifying code.
  Use when completing logical chunks of development work. Analyzes
  security vulnerabilities, correctness issues, performance problems,
  and maintainability concerns. Outputs structured findings with
  severity ratings. Activate for PR reviews, staged change reviews,
  and file-level audits.
````

告訴 agent 做什麼、什麼時候啟動、輸出長什麼樣。
對任何 prompt 都能做明確的 yes/no 判斷。


#### 「積極主動」技巧
Anthropic 文件說明 Claude 傾向 undertrigger skill -- 該用的時候不用。
解法：description 寫得稍微積極一點。

差的寫法：
````
「Can be used for deployment tasks」
````

好的寫法：
````
Use this skill whenever the user asks to deploy, push to staging, release, ship, or when you detect deployment-related file changes.
````

觸發條件一個個列出來。寧可觸發太頻繁。
載入不相關 skill 的成本（幾百 token 的 context）
遠低於沒載入相關 skill 的成本（agent 自己亂來然後搞砸）。

#### 測試觸發準確率
Skill Creator 的 description 最佳化提供嚴謹方法：
建立 20 個 eval query -- 
10 個該觸發、10 個不該觸發。
每個 query 跑 3 次取可靠觸發率。
系統拆成 60/40 的 train/test，評估當前 description，根據失敗提改進建議，然後迭代。

不需要 Skill Creator 也能手動做。
寫 20 個 prompt，對 agent 跑一遍，數幾個正確觸發、幾個正確沒觸發。
準確率低於 80% 就重寫 description 再測。


### 原則二：解釋為什麼，不只是什麼
LLM 不是需要死板指令的規則執行機器。它們是推理引擎，對解釋過的理由反應比命令式規定更好。

死板寫法：
````
## Rules
- ALWAYS use TDD. NEVER skip tests.
- ALWAYS validate input. NEVER trust user data.
- MUST use error boundaries around every async operation.
````

推理導向寫法：
````
## 測試哲學
測試在 regression 到達使用者之前就攔住它。先寫測試，
這樣你在寫實作之前就知道「成功」長什麼樣。
當測試一開始就失敗，你有了它確實在測正確行為的證據
-- 而不是碰巧通過。

## 輸入驗證
外部資料（使用者輸入、API 回應、檔案內容）到達時的
形狀你控制不了。在邊界處驗證，這樣內部程式碼就能信任
它的輸入。把錯誤處理移到 context 最豐富的邊緣，
讓核心邏輯保持乾淨。

````

兩種都說「做 TDD」和「驗證輸入」。
第二種解釋了為什麼，讓 agent 在邊界情況有足夠 context 做好判斷。
模型碰到 skill 作者沒預料到的狀況時，推理式指令能泛化。
規則式指令讓模型只能猜。

#### MUST/ALWAYS/NEVER 陷阱
重磅規則感覺很權威，效果比解釋過的推理差。
ETH Zurich 2026 年 2 月的研究發現，過度詳細和限制性的指令實際上降低了 agent 任務成功率。
表現最好的 agent 搭配的是精簡原則式引導 -- 不是整面牆的全大寫命令。

#### 什麼時候該用死板規則
安全約束和合規要求是例外。
「絕不把 AWS credentials commit 到版控」不是需要細緻推理的地方。
「絕不修改已存在的 migration 檔案」是硬性約束，違反會造成真實損害。
二元的、不可商量的約束用死板規則。其餘一切用推理。


### 原則三：漸進式揭露
觸發時就把 500 行指令倒進 context window 的 SKILL.md，會拉低 agent 表現。
ETH Zurich 研究證實：更多 context 不等於更好結果。
Agent 出乎意料地擅長自己發現需要的東西。
預載所有東西只增加 token 成本和認知負擔。

三層系統：

第一層：Metadata（約 100 字，永遠載入）。 
- Frontmatter 的 name 和 description。每個已安裝 skill 的 metadata 在 session 開始就載入。觸發機制，保持精簡。

第二層：SKILL.md body（< 500 行，觸發時載入）。 
- 主要指令。Agent 決定 skill 相關時讀的內容。應包含流程、關鍵規則、指向 reference 檔案的指引。

第三層：Reference 檔案 + script（按需載入）。 
- 詳細 API 規格、完整 checklist、模板庫、驗證 script。只在 agent 碰到需要的任務時載入。

經驗法則：段落只在 20% 使用案例中用到，
就該放 reference 檔案而非 SKILL.md body。
Code review skill 包含 200 行安全 checklist 的話，
把 checklist 放 references/security-checklist.md，
告訴 agent 只在 review auth 相關程式碼時才載。

關於 SKILL.md、CLAUDE.md、AGENTS.md 如何互動
（以及漸進式揭露如何融入更廣泛的 context engineering 策略），
詳見 SKILL.md vs CLAUDE.md vs AGENTS.md。
https://www.termdock.com/zh/blog/good-skill-design-principles



### 原則四：確定性工作交給 Script
能寫成 script 的就該寫成 script。LLM 在重複性、精確的任務上不可靠。計算行數、驗證結構化格式、跑特定命令序列、檢查檔案存在模式 -- 這些 LLM 偶爾會幻覺或每次跑法都不一樣。

適合 script 的任務：
- 檔案驗證（frontmatter 有所有必填欄位嗎？）
- 格式檢查（commit message 符合 Conventional Commits 嗎？）
- 資料擷取（從 codebase 拉出所有 TODO）
- API 呼叫（打 health endpoint 回報狀態）
- 起飛前檢查（dependency 都裝了嗎？資料庫跑起來了嗎？）

不適合的任務：
- 創意決策（哪種架構模式適合這個問題？）
- 依 context 而定的選擇（該新建元件還是擴充現有的？）
- 主觀評估（這段程式碼結構好嗎？）

具體範例 -- 驗證 SKILL.md frontmatter 的 script：
````bash
  #!/bin/bash
  # 驗證 SKILL.md frontmatter 欄位
  SKILL_FILE="$1"

  if [ ! -f "$SKILL_FILE" ]; then
    echo "Error: File not found: $SKILL_FILE"
    exit 1
  fi

  ERRORS=0

  if ! grep -q '^name:' "$SKILL_FILE"; then
    echo "Missing required field: name"
    ERRORS=$((ERRORS + 1))
  fi

  if ! grep -q '^description:' "$SKILL_FILE"; then
    echo "Missing required field: description"
    ERRORS=$((ERRORS + 1))
  fi

  LINES=$(wc -l < "$SKILL_FILE")
  if [ "$LINES" -gt 500 ]; then
    echo "Warning: SKILL.md is $LINES lines (recommended < 500)"
  fi

  if [ "$ERRORS" -gt 0 ]; then
    echo "$ERRORS error(s) found."
    exit 1
  fi

  echo "Validation passed."
  exit 0
````

Agent 跑 script 拿到確定性 pass/fail 結果。
沒有解讀差異、沒有幻覺欄位名、沒有跳過的檢查。
Script 做什麼就是做什麼，每次都一樣。

SKILL.md 簡單引用：
````
## 驗證
發布前先驗證 skill：
```bash
bash scripts/validate-skill.sh SKILL.md
Script 原始碼不進 context window -- 只有輸出會。Agent 推理空間保持乾淨，機械性任務精確可重複。
````


### 原則五：為你沒見過的邊界情況設計
好 skill 能優雅處理非預期輸入。
多數 skill 的失敗模式不是 happy path 壞掉，
而是碰到稍微不同的專案結構、不同措辭、不同技術棧就輸出垃圾。

「心智理論」方法：
想想使用者可能用的 10 種不同措辭。 
「Review this code」「check my PR」「audit the auth module」「is this safe to merge?」
-- 只對「review code」觸發的 code review skill 會漏掉大部分真實使用。

想想 skill 可能跑在的 5 種不同專案類型。 
假設用 Docker 的 deploy skill 在 serverless 專案會失敗。
假設用 Jest 的測試 skill 在用 Vitest 的專案會失敗。
寫引用專案實際工具的指令，不要寫死偏好的技術棧。

寫能泛化的指令，不要 overfit。 
Jesse Vincent 的 Superpowers 示範得很好。
Brainstorming skill 不是說「問剛好這 5 個問題」，
它解釋原則（commit 之前探索多種方法），讓 agent 把原則適配到具體 context。
所以 Superpowers 能跨完全不同的專案類型運作，而死板模板 skill 一碰到作者設定之外的東西就壞。

泛化測試：完全不同專案類型的開發者能不能從這 skill 的指令受益？
不能的話就 overfit 了。
把原則萃取出來，讓 agent 依 context 應用。


### 原則六：保持精簡
每一條沒在出力的指令都在浪費 context、混淆模型。
最好的 skill 都很短。不是因為短本身就好，而是短的 skill 裡每一行都是承重的。

讀逐字稿，不只讀輸出。 對 skill 最有揭示力的 debug 技巧是讀完整 agent 逐字稿 
-- 推理過程，不只最終輸出。你會發現：
- Agent 讀了但從沒用到的段落（刪掉）
- Agent 因措辭含糊而誤解的指令（重寫）
- Agent 花推理 token 把指令複述一遍給自己聽的地方（你的指令太囉嗦）

移除永遠被跳過的段落。 Skill 有個「Edge Cases」段落 agent 跑 10 次都沒引用過，就是死重量。
要嘛邊界情況沒觸發，要嘛 agent 不需要指令就處理得好。

把全大寫規則改寫成推理。 在寫 ALWAYS 和 NEVER 的話，停下來。
你在用音量補償不清楚的推理。「NEVER use default exports」
比不上「Named exports enable tree-shaking and make refactoring safer because the import name is tied to the export site, not the consumer.」第二種解釋了為什麼，agent 在第一種沒覆蓋到的邊界情況也能正確應用。

Agent Skills 完全指南建議 SKILL.md 控制在 500 行以內。
那是天花板，不是目標。很多有效 skill 不到 100 行。超過 200 行就審計一下：每個段落都在賺回它的 context 成本嗎？


