# Feature Specification: 操作員商品創建與編輯權限綁定

**Feature Branch**: `001-operator-product-binding`  
**Created**: 2026-01-27  
**Last Updated**: 2026-01-28  
**Status**: 🔄 Updated - Pending Implementation  
**Completed**: 2026-01-27 (Initial) → 2026-01-28 (Enhanced)  
**Input**: User description: "讓操作員Operator可新增商品但歸屬於店長StoreManager並記錄createId欄位，並新增操作員可檢視和編輯所屬店長所有商品，商品表格新增「最近編輯者」欄位並記錄於資料庫與後端 log"

## Implementation Summary

### Completed Components (Phase 1 - 2026-01-27)

- **Backend Service Layer**: 
  - `productPillow.service.js` / `productMattress.service.js`: 綁定邏輯已實現
  - `storeManagerToOperator.service.js`: 新增 `getStoreManagerInfoByOperatorId()` 方法
- **Backend API Layer**: 
  - 新增 `/store-manager-info` API 端點
- **Model Layer**: 
  - 枕頭/床墊商品 Model 新增 `createId` 欄位
- **Frontend Pages**: 
  - 商品列表頁顯示「創建者」欄位
  - 商品詳情頁顯示創建者資訊
  - 操作員設定頁顯示綁定店長

### New Requirements (Phase 2 - 2026-01-28)

- **Enhanced Operator Permissions**:
  - 操作員可檢視所屬店長的所有商品（不僅限自己創建的）
  - 操作員可編輯所屬店長的所有商品
- **Last Editor Tracking**:
  - 商品資料表新增 `lastEditId` 欄位（最近編輯者 userId）
  - 商品資料表新增 `lastEditTime` 欄位（最後編輯時間）
  - 商品列表 UI 顯示「最近編輯者」資訊
- **Audit Logging**:
  - 後端 log 記錄所有商品編輯操作
  - 記錄內容包含：操作者 userId、操作類型、商品 ID、修改時間

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 操作員創建商品並自動綁定店長 (Priority: P1)

操作員在系統中新增商品時，系統自動將商品所有權歸屬於其綁定的店長，同時記錄實際創建者為操作員本身。

**Why this priority**: 這是核心功能需求，確保操作員能執行日常商品管理工作，同時維持正確的商品所有權關係和創建者追蹤。

**Independent Test**: 可透過操作員登入系統，新增一筆商品，驗證商品的 userId（所有者）為店長 ID，createId（創建者）為操作員 ID，lastEditId 為操作員 ID，即可獨立測試此功能。

**Acceptance Scenarios**:

1. **Given** 操作員已登入系統且綁定至某店長，**When** 操作員新增枕頭商品，**Then** 系統應將商品 userId 設為店長 ID，createId 設為操作員 ID，lastEditId 設為操作員 ID
2. **Given** 操作員已登入系統且綁定至某店長，**When** 操作員新增床墊商品，**Then** 系統應將商品 userId 設為店長 ID，createId 設為操作員 ID，lastEditId 設為操作員 ID
3. **Given** 操作員創建商品，**When** 商品創建成功，**Then** 後端 log 應記錄操作員 ID、操作類型（CREATE）、商品 ID 及時間戳記

---

### User Story 2 - 操作員檢視所屬店長的所有商品 (Priority: P1) **[NEW]**

操作員登入系統後，可以查看所屬店長的所有商品（不僅限於自己創建的商品），以便進行商品管理和編輯工作。

**Why this priority**: 操作員需要能夠管理店長的完整商品庫存，而非僅限於自己創建的商品，這是日常運營的基本需求。

**Independent Test**: 操作員登入系統後進入商品列表頁，應能看到所有歸屬於其綁定店長的商品（包括店長本人創建的和其他操作員創建的）。

**Acceptance Scenarios**:

1. **Given** 操作員已登入且綁定至店長 A，**When** 操作員進入枕頭商品列表頁，**Then** 系統應顯示所有 userId 為店長 A 的枕頭商品
2. **Given** 操作員已登入且綁定至店長 A，**When** 操作員進入床墊商品列表頁，**Then** 系統應顯示所有 userId 為店長 A 的床墊商品
3. **Given** 店長 A 有 10 筆商品（3 筆由店長自己創建，4 筆由操作員 B 創建，3 筆由操作員 C 創建），**When** 操作員 B 查看商品列表，**Then** 應顯示全部 10 筆商品

