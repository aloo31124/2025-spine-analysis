---
name: permission-role
description: >
  脊椎分析系統的分權管理機制。定義了 Admin、GeneralManager、DistrictManager、
  StoreManager、Operator 五種角色的權限範圍、資料綁定關係、白名單路由控制，
  以及各角色的 CRUD 管理流程和 API 端點。
version: 1.0.0
---

# 分權管理 (Permission & Role)

## 1. 系統概述

本系統採用**角色型存取控制 (RBAC)** 機制，透過 `UserToRole` 表將使用者與角色綁定。
每位使用者**僅能擁有一個角色**（新增角色前會檢查是否已有其他角色）。
前端以**白名單 (whitelist)** 機制控制左選單可見節點；後端以 **JWT Token + 角色檢查** 進行 API 保護。

### 技術棧

| 層級 | 技術 |
|------|------|
| 前端 | React (JSX)、React Router、CSS Modules |
| 後端 | Node.js / Express |
| 資料庫 | Firebase Firestore |
| 認證 | JWT Token (Bearer) |
| 狀態管理 | localStorage（角色、選中店長 ID） |

---

## 2. 角色定義

系統共有 **5 種角色**，儲存於 Firestore `UserToRole` 集合的 `role` 欄位：

| 角色 | role 值 | 說明 | 管理者 |
|------|---------|------|--------|
| 系統管理員 | `Admin` | 最高權限，可進入所有功能 | 手動建立 / 種子資料 |
| 總經理 | `GeneralManager` | 可檢視所有店長的營收與庫存，管理經理與區經理 | Admin、GeneralManager |
| 區經理 | `DistrictManager` | 可檢視其負責區域內店長的營收與庫存 | Admin、GeneralManager |
| 店長 | `StoreManager` | 管理自己所屬店面、商品、客戶、營收、庫存 | Admin |
| 操作員 | `Operator` | 綁定店長，僅可操作商品與客戶，無營收庫存權限 | StoreManager |

### 約束條件

- 一位使用者**只能擁有一個角色**。新增角色前，系統會檢查 `UserToRole` 表中該 userId 是否已有紀錄。
- 角色新增流程：輸入 email → 查詢 `User` 表是否存在 → 檢查 `UserToRole` 是否已有角色 → 寫入角色。

---

## 3. 白名單權限對照表

前端透過 `MenuLeft.jsx` 中的 `canAccess(feature)` 函式，依角色比對白名單決定左選單哪些項目可見。

### 3.1 功能節點 (feature) 與頁面對照

| feature 識別碼 | 頁面名稱 | 路由 |
|----------------|----------|------|
| `photo-capture` | 拍照上傳 | `/manager/photo-capture` |
| `analysis-spine` | 頸部分析 | `/manager/analysis-spine` |
| `analysis-tail` | 尾椎分析 | `/manager/analysis-tail` |
| `customer` | 客戶管理 | `/manager/customer/list` |
| `product-pillow` | 枕頭商品 | `/manager/product-pillow/list` |
| `product-mattress` | 床墊管理 | `/manager/product-mattress/list` |
| `product-inventory` | 商品庫存 | `/manager/product-inventory` |
| `revenue` | 營收管理 | `/manager/revenue` |
| `operator-management` | 操作員設定 | `/manager/operator-management` |
| `manager-setting` | 經理設定 | `/manager/manager-setting` |
| `district-manager-setting` | 區經理設定 | `/manager/district-manager-setting` |
| `store-management` | 店面管理 | `/manager/store/list` |
| `role-management` | 店長設定 | `/manager/role-management` |
| `plan` | 方案管理 | `/manager/plan` |
| `system` | 系統管理 | `/manager/system` |

### 3.2 角色 × 功能 存取矩陣

