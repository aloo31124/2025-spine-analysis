<!--
═══════════════════════════════════════════════════════════════════════════════
  SYNC IMPACT REPORT
═══════════════════════════════════════════════════════════════════════════════

Version Change: [Template] → 1.0.0
Type: MINOR (Initial constitution establishment from template)

Modified Principles:
  ✅ PRINCIPLE_1: Defined as "分層架構強制分離 (Layered Architecture Enforcement)"
  ✅ PRINCIPLE_2: Defined as "測試必要性 (Testing Requirement)"
  ✅ PRINCIPLE_3: Defined as "最小可行產品優先 (MVP First, No Overdesign)"
  ✅ PRINCIPLE_4: Defined as "業務正確性優先序 (Business Correctness Priority)"
  ✅ PRINCIPLE_5: Defined as "向後相容性 (Backward Compatibility)"
  ✅ PRINCIPLE_6: Defined as "文件與註解規範 (Documentation and Comment Standards)"

Added Sections:
  ✅ 前端規範 (Frontend Standards)
  ✅ 既有程式碼適用原則 (Legacy Code Principles)
  ✅ 禁止事項 (Prohibited Practices)

Removed Sections: None

Templates Requiring Updates:
  ✅ .specify/templates/plan-template.md - Constitution Check section verified
  ✅ .specify/templates/spec-template.md - Alignment with principles verified
  ✅ .specify/templates/tasks-template.md - Task categorization aligned
  ⚠️  Command templates - No command files found in .specify/templates/commands/

Follow-up TODOs: None - All placeholders resolved

═══════════════════════════════════════════════════════════════════════════════
-->

# FlowEngine 專案憲法

## 核心原則 (Core Principles)

### I. 分層架構強制分離 (Layered Architecture Enforcement)

本專案後端必須嚴格遵守分層架構，確保各層職責清晰、互不跨越：

- **Controller 層**：僅負責 HTTP 請求解析、參數驗證與回應格式化，禁止包含任何業務邏輯
- **Service 層**：所有商業邏輯必須存在於此層，不得在 Controller 或 Repository 中實作
- **Repository 層**：僅負責資料存取與持久化操作，不得包含業務邏輯
- **跨層存取禁止**：Controller 不得直接呼叫 Repository，必須透過 Service 層

**理由**：分層架構確保關注點分離 (Separation of Concerns)，使程式碼易於測試、維護與擴充。違反此原則將導致邏輯散落、測試困難及技術債累積。

### II. 測試必要性 (Testing Requirement)

所有新增或變更的功能必須可被測試，以確保程式碼品質與穩定性：

- 新功能必須伴隨對應的單元測試 (Unit Test) 或整合測試 (Integration Test)
- 測試範圍涵蓋業務邏輯、邊界條件與錯誤處理
- 不可測試的程式碼視為不完整的交付物

**理由**：可測試性是高品質軟體的基礎。測試不僅驗證功能正確性，更是最佳的活文件，確保未來修改不會破壞既有行為。

### III. 最小可行產品優先 (MVP First, No Overdesign)

專案目標為建立高品質、可測試、可持續擴充的 MVP，嚴禁過度設計：