---

### User Story 3 - 操作員編輯所屬店長的所有商品 (Priority: P1) **[NEW]**

操作員可以編輯所屬店長的任何商品（不論創建者是誰），編輯後系統自動更新「最近編輯者」為該操作員，並記錄編輯時間。

**Why this priority**: 操作員需要完整的商品編輯權限來協助店長管理商品，不應受限於只能編輯自己創建的商品。

**Independent Test**: 操作員登入後選擇任一商品（包括店長或其他操作員創建的）進行編輯，確認可成功儲存，並驗證 lastEditId 更新為該操作員 ID。

**Acceptance Scenarios**:

1. **Given** 操作員 A 綁定至店長 B，商品由店長 B 創建，**When** 操作員 A 編輯該商品，**Then** 系統應允許編輯並將 lastEditId 設為操作員 A 的 ID
2. **Given** 操作員 A 編輯商品，**When** 商品更新成功，**Then** 系統應更新 lastEditTime 為當前時間戳記
3. **Given** 操作員 A 編輯商品，**When** 商品更新成功，**Then** 後端 log 應記錄操作員 A 的 userId、操作類型（UPDATE）、商品 ID、修改欄位及時間戳記
4. **Given** 操作員 A 編輯商品，**When** 編輯操作完成，**Then** 商品的 userId（所有者）和 createId（創建者）應保持不變

---

### User Story 4 - 商品列表顯示最近編輯者資訊 (Priority: P2) **[NEW]**

在商品列表頁中，每筆商品除了顯示創建者外，還應顯示「最近編輯者」的名稱及編輯時間，方便追蹤商品的維護狀態。

**Why this priority**: 提供編輯歷史的可見性，讓店長和操作員能快速識別商品的最新維護狀態和負責人。

**Independent Test**: 進入商品列表頁，確認每筆商品顯示「創建者」和「最近編輯者」欄位，且資訊正確對應資料庫中的 createId 和 lastEditId。

**Acceptance Scenarios**:

1. **Given** 商品列表頁已載入，**When** 商品曾被編輯，**Then** 應顯示「最近編輯者」欄位，內容為編輯者的名稱或 email
2. **Given** 商品列表頁已載入，**When** 商品從未被編輯（新創建），**Then** 「最近編輯者」應顯示為創建者
3. **Given** 商品列表頁已載入，**When** 查看商品列表，**Then** 應顯示「最後編輯時間」欄位，格式為 ISO 8601 標準（如：2026-01-28 14:30:00 或 2026-01-28T14:30:00+08:00）

---

### User Story 5 - 店長查看操作員創建的商品 (Priority: P2)

店長可以查看和管理所有歸屬於自己的商品，包括由操作員創建的商品，並可識別實際創建者和最近編輯者。

**Why this priority**: 店長需要完整掌握商品管理權限，並能追蹤哪些商品是由操作員創建的，以便進行監督和管理。

**Independent Test**: 店長登入系統後查看商品列表，能看到所有歸屬於自己的商品（包括操作員創建的），商品詳情中可識別創建者和最近編輯者資訊。

**Acceptance Scenarios**:

1. **Given** 店長已登入系統，**When** 店長查看枕頭商品列表，**Then** 系統應顯示所有 userId 為該店長的商品（包括操作員創建的）
2. **Given** 店長查看商品詳情，**When** 商品由操作員創建，**Then** 系統應顯示創建者為操作員的名稱或 ID
3. **Given** 店長查看商品詳情，**When** 商品曾被操作員編輯，**Then** 系統應顯示最近編輯者為操作員的名稱或 ID
4. **Given** 店長已登入系統，**When** 店長編輯或刪除操作員創建的商品，**Then** 系統應允許操作並記錄修改者(編輯時記錄 lastEditId，刪除時記錄刪除 log)

---

### User Story 6 - 系統驗證操作員身份與綁定關係 (Priority: P1)

系統在操作員創建商品前，必須驗證該用戶為操作員角色且已綁定至店長。

**Why this priority**: 確保資料完整性和權限控制的基礎，避免未綁定的操作員創建無效商品或權限錯誤。

**Independent Test**: 嘗試以未綁定店長的操作員身份創建商品，系統應拒絕操作；以已綁定的操作員創建則應成功。

