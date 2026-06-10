# Skills 索引

本專案的 Skills 文檔位於 `skills/` 目錄，並依性質分為兩類：

- **業務邏輯（business-logic/）**：本專案特定功能、架構與整合流程相關規範。
- **撰寫設計風格規範（design-style/）**：跨專案可重用的撰寫風格與設計原則。

進行相關功能開發時，請優先閱讀對應的 SKILL.md。

---

## 業務邏輯 (business-logic/)

### [文稿編輯區] 新舊雙專案重構流程
- **文檔**: `skills/business-logic/document-editor-refactor-flow/SKILL.md`
- **適用情境**:
    * 新增或修改 [文稿編輯區] / [簡易編輯區] 任何功能（螢光筆、中文編號、縮排、新公文格式…），需要同步處理新專案 Frontend (Vue 3) 開發 → `npm run build:wc` 封裝為 Web Component → 舊專案 Frontend-old (ExtJS) 串接的完整鏈路。
    * 新增第四個 Web Component 變體；調整 `Frontend/scripts/copy-wc-to-old.cjs` 同步腳本；變動 `package.json` 的 `build:wc` 三輪 vite build chain。
    * 修改舊專案 `Frontend-old/oa/app/components/PaperNew.js` 橋接器（cpaper ↔ simple-doc-editor 雙向資料同步、multiFormat 螢光筆色段、KDRichTextBlock SVG 操作、ChineseNumberStringPlus 中文編號）、或 `Frontend-old/oa/app/controller/Work.js` 的 `onSimpleEditTap` 開啟簡易編輯視窗邏輯。
    * 涵蓋 submodule 架構（tdym_ap 主專案 + Frontend / Frontend-old 兩 submodule）、三個 web component 變體（doc-editor / simple-doc-editor / simple-with-proposal-doc-editor）、不可違反的硬性約束（不改 Paper.js / Utils.js、不手動編輯 dist-webcomponent 產物、不再為 simple 變體寫第二套 toolbar）、完成後檢查清單。
    * 關鍵字：文稿編輯區、簡易編輯區、PaperNew、cpaper、Paper.js、Work.js、doc-editor-element、simple-doc-editor-element、simple-with-proposal-doc-editor-element、build:wc、copy-wc-to-old、dist-webcomponent、submodule、Frontend-old、saveKDRichTextBlock、svgUpdateLayout、KDRichTextBlock、ChineseNumberStringPlus、multiFormat、新舊專案橋接。

### 公文格式元件分層架構
- **文檔**: `skills/business-logic/document-format-component-architecture/SKILL.md`
- **適用情境**:
    * 新增任何公文格式類型（函、簽、令、書函、開會通知單、簽呈、便箋…）。
    * 修改 `Frontend/src/view/DocumentBody.vue` 區段結構、調整 `Frontend/src/formats/documentFormats.ts` schema、抽離或合併公文版面元件、重構 Quill 編輯器初始化流程。
    * 評估「某欄位該不該獨立成元件」時的決策依據。
    * 涵蓋三層分層原則（原子 `DocFieldRow` / 區段元件 / 協調層）、Quill 集中管理與 `useDocumentEditors` composable 規範、schema 驅動的 v-for 渲染模式、明確列出「不應抽離」的反例。
    * 關鍵字：公文格式、DocumentBody、documentFormats、函、簽、令、書函、區段元件、DocFieldRow、ArchiveSection、SenderInfoSection、CopySection、Quill、useDocumentEditors、schema-driven、A4 排版。

### Speckit 目錄完整說明