- 不為「可能的未來需求」提前設計
- 功能實作以滿足當前需求為準，保持簡單與可擴充性
- 遵循 YAGNI 原則 (You Aren't Gonna Need It)
- 任何額外的抽象層或設計模式必須有明確的當前需求支持

**理由**：過度設計增加複雜度、開發時間與維護成本，且多數「未來需求」永遠不會發生。專注於當前價值交付，在實際需求出現時再擴充。

### IV. 業務正確性優先序 (Business Correctness Priority)

當設計決策發生衝突時，依照以下優先序裁決：

1. **業務正確性**：功能必須符合業務需求與預期行為
2. **向後相容**：現有 API 與行為不得在未通知的情況下改變
3. **程式優雅度**：在不犧牲前兩者的前提下，追求程式碼品質

**理由**：再優雅的程式碼若無法解決業務問題或破壞既有功能，皆無意義。

### V. 向後相容性 (Backward Compatibility)

所有對外 API 的行為變更必須考慮向後相容性：

- 變更前必須評估對現有使用者的影響
- 破壞性變更 (Breaking Changes) 必須明確標註、提供遷移指南並預留緩衝期
- 新增欄位或參數應設定合理預設值，避免強制要求既有呼叫端修改

**理由**：向後不相容的變更會破壞既有整合、增加維護成本並降低使用者信任。

### VI. 文件與註解規範 (Documentation and Comment Standards)

為確保團隊協作與知識傳承，所有規格文件與程式碼註解必須使用繁體中文：

- **規格文件**：一律使用繁體中文撰寫
- **方法與函式註解**：每個方法或函式必須包含繁體中文註解，說明其用途、參數與回傳值
- **段落註解**：若方法或函式邏輯超過 5 行，需在每個主要處理段落後加上註解，說明該段落的主要處理動作
- **複雜邏輯註解**：對於非直觀的演算法、業務規則或技術決策，必須加上詳細說明

**理由**：繁體中文註解降低理解門檻，加速新成員上手，並確保業務邏輯與程式碼的對應關係清晰可追溯。

## 後端規範 (Backend Standards)

本專案後端基於 Spring Boot 3.5.9 + Java 21 開發，必須遵守以下規範：

- **SOLID 原則**：所有類別設計必須符合 SOLID 原則，特別是單一職責 (Single Responsibility) 與依賴反轉 (Dependency Inversion)
- **分層職責**：依照「原則 I」嚴格執行 Controller、Service、Repository 分層
- **例外處理**：使用統一的例外處理機制，避免在 Controller 中散落 try-catch
- **依賴注入**：使用 Spring 的依賴注入，避免 new 關鍵字建立 Service 或 Repository 實例
- **API 回應格式**：統一使用標準回應格式 (如 `{ "success": boolean, "data": object, "message": string }`)

## 前端規範 (Frontend Standards)

本專案前端基於 Vue 3 + TypeScript 開發，必須遵守以下規範：

- **單一職責原則**：每個元件應專注於單一功能或職責，避免「萬能元件」
- **邏輯分離**：UI 元件與資料處理邏輯需明確分離
  - UI 元件負責呈現與使用者互動
  - 資料處理邏輯抽取至 Composables、Services 或 Stores
- **可複用性**：共用元件應設計為通用且可配置，避免耦合特定業務邏輯

## 既有程式碼適用原則 (Legacy Code Principles)

本專案目前處於開發中階段，對於既有程式碼的處理原則如下：

- 本憲法所有原則「不溯及既往」，僅適用於「新開發與修改內容」
- 既有程式碼僅在被修改、擴充或重構時，才需逐步符合本憲法規範
- **禁止**以「套用本憲法」為理由，對未變動之既有功能進行非必要調整
- 既有 legacy 行為僅維持運作，不主動擴散至新程式碼

**理由**：避免無謂的重構風險與開發成本，將資源集中於新功能價值交付。

## 禁止事項 (Prohibited Practices)

以下行為嚴格禁止，違反者須提出明確的技術債追蹤計畫：

- **隱性行為變更**：任何改變既有行為的修改，必須伴隨文件與測試更新
- **魔法數值**：禁止在程式碼中直接使用未命名的常數 (如 `if (status == 3)`)，必須使用具名常數或列舉
- **隱性副作用**：方法或函式不得產生未在命名或註解中說明的副作用 (如修改全域狀態)
- **跨層存取**：如前述，Controller 不得直接呼叫 Repository
- **犧牲可理解性**：不得為了追求「程式碼簡潔」而犧牲可讀性 (如過度使用 Lambda 或 Stream 導致邏輯難以追蹤)

## 治理與修訂 (Governance)

- **最高指導原則**：本憲法優先於所有其他開發慣例與個人偏好
- **修訂程序**：憲法修訂需經過團隊討論、文件化理由、版本號更新，並同步更新相關範本與指引
- **版本控制**：
  - **MAJOR**：破壞性變更（移除或重新定義核心原則）
  - **MINOR**：新增原則或大幅擴充既有原則
  - **PATCH**：文字修正、範例補充、非語義變更
- **合規檢查**：所有 Pull Request 與 Code Review 必須驗證是否符合本憲法
- **複雜度豁免**：若需違反原則，必須在設計文件中提出明確理由與風險評估

**Version**: 1.0.0 | **Ratified**: 2026-01-23 | **Last Amended**: 2026-01-23
