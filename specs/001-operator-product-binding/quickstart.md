# Quickstart: 操作員商品創建權限綁定

**Feature**: 001-operator-product-binding
**Phase**: 1 - Design & Contracts
**Created**: 2026-01-27

---

## 1. 開發環境設定

### 1.1 必要條件

- Node.js 20+
- npm 或 yarn
- Firebase CLI (用於部署)
- Git

### 1.2 專案結構

```
2025-spine-analysis/
├── spine-server/     # 後端服務 (Express + Firebase Functions)
├── spine-client/     # 前端應用 (React 19)
└── specs/            # 功能規範文件
```

### 1.3 啟動後端服務

```bash
cd spine-server

# 安裝依賴
npm install

# 本地開發 (使用 Firebase Emulator)
firebase emulators:start --only functions

# 或直接使用 Node.js
node src/index.js
```

### 1.4 啟動前端應用

```bash
cd spine-client

# 安裝依賴
npm install

# 啟動開發伺服器
npm start

# 開發伺服器會在 http://localhost:3000 啟動
```

---

## 2. 測試資料設定

### 2.1 建立測試用戶

在 Firestore 中建立以下測試資料：

**User 集合**:
```javascript
// 店長帳號
{
  id: "storeManager_001",
  mail: "manager@test.com",
  account: "測試店長",
  password: "[hashed_password]"
}

// 操作員帳號
{
  id: "operator_001",
  mail: "operator@test.com",
  account: "測試操作員",
  password: "[hashed_password]"
}
```

**UserToRole 集合**:
```javascript
// 店長角色
{
  id: "role_001",
  userId: "storeManager_001",
  role: "StoreManager"
}

// 操作員角色
{
  id: "role_002",
  userId: "operator_001",
  role: "Operator"
}
```

**StoreManagerToOperator 集合**:
```javascript
// 綁定關係
{
  id: "binding_001",
  storeManagerId: "storeManager_001",
  operatorId: "operator_001",
  createdAt: "2026-01-27T00:00:00Z"
}
```

### 2.2 測試情境

| 情境 | 登入帳號 | 預期行為 |
|------|----------|----------|
| 操作員創建商品 | operator@test.com | 商品 userId = 店長 ID，createId = 操作員 ID |
| 店長創建商品 | manager@test.com | 商品 userId = createId = 店長 ID |
| 店長查看商品 | manager@test.com | 可看到自己和操作員創建的所有商品 |
| 未綁定操作員創建商品 | (移除綁定後測試) | 返回錯誤「操作員未綁定店長」 |

---

## 3. 開發指南

### 3.1 修改後端 Service 層

**檔案**: `spine-server/src/services/productPillow.service.js`

```javascript
/* 新增枕頭商品 - 含操作員綁定邏輯 */
exports.addProductPillow = async (productPillow) => {
    const storeManagerToOperatorService = require('./storeManagerToOperator.service');
    
    // 1. 檢查是否為操作員
    const isOperator = await storeManagerToOperatorService.isOperator(productPillow.userId);
    
    if (isOperator) {
        // 2. 取得綁定的店長 ID
        const storeManagerId = await storeManagerToOperatorService.getStoreManagerIdByOperatorId(productPillow.userId);
        
        if (!storeManagerId) {
            throw new Error('操作員未綁定店長');
        }
        
        // 3. 設定商品歸屬
        return ProductPillow.addProductPillow({
            ...productPillow,
            userId: storeManagerId,      // 商品歸屬店長
            createId: productPillow.userId  // 記錄實際創建者
        });
    }
    
    // 非操作員：userId = createId
    return ProductPillow.addProductPillow({
        ...productPillow,
        createId: productPillow.userId
    });
}
```

### 3.2 修改後端 Model 層

**檔案**: `spine-server/src/models/productPillow.model.js`

在 constructor 和 addProductPillow 方法中新增 `createId` 欄位處理。

### 3.3 修改前端列表頁面

**檔案**: `spine-client/src/pages.spine/manager/ProductPillowListPage.jsx`

在表格中新增「創建者」欄位：

```jsx
<th>創建者</th>
// ...
<td>{product.creatorName || product.createId || '-'}</td>
```

### 3.4 修改操作員設定頁面

**檔案**: `spine-client/src/pages.spine/manager/OperatorManagementPage.jsx`

在操作員列表中顯示綁定的店長資訊。

---

## 4. 驗證清單

### 4.1 後端驗證

- [ ] 操作員創建商品時，userId 正確設為店長 ID
- [ ] 操作員創建商品時，createId 正確設為操作員 ID
- [ ] 店長創建商品時，userId = createId = 店長 ID
- [ ] 未綁定店長的操作員創建商品時，返回正確錯誤訊息
- [ ] 商品列表 API 返回 createId 和創建者資訊

### 4.2 前端驗證

- [ ] 商品列表頁面顯示創建者欄位
- [ ] 商品詳情頁面顯示創建者資訊
- [ ] 操作員設定頁面顯示綁定的店長資訊
- [ ] 錯誤訊息正確顯示（操作員未綁定店長）

---

## 5. 常見問題

### Q1: 如何測試操作員未綁定店長的情況？

A: 在 Firestore 中刪除 `StoreManagerToOperator` 集合中對應的綁定記錄，然後以該操作員身份嘗試創建商品。

### Q2: 舊商品沒有 createId 欄位怎麼處理？

A: 查詢時會自動補值，將 createId 設為 userId（表示由所有者自己創建）。

### Q3: 如何確認商品是由操作員還是店長創建的？

A: 比較 `userId` 和 `createId`：
- 若相同：由所有者（店長）自己創建
- 若不同：由操作員創建（createId 為操作員 ID）

---

## 6. 參考資源

- [spec.md](./spec.md) - 功能規範
- [data-model.md](./data-model.md) - 資料模型
- [api-contracts.md](./contracts/api-contracts.md) - API 契約
- [research.md](./research.md) - 技術研究
