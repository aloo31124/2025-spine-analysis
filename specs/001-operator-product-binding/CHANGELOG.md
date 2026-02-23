# 規格變更記錄 (Changelog)

**Feature**: 001-operator-product-binding  
**Last Updated**: 2026-01-28

---

## Phase 2 更新 (2026-01-28)

### 📋 變更摘要

本次更新擴展了操作員的權限範圍，新增商品編輯權限和最近編輯者追蹤功能。

### ✨ 新增功能

#### 1. 操作員查看權限擴展
- **FR-008**: 操作員可查看所屬店長的**所有商品**（不僅限自己創建的商品）
- **FR-009**: 店長可查看所有歸屬於自己的商品（包括操作員創建的）
- **FR-010**: 系統自動識別用戶角色並套用相應的查詢邏輯

#### 2. 操作員編輯權限
- **FR-011**: 操作員可編輯所屬店長的所有商品（不論 createId 是誰）
- **FR-012**: 系統驗證操作員編輯權限（商品 userId 必須等於綁定的店長 ID）
- **FR-013**: 店長可編輯所有歸屬於自己的商品
- **FR-014**: 確保編輯時 userId 和 createId 不可被修改

#### 3. 最近編輯者追蹤
- **FR-015**: 新增 `lastEditId` 欄位（記錄最近編輯者的 userId）
- **FR-016**: 新增 `lastEditTime` 欄位（記錄最後編輯時間）
- **FR-017**: 商品創建時自動設定 lastEditId 和 lastEditTime
- **FR-018**: 商品編輯時自動更新 lastEditId 為當前編輯者
- **FR-019**: 商品編輯時自動更新 lastEditTime 為當前時間
- **FR-020**: lastEditId 和 lastEditTime 由後端自動設定，前端不可手動傳入

#### 4. UI 顯示增強
- **FR-021**: 商品列表頁顯示「最近編輯者」欄位
- **FR-022**: 商品列表頁顯示「最後編輯時間」欄位
- **FR-023**: 商品列表頁繼續顯示「創建者」欄位
- **FR-024**: 商品詳情頁顯示完整的創建者和最近編輯者資訊

#### 5. 後端 Log 記錄
- **FR-025**: 商品創建時記錄 log（包含操作者、商品 ID、商品名稱、時間戳記）
- **FR-026**: 商品編輯時記錄 log（包含操作者、商品 ID、修改欄位、修改前後值、時間戳記）
- **FR-027**: 商品刪除時記錄 log（包含操作者、商品 ID、商品名稱、時間戳記）
- **FR-028**: 使用統一的 logger 服務，包含 log level（INFO/ERROR）

### 📊 資料模型變更

#### ProductPillow / ProductMattress 新增欄位

| 欄位 | 類型 | 必填 | 說明 |
|------|------|------|------|
| `lastEditId` | String | ✅ | 最近編輯者的 userId |
| `lastEditTime` | Timestamp | ✅ | 最後編輯時間 |

#### 欄位規則

**lastEditId**:
- 商品創建時：`lastEditId` = `createId`
- 商品編輯時：`lastEditId` = 當前編輯者 userId
- 舊資料遷移：`lastEditId` = `createId` 或 `userId`

**lastEditTime**:
- 商品創建時：`lastEditTime` = 當前時間戳記
- 商品編輯時：`lastEditTime` = 編輯完成時間
- 舊資料遷移：`lastEditTime` = `createDate`

### 🎯 新增 User Stories

- **User Story 2**: 操作員檢視所屬店長的所有商品 (Priority: P1)
- **User Story 3**: 操作員編輯所屬店長的所有商品 (Priority: P1)
- **User Story 4**: 商品列表顯示最近編輯者資訊 (Priority: P2)

### 🎯 Success Criteria 更新

新增成功標準：
- **SC-005**: 操作員可查看所屬店長的所有商品，查詢準確率 100%
- **SC-007 ~ SC-010**: 操作員編輯權限和資料正確性標準
- **SC-011 ~ SC-013**: UI 顯示正確性標準
- **SC-014 ~ SC-016**: 後端 log 記錄完整性標準
- **SC-018 ~ SC-019**: 效能標準（編輯和查詢響應時間）

### 📝 文件更新

已更新的文件：
- ✅ `spec.md` - 完整規格文件
- ✅ `data-model.md` - 資料模型和驗證規則
- ⏳ `plan.md` - 待更新實作計劃
- ⏳ `tasks.md` - 待更新任務清單
- ⏳ `contracts/api-contracts.md` - 待更新 API 契約

### 🔄 待辦事項

1. 更新 `plan.md` 以反映新的實作需求
2. 更新 `tasks.md` 以包含新功能的開發任務
3. 更新 `contracts/api-contracts.md` 以包含新增的 API 欄位和驗證規則
4. 更新資料庫 schema（新增 lastEditId 和 lastEditTime 欄位）
5. 實作後端 logger 服務（如尚未建置）
6. 更新前端商品列表組件以顯示新欄位
7. 更新後端商品服務層以實作編輯權限驗證和編輯者追蹤

### 🔍 相容性注意事項

- 舊資料（無 lastEditId 和 lastEditTime 欄位）會在查詢時自動補值
- API 向下相容，前端不依賴新欄位仍可正常運作
- 建議執行批量遷移腳本以更新舊資料（選用）

---

## Phase 1 初始實作 (2026-01-27)

### 初始功能
- 操作員創建商品時自動綁定店長
- 新增 createId 欄位記錄實際創建者
- 商品列表顯示創建者資訊
- 操作員設定頁面顯示綁定店長資訊