**Acceptance Scenarios**:

1. **Given** 用戶為操作員且已綁定店長，**When** 用戶嘗試新增商品，**Then** 系統應允許操作並正確設置商品關係
2. **Given** 用戶為操作員但未綁定店長，**When** 用戶嘗試新增商品，**Then** 系統應拒絕操作並提示「操作員未綁定店長」
3. **Given** 用戶為店長（非操作員），**When** 用戶新增商品，**Then** 系統應按原邏輯處理，userId 和 createId 均為店長自己

---

### User Story 7 - 操作員設定頁面檢視綁定店長資訊 (Priority: P2)

店長在「操作員設定」頁面管理操作員時，可以查看每位操作員綁定至哪位店長的詳細資訊，方便管理和確認綁定關係。

**Why this priority**: 管理功能的重要補充，讓店長能清楚掌握操作員的歸屬關係，避免綁定錯誤或重複綁定的情況。

**Independent Test**: 店長登入後進入「操作員設定」頁面，在操作員列表中可以看到每位操作員對應的綁定店長名稱或 ID，即可驗證功能正常運作。

**Acceptance Scenarios**:

1. **Given** 店長已登入並進入「操作員設定」頁面，**When** 系統顯示操作員列表，**Then** 每位操作員記錄應顯示其綁定的店長名稱及 email
2. **Given** 店長查看操作員列表，**When** 操作員已綁定至當前店長，**Then** 系統應清楚標示該操作員屬於當前店長
3. **Given** 店長查看操作員詳情，**When** 點擊或展開操作員資訊，**Then** 系統應顯示完整的綁定關係資訊（店長名稱、email、綁定時間）

---

### Edge Cases

- **操作員被解除綁定後**: 已創建的商品仍然歸屬原店長，createId 和 lastEditId **永久保留不變**，前端顯示時對已離職用戶顯示「已離職用戶」標記
- **操作員重新綁定至不同店長**: 之前創建的商品仍歸屬原店長，新創建的商品歸屬新店長；操作員僅可編輯當前綁定店長的商品
- **店長帳號被停用或刪除**: 需決定商品如何處理（轉移、保留、標記等）
- **操作員同時為其他角色**: 系統應優先檢查是否為操作員，若是則套用操作員邏輯
- **商品資料表 createId 或 lastEditId 欄位為空或遺失**: 對於舊資料的處理方式（預設為 userId 或標記為系統創建）
- **多位操作員同時編輯同一商品**: 使用樂觀鎖機制，檢查 version 欄位，若版本號不符則拒絕儲存並提示「商品已被其他人修改，請重新載入」
- **操作員查詢商品時無綁定店長**: 系統應返回空列表或提示「未綁定店長」
- **商品版本號溢位**: version 欄位使用 Number 類型，理論上限為 2^53-1，實務上不會達到此上限
- **操作員嘗試刪除商品**: 系統應拒絕操作並返回 403 錯誤，前端不應顯示刪除按鈕給操作員

## Requirements *(mandatory)*

### Functional Requirements

#### 商品創建權限
- **FR-001**: 系統在處理商品創建請求時，必須檢查當前用戶是否為操作員角色
- **FR-002**: 若用戶為操作員，系統必須查詢 StoreManagerToOperator 表以取得綁定的店長 ID
- **FR-003**: 系統必須在商品資料表中新增 `createId` 欄位，用於記錄實際創建者的 userId
- **FR-004**: 操作員創建商品時，系統必須將商品的 `userId`（所有者）設為綁定的店長 ID
- **FR-005**: 操作員創建商品時，系統必須將商品的 `createId`（創建者）設為操作員自己的 userId
- **FR-006**: 非操作員創建商品時，系統必須保持原有邏輯，`userId` 和 `createId` 均設為創建者自己的 userId
- **FR-007**: 系統必須驗證操作員是否已綁定店長，若未綁定則拒絕商品創建操作

#### 商品查看權限 **[NEW]**
- **FR-008**: 操作員查詢商品列表時，系統必須返回所屬店長的所有商品（userId 等於綁定店長 ID 的所有商品）
- **FR-009**: 店長查詢商品列表時，系統必須返回所有歸屬於該店長的商品（包括操作員創建的商品）
- **FR-010**: 系統必須在商品查詢 API 中自動識別當前用戶角色（操作員或店長），並套用相應的查詢邏輯