- **文檔**: `skills/business-logic/speckit-directory-overview/SKILL.md`
- **適用情境**:
    * 想了解本專案 spec-kit 自動串接管線（`/speckit.specify → clarify → plan → tasks → 停於詢問 implement`）由哪些檔案驅動。
    * 修改 speckit 行為（自訂 prompt、調整 hook、改模板、加掛/停用 git extension、改 auto-commit 規則）之前的查找地圖。
    * 排錯：追蹤某個 speckit 指令到底由哪個 SKILL.md / template / script 載入。
    * 涵蓋 `.specify/`（init-options / integration / feature / extensions.yml / templates / scripts / memory / integrations）、`.claude/skills/speckit-*`、`.github/agents` 與 `.github/prompts`、`.specify/extensions/git/`、`specs/` 已產生的 6 份 spec、自動串接合約與中止條件。
    * 關鍵字：speckit、spec-kit、.specify、.claude/skills/speckit-*、constitution、specs/、auto_commit、自動串接、prompt-template、extensions.yml、git extension。

### 螢光筆多色選擇 bar

- **文檔**: `skills/business-logic/highlighter-color-bar/SKILL.md`
- **適用情境**:
    * 修改工具列螢光筆按鈕之點擊行為、9 色色票之 `#` 編碼或順序、螢光筆 bar 之視覺樣式、鍵盤無障礙行為。
    * 新增 Web Component 變體並要求其工具列具有螢光筆 bar 功能；排錯螢光筆 bar 於某情境下無法展開 / 收合或宿主頁面 CSS 干擾色票顯示。
    * 涵蓋 9 色色票常數位置（`Frontend/src/styles/highlighterPalette.ts`）、`HighlighterBar.vue` 元件之 props / emit 契約、roving tabindex 與 click-outside 行為、`EditorToolbar` / `DocumentBody` / `DocumentEditor` / 三組 `.ce.vue` 之事件鏈、與 spec 005 之向後相容性升級。
    * 關鍵字：螢光筆、highlighter、highlighter-bar、HighlighterBar、HIGHLIGHTER_PALETTE、useClickOutside、roving tabindex、role="toolbar"、apply-highlight-color、clear-highlight、currentHighlightColor、spec 007、Quill background。

### 前端 Cypress E2E 測試（公文製作）
- **文檔**: `skills/business-logic/frontend-cypress-e2e-testing/SKILL.md`
- **適用情境**:
    * 新增或修改 `Frontend/cypress/` 目錄下任何檔案、新增公文製作相關 E2E 測試案例。
    * 修改 `Frontend/cypress.config.ts`（baseUrl、viewport、spec pattern）、新增 / 調整自訂 Cypress 指令、改變 dev server 埠號。
    * 撰寫 Quill 編輯器互動測試、多份創稿切換驗證、工具列按鈕測試、各公文格式 A4 區段渲染斷言。
    * 評估「測試該寫成單元測試（Vitest）還是 E2E」、「某段測試該封裝為自訂指令還是直接內聯」的判斷依據。
    * 涵蓋目錄結構、語意化選擇器策略（不依賴 `data-cy`）、自訂指令封裝原則、Quill `.ql-editor` 互動手法、`start-server-and-test` 整合 CI 跑法、已知陷阱（`uncaught:exception` 攔截、流水號跨測試重置、Modal 焦點時序）。
    * 關鍵字：cypress、E2E、端對端測試、公文製作、document-creation、cypress:open、cypress:run、test:e2e、start-server-and-test、ql-editor、draft-chip、nd-modal、baseUrl、4200、自訂指令、選擇器策略、Quill 測試。