| 功能 | Admin | GeneralManager | DistrictManager | StoreManager | Operator |
|------|:-----:|:--------------:|:---------------:|:------------:|:--------:|
| 拍照上傳 | ✅ | ❌ | ❌ | ✅ | ✅ |
| 頸部分析 | ✅ | ❌ | ❌ | ✅ | ✅ |
| 尾椎分析 | ✅ | ❌ | ❌ | ✅ | ✅ |
| 客戶管理 | ✅ | ❌ | ❌ | ✅ | ✅ |
| 枕頭商品 | ✅ | ❌ | ❌ | ✅ | ✅ |
| 床墊管理 | ✅ | ❌ | ❌ | ✅ | ✅ |
| 商品庫存 | ✅ | ✅ | ✅* | ✅ | ❌ |
| 營收管理 | ✅ | ✅ | ✅* | ✅ | ❌ |
| 經理設定 | ✅ | ✅ | ❌ | ❌ | ❌ |
| 區經理設定 | ✅ | ✅ | ❌ | ❌ | ❌ |
| 店長設定 | ✅ | ❌ | ❌ | ❌ | ❌ |
| 店面管理 | ✅ | ✅ | ❌ | ✅ | ❌ |
| 操作員設定 | ✅ | ❌ | ❌ | ✅ | ❌ |
| 方案管理 | ✅ | ❌ | ❌ | ❌ | ❌ |
| 系統管理 | ✅ | ❌ | ❌ | ❌ | ❌ |

> *DistrictManager 的庫存/營收僅可檢視其負責區域內店長的資料（透過 Header 店長下拉選單切換）。

---

## 4. 資料模型 (Firestore Collections)

### 4.1 UserToRole — 使用者角色綁定

| 欄位 | 型別 | 說明 |
|------|------|------|
| `id` | string | 文件 ID（自動生成） |
| `userId` | string | 使用者 ID（對應 `User.id`） |
| `role` | string | 角色值：`Admin` / `GeneralManager` / `DistrictManager` / `StoreManager` / `Operator` |

**關鍵方法**：
- `findByUserId(userId)` → 取得使用者所有角色
- `findByUserIdAndRole(userId, role)` → 精確查詢
- `add({userId, role})` → 新增角色綁定
- `delete(id)` → 刪除角色綁定
- `search({role}, pagingParam)` → 依角色搜尋（支援分頁）

### 4.2 StoreManagerToOperator — 店長綁定操作員

| 欄位 | 型別 | 說明 |
|------|------|------|
| `id` | string | 文件 ID |
| `storeManagerId` | string | 店長的 userId |
| `operatorId` | string | 操作員的 userId |
| `createdAt` | timestamp | 建立時間 |
| `updatedAt` | timestamp | 更新時間 |

**綁定規則**：
- 一位店長可綁定**多位**操作員
- 一位操作員只能綁定**一位**店長

**關鍵方法**：
- `findByStoreManagerId(storeManagerId)` → 取得店長下所有操作員
- `findByOperatorId(operatorId)` → 取得操作員所屬店長
- `isOperatorBound(operatorId)` → 檢查是否已綁定
- `add({storeManagerId, operatorId})` / `delete(id)`

### 4.3 Store — 店面

| 欄位 | 型別 | 說明 |
|------|------|------|
| `id` | string | 文件 ID |
| `name` | string | 店面名稱 |
| `region` | string | 所屬區域（北區、中區、南區、東區、離島區） |
| `address` | string | 地址 |
| `phone` | string | 電話 |
| `storeManagerId` | string / null | 所屬店長 userId（可為空） |
| `notes` | string | 備註 |
| `createdAt` | timestamp | 建立時間 |
| `updatedAt` | timestamp | 更新時間 |

**綁定規則**：
- 一位店長可管理**多間**店面
- 一間店面最多只能綁定**一位**店長

### 4.4 District — 區域

| 欄位 | 型別 | 說明 |
|------|------|------|
| `id` | string | 文件 ID |
| `name` | string | 區域名稱 |
| `createdAt` | timestamp | 建立時間 |
| `updatedAt` | timestamp | 更新時間 |