#### 商品編輯權限 **[NEW]**
- **FR-011**: 操作員必須能夠編輯所屬店長的所有商品（不論 createId 是誰）
- **FR-012**: 系統在處理商品編輯請求時，必須驗證操作員是否有權限編輯該商品（商品 userId 必須等於操作員綁定的店長 ID）
- **FR-013**: 店長必須能夠編輯所有歸屬於自己的商品（userId 等於店長 ID 的商品）
- **FR-014**: 系統必須確保商品編輯時 `userId`（所有者）和 `createId`（創建者）欄位不可被修改
#### 商品刪除權限 **[NEW]**
- **FR-040**: 操作員不得刪除任何商品，系統必須在刪除請求時驗證用戶非操作員角色
- **FR-041**: 僅店長可刪除歸屬於自己的商品(userId 等於店長 ID 的商品)
- **FR-042**: 系統在處理刪除請求時，若用戶為操作員，必須返回 403 Forbidden 錯誤，錯誤訊息為「操作員無商品刪除權限」
- **FR-043**: 前端介面在操作員登入時，不得顯示商品刪除按鈕或刪除功能入口
#### 最近編輯者追蹤 **[NEW]**
- **FR-015**: 系統必須在商品資料表中新增 `lastEditId` 欄位，用於記錄最近編輯者的 userId
- **FR-016**: 系統必須在商品資料表中新增 `lastEditTime` 欄位（Timestamp 類型），用於記錄最後編輯時間
- **FR-017**: 商品創建時，系統必須將 `lastEditId` 設為創建者的 userId，`lastEditTime` 設為當前時間
- **FR-018**: 商品編輯時，系統必須自動更新 `lastEditId` 為當前編輯者的 userId
- **FR-019**: 商品編輯時，系統必須自動更新 `lastEditTime` 為當前時間戳記
- **FR-020**: 系統必須確保 `lastEditId` 和 `lastEditTime` 由後端自動設定，前端不可手動傳入

#### 樂觀鎖與版本控制 **[NEW]**
- **FR-034**: 系統必須在商品資料表中新增 `version` 欄位（Number 類型），用於實作樂觀鎖機制
- **FR-035**: 商品創建時，系統必須將 `version` 設為 1
- **FR-036**: 商品編輯時，系統必須驗證前端傳入的 `version` 是否與資料庫中的值相同
- **FR-037**: 若 `version` 不符，系統必須拒絕編輯操作並返回 409 Conflict 錯誤，錯誤訊息為「商品已被其他人修改，請重新載入」
- **FR-038**: 若 `version` 相符，系統必須在儲存後將 `version` 加 1
- **FR-039**: 前端必須在編輯表單中包含當前商品的 `version` 值，並在提交時一併傳送

#### UI 顯示需求 **[NEW]**
- **FR-021**: 系統必須在商品列表頁中顯示「最近編輯者」欄位，內容為 lastEditId 對應的用戶名稱或 email
- **FR-022**: 系統必須在商品列表頁中顯示「最後編輯時間」欄位，格式為 ISO 8601 標準（YYYY-MM-DD HH:mm:ss 或 YYYY-MM-DDTHH:mm:ss+TZ）
- **FR-023**: 系統必須在商品列表頁中繼續顯示「創建者」欄位，內容為 createId 對應的用戶名稱或 email
- **FR-024**: 系統必須在商品詳情頁中顯示完整的創建者和最近編輯者資訊
- **FR-044**: 前端顯示創建者或編輯者名稱時，若用戶已離職或刪除，應顯示「已離職用戶」或類似標記，而非顯示錯誤或空白
- **FR-044**: 前端顯示創建者或編輯者名稱時，若用戶已離職或刪除，應顯示「已離職用戶」或類似標記，而非顯示錯誤或空白

#### 後端 Log 記錄 **[NEW]**
- **FR-025**: 系統必須在商品創建時記錄後端 log，包含：操作者 userId、操作類型（CREATE）、商品 ID、商品名稱、時間戳記
- **FR-026**: 系統必須在商品編輯時記錄後端 log，包含：操作者 userId、操作類型（UPDATE）、商品 ID、修改欄位列表、修改前後值（標準欄位記錄完整值，大型欄位僅標記 [MODIFIED]）、時間戳記
- **FR-027**: 系統必須在商品刪除時(僅店長可執行)記錄後端 log，包含：操作者 userId(店長 ID)、操作類型(DELETE)、商品 ID、商品名稱、時間戳記
- **FR-028**: 後端 log 必須使用統一的 logger 服務，並包含 log level（INFO/ERROR）

