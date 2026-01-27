# Research: 操作員商品創建權限綁定

**Feature**: 001-operator-product-binding
**Phase**: 0 - Outline & Research
**Created**: 2026-01-27

---

## 1. 技術背景研究

### 1.1 現有架構分析

**後端架構 (spine-server)**
- **框架**: Express.js 4.21 + Firebase Functions 6.2
- **資料庫**: Firebase Firestore (NoSQL)
- **分層結構**: Controller → Service → Model
- **認證機制**: JWT Token (jsonwebtoken 9.0)

**前端架構 (spine-client)**
- **框架**: React 19 + React Router DOM 7.1
- **狀態管理**: useState/useEffect (無 Redux)
- **API 呼叫**: Axios 1.7
- **樣式**: CSS Modules

### 1.2 現有綁定機制分析

**StoreManagerToOperator 表結構** (已存在):
```javascript
{
  id: String,           // 文件 ID
  storeManagerId: String,  // 店長的 userId
  operatorId: String,      // 操作員的 userId
  createdAt: Timestamp     // 建立時間
}
```

**現有服務方法** (`storeManagerToOperator.service.js`):
- `isOperator(userId)` - 檢查用戶是否為操作員
- `getStoreManagerIdByOperatorId(operatorId)` - 取得操作員綁定的店長 ID
- `getOperatorListByStoreManager(storeManagerId)` - 取得店長的所有操作員

### 1.3 商品創建流程分析

**現有 addProductPillow 流程**:
1. Controller 接收請求，驗證 JWT Token
2. 從 Token 取得 userId
3. 呼叫 `productPillow.service.addProductPillow()`
4. Service 層已實作操作員檢查 (部分完成)
5. Model 層寫入 Firestore

**發現問題**:
- ✅ Service 層已有操作員判斷邏輯
- ❌ Model 層尚未定義 `createId` 欄位
- ❌ 前端列表未顯示創建者資訊
- ❌ 操作員設定頁面未顯示綁定店長資訊

---

## 2. 設計決策

### 2.1 createId 欄位處理策略

**Decision**: 在 Model 層新增 `createId` 欄位，舊資料設為與 `userId` 相同

**Rationale**: 
- 符合 Clarifications 中的決議：舊資料 createId = userId
- 向後相容：現有查詢不受影響
- 前端可優雅處理有/無 createId 的情況

**Alternatives Considered**:
- 設為 null：被否決，因會造成前端顯示「未知」的不佳體驗

### 2.2 Service 層綁定邏輯

**Decision**: 在 `addProductPillow()` 和 `addProductMattress()` 中實作統一綁定邏輯

**Rationale**:
- 符合憲法原則 I：所有業務邏輯在 Service 層
- 已有部分實作，僅需補充完整
- 確保兩種商品行為一致

**Implementation Pattern**:
```javascript
// 綁定邏輯偽代碼
async addProduct(product) {
  const isOperator = await isOperator(product.userId);
  
  if (isOperator) {
    const storeManagerId = await getStoreManagerIdByOperatorId(product.userId);
    if (!storeManagerId) throw new Error('操作員未綁定店長');
    
    return Model.add({
      ...product,
      userId: storeManagerId,      // 商品歸屬店長
      createId: product.userId     // 記錄實際創建者
    });
  }
  
  // 非操作員：userId = createId = 當前用戶
  return Model.add({
    ...product,
    createId: product.userId
  });
}
```

### 2.3 前端顯示策略

**Decision**: 在商品列表和詳情頁都顯示創建者欄位

**Rationale**:
- 符合 Clarifications 中的決議
- 提升店長管理效率，快速識別商品來源

**UI 設計**:
- 列表頁：新增「創建者」欄位，顯示帳號名稱
- 詳情頁：在商品資訊區塊顯示創建者資訊

### 2.4 操作員設定頁面擴充

**Decision**: 在操作員列表中新增「綁定店長」欄位

**Rationale**:
- 滿足 FR-012 至 FR-014 需求
- 讓店長清楚掌握操作員歸屬關係

**需新增 API**:
- 取得操作員綁定的店長詳細資訊（名稱、email）

---

## 3. 風險評估

| 風險 | 影響 | 緩解措施 |
|------|------|----------|
| Firestore 查詢效能 | 新增角色檢查可能增加延遲 | 考慮快取 isOperator 結果 |
| 舊資料遷移 | 大量商品需更新 createId | 採用漸進式遷移，查詢時補值 |
| 前端相容性 | 現有元件需修改 | 採用條件渲染，處理 createId 不存在情況 |

---

## 4. 待辦事項清單

### Phase 1 輸出物

- [ ] `data-model.md` - 定義 createId 欄位結構
- [ ] `contracts/api-contracts.md` - 定義 API 變更
- [ ] `quickstart.md` - 開發環境設定指南

### 後端修改清單

| 檔案 | 修改內容 |
|------|----------|
| `productPillow.model.js` | 新增 createId 欄位定義 |
| `productMattress.model.js` | 新增 createId 欄位定義 |
| `productPillow.service.js` | 確認綁定邏輯完整性 |
| `productMattress.service.js` | 實作相同綁定邏輯 |
| `storeManagerToOperator.service.js` | 新增取得店長詳細資訊方法 |

### 前端修改清單

| 檔案 | 修改內容 |
|------|----------|
| `ProductPillowListPage.jsx` | 新增創建者欄位顯示 |
| `ProductMattressListPage.jsx` | 新增創建者欄位顯示 |
| `OperatorManagementPage.jsx` | 新增綁定店長資訊顯示 |
| `storeManagerToOperator.js` | 新增取得店長資訊 API |

---

## 5. 結論

本功能的技術複雜度為**低至中等**，主要原因：

1. **已有基礎設施**：StoreManagerToOperator 表和相關服務已存在
2. **架構符合**：現有分層架構支援此變更，無需重構
3. **向後相容**：新增欄位不影響現有功能

**建議實作順序**：
1. 後端 Model 層新增 createId 欄位
2. 後端 Service 層完善綁定邏輯
3. 前端列表頁面新增創建者顯示
4. 前端操作員設定頁面新增店長資訊