### 4.5 DistrictManagerToDistrict — 區經理綁定區域

| 欄位 | 型別 | 說明 |
|------|------|------|
| `id` | string | 文件 ID |
| `districtId` | string | 區域 ID（對應 `District.id`） |
| `districtManagerUserId` | string | 區經理 userId |
| `createdAt` | timestamp | 建立時間 |
| `updatedAt` | timestamp | 更新時間 |

**綁定規則**：M:N 關係，一位區經理可管理多個區域。

### 4.6 DistrictToStoreManager — 區域綁定店長

| 欄位 | 型別 | 說明 |
|------|------|------|
| `id` | string | 文件 ID |
| `districtId` | string | 區域 ID |
| `storeManagerUserId` | string | 店長 userId |
| `createdAt` | timestamp | 建立時間 |
| `updatedAt` | timestamp | 更新時間 |

**綁定規則**：M:N 關係，一個區域可包含多位店長，一位店長可屬於多個區域。

---

## 5. 資料關聯圖

```
User (使用者)
 │
 ├── UserToRole (角色綁定，1:1 約束)
 │    ├── Admin
 │    ├── GeneralManager
 │    ├── DistrictManager
 │    ├── StoreManager
 │    └── Operator
 │
 ├── StoreManagerToOperator (店長↔操作員，1:N)
 │    ├── storeManagerId → User.id (店長)
 │    └── operatorId    → User.id (操作員)
 │
 ├── Store (店面，N:1 綁定店長)
 │    └── storeManagerId → User.id (店長，可為 null)
 │
 ├── District (區域)
 │    ├── DistrictManagerToDistrict (區經理↔區域，M:N)
 │    │    ├── districtId            → District.id
 │    │    └── districtManagerUserId → User.id
 │    └── DistrictToStoreManager (區域↔店長，M:N)
 │         ├── districtId            → District.id
 │         └── storeManagerUserId    → User.id
 │
 └── Product (商品：ProductPillow / ProductMattress)
      ├── userId   → 商品所有者 (店長 userId)
      └── createId → 實際建立者 (操作員 userId，若非操作員則同 userId)
```

---

## 6. 認證與授權流程

### 6.1 登入流程

```
1. POST /api/auth/login {email, password}
   → 回傳 JWT Token，前端存入 localStorage('jwt')

2. 頁面載入 → AppRouterVerify.jsx
   → POST /api/auth/verify/jwt (Bearer Token)
   → 取得 payload: {userId, email}

3. POST /api/auth/verify/role {user}
   → 回傳 userToRoleList: [{id, userId, role}]
   → 前端存入 localStorage('userRoles')

4. MenuLeft.jsx 讀取 localStorage('userRoles')
   → canAccess(feature) 依白名單決定選單可見性
```

### 6.2 後端 API 權限驗證模式

```javascript
// 標準模式：從 JWT 取得 userId，再檢查角色
const payload = authService.verifyJwt(req);       // 解析 Bearer Token
const userId  = payload?.userId;
const isXxx   = await userToRoleService.isStoreManager(userId);  // 或 isAdmin, isGeneralManager 等
if (!isXxx) return res.status(403).json({ error: '權限不足' });
```

### 6.3 前端 localStorage 管理

統一由 `spine-client/src/utils/localStorage.js` 管理：

| Key | 常數名 | 說明 |
|-----|--------|------|
| `jwt` | `JWT_TOKEN` | JWT 認證 Token |
| `userRoles` | `USER_ROLES` | 角色陣列 JSON `[{id, userId, role}]` |
| `userId` | `USER_ID` | 當前使用者 ID |
| `selectedStoreManagerId` | `SELECTED_STORE_MANAGER_ID` | 總經理/區經理選中的店長 ID |

登出時呼叫 `clearUserData()` 清除所有上述資料。

---

## 7. 各角色管理流程

### 7.1 店長 (StoreManager) 管理