#### 通用需求
- **FR-029**: 系統必須在枕頭商品（ProductPillow）的創建、編輯流程中套用上述所有邏輯
- **FR-030**: 系統必須在床墊商品（ProductMattress）的創建、編輯流程中套用上述所有邏輯
- **FR-031**: 系統必須在「操作員設定」頁面的操作員列表中顯示每位操作員綁定的店長資訊
- **FR-032**: 系統必須提供查詢操作員綁定店長詳細資訊的功能，包括店長名稱、email 及綁定時間
- **FR-033**: 系統必須在操作員列表中清楚標示哪些操作員屬於當前登入的店長

### Key Entities *(include if feature involves data)*

- **Product (商品)**: 
  - `userId`: 商品所有者（對操作員創建的商品為店長 ID，其他情況為創建者 ID）
  - `createId`: 實際創建者的 userId（新增欄位）
  - `lastEditId`: **[NEW]** 最近編輯者的 userId（新增欄位）
  - `lastEditTime`: **[NEW]** 最後編輯時間（Timestamp 類型，新增欄位）
  - `version`: **[NEW]** 樂觀鎖版本號（Number 類型，新增欄位）
  - 其他商品屬性（名稱、規格、價格等）

- **StoreManagerToOperator (店長綁定操作員)**:
  - `storeManagerId`: 店長的 userId
  - `operatorId`: 操作員的 userId
  - 用於查詢操作員綁定的店長關係

- **UserToRole (用戶角色)**:
  - 用於識別用戶是否為操作員（Operator）角色

- **User (用戶)**:
  - `id`: 用戶 ID
  - `mail`: 電子郵件
  - `account`: 帳號名稱
  - 用於顯示創建者和編輯者的名稱或 email

## Success Criteria *(mandatory)*

### Measurable Outcomes

#### 資料正確性
- **SC-001**: 操作員創建的所有商品，其 userId 必須正確指向綁定的店長，準確率 100%
- **SC-002**: 操作員創建的所有商品，其 createId 必須正確記錄操作員 ID，準確率 100%
- **SC-003**: 未綁定店長的操作員嘗試創建商品時，系統拒絕率 100%，並提供明確錯誤訊息
- **SC-004**: 非操作員用戶創建商品時，維持原有邏輯不受影響，相容性 100%

#### 查看權限 **[NEW]**
- **SC-005**: 操作員可查看所屬店長的所有商品（不論創建者），查詢準確率 100%
- **SC-006**: 店長可查看並管理所有歸屬於自己的商品（包括操作員創建的），查詢準確率 100%

#### 編輯權限 **[NEW]**
- **SC-007**: 操作員可成功編輯所屬店長的所有商品（不論 createId），編輯成功率 100%
- **SC-008**: 操作員編輯商品時，lastEditId 必須正確更新為操作員 ID，準確率 100%
- **SC-009**: 操作員編輯商品時，lastEditTime 必須正確更新為當前時間，準確率 100%
- **SC-010**: 商品編輯時，userId 和 createId 欄位保持不變，準確率 100%

#### UI 顯示 **[NEW]**
- **SC-011**: 商品列表頁必須正確顯示「最近編輯者」欄位，顯示準確率 100%
- **SC-012**: 商品列表頁必須正確顯示「最後編輯時間」欄位，格式為易讀的日期時間，顯示準確率 100%
- **SC-013**: 商品列表頁必須繼續正確顯示「創建者」欄位，顯示準確率 100%

#### 後端 Log **[NEW]**
- **SC-014**: 所有商品創建操作必須記錄後端 log，記錄率 100%
- **SC-015**: 所有商品編輯操作必須記錄後端 log，包含修改欄位和修改值，記錄率 100%
- **SC-016**: 所有商品刪除操作必須記錄後端 log，記錄率 100%

#### 效能
- **SC-017**: 商品創建流程響應時間不因新增驗證邏輯而增加超過 200ms
- **SC-018**: 商品編輯流程響應時間不因新增編輯者追蹤而增加超過 200ms
- **SC-019**: 商品列表查詢響應時間不因新增最近編輯者資訊而增加超過 300ms

