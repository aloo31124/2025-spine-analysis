# Feature Specification: 操作員商品創建權限綁定

**Feature Branch**: `001-operator-product-binding`  
**Created**: 2026-01-27  
**Status**: ✅ Implemented  
**Completed**: 2026-01-27  
**Input**: User description: "讓操作員Operator可新增商品但歸屬於店長StoreManager並記錄createId欄位"

## Implementation Summary

### Completed Components

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

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 操作員創建商品並自動綁定店長 (Priority: P1)

操作員在系統中新增商品時，系統自動將商品所有權歸屬於其綁定的店長，同時記錄實際創建者為操作員本身。

**Why this priority**: 這是核心功能需求，確保操作員能執行日常商品管理工作，同時維持正確的商品所有權關係和創建者追蹤。

**Independent Test**: 可透過操作員登入系統，新增一筆商品，驗證商品的 userId（所有者）為店長 ID，createId（創建者）為操作員 ID，即可獨立測試此功能。

**Acceptance Scenarios**:

1. **Given** 操作員已登入系統且綁定至某店長，**When** 操作員新增枕頭商品，**Then** 系統應將商品 userId 設為店長 ID，createId 設為操作員 ID
2. **Given** 操作員已登入系統且綁定至某店長，**When** 操作員新增床墊商品，**Then** 系統應將商品 userId 設為店長 ID，createId 設為操作員 ID
3. **Given** 操作員已登入系統且綁定至某店長，**When** 操作員編輯商品，**Then** 系統應保持原始 userId（店長）和 createId（原創建者）不變

---

### User Story 2 - 店長查看操作員創建的商品 (Priority: P2)

店長可以查看和管理所有歸屬於自己的商品，包括由操作員創建的商品，並可識別實際創建者。

**Why this priority**: 店長需要完整掌握商品管理權限，並能追蹤哪些商品是由操作員創建的，以便進行監督和管理。

**Independent Test**: 店長登入系統後查看商品列表，能看到所有歸屬於自己的商品（包括操作員創建的），商品詳情中可識別創建者資訊。

**Acceptance Scenarios**:

1. **Given** 店長已登入系統，**When** 店長查看枕頭商品列表，**Then** 系統應顯示所有 userId 為該店長的商品（包括操作員創建的）
2. **Given** 店長查看商品詳情，**When** 商品由操作員創建，**Then** 系統應顯示創建者為操作員的名稱或 ID
3. **Given** 店長已登入系統，**When** 店長編輯或刪除操作員創建的商品，**Then** 系統應允許操作並記錄修改者

---

### User Story 3 - 系統驗證操作員身份與綁定關係 (Priority: P1)

系統在操作員創建商品前，必須驗證該用戶為操作員角色且已綁定至店長。

**Why this priority**: 確保資料完整性和權限控制的基礎，避免未綁定的操作員創建無效商品或權限錯誤。

**Independent Test**: 嘗試以未綁定店長的操作員身份創建商品，系統應拒絕操作；以已綁定的操作員創建則應成功。

**Acceptance Scenarios**:

1. **Given** 用戶為操作員且已綁定店長，**When** 用戶嘗試新增商品，**Then** 系統應允許操作並正確設置商品關係
2. **Given** 用戶為操作員但未綁定店長，**When** 用戶嘗試新增商品，**Then** 系統應拒絕操作並提示「操作員未綁定店長」
3. **Given** 用戶為店長（非操作員），**When** 用戶新增商品，**Then** 系統應按原邏輯處理，userId 和 createId 均為店長自己

---

### User Story 4 - 操作員設定頁面檢視綁定店長資訊 (Priority: P2)

店長在「操作員設定」頁面管理操作員時，可以查看每位操作員綁定至哪位店長的詳細資訊，方便管理和確認綁定關係。

**Why this priority**: 管理功能的重要補充，讓店長能清楚掌握操作員的歸屬關係，避免綁定錯誤或重複綁定的情況。

**Independent Test**: 店長登入後進入「操作員設定」頁面，在操作員列表中可以看到每位操作員對應的綁定店長名稱或 ID，即可驗證功能正常運作。

**Acceptance Scenarios**:

1. **Given** 店長已登入並進入「操作員設定」頁面，**When** 系統顯示操作員列表，**Then** 每位操作員記錄應顯示其綁定的店長名稱及 email
2. **Given** 店長查看操作員列表，**When** 操作員已綁定至當前店長，**Then** 系統應清楚標示該操作員屬於當前店長
3. **Given** 店長查看操作員詳情，**When** 點擊或展開操作員資訊，**Then** 系統應顯示完整的綁定關係資訊（店長名稱、email、綁定時間）

---

### Edge Cases