**管理頁面**：店長設定 (`RoleManagementPage.jsx`)
**可操作角色**：Admin

**流程**：
1. Admin 進入「店長設定」頁面
2. 輸入使用者 email → 呼叫 `addStoreManagerByEmail` API
3. 後端檢查：User 表是否存在 → UserToRole 是否已有角色 → 新增 `StoreManager` 角色
4. 列表顯示所有店長，可刪除角色

**綁定店面**：
- 在「店長設定」頁面下方「綁定店面」區塊
- 顯示所有店面清單與下拉選單
- 修改綁定時彈出確認對話框

**相關 API**：

| 端點 | 方法 | 說明 |
|------|------|------|
| `/api/auth/store-manager/list` | GET | 取得店長列表 |
| `/api/auth/store-manager/add` | POST | 新增店長 (by email) |
| `/api/auth/store-manager/delete/:id` | DELETE | 刪除店長角色 |

**相關檔案**：
- 前端：`spine-client/src/pages.spine/manager/RoleManagementPage.jsx`
- 後端 Service：`spine-server/src/services/userToRole.service.js`

### 7.2 操作員 (Operator) 管理

**管理頁面**：操作員設定 (`OperatorManagementPage.jsx`)
**可操作角色**：StoreManager

**流程**：
1. 店長進入「操作員設定」頁面
2. 輸入操作員 email → 呼叫 `addOperatorByEmail` API
3. 後端檢查（JWT 取得店長 userId）：
   - User 表是否存在該 email → 不存在回傳「操作員不存在User表中」
   - UserToRole 是否已有其他角色 → 已有回傳「該使用者已被其他角色綁定」
   - 通過後寫入 UserToRole (`Operator`) + StoreManagerToOperator 綁定
4. 刪除操作員時同步刪除 UserToRole 與 StoreManagerToOperator 紀錄

**操作員商品綁定邏輯**：
- 操作員新增商品時，後端 service 層檢查 `isOperator(userId)`
- 若為操作員：`userId` 設為綁定店長的 ID，`createId` 設為操作員自己的 ID
- 商品以店長名義歸屬，但記錄實際建立者

**相關 API**：

| 端點 | 方法 | 說明 |
|------|------|------|
| `/api/account/store-manager-to-operator/list` | GET | 取得操作員列表 |
| `/api/account/store-manager-to-operator/add` | POST | 新增操作員 (by email) |
| `/api/account/store-manager-to-operator/delete/:id` | DELETE | 刪除操作員綁定 |
| `/api/account/store-manager-to-operator/search` | POST | 搜尋綁定關係 |
| `/api/account/store-manager-to-operator/store-manager-info` | GET | 取得操作員所屬店長資訊 |

**相關檔案**：
- 前端頁面：`spine-client/src/pages.spine/manager/OperatorManagementPage.jsx`
- 前端 API：`spine-client/src/api/manager/storeManagerToOperator.js`
- 後端 Controller：`spine-server/src/controllers/manager/storeManagerToOperator.api.controller.js`
- 後端 Service：`spine-server/src/services/storeManagerToOperator.service.js`
- 後端 Model：`spine-server/src/models/storeManagerToOperator.model.js`
- 商品 Service（商品綁定邏輯）：`spine-server/src/services/productPillow.service.js`、`spine-server/src/services/productMattress.service.js`

### 7.3 總經理 (GeneralManager) 管理

**管理頁面**：經理設定 (`ManagerSettingPage.jsx`)
**可操作角色**：Admin、GeneralManager

**流程**：
1. 進入「經理設定」頁面
2. 輸入 email → 後端檢查 User 存在 + 無其他角色 → 新增 `GeneralManager`
3. 可刪除總經理角色

**總經理功能特性**：
- Header 上方選單顯示「店長列表」下拉選單（所有店長）
- 選擇店長後，營收/庫存頁面切換為該店長資料
- `selectedStoreManagerId` 存入 localStorage

**相關 API**：