#### 管理功能
- **SC-020**: 在「操作員設定」頁面中，所有操作員的綁定店長資訊顯示正確率 100%

## Assumptions *(optional)*

- 操作員在創建或編輯商品時已完成登入驗證，系統可取得當前用戶 ID
- StoreManagerToOperator 表已正確建立並維護操作員與店長的綁定關係
- 商品資料表結構支援新增 `createId`、`lastEditId`、`lastEditTime` 欄位（資料庫 schema 需更新）
- 現有商品（無 createId 欄位的舊資料）的 createId 應設為與 userId 相同，表示由所有者自己創建
- 現有商品（無 lastEditId 欄位的舊資料）的 lastEditId 應設為與 createId 相同，lastEditTime 設為 createDate
- 操作員只會綁定一位店長（一對一關係）
- 商品的編輯權限基於 userId(所有者)及操作員綁定關係，不受 createId 影響
- 商品的刪除權限僅限店長，操作員無刪除權限
- **[NEW]** 操作員有權限編輯所屬店長的所有商品，但無刪除權限，無需額外的商品級別權限控制
- **[NEW]** 後端 log 系統已建置且可正常運作，支援結構化 log 記錄
- **[NEW]** 前端可透過 API 取得用戶的名稱或 email，用於顯示創建者和編輯者資訊
- **[NEW]** 操作員被解除綁定或離職後，其 createId 和 lastEditId 永久保留不變，前端負責檢查用戶狀態並適當顯示
- **[NEW]** User 表建議採用軟刪除機制（如 isDeleted 或 status 欄位），而非實際刪除用戶記錄
- **[NEW]** 操作員被解除綁定或離職後，其 createId 和 lastEditId 永久保留不變，前端負責檢查用戶狀態並適當顯示
- **[NEW]** User 表建議採用軟刪除機制（如 isDeleted 或 status 欄位），而非實際刪除用戶記錄

## Dependencies *(optional)*

- 需依賴現有的 StoreManagerToOperator 表及其相關服務（storeManagerToOperatorService）
- 需依賴 UserToRole 服務來識別用戶角色
- 需要更新商品資料表 schema，新增 createId、lastEditId、lastEditTime 欄位
- 前端商品創建組件（CreateEditProductPillow.jsx、CreateEditProductMattress.jsx）需支援傳遞 createId
- 後端商品服務層（productPillow.service.js、productMattress.service.js）需實作綁定邏輯、編輯權限驗證和編輯者追蹤
- **[NEW]** 需依賴後端 logger 服務（如 Winston 或 Bunyan）來記錄操作 log
- **[NEW]** 需依賴 User 服務來查詢用戶名稱或 email（用於前端顯示創建者和編輯者）
- **[NEW]** 前端商品列表組件需更新以顯示「最近編輯者」和「最後編輯時間」欄位

## Out of Scope *(optional)*

- 修改商品的所有權轉移功能（例如將操作員創建的商品轉給其他店長）
- 批量修改或遷移現有商品的 createId、lastEditId、version 欄位
- 操作員申請刪除商品的審核流程(若需刪除由店長直接執行)
- 操作員績效追蹤或統計報表（基於 createId 或 lastEditId 的分析功能）
- 多重綁定（一個操作員綁定多個店長）的支援
- createId 或 lastEditId 的權限控制或顯示邏輯（僅實作資料記錄）
- 商品編輯時修改 createId 的功能（應為不可變更欄位）
- **[NEW]** 商品編輯歷史記錄的完整版本控制（僅記錄最近一次編輯者）
- **[NEW]** 前端即時通知其他用戶商品正在被編輯（防止編輯衝突）
- **[NEW]** 操作員對特定商品的細粒度權限控制（如只能編輯特定類型商品）
- **[NEW]** 後端 log 的前端查詢介面或管理介面

## Non-Functional Considerations *(optional)*

### Security
- 必須驗證操作員身份並確認綁定關係，防止未授權商品創建
- 必須驗證操作員編輯權限，確保只能編輯所屬店長的商品
- createId 欄位應設為僅在創建時寫入，後續不可修改
- lastEditId 和 lastEditTime 欄位應由後端自動設定，前端不可手動傳入
- 需記錄操作日誌（audit log）以追蹤商品創建者和編輯者
- **[NEW]** 後端 log 必須包含足夠的資訊以進行安全稽核和問題追蹤