- **操作員被解除綁定後**: 已創建的商品仍然歸屬原店長，createId 不變
- **操作員重新綁定至不同店長**: 之前創建的商品仍歸屬原店長，新創建的商品歸屬新店長
- **店長帳號被停用或刪除**: 需決定商品如何處理（轉移、保留、標記等）
- **操作員同時為其他角色**: 系統應優先檢查是否為操作員，若是則套用操作員邏輯
- **商品資料表 createId 欄位為空或遺失**: 對於舊資料的處理方式（預設為 userId 或標記為系統創建）

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: 系統在處理商品創建請求時，必須檢查當前用戶是否為操作員角色
- **FR-002**: 若用戶為操作員，系統必須查詢 StoreManagerToOperator 表以取得綁定的店長 ID
- **FR-003**: 系統必須在商品資料表中新增 `createId` 欄位，用於記錄實際創建者的 userId
- **FR-004**: 操作員創建商品時，系統必須將商品的 `userId`（所有者）設為綁定的店長 ID
- **FR-005**: 操作員創建商品時，系統必須將商品的 `createId`（創建者）設為操作員自己的 userId
- **FR-006**: 非操作員創建商品時，系統必須保持原有邏輯，`userId` 和 `createId` 均設為創建者自己的 userId
- **FR-007**: 系統必須驗證操作員是否已綁定店長，若未綁定則拒絕商品創建操作
- **FR-008**: 系統必須在枕頭商品（ProductPillow）創建流程中套用此綁定邏輯
- **FR-009**: 系統必須在床墊商品（ProductMattress）創建流程中套用此綁定邏輯
- **FR-010**: 系統必須確保商品查詢、編輯、刪除等操作基於 `userId`（所有者）而非 `createId`
- **FR-011**: 系統必須在商品列表和商品詳情頁中都顯示 `createId`（實際創建者）的名稱或帳號資訊
- **FR-012**: 系統必須在「操作員設定」頁面的操作員列表中顯示每位操作員綁定的店長資訊
- **FR-013**: 系統必須提供查詢操作員綁定店長詳細資訊的功能，包括店長名稱、email 及綁定時間
- **FR-014**: 系統必須在操作員列表中清楚標示哪些操作員屬於當前登入的店長

### Key Entities *(include if feature involves data)*

- **Product (商品)**: 
  - `userId`: 商品所有者（對操作員創建的商品為店長 ID，其他情況為創建者 ID）
  - `createId`: 實際創建者的 userId（新增欄位）
  - 其他商品屬性（名稱、規格、價格等）

- **StoreManagerToOperator (店長綁定操作員)**:
  - `storeManagerId`: 店長的 userId
  - `operatorId`: 操作員的 userId
  - 用於查詢操作員綁定的店長關係

- **UserToRole (用戶角色)**:
  - 用於識別用戶是否為操作員（Operator）角色

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 操作員創建的所有商品，其 userId 必須正確指向綁定的店長，準確率 100%
- **SC-002**: 操作員創建的所有商品，其 createId 必須正確記錄操作員 ID，準確率 100%
- **SC-003**: 店長可查看並管理所有歸屬於自己的商品（包括操作員創建的），查詢準確率 100%
- **SC-004**: 未綁定店長的操作員嘗試創建商品時，系統拒絕率 100%，並提供明確錯誤訊息
- **SC-005**: 非操作員用戶創建商品時，維持原有邏輯不受影響，相容性 100%
- **SC-006**: 商品創建流程響應時間不因新增驗證邏輯而增加超過 200ms
- **SC-007**: 在「操作員設定」頁面中，所有操作員的綁定店長資訊顯示正確率 100%

## Assumptions *(optional)*

- 操作員在創建商品時已完成登入驗證，系統可取得當前用戶 ID
- StoreManagerToOperator 表已正確建立並維護操作員與店長的綁定關係
- 商品資料表結構支援新增 `createId` 欄位（資料庫 schema 需更新）
- 現有商品（無 createId 欄位的舊資料）的 createId 應設為與 userId 相同，表示由所有者自己創建
- 操作員只會綁定一位店長（一對一關係）
- 商品的編輯和刪除權限基於 userId（所有者），不受 createId 影響

## Dependencies *(optional)*

- 需依賴現有的 StoreManagerToOperator 表及其相關服務（storeManagerToOperatorService）
- 需依賴 UserToRole 服務來識別用戶角色
- 需要更新商品資料表 schema，新增 createId 欄位
- 前端商品創建組件（CreateEditProductPillow.jsx、CreateEditProductMattress.jsx）需支援傳遞 createId
- 後端商品服務層（productPillow.service.js、productMattress.service.js）需實作綁定邏輯

## Out of Scope *(optional)*

- 修改商品的所有權轉移功能（例如將操作員創建的商品轉給其他店長）
- 批量修改或遷移現有商品的 createId 欄位
- 操作員績效追蹤或統計報表（基於 createId 的分析功能）
- 多重綁定（一個操作員綁定多個店長）的支援
- createId 的權限控制或顯示邏輯（僅實作資料記錄）
- 商品編輯時修改 createId 的功能（應為不可變更欄位）

## Non-Functional Considerations *(optional)*

### Security
- 必須驗證操作員身份並確認綁定關係，防止未授權商品創建
- createId 欄位應設為僅在創建時寫入，後續不可修改
- 需記錄操作日誌（audit log）以追蹤商品創建者

### Performance
- 新增的角色檢查和綁定查詢應使用索引優化，避免影響商品創建效能
- 考慮快取操作員與店長的綁定關係，減少資料庫查詢

### Data Integrity
- createId 欄位應為必填（操作員創建時）或可為 null（舊資料相容）
- userId 和 createId 的關聯性應透過資料庫約束或應用層驗證確保一致性
- 需要資料庫遷移腳本（migration）來新增 createId 欄位至現有商品表

### Compatibility
- 需向下相容現有商品資料（無 createId 的商品）
- 前端介面應能優雅地顯示有/無 createId 的商品
- API 回應格式應包含 createId 欄位，前端不依賴該欄位則不影響

## Open Questions *(optional)*

- 操作員被解除綁定後，是否需要保留其 createId 資訊還是匿名化處理？
- 是否需要提供 API 讓店長查詢特定操作員創建的所有商品？

## Clarifications

### Session 2026-01-27

- Q: 舊商品資料的 createId 應設為 null 還是與 userId 相同？ → A: 設為與 userId 相同（表示由所有者自己創建）
- Q: 是否需要在前端商品列表中顯示「創建者」欄位，或僅在詳情頁顯示？ → A: 在商品列表和詳情頁都顯示創建者欄位