| 端點 | 方法 | 說明 |
|------|------|------|
| `/api/manager/general-manager/list` | GET | 取得總經理列表 |
| `/api/manager/general-manager/add` | POST | 新增總經理 |
| `/api/manager/general-manager/delete/:roleId` | DELETE | 刪除總經理 |
| `/api/manager/auth-permission/check-role` | GET | 檢查當前角色 |
| `/api/manager/auth-permission/store-manager-list` | GET | 取得可檢視的店長列表 |

**相關檔案**：
- 前端頁面：`spine-client/src/pages.spine/manager/ManagerSettingPage.jsx`
- 前端 API：`spine-client/src/api/manager/generalManager.js`、`spine-client/src/api/manager/authPermission.js`
- 後端 Controller：`spine-server/src/controllers/manager/generalManager.api.controller.js`、`spine-server/src/controllers/manager/authPermission.api.controller.js`
- 後端 Service：`spine-server/src/services/generalManager.service.js`、`spine-server/src/services/authPermission.service.js`

### 7.4 區經理 (DistrictManager) 管理

**管理頁面**：區經理設定 (`DistrictManagerSettingPage.jsx`)
**可操作角色**：Admin、GeneralManager

**流程**：
1. 進入「區經理設定」頁面
2. **區域管理**：可新增/修改/刪除區域，每個區域可綁定多位店長
3. **區經理帳號管理**：輸入 email 新增區經理角色，可刪除
4. **區域與區經理綁定**：將區經理綁定至特定區域

**區經理功能特性**：
- 登入後 Header 僅顯示其負責區域內的店長列表
- 切換店長後，營收/庫存頁面對應切換（同總經理模式）

**區域下拉選單選項**（前端寫死）：`北區`、`中區`、`南區`、`東區`、`離島區`

**相關 API**：

| 端點 | 方法 | 說明 |
|------|------|------|
| `/api/manager/district-manager/list` | GET | 取得區經理列表 |
| `/api/manager/district-manager/add` | POST | 新增區經理 |
| `/api/manager/district-manager/delete/:roleId` | DELETE | 刪除區經理 |
| `/api/manager/district/list` | GET | 取得所有區域 |
| `/api/manager/district/add` | POST | 新增區域 |
| `/api/manager/district/update` | PATCH | 更新區域 |
| `/api/manager/district/delete/:districtId` | DELETE | 刪除區域 |
| `/api/manager/district/:districtId/store-managers` | GET | 取得區域內店長 |
| `/api/manager/district/bind-store-manager` | POST | 區域綁定店長 |
| `/api/manager/district/unbind-store-manager/:bindingId` | DELETE | 解除區域店長綁定 |
| `/api/manager/district/bind-district-manager` | POST | 區域綁定區經理 |
| `/api/manager/district/unbind-district-manager/:bindingId` | DELETE | 解除區域區經理綁定 |

**相關檔案**：
- 前端頁面：`spine-client/src/pages.spine/manager/DistrictManagerSettingPage.jsx`
- 前端 API：`spine-client/src/api/manager/districtManager.js`、`spine-client/src/api/manager/district.js`
- 後端 Controller：`spine-server/src/controllers/manager/districtManager.api.controller.js`、`spine-server/src/controllers/manager/district.api.controller.js`
- 後端 Service：`spine-server/src/services/districtManager.service.js`、`spine-server/src/services/district.service.js`
- 後端 Model：`spine-server/src/models/district.model.js`、`spine-server/src/models/districtManagerToDistrict.model.js`、`spine-server/src/models/districtToStoreManager.model.js`

---

## 8. Header 店長下拉選單機制

適用角色：**Admin**、**GeneralManager**、**DistrictManager**

### 流程