### 文稿編輯區 復原 / 取消復原（Quill history）
- **文檔**: `skills/business-logic/undo-redo-history-flow/SKILL.md`
- **適用情境**:
    * 修改工具列「復原 / 取消復原」兩 icon（位於符號 icon 左方）之行為、位置、disabled 條件，或調整復原粒度（逐字 vs 整批格式動作）。
    * 新增任何「需可被復原」的編輯功能時，判斷該操作要以何種 Quill source（`user` 入歷程 / `api`、`silent` 不入歷程）觸發。
    * 排錯：復原無效 / 一次掉太多字 / 同步進來的內容被誤復原 / redo 沒清空 / 按鈕一直 disabled。
    * 涵蓋 Quill 2.0.2 內建 `history` 模組三大設定（`delay:0` 逐字、`maxStack` 無上限、`userOnly:true` + source 區分）、`DocumentBody.vue` 之 `createQuill`/`undo`/`redo`/`computeHistoryFlags`/`loadDraftFields` history.clear、`EditorToolbar` 兩按鈕與 canUndo/canRedo 事件鏈、與舊專案 cpaper 僅同步內容結果之雙向綁定、jsdom 測試 stub。
    * 關鍵字：復原、取消復原、undo、redo、Quill history、delay、maxStack、userOnly、user source、api source、逐字復原、canUndo、canRedo、bi-arrow-counterclockwise、bi-arrow-clockwise、DocumentBody、EditorToolbar、spec 010、history.clear、雙向綁定、cpaper。

### 文稿編輯區 DI 檔匯入 / 匯出
- **文檔**: `skills/business-logic/di-import-export-flow/SKILL.md`
- **適用情境**:
    * 修改工具列「匯入 / 匯出」兩 icon（位於凸排 icon 右側）之行為、位置、圖示，或調整 DI 檔格式（XML 宣告 / DTD 標頭 / 文別根節點 / 主旨 / 段落 / 條列）。
    * 修改 `Frontend/src/docRules/di/`（diSchema / deltaBridge / diSerializer / diParser / index）之轉換邏輯，或調整 Quill Delta 與 DI 之欄位對照、縮排凸排層級換算。
    * 排錯：匯入後文稿錯位 / 條列層級錯亂 / 中文亂碼 / 往返失真 / 某 Web Component 封裝無匯入匯出 / 匯入未覆蓋既有內容。
    * 涵蓋邏輯與 UI 解耦架構、`DocContent` 中介樹、DI 格式契約（函→104_2、簽→104_5、不含附件 ENTITY）、欄位↔DI 對照、UTF-8 與 XML 跳脫、一次性匯入（非雙向綁定）、Vitest 往返一致性測試、與舊專案 `DIMgr.js` 之格式對應。
    * 關鍵字：DI、匯入、匯出、import-di、export-di、di-import-export、docRules/di、deltaBridge、diSerializer、diParser、diSchema、DocContent、條列、段落、主旨、序號、縮排、凸排、indent、chinese-ordered、104_2_utf8.dtd、104_5_utf8.dtd、DOMParser、Blob、FileReader、文別、函、簽、spec 011、往返一致性、DIMgr、generateXDI、ImportDI。

### 文稿編輯區 鍵盤操作優化（跨欄位導航 / Enter 防呆 / Backspace 接續）
- **文檔**: `skills/business-logic/editor-keyboard-nav-flow/SKILL.md`
- **適用情境**:
    * 修改／新增文稿編輯區鍵盤行為：中文編號空行 Enter 防呆提醒、行首 Backspace 向上跨欄位接續（含文字併入並繼承上一行格式）、上下方向鍵在主旨/說明/說明區塊/擬辦間切換。
    * 調整欄位視覺順序或新增／移除可編輯欄位（須同步 `FIELD_ORDER` 與 `createQuill` 的 `kind`），導航即自動納入。
    * 排錯：上下鍵跳到錯誤欄位 / 切換後游標不在行首 / Backspace 沒接續或殘留空白行 / 併入後格式錯亂或編號跳號 / 空白中文編號 Enter 沒提醒 / IME 組字誤觸。
    * 涵蓋多 Quill 實例架構、`fieldNavigator.js`（順序＋相鄰焦點/游標轉移單一事實來源）、`keyboardRules.js` 三規則（attachEmptyListEnterGuard / attachBackspaceRule / attachArrowNavRule）、capture 階段 keydown 攔截（避開 Quill 內建 binding 搶先）、`isComposing` no-op、`DocumentBody.vue` 註冊/清除時序與非阻斷 toast、與 `chineseListBlot` 編號重算的銜接。
    * 關鍵字：鍵盤、上下鍵、ArrowUp、ArrowDown、Enter 防呆、Backspace、跨欄位、接續、併入、行首、中文編號、fieldNavigator、keyboardRules、focusInto、getNeighbor、attachBackspaceRule、attachArrowNavRule、attachEmptyListEnterGuard、capture、isComposing、IME、DocumentBody、spec 012、主旨、說明、擬辦、reminder、toast。

