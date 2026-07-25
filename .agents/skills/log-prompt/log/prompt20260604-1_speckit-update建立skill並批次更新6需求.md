# Prompt 紀錄 — 2026-06-04 建立 /speckit-update skill 並批次更新 6 需求

> 時間：2026-06-04
> 分支：755-temp-0604（自 755-公文製作-vue框架重寫 切出之暫存 local 分支）

## git commit

本次工作對應 6 個 commit（一條需求一 commit，新到舊）：

- `ad6d30a47` [feature] #755 [簡易編輯] 舊文稿編輯區點選主旨/說明/擬辦後，簡易編輯開啟時游標定位至對應欄位（新 spec 014）。
- `07d72319c` [feature] #755 [文稿編輯區] 主旨/說明/擬辦欄位格式卡控：放行螢光筆/底線/符號、卡控粗體/清單/縮排（含貼上清洗）（新 spec 013）。
- `3a0a9b6aa` [feature] #755 [公文製作] 上方選單固定於螢幕上方、提醒訊息固定於螢幕正中央（spec 005 / FR-013、FR-014）。
- `c68190dfd` [feature] #755 [文稿編輯區] 卡控粗體/斜體快捷鍵 Ctrl/Cmd+B、Ctrl/Cmd+I，以鍵盤攔截使其無效果（spec 012 / FR-017）。
- `7207cc73a` [feature] #755 [文稿編輯區] 首個中文編號條例「一」兩段式 Backspace：先去除清單格式再接續說明欄位（spec 012 / FR-016）。
- `495da99b5` [feature] #755 [中文編號] Backspace 後與 Enter 一致重整中文編號與縮排/凸排，使縮排不可跨層級（spec 002 / FR-018）。

（前置：`6b7ce3b18` 於本次對話建立 /speckit-update skill，已先行 commit。）

## result
[docs] #755 [log-prompt] 歸檔 /speckit-update 建立 skill 並批次更新 6 需求之對話紀錄。
    fail	舊[文稿編輯區] 之 [主旨]、[說明]、[擬辦]欄位點選後，文字輸入游標於 [簡易編輯] 對應欄位。
    pass	新[文稿編輯區] 之 [上方選單] fixed 至螢幕上方。 [提醒訊息]跳出 fixed 在螢幕中央。
    pass	新[文稿編輯區] 之 [中文編碼] 首個條例 “一” 可由鍵盤 backspace 可刪除，刪除後再次按下 backspace 會接續到 [說明第一行]欄位。
    pass	新[文稿編輯區] 之 [中文編碼] 每次按下 鍵盤 backspace 需與 鍵盤[enter] 一樣再次重新整理 [中文編碼]與[縮排/凸排]，讓 [縮排/凸排] 符合原本規範不可跨層級。
    fail	新[文稿編輯區] 之 [主旨]、[說明]、[擬辦] 欄位 可有 螢光筆、底線、符號 效果，不可有 [中文編碼] (條例)、[縮排/凸排] 效果卡控。(包含複製貼上)
    pass	新[文稿編輯區] 之 卡控快捷鍵：ctrl + i 、ctrl + b 不可有效果，需鍵盤行為攔截。
    fail	新 [文稿編輯區] 之 [復原/取消復原] 卡控上限 20次。


## prompt 1

> 多需求更新spec文件與程式碼。/create-skill … 有多個需求要修改修正，請創建新 skill : /speckit-update。先建立暫存 git local branch： {issue號}-temp-{日期}，依照需求關鍵字 分類於 不同的 spec 功能。並依序更新該功能之 spec -> plan -> task ，之後修改程式碼並測試功能成功。再紀錄 log-prompt，並 git commit 至 git local branch，再換下一個 需求。直到完成所有需求修改。（附 6 條需求範例）

## prompt 1 response

依 skill-create 六原則建立 `/speckit-update` skill：`.claude/skills/speckit-update/SKILL.md`（112 行，多需求批次更新協調器）＋ `scripts/speckit-update-helper.ps1`（branch 建暫存分支、features 列既有 feature；修正 CJK 路徑 git octal 跳脫與主控台亂碼）；並登錄兩份 SKILLS_INDEX.md。commit `6b7ce3b18`。

## prompt 2

> /speckit-update（args：6 條需求）
> 1. 舊[文稿編輯區] 主旨/說明/擬辦欄位點選後，游標於[簡易編輯]對應欄位。
> 2. 新[文稿編輯區] 上方選單 fixed 至螢幕上方；提醒訊息 fixed 在螢幕中央。
> 3. 中文編碼首個條例「一」可 backspace 刪除，刪除後再按 backspace 接續到說明第一行。
> 4. 中文編碼每次 backspace 需與 enter 一樣重整中文編碼與縮排/凸排，不可跨層級。
> 5. 主旨/說明/擬辦 可有螢光筆/底線/符號，不可有中文編碼/縮排凸排卡控（含複製貼上）。
> 6. 卡控快捷鍵 ctrl+i / ctrl+b 不可有效果，需鍵盤行為攔截。

## prompt 2 response

依 skill 流程：建暫存分支 `755-temp-0604`；分類 6 需求並以 AskUserQuestion 確認分歧（R1→新 catch-all 014、R5→新 013、R2→主歸 005 連帶 012）；依 R4→R3→R6→R2→R5→R1 逐條走 spec→plan→tasks→改碼→測試→commit。

- **R4（spec 002 / FR-018）**：新增 `normalizeChineseListIndents`（純函式夾擠層級不可跨層）＋ `attachChineseListReflow`（Backspace/Enter 後 microtask 重整）＋ DocumentBody onReflow；9 例測試。
- **R3（spec 012 / FR-016）**：`attachBackspaceRule` 情境 A 前置「首行為中文編號 → 先去清單格式、再按一次才跨欄位」；修訂 FR-007、更新/新增測試共 17 例。
- **R6（spec 012 / FR-017）**：`attachFormatShortcutGuard` capture 攔截 Ctrl/Cmd+B、I；7 例測試（共 24 例）。
- **R2（spec 005 / FR-013、FR-014）**：工具列 `.toolbar-root` position:sticky top:0；提醒 toast position:fixed 置中。純 CSS。
- **R5（新 spec 013）**：抽 `isListIndentGatedActive()`；移除螢光筆/底線卡控、保留粗體/清單/縮排卡控；emitToolbarState 調整；新增 `fieldFormatGating.ts` 貼上白名單清洗（保留 background/underline、剝除 list/indent/其他）；8 例測試。
- **R1（新 spec 014，catch-all）**：DocumentBody `focusField`＋`openFocusField.ts` rAF 重試＋兩 .ce.vue `focus-field` prop＋4 份 iframe 測試頁 hash→屬性＋Work.js 點選對映/iframe src 附 hash；build:wc 重打包；5 例測試。Work.js 改動位於 Frontend-old submodule（未進主庫）；OA 實機驗收待使用者。

全程測試：各需求新增測試全綠；全專案 vitest 156 通過，餘 4 紅為既有 spec 011「匯入/匯出」隱藏選單之過時測試（與本次無關）。