```
1. Header.jsx 載入 → 呼叫 checkCanViewStoreManagerList()
   檢查 localStorage('userRoles') 是否含 Admin / GeneralManager / DistrictManager

2. 若有權限 → 呼叫 GET /api/manager/auth-permission/store-manager-list
   → 後端 authPermission.service.js：
     - Admin / GeneralManager → 回傳所有店長
     - DistrictManager → 僅回傳其區域內店長

3. 前端渲染下拉選單（顯示 mail）

4. 選擇店長 → setSelectedStoreManagerId(userId) 存入 localStorage

5. 營收/庫存頁面讀取 localStorage('selectedStoreManagerId')
   → 帶入 API body 的 storeManagerId 參數
   → 後端依該 storeManagerId 查詢對應資料
```

### RWD 行為

- 螢幕過窄時隱藏「店長列表」文字標籤，僅保留精簡下拉選單
- 登出後隱藏下拉選單（檢查 JWT 是否存在）

---

## 9. 營收與庫存的分權查詢

### 營收頁面

- **店長**：自動以自身 userId 查詢
- **總經理 / Admin**：從 Header 選擇店長 → `storeManagerId` 帶入 API
- **區經理**：僅可選擇其區域內店長

相關頁面：
- `spine-client/src/pages.spine/manager/ReportSpineRevenueLineChart.jsx`
- `spine-client/src/pages.spine/manager/ReportSpineSalesLineChart.jsx`

### 庫存頁面

- 同營收邏輯，額外依店面細分
- 若店長無綁定店面，需顯示提示訊息

相關頁面：
- `spine-client/src/pages.spine/manager/ProductInventoryPage.jsx`

相關後端：
- `spine-server/src/controllers/manager/stock.api.controller.js`

---

## 10. 店面管理

**管理頁面**：店面管理 (`StoreListPage.jsx`、`StoreAddPage.jsx`、`StoreEditPage.jsx`)
**可操作角色**：Admin、StoreManager、GeneralManager

### 功能

- CRUD 店面（名稱、區域、地址、電話、所屬店長、備註）
- 所屬店長下拉選單：取自 UserToRole 中 role 為 StoreManager 的使用者
- 區域為前端固定選項：北區、中區、南區、東區、離島區

### 相關 API

| 端點 | 方法 | 說明 |
|------|------|------|
| `/api/manager/store/list` | POST | 取得店面列表 |
| `/api/manager/store/:id` | GET | 取得單一店面 |
| `/api/manager/store/add` | POST | 新增店面 |
| `/api/manager/store/edit` | PATCH | 更新店面 |
| `/api/manager/store/delete/:id` | DELETE | 刪除店面 |
| `/api/manager/store/search` | POST | 搜尋店面 |
| `/api/manager/store/store-manager/:storeManagerId` | GET | 依店長取得店面 |

**相關檔案**：
- 前端：`spine-client/src/pages.spine/manager/StoreListPage.jsx`、`StoreAddPage.jsx`、`StoreEditPage.jsx`
- 前端 API：`spine-client/src/api/manager/store.js`
- 後端 Controller：`spine-server/src/controllers/manager/store.api.controller.js`
- 後端 Service：`spine-server/src/services/store.service.js`
- 後端 Model：`spine-server/src/models/store.model.js`

---

## 11. 檔案索引

### 前端核心檔案

| 檔案路徑 | 說明 |
|----------|------|
| `spine-client/src/AppRouterVerify.jsx` | 路由權限驗證（JWT + 角色） |
| `spine-client/src/components.spine/manager/MenuLeft/MenuLeft.jsx` | 左選單（白名單控制） |
| `spine-client/src/components.spine/Header/Header.jsx` | 上方選單（店長下拉選單） |
| `spine-client/src/utils/localStorage.js` | localStorage 統一管理 |
| `spine-client/src/api/auth.js` | 認證 API（login / logout / verify） |
| `spine-client/src/api/manager/authPermission.js` | 角色權限 API |
| `spine-client/src/api/manager/generalManager.js` | 總經理管理 API |
| `spine-client/src/api/manager/districtManager.js` | 區經理管理 API |
| `spine-client/src/api/manager/district.js` | 區域管理 API |
| `spine-client/src/api/manager/storeManagerToOperator.js` | 操作員管理 API |
| `spine-client/src/api/manager/store.js` | 店面管理 API |