---

## 撰寫設計風格規範 (design-style/)

### 程式碼修改後自動產出 git commit 總結（必讀）
- **文檔**: `skills/design-style/auto-commit-summary/SKILL.md`
- **適用情境**:
    * 每當 Claude / Copilot 完成「實際修改、新增、刪除原始碼或專案檔案」之回應，最末段**必須**附上一段可一鍵複製的 Markdown 區塊，包含一行符合本專案規範的 git title 與 3–8 條小總結。
    * 規範 git title 格式：`[動作] #檔號 於[功能名稱]執行動作一句說明。`（動作分類：`feature` / `fix` / `reactor` / `update` / `test` / `docs` / `speckit` / `claude` / `chore`）。
    * 明確列出**不觸發**情境（純讀取、純對話、僅產生 Plan 未落檔）以避免噪音。
    * 涵蓋輸出位置、雙層 code fence 寫法、檔號預設 `#755`、繁體中文、避免英文 commit 與多餘簽名等反例，並附自我檢核清單。
    * 關鍵字：git commit、commit message、git title、自動產生 commit、reactor、feature、fix、test、update、docs、speckit、#755、可複製、Markdown 區塊、回應格式。

### 對話 prompt 紀錄歸檔（log-prompt）
- **文檔**: `.claude/skills/log-prompt/SKILL.md`
- **適用情境**:
    * 一段對話 / 工作完成後，要把「本次 git commit + 所有使用者 prompt（逐字）+ 各自回復精要」歸檔成一份 `.md`。
    * 產出路徑固定 `.claude/skills/log-prompt/log/`，檔名 `prompt{yyyymmdd}-{當日流水號}_{繁中工作精要}.md`（流水號需 Glob 當日既有檔遞增）。
    * 內容格式：首行時間戳 → `## git commit` → 逐則 `## prompt {n}`（逐字）+ `## prompt {n} response`（精要）。
    * 觸發語：「記錄這次對話」「產生 prompt log」「log 這個 chat」「把這次工作存成紀錄」「對話完成請存檔」。
    * 關鍵字：log-prompt、prompt 紀錄、對話歸檔、prompt log、流水號、回復精要、git commit 歸檔。

### 每季工作報告 / 週回顧結算（log-report）
- **文檔**: `.claude/skills/log-report/SKILL.md`
- **輔助工具**: `.claude/skills/log-report/scripts/log-report-helper.ps1`（titles 抽 title／week 算星期／backup 建備份分支）
- **適用情境**:
    * 一週工作收尾要結算、把 commit 填進季報時。把「上一個 branch..HEAD」的 git title 匯入〔待分配 git commit title〕→去重＋新到舊排序→由舊到新補進最舊一筆〔紀錄中〕週回顧的每個工作日（每日上限 5 行）。
    * 報告路徑 `.claude/skills/log-report/report/Q{季}.工作.md`（Q1=1–3 / Q2=4–6 / Q3=7–9 / Q4=10–12），不存在則照格式新建。
    * 補滿一週後：該週標籤改〔記錄完畢〕並補該週小結 → 下一週標〔紀錄中〕 → 從上一個 branch 切 local 備份分支 `{編號}-temp-{MMdd}` 並 cherry-pick 該週 commit。
    * git title 規則：100 字上限、取 commit 第一行（去 `-` 條列與 `[why]/[why/how]` 之後）、否則取到首個「。」。
    * 觸發語：「產生工作報告 / 季報 / log-report / 更新 Q2 工作報告 / 整理本週工作回顧 / 把這週 commit 填進報告 / 收這週工作紀錄」。
    * 關鍵字：log-report、工作報告、週回顧、季報、待分配 git commit title、紀錄中、記錄完畢、備份分支、cherry-pick。

