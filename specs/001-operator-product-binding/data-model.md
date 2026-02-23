# Data Model: 操作員商品創建與編輯權限綁定

**Feature**: 001-operator-product-binding
**Phase**: 1 - Design & Contracts
**Created**: 2026-01-27
**Last Updated**: 2026-01-28

---

## 1. 實體定義

### 1.1 ProductPillow (枕頭商品)

**Collection Name**: `ProductPillow`

| 欄位 | 類型 | 必填 | 說明 |
|------|------|------|------|
| id | String | ✅ | 文件 ID |
| name | String | ✅ | 商品名稱 |
| price | String | ✅ | 商品價格 |
| state | String | ✅ | 商品狀態 (上架/下架) |
| type | String | ❌ | 商品類型 |
| userId | String | ✅ | 商品所有者 (店長 ID) |
| **createId** | String | ✅ | **實際創建者 ID (新增欄位)** |
| **lastEditId** | String | ✅ | **最近編輯者 ID (新增欄位)** |
| **lastEditTime** | Timestamp | ✅ | **最後編輯時間 (新增欄位)** |
| shortHeight | Number | ❌ | 短高度 |
| longHeight | Number | ❌ | 長高度 |
| shortCurvature | Number | ❌ | 短弧度 |
| mediumCurvature | Number | ❌ | 中弧度 |
| longCurvature | Number | ❌ | 長弧度 |
| stock | Number | ❌ | 庫存數量 |
| createDate | Timestamp | ❌ | 建立時間 |

**createId 欄位規則**:
- 操作員創建：`createId` = 操作員 userId，`userId` = 店長 userId
- 店長/其他角色創建：`createId` = `userId` = 創建者 userId
- 舊資料遷移：`createId` = `userId`（表示由所有者自己創建）

**lastEditId 欄位規則** **[NEW]**:
- 商品創建時：`lastEditId` = `createId`（創建者即為最近編輯者）
- 商品編輯時：`lastEditId` = 當前編輯者 userId（可能是店長或操作員）
- 舊資料遷移：`lastEditId` = `createId` 或 `userId`

**lastEditTime 欄位規則** **[NEW]**:
- 商品創建時：`lastEditTime` = 當前時間戳記
- 商品編輯時：`lastEditTime` = 編輯完成的時間戳記
- 舊資料遷移：`lastEditTime` = `createDate`

---

### 1.2 ProductMattress (床墊商品)

**Collection Name**: `ProductMattress`

| 欄位 | 類型 | 必填 | 說明 |
|------|------|------|------|
| id | String | ✅ | 文件 ID |
| name | String | ✅ | 商品名稱 |
| price | String | ✅ | 商品價格 |
| state | String | ✅ | 商品狀態 (上架/下架) |
| type | String | ❌ | 商品類型 |
| userId | String | ✅ | 商品所有者 (店長 ID) |
| **createId** | String | ✅ | **實際創建者 ID (新增欄位)** |
| **lastEditId** | String | ✅ | **最近編輯者 ID (新增欄位)** |
| **lastEditTime** | Timestamp | ✅ | **最後編輯時間 (新增欄位)** |
| hardness | Number | ❌ | 硬度 |
| thickness | Number | ❌ | 厚度 |
| size | String | ❌ | 尺寸 |
| stock | Number | ❌ | 庫存數量 |
| createDate | Timestamp | ❌ | 建立時間 |

---

### 1.3 StoreManagerToOperator (店長綁定操作員)

**Collection Name**: `StoreManagerToOperator`

| 欄位 | 類型 | 必填 | 說明 |
|------|------|------|------|
| id | String | ✅ | 綁定記錄 ID |
| storeManagerId | String | ✅ | 店長的 userId |
| operatorId | String | ✅ | 操作員的 userId |
| createdAt | Timestamp | ✅ | 綁定時間 |

**關係說明**:
- 一位操作員只能綁定一位店長 (一對一)
- 一位店長可以綁定多位操作員 (一對多)

---

