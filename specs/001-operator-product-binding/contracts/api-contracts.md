# API Contracts: 操作員商品創建權限綁定

**Feature**: 001-operator-product-binding
**Phase**: 1 - Design & Contracts
**Created**: 2026-01-27

---

## 1. 變更摘要

本功能涉及以下 API 變更：

| API | 變更類型 | 說明 |
|-----|----------|------|
| POST /api/product-pillow/add | 行為變更 | 操作員創建時自動綁定店長 |
| POST /api/product-mattress/add | 行為變更 | 操作員創建時自動綁定店長 |
| GET /api/product-pillow/list | 回應擴充 | 新增 createId 與創建者資訊 |
| GET /api/product-mattress/list | 回應擴充 | 新增 createId 與創建者資訊 |
| GET /api/store-manager-to-operator/list | 回應擴充 | 新增店長詳細資訊 |
| GET /api/store-manager-to-operator/store-manager-info | **新增** | 取得操作員綁定的店長資訊 |

---

## 2. 商品 API

### 2.1 新增枕頭商品

**Endpoint**: `POST /api/product-pillow/add`

**Headers**:
```
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Request Body**:
```json
{
  "name": "舒眠枕頭",
  "price": "1200",
  "state": "上架",
  "type": "記憶枕",
  "shortHeight": 8,
  "longHeight": 12,
  "shortCurvature": 3,
  "mediumCurvature": 5,
  "longCurvature": 7,
  "stock": 50
}
```

**Response (成功 - 操作員創建)**:
```json
{
  "success": true,
  "data": {
    "id": "product_123",
    "name": "舒眠枕頭",
    "price": "1200",
    "state": "上架",
    "type": "記憶枕",
    "userId": "storeManager_456",    // 店長 ID (所有者)
    "createId": "operator_789",       // 操作員 ID (創建者)
    "shortHeight": 8,
    "longHeight": 12,
    "shortCurvature": 3,
    "mediumCurvature": 5,
    "longCurvature": 7,
    "stock": 50,
    "createDate": "2026-01-27T10:30:00Z"
  }
}
```

**Response (成功 - 店長創建)**:
```json
{
  "success": true,
  "data": {
    "id": "product_124",
    "userId": "storeManager_456",    // 店長 ID (所有者)
    "createId": "storeManager_456",  // 店長 ID (創建者 = 所有者)
    // ...其他欄位
  }
}
```

**Response (失敗 - 操作員未綁定店長)**:
```json
{
  "success": false,
  "error": "操作員未綁定店長"
}
```
**Status Code**: 500

---

### 2.2 查詢枕頭商品列表

**Endpoint**: `GET /api/product-pillow/list`

**Headers**:
```
Authorization: Bearer {jwt_token}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "productPillowList": [
      {
        "id": "product_123",
        "name": "舒眠枕頭",
        "price": "1200",
        "state": "上架",
        "userId": "storeManager_456",
        "createId": "operator_789",
        "creatorName": "張小明",        // 新增：創建者名稱
        "creatorEmail": "operator@example.com",  // 新增：創建者 email
        // ...其他欄位
      },
      {
        "id": "product_124",
        "name": "經典枕頭",
        "userId": "storeManager_456",
        "createId": "storeManager_456",
        "creatorName": "王店長",        // 店長自己創建
        "creatorEmail": "manager@example.com",
        // ...其他欄位
      }
    ],
    "pagingParam": {
      "pageIndex": 1,
      "pageSize": 10,
      "dataTotal": 25,
      "pageTotal": 3
    }
  }
}
```

---

### 2.3 新增床墊商品

**Endpoint**: `POST /api/product-mattress/add`

行為與枕頭商品相同，操作員創建時自動綁定店長。

---

### 2.4 查詢床墊商品列表

**Endpoint**: `GET /api/product-mattress/list`

回應格式與枕頭商品相同，新增 `createId`、`creatorName`、`creatorEmail` 欄位。

---

## 3. 操作員管理 API

### 3.1 取得操作員列表 (擴充)

**Endpoint**: `GET /api/account/store-manager-to-operator/list`

**Headers**:
```
Authorization: Bearer {jwt_token}
```

**Response** (擴充後):
```json
{
  "success": true,
  "data": {
    "operatorList": [
      {
        "id": "binding_001",
        "operatorId": "operator_789",
        "userId": "operator_789",
        "userName": "張小明",
        "userEmail": "operator@example.com",
        "userAccount": "zhangxiaoming",
        "createdAt": "2026-01-15T08:00:00Z",
        "storeManager": {              // 新增：綁定店長資訊
          "id": "storeManager_456",
          "name": "王店長",
          "email": "manager@example.com"
        }
      }
    ]
  }
}
```

---

### 3.2 取得操作員綁定的店長資訊 (新增)

**Endpoint**: `GET /api/account/store-manager-to-operator/store-manager-info`

**Headers**:
```
Authorization: Bearer {jwt_token}
```

**Query Parameters**:
```
operatorId: string (必填) - 操作員的 userId
```

**Response (成功)**:
```json
{
  "success": true,
  "data": {
    "storeManager": {
      "id": "storeManager_456",
      "name": "王店長",
      "email": "manager@example.com",
      "bindingDate": "2026-01-15T08:00:00Z"
    }
  }
}
```

**Response (失敗 - 未綁定店長)**:
```json
{
  "success": false,
  "error": "該操作員未綁定店長"
}
```
**Status Code**: 404

---

## 4. 錯誤碼對照表

| 錯誤碼 | HTTP Status | 錯誤訊息 | 說明 |
|--------|-------------|----------|------|
| ERR_OPERATOR_NOT_BOUND | 500 | 操作員未綁定店長 | 操作員嘗試創建商品但未綁定店長 |
| ERR_NOT_AUTHORIZED | 401 | 未授權 | JWT Token 無效或過期 |
| ERR_FORBIDDEN | 403 | 權限不足 | 非店長嘗試存取操作員管理 API |
| ERR_NOT_FOUND | 404 | 該操作員未綁定店長 | 查詢店長資訊時找不到綁定關係 |

---

## 5. 向後相容性說明

### 5.1 API 回應格式變更

| 欄位 | 新增/變更 | 影響評估 |
|------|----------|----------|
| `createId` | 新增欄位 | ✅ 無影響：前端不依賴則忽略 |
| `creatorName` | 新增欄位 | ✅ 無影響：選擇性使用 |
| `creatorEmail` | 新增欄位 | ✅ 無影響：選擇性使用 |
| `storeManager` (operator list) | 新增物件 | ✅ 無影響：選擇性使用 |

### 5.2 API 行為變更

| 變更 | 影響評估 |
|------|----------|
| 操作員創建商品時 userId 自動改為店長 ID | ⚠️ 行為變更：操作員創建的商品將歸屬店長 |
| 非操作員行為不變 | ✅ 無影響：店長/管理員行為維持不變 |

**注意**: 操作員創建商品的行為變更是**預期功能**，非破壞性變更。