### 前端頁面

| 檔案路徑 | 說明 |
|----------|------|
| `spine-client/src/pages.spine/manager/RoleManagementPage.jsx` | 店長設定頁 |
| `spine-client/src/pages.spine/manager/OperatorManagementPage.jsx` | 操作員設定頁 |
| `spine-client/src/pages.spine/manager/ManagerSettingPage.jsx` | 經理設定頁 |
| `spine-client/src/pages.spine/manager/DistrictManagerSettingPage.jsx` | 區經理設定頁 |
| `spine-client/src/pages.spine/manager/StoreListPage.jsx` | 店面列表頁 |
| `spine-client/src/pages.spine/manager/StoreAddPage.jsx` | 新增店面頁 |
| `spine-client/src/pages.spine/manager/StoreEditPage.jsx` | 編輯店面頁 |

### 後端核心檔案

| 檔案路徑 | 說明 |
|----------|------|
| `spine-server/src/index.js` | 路由註冊 |
| `spine-server/src/services/userToRole.service.js` | 使用者角色服務 |
| `spine-server/src/services/authPermission.service.js` | 權限檢查服務 |
| `spine-server/src/services/generalManager.service.js` | 總經理服務 |
| `spine-server/src/services/districtManager.service.js` | 區經理服務 |
| `spine-server/src/services/district.service.js` | 區域管理服務 |
| `spine-server/src/services/storeManagerToOperator.service.js` | 操作員綁定服務 |
| `spine-server/src/services/store.service.js` | 店面服務 |
| `spine-server/src/models/userToRole.model.js` | 使用者角色 Model |
| `spine-server/src/models/storeManagerToOperator.model.js` | 操作員綁定 Model |
| `spine-server/src/models/store.model.js` | 店面 Model |
| `spine-server/src/models/district.model.js` | 區域 Model |
| `spine-server/src/models/districtManagerToDistrict.model.js` | 區經理↔區域 Model |
| `spine-server/src/models/districtToStoreManager.model.js` | 區域↔店長 Model |
| `spine-server/src/controllers/manager/authPermission.api.controller.js` | 權限 API Controller |
| `spine-server/src/controllers/manager/generalManager.api.controller.js` | 總經理 API Controller |
| `spine-server/src/controllers/manager/districtManager.api.controller.js` | 區經理 API Controller |
| `spine-server/src/controllers/manager/district.api.controller.js` | 區域 API Controller |
| `spine-server/src/controllers/manager/storeManagerToOperator.api.controller.js` | 操作員 API Controller |
| `spine-server/src/controllers/manager/store.api.controller.js` | 店面 API Controller |
| `spine-server/src/controllers/manager/stock.api.controller.js` | 庫存 API Controller |

---

## 12. 開發注意事項

1. **角色唯一性**：新增任何角色前必須檢查 `UserToRole` 表中該 userId 無其他角色紀錄。
2. **JWT 必要性**：所有 API 皆需攜帶 `Authorization: Bearer <token>` header。
3. **白名單同步**：若新增前端功能節點，需同步更新 `MenuLeft.jsx` 中各角色的白名單陣列。
4. **操作員商品歸屬**：操作員建立商品時 `userId` 設為店長、`createId` 設為操作員自身。
5. **localStorage 清理**：登出時務必呼叫 `clearUserData()` 清除所有快取。
6. **區域選項**：目前寫死於前端（北區/中區/南區/東區/離島區），如需調整須修改前端程式碼。
7. **刪除級聯**：刪除區域時應同步清除 `DistrictManagerToDistrict` 和 `DistrictToStoreManager` 綁定；刪除操作員時同步清除 `UserToRole` 和 `StoreManagerToOperator` 紀錄。