### 1.4 UserToRole (用戶角色)

**Collection Name**: `UserToRole`

| 欄位 | 類型 | 必填 | 說明 |
|------|------|------|------|
| id | String | ✅ | 記錄 ID |
| userId | String | ✅ | 用戶 ID |
| role | String | ✅ | 角色名稱 (Admin/StoreManager/Operator) |

---

### 1.5 User (用戶)

**Collection Name**: `User`

| 欄位 | 類型 | 必填 | 說明 |
|------|------|------|------|
| id | String | ✅ | 用戶 ID |
| mail | String | ✅ | 電子郵件 |
| account | String | ❌ | 帳號名稱 |
| password | String | ✅ | 密碼 (加密) |

---

## 2. 實體關係圖

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         User (用戶)                                      │
│  ┌─────┬──────────────────┬───────────────┐                             │
│  │ id  │ mail             │ account       │                             │
│  └──┬──┴──────────────────┴───────────────┘                             │
│     │                                                                    │
│     ├──────────────────┬──────────────────────────┐                     │
│     │                  │                          │                     │
│     ▼                  ▼                          ▼                     │
│ ┌────────────┐   ┌───────────────────┐   ┌────────────────────────────┐│
│ │ UserToRole │   │ StoreManagerTo    │   │ ProductPillow/             ││
│ │            │   │ Operator          │   │ ProductMattress            ││
│ │ userId ────┼───┤ storeManagerId    │   │ userId (所有者)            ││
│ │ role       │   │ operatorId ───────┼───┤ createId (創建者)          ││
│ └────────────┘   └───────────────────┘   │ lastEditId (最近編輯者)    ││
│                                           │ lastEditTime (最後編輯時間)││
│                                           └────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────┘

關係說明：
• User 1:N UserToRole (一個用戶可有多個角色)
• StoreManager 1:N Operator (一個店長可綁定多個操作員)
• User 1:N Product (一個用戶可擁有多個商品，透過 userId)
• Operator → Product.createId (操作員創建商品時記錄)
• User → Product.lastEditId (任何用戶編輯商品時記錄最近編輯者)
```

---

## 3. 資料流程

### 3.1 操作員創建商品流程

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   前端      │    │ Controller  │    │  Service    │    │   Model     │
│ (React)     │    │ (Express)   │    │ (Business)  │    │ (Firestore) │
└──────┬──────┘    └──────┬──────┘    └──────┬──────┘    └──────┬──────┘
       │                  │                  │                  │
       │ POST /api/product-pillow/add        │                  │
       │ {name, price...} │                  │                  │
       │ JWT Token ───────┤                  │                  │
       │                  │                  │                  │
       │                  │ verifyJwt()      │                  │
       │                  │ userId = token   │                  │
       │                  │──────────────────┤                  │
       │                  │                  │                  │
       │                  │    addProductPillow(product)        │
       │                  │──────────────────┤                  │
       │                  │                  │                  │
       │                  │                  │ isOperator(userId)
       │                  │                  │──────────────────┤
       │                  │                  │◄─── true/false ──┤
       │                  │                  │                  │
       │                  │                  │ [if operator]    │
       │                  │                  │ getStoreManagerId│
       │                  │                  │──────────────────┤
       │                  │                  │◄── storeManagerId│
       │                  │                  │                  │
       │                  │                  │ add({            │
       │                  │                  │   userId: storeMgr│
       │                  │                  │   createId: operator│
       │                  │                  │   lastEditId: operator│
       │                  │                  │   lastEditTime: now│
       │                  │                  │ })               │
       │                  │                  │──────────────────┤
       │                  │                  │                  │
       │                  │                  │ logger.info(     │
       │                  │                  │   'CREATE', productId│
       │                  │                  │ )                │
       │                  │                  │                  │
       │                  │◄─────────────────┤                  │
       │◄─────────────────┤                  │                  │
       │ { success: true }│                  │                  │
       │                  │                  │                  │
```