### 多需求批次更新 spec 與程式碼（speckit-update）
- **文檔**: `.claude/skills/speckit-update/SKILL.md`
- **輔助工具**: `.claude/skills/speckit-update/scripts/speckit-update-helper.ps1`（branch 建暫存分支／features 列既有 feature 與標題）
- **適用情境**:
    * 使用者一次丟「多條」要修改的需求，要先建暫存 local 分支 `{issue}-temp-{MMdd}`、依關鍵字把每條需求分類到既有 `specs/NNN-*` 功能，再逐一對該功能執行 spec → plan → tasks 更新、改程式碼、跑測試到通過、log-prompt 歸檔、commit 進暫存分支，做完一條換下一條。
    * 核心原則：一條需求＝一個完整 speckit 循環＝一個 commit（可單獨回退、log 與 commit 一一對應）；切換 feature 前必設 `.specify/feature.json`；既有功能直接編輯該 `spec.md` 不新建 feature；測試紅燈不前進；暫存分支為 local 勿 push。
    * 分類為判斷題（先回報「需求→feature」對照表給使用者確認）、機械題（建分支／列 feature）交給 helper。單一全新功能請改用 `/speckit.specify`。
    * 觸發語：「多需求更新 spec / 批次更新規格與程式碼 / speckit-update / 把這幾條需求分類後依序做」。
    * 關鍵字：speckit-update、多需求、批次更新、暫存分支、temp 分支、需求分類、feature.json、spec plan tasks、一條需求一 commit、log-prompt、specs/NNN。

### Spec → Cypress 測試步驟清單盤點（spec-cypress-checklist）
- **文檔**: `.claude/skills/spec-cypress-checklist/SKILL.md`
- **輔助工具**: `.claude/skills/spec-cypress-checklist/scripts/spec-cypress-helper.ps1`（inventory 文件齊備度＋AS/SC/FR 數量／cypress 既有 describe·it 清單／scenarios 單一 spec 斷言原文）
- **適用情境**:
    * 定期盤點 `specs/` 所有 spec.md 與 quickstart.md，比對 `Frontend/cypress/e2e` 既有 E2E 覆蓋，產出固定路徑 `.claude/skills/spec-cypress-checklist/checklist/{yyyymmdd}_測試步驟清單.md` —— 把每條 Acceptance Scenario / Success Criteria 標為 ✅已覆蓋 / ⬜待補（可自動化） / 🚫不可自動化（OA 實機、視覺回歸、建置產物），用於優化與擴充 Cypress。
    * 一輪 spec/quickstart 補件後要決定「接下來該補哪幾條 E2E、優先序為何」；或想確認 cypress 是否仍測已作廢規範（如 spec 013 貼上端 2026-06-05 修訂）。
    * 與 `frontend-cypress-e2e-testing` 分工：本 skill 只**盤點與產清單、不寫測試不改碼**；實際撰寫測試時切換至該 skill 沿用其選擇器策略。quickstart 缺漏者先補再盤點。
    * 關鍵字：測試步驟清單、cypress 覆蓋、E2E 盤點、quickstart、Acceptance Scenario、Success Criteria、spec-cypress-checklist、測試缺口、覆蓋率、待補測試、不可自動化、OA 實機、視覺回歸。

