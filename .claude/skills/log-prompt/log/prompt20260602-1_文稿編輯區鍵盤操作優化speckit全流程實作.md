2026-06-02 19:40:00

## git commit
[feature] #755 [公文製作] 文稿編輯區鍵盤操作優化：中文編號空行 Enter 防呆、行首 Backspace 跨欄位接續/併入、↑↓ 跨欄位導航（僅新專案，spec 012）。
- Frontend 新增 `src/docRules/fieldNavigator.js`：跨欄位導航協調器（createFieldNavigator → register/unregister/clear/getNeighbor/focusInto），以視覺順序 order 為單一事實來源、自動略過未註冊欄位（函無擬辦），focusInto 支援 start/end 與 atLineStart 行首落點。
- Frontend 擴充 `src/docRules/keyboardRules.js`：新增 attachEmptyListEnterGuard（US1：空白中文編號 Enter preventDefault + onReminder、有文字不介入）、擴充 attachBackspaceRule（US2：第一行行首經 navigator 取上一欄位 mergeFirstLineIntoPrevField 文字併入繼承目標格式並移除空行、非首行 list 項目手動併入避開 Quill outdent、無上一欄位 no-op）、新增 attachArrowNavRule（US3：首行↑/末行↓ 跨欄位、行首維持行首、無相鄰 no-op）；applyKeyboardRules 改為 (quill, {navigator,kind,onReminder}) 並向後相容；全部 capture 階段 keydown、isComposing 一律 no-op。
- Frontend `DocumentBody.vue`：建立 fieldNavigator 與 FIELD_ORDER，createQuill 新增 kind 參數並於建立後 register + 傳 options 至 applyKeyboardRules；新增 showReminder 與 .keyboard-reminder-toast 非阻斷提醒（2 秒自動消失、單例去重）；destroyQuillInstances/onUnmounted 清空 navigator 與計時。
- 測試：新增 `__tests__/fieldNavigator.spec.ts`(9)、`__tests__/keyboardRules.spec.ts`(15)，`view/__tests__/DocumentBody.spec.ts` 補真實 Quill 跨欄位 Backspace 併入整合(2)；npm run test:unit 129/129 通過、npm run build:wc 成功並同步 12 檔至 Frontend-old/oa/dist-webcomponent。
- 規格文件：specs/012-editor-keyboard-nav/（spec/clarify/plan/research/data-model/contracts/quickstart/tasks）；T001–T021 完成，T022 手動驗收待使用者於瀏覽器執行。
- skills：新增 `skills/business-logic/editor-keyboard-nav-flow/SKILL.md` 並登錄 `.claude/skills/SKILLS_INDEX.md`、`skills/SKILLS_INDEX.md`。
- 僅修改新專案 Frontend，未動 Frontend-old 原始碼。

## prompt 1
[文稿編輯區]中[鍵盤操作]優化。

/speckit-specify

### 需求項目
* [ ] \[文稿編輯區\] 中 \[主旨\]、\[說明欄位第一行\]、\[擬辦\]、\[中文編號\] 於 \[鍵盤操作\] 優化
  * [ ] \[中文編號\] 如果沒有輸入文字，按 enter 後跳出提醒訊息。(依照留言3點)
  * [ ] \[中文編號\] 或純文字，不論是否有文字，按下刪除 backspace，該游標會接續上一行 \[中文編號\] 或 \[說明欄位\] 。 若該行有文字，則將所有文字接續上一行 \[中文編碼\] 或 \[說明欄位第一行\]。 (依照留言4,5點)
  * [ ] \[文稿編輯區\] 中 \[主旨\]、\[說明欄位第一行\]、\[擬辦\]、\[中文編號\] 使用鍵盤 上下鍵 可切換。若是在行首，確保上下切換時游標皆在行首。

## prompt 1 response
- 觸發 speckit 自動化管線（specify → clarify → plan → tasks），全程串接不中斷。
- **specify**：建立 `specs/012-editor-keyboard-nav/`（下一序號 012）；產出 spec.md（3 User Story：US1 中文編號空行 Enter 防呆 P1、US2 Backspace 行首向上接續含文字併入 P1、US3 上下鍵跨欄位導航 P2；15 條 FR；自動決策 4 項記入 Clarifications）、prompt.md 原始 prompt 歸檔、checklists/requirements.md（16/16 通過）；更新 `.specify/feature.json`。
- **clarify**：以自動最優解模式解決 2 個高影響度模糊點 —— (1) Backspace 併入採目標行格式（中文編號重算/說明欄位轉純文字，更新 FR-005）、(2) ↑/↓ 進多行欄位 ↓ 進首行 ↑ 進末行（更新 FR-011）；寫入 spec.md Session 2026-06-02 並同步目錄。
- **plan**：產出 plan.md（含目錄＋技術樹 Mermaid mindmap＋條列 fallback、6 項技術決策表）、research.md、data-model.md（4 實體＋4 不變式）、contracts/keyboard-nav.contract.md、quickstart.md；關鍵決策：維持多 Quill 實例 + 新增 fieldNavigator 協調器、capture-phase keydown、非阻斷 toast、Vitest+jsdom 測試；Constitution 為未填範本故 Gate PASS。
- **tasks**：產出 tasks.md（22 任務，Setup 2/Foundational 4/US1 4/US2 4/US3 3/Polish 5，8 項可平行），於終點停止並詢問是否執行 /speckit.implement。

## prompt 2
y

## prompt 2 response
- 確認執行實作；因 speckit-implement 被 disable-model-invocation 無法由 Skill 自動啟動，改為直接依 tasks.md 逐階段實作。
- **Phase 1**：跑基準測試 103 passed；檢視既有 keyboardRules.js / chineseListBlot.ts / DocumentBody.vue 接點（4 個獨立 Quill：subject/desc/descArea/proposal）。
- **Phase 2**：新增 `fieldNavigator.js`（順序＋相鄰焦點/游標轉移）；擴充 `applyKeyboardRules(quill, {navigator,kind,onReminder})` 向後相容；DocumentBody 建 fieldNavigator+FIELD_ORDER、createQuill 加 kind 並 register、destroy/unmount clear。新增 fieldNavigator.spec.ts（9 passed）。
- **US1**：attachEmptyListEnterGuard（trim 空才攔、有文字不介入）+ showReminder/toast；測試覆蓋。
- **US2**：attachBackspaceRule 情境 A 跨欄位 mergeFirstLineIntoPrevField（繼承目標格式、移除空行、focusInto end）、情境 B 非首行 list 手動併入避開 Quill outdent、無上一欄位 no-op；測試覆蓋。
- **US3**：attachArrowNavRule（邊界偵測、↓ 進首行 ↑ 進末行、行首維持行首、無相鄰 no-op）；測試覆蓋。keyboardRules.spec.ts 共 15 passed。
- **Phase 6**：DocumentBody.spec.ts 補真實 Quill 跨欄位 Backspace 整合 2 案例；`npm run test:unit` 129/129 全綠；`npm run build:wc` 成功同步 12 檔至 Frontend-old/oa/dist-webcomponent；新增 editor-keyboard-nav-flow/SKILL.md 並登錄兩份 SKILLS_INDEX。
- tasks.md 標記 T001–T021 完成、T022 手動驗收待使用者執行；產出符合規範的 git commit 區塊。
