2026-05-29 15:30:46

## git commit
[update] [speckit] #755 speckit specify 階段停用自動切 branch（before_specify git.feature hook）。
- `.specify/extensions.yml`：將 `before_specify` 之 `speckit.git.feature` hook 由 `enabled: true` 改為 `enabled: false`，停止 `/speckit.specify` 時自動 `git checkout -b`；保留條目並加註專案政策，以便日後可逆。本專案於單一工作分支連續產出多份 spec，無需每次切 branch。
- `.specify/extensions/git/extension.yml`：於 `before_specify` 段補註記，提醒重新安裝/同步 git extension 後需再次於 `.specify/extensions.yml` 停用此 hook。
- `.claude/skills/speckit-specify/SKILL.md`：於「Branch creation」段加上專案政策說明——specify 階段不切 branch、spec 目錄沿用 `specs/NNN-` 序號獨立產生。
- 不改任何 PowerShell/Bash 腳本與核心流程；spec 目錄命名不依賴 branch，停用 hook 後自動走 SKILL.md 內建 mkdir + 複製模板降級路徑，specify→clarify→plan→tasks 自動鏈與各階段 auto-commit hook 均不受影響。

## prompt 1
調整整份專案之 speckit 設定，
在進行 speckit specify 時，不要另外切 branch。
請評估最適合的調整方式。

## prompt 1 response
- 以 plan mode 探查 speckit 機制，追蹤確認：`/speckit.specify` 核心流程本身不切 branch；切 branch 來自 `.specify/extensions.yml` 的 `before_specify` hook → `speckit.git.feature` → `create-new-feature.ps1` 第 298 行 `git checkout -q -b`。
- 關鍵發現：spec 目錄命名（`specs/NNN-xxx`）由 SKILL.md 核心流程獨立用序號產生、不依賴 branch；hook 是否執行為條件式判斷，停用後自動走 SKILL.md 第 108-109 行 mkdir + 複製模板降級路徑。
- 評估結論：採 spec-kit 官方內建 hook 停用機制（`enabled: false`）為最適方案——可逆、零腳本侵入、不破壞 specify→clarify→plan→tasks 自動鏈與各階段 auto-commit hook。
- 寫出計畫檔 `speckit-hidden-duckling.md` 並經使用者核准。
- 實作三處變更：(1) `.specify/extensions.yml` 將 `before_specify` git.feature 改 `enabled: false`（決定性變更，保留條目加註）；(2) `.specify/extensions/git/extension.yml` manifest 加重裝提醒註記；(3) `speckit-specify/SKILL.md` Branch creation 段加專案政策說明。
- 未動範圍：`before_constitution` 的 git.initialize、各階段 git.commit auto-commit hook（皆在當前分支運作，無衝突）；未改任何腳本。
- 提供符合規範的 commit 訊息（`[update] [speckit] #755`）。

## prompt 2
（log-prompt skill：要求把本次對話歸檔為 prompt 紀錄 *.md）

## prompt 2 response
- Glob 查得當日已有 `prompt20260529-1`、`-2`，本次流水號為 3。
- 取得時間戳 `2026-05-29 15:30:46`。
- 依 log-prompt 規格寫出本檔 `prompt20260529-3_speckit停用specify自動切branch.md`：首行時間戳 → `## git commit` → 逐則 `## prompt {n}` + `## prompt {n} response`。