### 依清單落地 Cypress 待補測試（cypress-test-optimize）
- **文檔**: `.claude/skills/cypress-test-optimize/SKILL.md`
- **輔助工具**: `.claude/skills/cypress-test-optimize/scripts/cypress-optimize-helper.ps1`（pending 找最新清單抽 ⬜ 待補項並小計／specs 列既有 .cy.ts）
- **適用情境**:
    * 接續 `spec-cypress-checklist` 的「治療」步驟：依最新一份 `.claude/skills/spec-cypress-checklist/checklist/{yyyymmdd}_測試步驟清單.md` 的 ⬜待補項，實際撰寫或擴充 `Frontend/cypress/e2e` 測試、跑 `npm run test:e2e` 到綠燈，再把清單對應列由 ⬜ 改 ✅ 並更新覆蓋率。
    * 一次只落地「一個 spec、一個 commit」（E2E 易 flaky，便於單獨跑/回退/回填）；沿用既有自訂指令（`createDraft`/`typeInField`/`clickToolbarButton`）與語意化選擇器，不重造；以 quickstart 修訂版為準（如 spec 013 貼上端 2026-06-05 強制純文字）。
    * 不寫 🚫 項（OA 實機、視覺回歸、建置產物、使用者明示不寫如 spec 010/011）；撰寫手法以 `frontend-cypress-e2e-testing` 為權威來源、不重述。紅燈先修不前進，揭露真實 bug 則回報使用者。
    * 關鍵字：cypress 優化、補測試、待補 E2E、cypress-test-optimize、測試步驟清單、覆蓋率、回填清單、⬜ 改 ✅、field-format-gating、keyboard-nav、chinese-ordered、Quill paste 模擬、npm run test:e2e。

### skills 文件創建 6 原則
- **文檔**: `skills/design-style/skill-design-6-principles/SKILL.md`
- **補充參考**: `skills/design-style/skill-design-6-principles/eval-loop-test.md`
- **適用情境**:
    * 創建 skills 文件時，必須閱讀此文件，包含:
    * 已經存在之功能需另外創建新 skills 文件說明。
    * 或使用 speckit、openspec 等工具開發之新功能完成後，也必須創建新的 skills 文件說明。
    * 關鍵字: skills、產生skills、speckit.implement、開發完成。

### Vue 3 組件撰寫風格
- **文檔**: `skills/design-style/vue-coding-style/SKILL.md`
- **適用情境**:
    * 修改前端相關 vue 時候，都必須參考此檔案中的規範與說明。
    * Vue 3 組件開發、Composition API、`<script setup>` 撰寫規範，只要修改到前端 vue 組件相關的程式碼，請優先參考此檔案。

### Spring Boot 後端撰寫風格（flowengine 流程引擎）
- **文檔**: `skills/design-style/spring-boot-coding-style/SKILL.md`
- **適用情境**:
    * 新增或修改任何後端 Java 程式碼時，必須參考此檔案；核心範圍為 `src/main/java/com/kangdainfo/flow`。
    * 涵蓋分層資料夾職責（`rest` / `service` / `service.impl` / `dto` / `model.bo` / `model.dao` / `model.converter` / `component` / `exception` / `config.handler`）、命名慣例（Dao 非 Repository、BO 非 Entity、主鍵 `String VARCHAR(36)` UUID）、`BaseController` + `RestfulBean` 統一回應、三層 try/catch + 上下文 log、`@Transactional` 與 `@Lock(PESSIMISTIC_WRITE)` 搭配、Enum 以 `AttributeConverter` 存 `SMALLINT`、軟刪除 `isDeleted`、`FlowBusinessException` 上下文欄位、大量 IN 批次（MSSQL 2100 參數上限）等，以及與主流 Spring Boot / Spring Data JPA 慣例的逐項差異。
    * 關鍵字：spring boot、flow engine、flowengine、kangdainfo、RestController、BaseController、RestfulBean、@Service、@Transactional、JpaRepository、@Query、@Lock、PESSIMISTIC_WRITE、AttributeConverter、@Convert、JPA Entity、Business Object、BO、Dao、DTO、FlowBusinessException、FlowSystemException、三層 try catch、欄位注入、UUID 主鍵、軟刪除、後端風格、後端分層。
# Skills 索引

本專案的 Skills 文檔位於 `skills/` 目錄。
進行相關功能開發時，請優先閱讀對應的 SKILL.md。

## 可用 Skills