### Performance
- 新增的角色檢查和綁定查詢應使用索引優化，避免影響商品創建效能
- 考慮快取操作員與店長的綁定關係，減少資料庫查詢
- **[NEW]** 商品查詢時取得創建者和編輯者名稱應使用批次查詢或快取，避免 N+1 查詢問題
- **[NEW]** 後端 log 記錄應為非同步操作，不影響 API 響應時間

### Data Integrity
- createId 欄位應為必填（操作員創建時）或可為 null（舊資料相容）
- userId 和 createId 的關聯性應透過資料庫約束或應用層驗證確保一致性
- 需要資料庫遷移腳本（migration）來新增 createId、lastEditId、lastEditTime、version 欄位至現有商品表
- **[NEW]** lastEditId 和 lastEditTime 必須同時更新，確保資料一致性
- **[NEW]** 編輯操作失敗時，lastEditId 和 lastEditTime 不應更新
- **[NEW]** lastEditTime 應以 ISO 8601 格式儲存（建議使用 UTC 時間，前端顯示時轉換為本地時區）

### Compatibility
- 需向下相容現有商品資料（無 createId、lastEditId 的商品）
- 前端介面應能優雅地顯示有/無 createId、lastEditId 的商品
- API 回應格式應包含 createId、lastEditId、lastEditTime 欄位，前端不依賴該欄位則不影響
- **[NEW]** 舊版前端應能正常運作（即使不顯示最近編輯者欄位）

### Observability **[NEW]**
- 後端 log 應包含結構化資訊，便於 log 分析工具解析
- 後端 log 應包含 request ID 或 trace ID，便於追蹤完整的請求鏈
- 後端 log 應設定合適的 log level（INFO 用於正常操作，ERROR 用於異常）
- 後端 log 記錄修改值時，標準欄位（name, price, state, type, stock, 規格欄位）應記錄完整修改前後值
- 大型欄位（圖片 URL、超過 500 字的描述、二進位資料）僅記錄欄位名稱和 [MODIFIED] 標記，不記錄完整內容

## Open Questions *(optional)*

- 是否需要提供 API 讓店長查詢特定操作員創建的所有商品？
- **[NEW]** 是否需要提供 API 讓店長查詢特定操作員編輯過的所有商品？
- 後端 log 的保留期限為何？是否需要定期清理或歸檔？
- 是否需要在前端提供商品編輯歷史的完整查詢功能（而非僅顯示最近編輯者）？
- **[NEW]** User 表是否應採用軟刪除（標記 isDeleted）而非實際刪除，以支援已離職用戶的歷史記錄顯示？

## Clarifications

### Session 2026-01-27

- Q: 舊商品資料的 createId 應設為 null 還是與 userId 相同？ → A: 設為與 userId 相同（表示由所有者自己創建）
- Q: 是否需要在前端商品列表中顯示「創建者」欄位，或僅在詳情頁顯示？ → A: 在商品列表和詳情頁都顯示創建者欄位

### Session 2026-01-28

- Q: 多位操作員同時編輯同一商品時，應使用何種衝突處理機制？ → A: 使用樂觀鎖（Optimistic Locking）- 新增 version 欄位，編輯時檢查版本號，衝突時拒絕儲存並提示使用者重新載入
- Q: 後端 log 應記錄所有欄位的完整修改值，還是對大型欄位採用不同策略？ → A: 記錄所有欄位但大型欄位（如圖片 URL、長描述）僅標記「[MODIFIED]」，不記錄完整內容，以平衡稽核需求與儲存成本
- Q: 最後編輯時間在前端應以何種格式顯示？ → A: 使用 ISO 8601 格式（YYYY-MM-DD HH:mm:ss 或 YYYY-MM-DDTHH:mm:ss+TZ），確保國際標準一致性與時區正確性- Q: 操作員是否有商品刪除權限？ → A: 僅店長可刪除商品，操作員無刪除權限，以降低誤刪風險並維持權限分級原則
- Q: 操作員被解除綁定或離職後，其創建和編輯的商品記錄應如何處理？ → A: 保留原始 createId 和 lastEditId 不變，維持完整稽核軌跡。前端顯示時檢查用戶狀態，對已離職用戶顯示「已離職用戶」標記