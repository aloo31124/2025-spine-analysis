2026-06-01 08:02:49

## git commit
[feature] #755 [公文製作] 新增文稿編輯區 DI 檔匯入／匯出（凸排 icon 右側兩 icon，僅新專案，spec 011）。

- Frontend 新增 `src/docRules/di/`：DI 匯入匯出核心邏輯抽離（types/diSchema/deltaBridge/diSerializer/diParser/index），與 UI 解耦、純函式可單元測試。
  - diSchema：文別↔DI 對照（函→104_2_utf8.dtd、簽→104_5_utf8.dtd）、最小 DTD 標頭（不含附件 ENTITY）、XML 跳脫。
  - deltaBridge：Quill Delta ⇆ DocContent 中介樹，indent(0–7) ⇆ 條列巢狀深度（stack），序號由中文計數規則重算。
  - diSerializer/diParser：DocContent → DI 字串／DI 字串 → DocContent（DOMParser，非法檔回 ok:false 不丟例外，空白條列略過）。
  - index：exportDocToDI / importDIToDoc / suggestFileName。
- Frontend `EditorToolbar.vue`：凸排 icon 右側新增〔匯入〕(bi-box-arrow-in-down)〔匯出〕(bi-box-arrow-up)，emit import-di/export-di，附 title/aria-label/data-testid。
- Frontend `DocumentEditor.vue` + 三組 `*.ce.vue`：比照 spec 010 事件鏈轉發 @import-di/@export-di。
- Frontend `DocumentBody.vue`：exportDI()（getContents→exportDocToDI→Blob 下載 UTF-8，檔名文別.di）、importDI()（input[type=file]+FileReader utf-8→importDIToDoc→非空 confirm→各 Quill setContents+history.clear），defineExpose。匯入為一次性轉換、不雙向綁定。
- 測試：新增 `src/docRules/__tests__/`（diSerializer/diParser/deltaBridge 含 Delta→DI→Delta 往返一致性）與 `EditorToolbar.spec.ts` 匯入/匯出 4 案例；npm run test:unit 103/103 通過、npm run build:wc 成功並同步 12 檔至 Frontend-old/oa/dist-webcomponent。
- skills：新增 `skills/business-logic/di-import-export-flow/SKILL.md` 並登錄 `.claude/skills/SKILLS_INDEX.md`、`skills/SKILLS_INDEX.md`。
- 規格文件：specs/011-di-import-export/（spec/clarify/plan/research/data-model/contracts/quickstart/tasks）；tasks T001–T026 完成，T026 手動驗收待使用者於瀏覽器執行。
- 僅修改新專案 Frontend，未動 Frontend-old 原始碼。

## prompt 1
匯入匯出功能speckit規劃。 

/speckit-specify

### 概述
請詳細檢視 舊專案 Frontend-old [匯入/匯出] icon機制，
在新專案 Frontend 上方選單 凸排icon右邊創建 [匯入/匯出] 的兩icon。 
匯出di檔案重新匯入後
必須與 舊專案 Frontend-old [匯入/匯出]  機制一致，
可由di檔轉換成 [文稿編輯區]
但不須[雙向綁定]。

### 匯入匯出機制
只需匯入匯出di檔，
匯出之 di 檔格式需與 舊專案一致(參考  di 範本)，
匯入 di 檔後，可正確於 [文稿編輯區] 呈現，
正確顯示 中文編碼 與 縮排、凸排。

### di 範本
參考路徑如下：
Frontend\src\formatExamples\函.di
Frontend\src\formatExamples\簽.di

### 第1階段範圍
目前第一階段
匯入匯出範圍只限在 [文稿編輯區]，
檔號、正本 等 文稿欄位 後續再補上。

### 撰寫規範
該匯入匯出功能邏輯請抽離至 
Frontend\src\docRules

### 備註
上述功能請只更新於新專案上。
不須 cypress 測試。
請另外創建新的 skills 文檔。

## prompt 1 response
- 啟動 spec-kit 自動化管線：`/speckit.specify → clarify → plan → tasks`，停於詢問是否 implement。
- 逆向舊專案 `Frontend-old/oa/app/common/DIMgr.js`（generateXDI / ImportDI / getChildNodesKRB / getDIDtd / wkToXml），釐清 DI 格式：XML 宣告＋DTD 標頭（函→104_2_utf8.dtd、簽→104_5_utf8.dtd），根節點＝文別，主旨 `<主旨><文字>`、段落 `<段落 段名="…">`、條列以巢狀 `<條列 序號="…">` 表達縮排層級。
- 發現使用者指定的 `函.di`/`簽.di` 範本不存在（僅有 .html），於 spec Clarifications 自動決策：以舊專案 DI 產出為權威格式來源、.html 僅作版面對照。
- specify：建立 `specs/011-di-import-export/`（spec.md 含目錄、FR-001~FR-020、SC-001~SC-005、prompt.md、checklists/requirements.md），更新 `.specify/feature.json`。
- clarify：自動解析並回寫 5 項高影響度決策（UTF-8 編碼、匯入取代＋非空確認、檔名文別.di、文別取自 draft.format／匯入以 DI 文別為準、最小 DTD 不含附件 ENTITY），新增 FR-021~FR-026。
- plan：產出 plan.md（目錄＋Mermaid 技術樹＋決策日誌＋架構資料流）、research.md（R-001~R-009）、data-model.md（DocContent/Paragraph/ListItem 與 Delta、DI 映射）、contracts/（di-format、docrules-di-api）、quickstart.md；執行 update-agent-context 同步技術棧至 CLAUDE.md。
- tasks：產出 tasks.md（T001–T026，依 US1 匯出／US2 匯入／US3 往返分組）。

## prompt 2
y

## prompt 2 response
- 使用者核可繼續實作；`speckit-implement` skill 因 disable-model-invocation 無法自動呼叫，改依 tasks.md 手動實作。
- 建立核心模組 `Frontend/src/docRules/di/`：types.ts、diSchema.ts、deltaBridge.ts（deltaToLines/linesToItems/bulletForLevel/deltaToDocContent/docContentToDelta）、diSerializer.ts、diParser.ts、index.ts。
- UI 串接：EditorToolbar.vue 凸排 icon 右側新增匯入/匯出 icon＋emit；DocumentEditor.vue 與三組 *.ce.vue 事件鏈轉發；DocumentBody.vue 實作 exportDI()/importDI()/applyImportedDI()/isContentNonEmpty() 並 defineExpose。
- 測試：新增 docRules/__tests__/ 三份（diSerializer 8、diParser 6、deltaBridge 9，含往返一致性）＋ EditorToolbar.spec.ts 匯入/匯出案例。
- 驗證：`npm run test:unit` 103/103 通過；`npm run build:wc` 成功，12 檔同步至 Frontend-old/oa/dist-webcomponent。
- 文件：新增 skills/business-logic/di-import-export-flow/SKILL.md，登錄兩份 SKILLS_INDEX.md。

## prompt 3
完成後續步驟

## prompt 3 response
- 補齊先前 `/speckit.tasks` 產出之 tasks.md 任務狀態：T001–T025 標記為完成 [X]。
- T026（quickstart 手動驗收）保留為未完成 [ ]，註明待使用者於瀏覽器手動驗收（自動化等價 test:unit／build:wc 已通過），避免謊報手動步驟。
- 於 tasks.md 頂部加註完成狀態與「實際測試落於 docRules/__tests__ 而非規劃所載 src/__tests__/di」之差異說明。
- 確認 spec-kit 管線 specify→clarify→plan→tasks→implement 全數走完；產出可一鍵複製之 git commit 區塊。