### 3.2 操作員編輯商品流程 **[NEW]**

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   前端      │    │ Controller  │    │  Service    │    │   Model     │
│ (React)     │    │ (Express)   │    │ (Business)  │    │ (Firestore) │
└──────┬──────┘    └──────┬──────┘    └──────┬──────┘    └──────┬──────┘
       │                  │                  │                  │
       │ PUT /api/product-pillow/update      │                  │
       │ {id, name, price...}                │                  │
       │ JWT Token ───────┤                  │                  │
       │                  │                  │                  │
       │                  │ verifyJwt()      │                  │
       │                  │ userId = token   │                  │
       │                  │──────────────────┤                  │
       │                  │                  │                  │
       │                  │    updateProductPillow(product)     │
       │                  │──────────────────┤                  │
       │                  │                  │                  │
       │                  │                  │ getProduct(id)   │
       │                  │                  │──────────────────┤
       │                  │                  │◄─── product ─────┤
       │                  │                  │                  │
       │                  │                  │ isOperator(userId)
       │                  │                  │──────────────────┤
       │                  │                  │◄─── true/false ──┤
       │                  │                  │                  │
       │                  │                  │ [if operator]    │
       │                  │                  │ getStoreManagerId│
       │                  │                  │──────────────────┤
       │                  │                  │◄── storeManagerId│
       │                  │                  │                  │
       │                  │                  │ verify(          │
       │                  │                  │   product.userId ==│
       │                  │                  │   storeManagerId │
       │                  │                  │ )                │
       │                  │                  │                  │
       │                  │                  │ update({         │
       │                  │                  │   ...product,    │
       │                  │                  │   lastEditId: userId│
       │                  │                  │   lastEditTime: now│
       │                  │                  │   // userId, createId不變│
       │                  │                  │ })               │
       │                  │                  │──────────────────┤
       │                  │                  │                  │
       │                  │                  │ logger.info(     │
       │                  │                  │   'UPDATE', productId,│
       │                  │                  │   changedFields  │
       │                  │                  │ )                │
       │                  │                  │                  │
       │                  │◄─────────────────┤                  │
       │◄─────────────────┤                  │                  │
       │ { success: true }│                  │                  │
       │                  │                  │                  │
```

### 3.3 操作員查詢商品列表流程 **[NEW]**

```
前端請求商品列表
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│ Service: getProductPillowList(userId)                       │
│                                                             │
│ 1. 檢查 userId 是否為操作員                                  │
│ 2. [if operator] 查詢綁定的店長 ID                          │
│ 3. 根據店長 ID (userId) 篩選商品                            │
│ 4. 對每筆商品查詢 createId 和 lastEditId 對應的用戶資訊     │
│ 5. 返回包含創建者和最近編輯者名稱的商品列表                 │
└─────────────────────────────────────────────────────────────┘
       │
       ▼
前端顯示：商品名稱 | 價格 | 狀態 | 創建者 | 最近編輯者 | 最後編輯時間
```

### 3.4 查詢商品流程 (含創建者與編輯者資訊)

```
前端請求商品列表
       │
       ▼
┌─────────────────────────────────────────────┐
│ Service: getProductPillowList(userId)       │
│                                             │
│ 1. 根據 userId 篩選商品                      │
│ 2. 對每筆商品查詢 createId 對應的用戶資訊     │
│ 3. 對每筆商品查詢 lastEditId 對應的用戶資訊   │
│ 4. 返回包含創建者和編輯者名稱的商品列表       │
└─────────────────────────────────────────────┘
       │
       ▼