### skills 文件創建6原則
- **文檔**: `skills/skill-design-6-principles/SKILL.md`
- **補充參考**: `skills/skill-design-6-principles/eval-loop-test.md`
- **適用情境**: 
    * 創建 skills 文件時，必須閱讀此文件，包含:
    * 已經存在之功能需另外創建新 skills 文件說明。
    * 或使用 speckit、openspec 等工具開發之新功能完成後，也必須創建新的 skills 文件說明。
    * 關鍵字: skills、產生skills、speckit.implement、開發完成。


### Formio 自訂義表單
- **文檔**: `skills/formio-spec/SKILL.md`
- **補充參考**: `skills/formio-spec/formio-ui-reference.md`
- **適用情境**: 
    * 修改 formio 相關前後端所有功能時，都必需要參考此檔案中的規範與說明。
    * formio 相關 表單設計、表單渲染、表單提交、FormioBuilder 整合、FormioForm 組件 與 開發調整所有功能皆需參考此檔案。

### Vue 3 組件撰寫風格
- **文檔**: `skills/vue-coding-style/SKILL.md`
- **適用情境**: 
    * 修改前端相關 vue 時候，都必須參考此檔案中的規範與說明。
    * Vue 3 組件開發、Composition API、`<script setup>` 撰寫規範，只要修改到前端 vue 組件相關的程式碼，請優先參考此檔案。

### iframe 嵌入整合
- **文檔**: `skills/iframe-integration/SKILL.md`
- **適用情境**:
    * 修改或新增任何 iframe 嵌入功能、postMessage 通訊、iframe 路由頁面時，必須參考此檔案。
    * 涵蓋 iframe 包裝元件、expand/shrink 動態尺寸機制、iframe HTML 生成與剪貼簿複製、API 認證旁路、IFRAME 模組功能開關等規範。
    * 關鍵字：iframe、postMessage、expandIframe、shrinkIframe、FlowEditIframe、SignIframe、ExternalPage、嵌入外部系統。

### 登入驗證機制（JWT + 2FA + Captcha）
- **文檔**: `skills/authentication-flow/SKILL.md`
- **適用情境**:
    * 修改或新增任何登入流程、Spring Security 過濾器鏈、JWT 簽發與驗簽、KeyPair/Keystore、密碼雜湊、登入失敗鎖定、雙因子（TOTP）、圖形驗證碼、前端 auth store、router beforeEach、ApiService 401/403 攔截、JwtService token 管理、WebSocket STOMP 認證、代理登入（impersonate）時，必須參考此檔案。
    * 涵蓋 `/sys_login`、`/api/captcha`、`/api/totp/*`、`/api/check_token`、`/oauth2/callback/keycloak`、`/2fa.jsp` 等端點對應的前後端程式點與整體運作原理。
    * 關鍵字：登入、驗證、authentication、JWT、SecurityConfig、JWTAuthorizationFilter、TotpFilter、CaptchaValidationFilter、LoginSuccessHandler、UserDetailsAuthenticationProvider、UserLoginService、LoginUtil、PasswordEncoderImpl、TotpController、WebSocketAuthChannelInterceptor、useAuthStore、JwtService、ApiService、access_token、Bearer、keystore、twoFactorEnabled、twoFactorAuthenticated、2fa、雙因子、TOTP、OAuth、keycloak、QuicklyLogin、impersonate。

### Web Component 打包
- **文檔**: `skills/web-component-build/SKILL.md`
- **適用情境**:
    * 修改或新增 Web Component 打包設定、自訂元素標籤、FlowEditElement 包裝層、mock 模組、假資料時，必須參考此檔案。
    * 涵蓋 defineCustomElement 註冊流程、Vite library 模式建置（ES/UMD/IIFE）、Shadow DOM 停用策略、mock-router / mock-api-service 替換架構、假資料系統（mockData）、Props HTML 屬性對應。
    * 關鍵字：web component、custom element、defineCustomElement、flow-edit-element、build:wc、IIFE、UMD、mockData、vite.config.webcomponent、dist-webcomponent。