前端顯示：商品名稱 | 價格 | 狀態 | 創建者 | 最近編輯者 | 最後編輯時間
```

---

## 4. 驗證規則

### 4.1 商品創建驗證

| 驗證項目 | 規則 | 錯誤訊息 |
|----------|------|----------|
| 操作員綁定檢查 | 操作員必須已綁定店長 | "操作員未綁定店長" |
| userId 必填 | 不可為空 | "userId 為必填欄位" |
| createId 設定 | 自動設定，不可手動傳入 | N/A (系統自動處理) |
| lastEditId 設定 | 自動設定，不可手動傳入 | N/A (系統自動處理) |
| lastEditTime 設定 | 自動設定，不可手動傳入 | N/A (系統自動處理) |

### 4.2 商品編輯驗證 **[NEW]**

| 驗證項目 | 規則 | 錯誤訊息 |
|----------|------|----------|
| 操作員編輯權限 | 操作員只能編輯所屬店長的商品 | "無權限編輯此商品" |
| userId 不可修改 | 編輯時 userId 不可變更 | "userId 不可修改" |
| createId 不可修改 | 編輯時 createId 不可變更 | "createId 不可修改" |
| lastEditId 自動設定 | 自動更新為當前編輯者，不可手動傳入 | N/A (系統自動處理) |
| lastEditTime 自動設定 | 自動更新為當前時間，不可手動傳入 | N/A (系統自動處理) |

### 4.3 createId 不可變更規則

- createId 僅在**創建時**設定
- 商品編輯時**不可修改** createId
- 此規則在 Service 層強制執行

### 4.4 lastEditId 與 lastEditTime 自動更新規則 **[NEW]**

- lastEditId 和 lastEditTime 僅由後端自動設定
- 前端傳入的 lastEditId 和 lastEditTime 值會被忽略
- 編輯成功後，後端返回更新後的 lastEditId 和 lastEditTime

---

## 5. 遷移策略

### 5.1 舊資料處理

**策略**: 漸進式遷移 + 查詢時補值

```javascript
// 查詢商品時的補值邏輯
function getProduct(id) {
  const product = await Model.get(id);
  
  // 舊資料沒有 createId，預設為 userId
  if (!product.createId) {
    product.createId = product.userId;
  }
  
  // 舊資料沒有 lastEditId，預設為 createId
  if (!product.lastEditId) {
    product.lastEditId = product.createId;
  }
  
  // 舊資料沒有 lastEditTime，預設為 createDate
  if (!product.lastEditTime) {
    product.lastEditTime = product.createDate || new Date();
  }
  
  return product;
}
```

### 5.2 批量遷移腳本 (選用)

```javascript
// 可選：批量更新舊資料
async function migrateCreateIdAndLastEdit() {
  const products = await ProductPillow.getAll();
  
  for (const product of products) {
    const updates = {};
    
    if (!product.createId) {
      updates.createId = product.userId;
    }
    
    if (!product.lastEditId) {
      updates.lastEditId = product.createId || product.userId;
    }
    
    if (!product.lastEditTime) {
      updates.lastEditTime = product.createDate || new Date();
    }
    
    if (Object.keys(updates).length > 0) {
      await ProductPillow.update({
        id: product.id,
        ...updates
      });
    }
  }
}
```

**注意**: 批量遷移為選用，因查詢時補值已能處理舊資料顯示問題。

### 5.3 後端 Log 記錄實作 **[NEW]**

```javascript
// Logger 服務範例
const logger = require('./logger'); // Winston 或 Bunyan

// 商品創建 log
logger.info({
  action: 'CREATE_PRODUCT',
  userId: operatorId,
  productId: newProduct.id,
  productName: newProduct.name,
  productType: 'pillow',
  storeManagerId: storeManagerId,
  timestamp: new Date().toISOString()
});

// 商品編輯 log
logger.info({
  action: 'UPDATE_PRODUCT',
  userId: editorId,
  productId: product.id,
  productName: product.name,
  productType: 'pillow',
  changedFields: ['price', 'state'],
  oldValues: { price: '1000', state: 'active' },
  newValues: { price: '1200', state: 'inactive' },
  timestamp: new Date().toISOString()
});

// 商品刪除 log
logger.info({
  action: 'DELETE_PRODUCT',
  userId: deleterId,
  productId: product.id,
  productName: product.name,
  productType: 'pillow',
  timestamp: new Date().toISOString()
});
```
