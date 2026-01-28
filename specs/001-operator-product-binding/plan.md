# Implementation Plan: 操作員商品創建與編輯權限綁定

**Branch**: `001-operator-product-binding` | **Date**: 2026-01-27 (Initial) → 2026-01-28 (Enhanced) | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-operator-product-binding/spec.md`

## Summary

### Phase 1 (已完成 - 2026-01-27)
實作操作員 (Operator) 創建商品時的自動綁定邏輯：
- 操作員新增商品時，商品 `userId`（所有者）自動設為綁定的店長 ID
- 商品 `createId`（創建者）記錄操作員自己的 userId
- 在商品列表與詳情頁顯示創建者資訊
- 在操作員設定頁面顯示綁定的店長資訊

### Phase 2 (待實作 - 2026-01-28)
擴展操作員權限並新增編輯追蹤與稽核機制：
- 操作員可檢視和編輯所屬店長的**所有商品**（不限自己創建的）
- 商品新增 `lastEditId`、`lastEditTime`、`version` 欄位追蹤最近編輯者
- 實作樂觀鎖（Optimistic Locking）機制防止編輯衝突
- 僅店長可刪除商品，操作員無刪除權限
- 後端 log 記錄所有商品創建、編輯、刪除操作
- 前端顯示已離職用戶標記

技術方案採用服務層（Service Layer）攔截處理，遵循現有分層架構。

## Technical Context

**Language/Version**: Node.js 20 (後端) + React 19 (前端)
**Primary Dependencies**: 
- 後端：Express 4.21、Firebase Admin 13.0、Firebase Functions 6.2
- 前端：React 19、React Router DOM 7.1、Axios 1.7
**Storage**: Firebase Firestore (NoSQL 文件資料庫)
**Testing**: React Testing Library (前端)、手動整合測試 (後端)
**Target Platform**: Web 應用程式 (Chrome/Firefox/Safari)
**Project Type**: Web (前後端分離架構)
**Performance Goals**: 商品創建/編輯 API 響應時間 < 500ms
**Constraints**: 
- 新增驗證邏輯不得增加超過 200ms 響應時間
- [Phase 2] 樂觀鎖版本檢查需在交易內完成，避免競爭條件
- [Phase 2] Log 記錄必須異步處理，不阻塞 API 響應
- [Phase 2] 大型欄位（圖片、長描述）log 僅記錄 [MODIFIED] 標記，不記錄完整內容
**Scale/Scope**: 單店多操作員模式，預估每店 1-5 位操作員，低衝突率場景（適合樂觀鎖）

**Phase 2 Technical Decisions**:
- **樂觀鎖機制**: 使用 `version` 欄位，發生衝突時回傳 409 Conflict，由前端處理重新載入
- **時間格式**: ISO 8601 (YYYY-MM-DDTHH:mm:ss+TZ) 用於 `lastEditTime`，確保時區正確性
- **Log 策略**: 分級記錄 - 標準欄位記錄完整內容，大型欄位（>500字元或圖片）僅記錄 [MODIFIED]
- **刪除權限**: 操作員無刪除權限（回傳 403），僅店長可刪除商品
- **離職用戶**: 保留原始 `createId`/`lastEditId`，前端顯示「已離職用戶」標記

## Constitution Check

*GATE: 依據 FlowEngine 專案憲法檢查設計決策*

| 原則 | 狀態 | 說明 |
|------|------|------|
| I. 分層架構強制分離 | ✅ 符合 | 綁定邏輯、權限驗證、樂觀鎖實作於 Service 層，Controller 僅負責請求解析 |
| II. 測試必要性 | ⚠️ 部分符合 | 後端無自動化測試框架，需手動整合測試驗證（建議後續新增樂觀鎖測試案例） |
| III. MVP 優先 | ✅ 符合 | 僅實作當前需求的綁定與編輯追蹤邏輯，不預先設計完整編輯歷史或統計報表 |
| IV. 業務正確性優先 | ✅ 符合 | 優先確保權限控制正確、版本衝突偵測有效，再處理 UI 優化 |
| V. 向後相容性 | ✅ 符合 | 新增 lastEditId/lastEditTime/version 欄位不影響現有 API，舊資料有預設值處理 |
| VI. 文件與註解規範 | ✅ 符合 | 所有新增方法使用繁體中文註解，包含樂觀鎖邏輯說明 |

**Gate 結果**: ✅ 通過 - Phase 1 已完成，可進入 Phase 2 實作

## Project Structure

### Documentation (this feature)

```text
specs/001-operator-product-binding/
├── plan.md              # 本文件 (實作計劃)
├── research.md          # Phase 0 輸出 (技術研究)
├── data-model.md        # Phase 1 輸出 (資料模型)
├── quickstart.md        # Phase 1 輸出 (快速入門)
├── contracts/           # Phase 1 輸出 (API 契約)
│   └── api-contracts.md
├── checklists/
│   ├── requirements.md  # 規範品質檢查清單
│   └── spec-review.md   # 規範審查檢查清單
└── tasks.md             # Phase 2 輸出 (任務清單)
```

### Source Code (repository root)

```text
spine-server/                    # 後端服務
├── src/
│   ├── controllers/
│   │   └── manager/
│   │       ├── product.api.controller.js          # 商品 API 控制器
│   │       └── storeManagerToOperator.api.controller.js  # 操作員綁定 API
│   ├── services/
│   │   ├── productPillow.service.js               # [Phase 2 修改] 枕頭商品服務 - 綁定邏輯、編輯權限、樂觀鎖
│   │   ├── productMattress.service.js             # [Phase 2 修改] 床墊商品服務 - 綁定邏輯、編輯權限、樂觀鎖
│   │   ├── storeManagerToOperator.service.js      # [修改] 操作員綁定服務 - 新增查詢
│   │   ├── userToRole.service.js                  # 用戶角色服務
│   │   ├── user.service.js                        # [Phase 2 新增] 用戶服務 - 查詢用戶資訊（含離職狀態）
│   │   └── logger.service.js                      # [Phase 2 新增] Logger 服務 - 結構化 log 記錄
│   ├── models/
│   │   ├── productPillow.model.js                 # [Phase 2 修改] 枕頭商品模型 - 新增 createId/lastEditId/lastEditTime/version
│   │   ├── productMattress.model.js               # [Phase 2 修改] 床墊商品模型 - 新增 createId/lastEditId/lastEditTime/version
│   │   ├── storeManagerToOperator.model.js        # 操作員綁定模型
│   │   └── user.model.js                          # [Phase 2 修改] 用戶模型 - 支援軟刪除（isDeleted）
│   └── index.js                                   # 路由設定
│
spine-client/                    # 前端應用
├── src/
│   ├── api/
│   │   └── manager/
│   │       ├── storeManagerToOperator.js          # [修改] 操作員 API - 新增店長查詢
│   │       ├── product.js                         # [Phase 2 修改] 商品 API - 新增 version 欄位處理
│   │       └── user.js                            # [Phase 2 新增] 用戶 API - 查詢用戶資訊
│   ├── pages.spine/
│   │   └── manager/
│   │       ├── OperatorManagementPage.jsx         # [修改] 操作員設定頁面 - 顯示綁定店長
│   │       ├── ProductPillowListPage.jsx          # [Phase 2 修改] 枕頭列表 - 顯示創建者、最近編輯者、隱藏刪除按鈕（操作員）
│   │       └── ProductMattressListPage.jsx        # [Phase 2 修改] 床墊列表 - 顯示創建者、最近編輯者、隱藏刪除按鈕（操作員）
│   ├── components/
│   │   └── manager/
│   │       ├── CreateEdit/
│   │       │   ├── CreateEditProductPillow.jsx    # [Phase 2 修改] 枕頭新增編輯元件 - 樂觀鎖處理
│   │       │   └── CreateEditProductMattress.jsx  # [Phase 2 修改] 床墊新增編輯元件 - 樂觀鎖處理
│   │       └── UserDisplay.jsx                    # [Phase 2 新增] 用戶顯示元件 - 處理已離職用戶標記
│   └── utils/
│       └── dateFormatter.js                       # [Phase 2 新增] 日期格式化工具 - ISO 8601 格式轉換
```

**Structure Decision**: 採用現有 Web Application 結構（spine-server + spine-client），
遵循既有的 MVC 分層架構，修改集中於 Service 層以符合分層原則。

## Complexity Tracking

> 無憲法違反需要追蹤

---

## Implementation Phases

### Phase 0: Research & Design (已完成)

**輸出**: [research.md](./research.md), [data-model.md](./data-model.md)

**Phase 0 關鍵決策**:
1. **資料模型設計**: 新增 `createId`, `lastEditId`, `lastEditTime`, `version` 欄位
2. **樂觀鎖選型**: 採用版本號（version）機制，適合低衝突率場景
3. **Log 策略**: 分級記錄（標準欄位 vs. 大型欄位）平衡可追蹤性與效能
4. **權限模型**: 操作員可檢視/編輯但不可刪除所屬店長商品

### Phase 1: 商品創建者綁定 (✅ 已完成 - 2026-01-27)

**目標**: 實作操作員創建商品時的自動綁定邏輯

**後端修改 (spine-server)**:
1. ✅ `productPillow.model.js` / `productMattress.model.js`
   - 新增 `createId` 欄位定義（String, 預設為 userId）
   
2. ✅ `productPillow.service.js` / `productMattress.service.js`
   - `createProduct()` 方法攔截：
     - 若當前用戶為操作員，查詢綁定的店長
     - 設定 `product.userId = 店長ID`
     - 設定 `product.createId = 操作員ID`
   
3. ✅ `storeManagerToOperator.service.js`
   - 新增 `getOperatorBinding(operatorId)` 方法查詢操作員綁定的店長

**前端修改 (spine-client)**:
1. ✅ `ProductPillowListPage.jsx` / `ProductMattressListPage.jsx`
   - 列表新增「創建者」欄位顯示
   - 使用 `createId` 查詢並顯示用戶名稱
   
2. ✅ `OperatorManagementPage.jsx`
   - 顯示操作員綁定的店長資訊
   - 使用 `storeManagerToOperator` API 查詢綁定關係

**驗收標準**:
- ✅ 操作員創建商品時，商品所有者為綁定的店長
- ✅ 商品列表正確顯示創建者名稱
- ✅ 操作員設定頁面正確顯示綁定店長

---

### Phase 2: 編輯權限與追蹤機制 (🔄 待實作 - 2026-01-28)

**目標**: 擴展操作員編輯權限，實作編輯追蹤、樂觀鎖、權限控制

#### 2.1 資料模型擴展

**後端修改 (spine-server)**:
1. `productPillow.model.js` / `productMattress.model.js`
   - 新增欄位定義：
     - `lastEditId: String` - 最後編輯者的 userId
     - `lastEditTime: Timestamp` - 最後編輯時間 (ISO 8601)
     - `version: Number` - 樂觀鎖版本號（預設 1）
   - 更新 `toFirestore()` 和 `fromFirestore()` 方法處理新欄位

2. `user.model.js`
   - 確保支援 `isDeleted` 欄位查詢（軟刪除標記）
   - 新增 `getUserInfo(userId)` 方法返回用戶資訊含離職狀態

**資料遷移**:
```javascript
// 為現有商品新增預設值
version = 1
lastEditId = createId || userId
lastEditTime = createDate || updateDate || now()
```

#### 2.2 樂觀鎖實作

**後端修改 (spine-server)**:
1. `productPillow.service.js` / `productMattress.service.js`
   - `updateProduct(productId, updateData, currentVersion)` 修改：
     ```javascript
     /**
      * 更新商品（含樂觀鎖檢查）
      * @param {string} productId - 商品 ID
      * @param {object} updateData - 更新資料
      * @param {number} currentVersion - 前端當前版本號
      * @throws {409} 版本衝突
      */
     async updateProduct(productId, updateData, currentVersion) {
       // 使用 Firestore Transaction 確保原子性
       await db.runTransaction(async (transaction) => {
         const productRef = db.collection('products').doc(productId);
         const productSnap = await transaction.get(productRef);
         
         // 版本檢查
         if (productSnap.data().version !== currentVersion) {
           throw new Error('VERSION_CONFLICT'); // 回傳 409
         }
         
         // 更新資料
         transaction.update(productRef, {
           ...updateData,
           lastEditId: currentUser.userId,
           lastEditTime: admin.firestore.FieldValue.serverTimestamp(),
           version: currentVersion + 1
         });
       });
     }
     ```

2. `product.api.controller.js`
   - 捕獲 `VERSION_CONFLICT` 錯誤，回傳 409 Conflict
   - 回傳最新商品資料供前端重新載入

**前端修改 (spine-client)**:
1. `CreateEditProductPillow.jsx` / `CreateEditProductMattress.jsx`
   - 儲存當前商品的 `version` 於 state
   - 提交更新時攜帶 `version` 參數
   - 接收 409 錯誤時：
     - 顯示提示：「商品已被其他用戶修改，請重新載入」
     - 自動重新載入最新商品資料
     - 用戶確認後重新提交

#### 2.3 編輯權限擴展

**後端修改 (spine-server)**:
1. `productPillow.service.js` / `productMattress.service.js`
   - `getProductList(userId, role)` 修改：
     ```javascript
     /**
      * 取得商品列表（依角色調整）
      * @param {string} userId - 當前用戶 ID
      * @param {string} role - 用戶角色 (storeManager/operator)
      */
     async getProductList(userId, role) {
       if (role === 'operator') {
         // 查詢綁定的店長 ID
         const binding = await getOperatorBinding(userId);
         if (!binding) throw new Error('OPERATOR_NOT_BOUND');
         
         // 返回店長的所有商品
         return await db.collection('products')
           .where('userId', '==', binding.storeManagerId)
           .get();
       }
       
       // 店長：返回自己的商品
       return await db.collection('products')
         .where('userId', '==', userId)
         .get();
     }
     ```
   
   - `updateProduct()` 修改：
     - 操作員可編輯所屬店長的任何商品（不限 createId）
     - 權限驗證：檢查商品 `userId` 是否為綁定的店長

**前端修改 (spine-client)**:
1. `ProductPillowListPage.jsx` / `ProductMattressListPage.jsx`
   - 操作員可看到所屬店長的所有商品
   - 操作員可對任何商品點擊「編輯」按鈕
   - 列表新增「最近編輯者」欄位顯示 `lastEditId` 對應用戶名稱
   - 顯示「最近編輯時間」（格式化為 YYYY-MM-DD HH:mm:ss）

#### 2.4 刪除權限控制

**後端修改 (spine-server)**:
1. `productPillow.service.js` / `productMattress.service.js`
   - `deleteProduct(productId, userId, role)` 修改：
     ```javascript
     /**
      * 刪除商品（僅店長）
      * @param {string} productId - 商品 ID
      * @param {string} userId - 當前用戶 ID
      * @param {string} role - 用戶角色
      * @throws {403} 操作員無刪除權限
      */
     async deleteProduct(productId, userId, role) {
       // 權限檢查
       if (role === 'operator') {
         throw new Error('OPERATOR_CANNOT_DELETE'); // 回傳 403
       }
       
       // 驗證商品所有權
       const product = await db.collection('products').doc(productId).get();
       if (product.data().userId !== userId) {
         throw new Error('FORBIDDEN'); // 回傳 403
       }
       
       // 執行刪除
       await db.collection('products').doc(productId).delete();
       
       // 記錄 log
       await logProductAction('DELETE', productId, userId, product.data());
     }
     ```

2. `product.api.controller.js`
   - 捕獲 `OPERATOR_CANNOT_DELETE` 錯誤，回傳 403 Forbidden

**前端修改 (spine-client)**:
1. `ProductPillowListPage.jsx` / `ProductMattressListPage.jsx`
   - 根據用戶角色決定是否顯示「刪除」按鈕：
     ```javascript
     const canDelete = userRole === 'storeManager';
     ```
   - 操作員：完全隱藏刪除按鈕
   - 店長：正常顯示刪除按鈕

#### 2.5 後端 Log 記錄

**後端新增 (spine-server)**:
1. `logger.service.js` (新檔案)
   ```javascript
   /**
    * 商品操作 Logger 服務
    * 提供結構化 log 記錄功能
    */
   class LoggerService {
     /**
      * 記錄商品操作
      * @param {string} action - 操作類型 (CREATE/UPDATE/DELETE)
      * @param {string} productId - 商品 ID
      * @param {string} userId - 操作者 ID
      * @param {object} before - 操作前資料（UPDATE/DELETE）
      * @param {object} after - 操作後資料（CREATE/UPDATE）
      */
     async logProductAction(action, productId, userId, before = null, after = null) {
       const logEntry = {
         timestamp: new Date().toISOString(),
         action,
         productId,
         userId,
         changes: this._calculateChanges(before, after)
       };
       
       console.log('[PRODUCT_LOG]', JSON.stringify(logEntry));
       // 可選：寫入專用 log collection
     }
     
     /**
      * 計算欄位變更（分級記錄）
      */
     _calculateChanges(before, after) {
       const changes = {};
       const largeFields = ['image', 'images', 'description', 'detailDescription'];
       
       Object.keys(after || {}).forEach(key => {
         if (before && before[key] !== after[key]) {
           // 大型欄位僅記錄 [MODIFIED] 標記
           if (largeFields.includes(key) || 
               (typeof after[key] === 'string' && after[key].length > 500)) {
             changes[key] = '[MODIFIED]';
           } else {
             changes[key] = { before: before[key], after: after[key] };
           }
         }
       });
       
       return changes;
     }
   }
   ```

2. `productPillow.service.js` / `productMattress.service.js`
   - 在 `createProduct()`, `updateProduct()`, `deleteProduct()` 中呼叫 Logger：
     ```javascript
     // CREATE
     await loggerService.logProductAction('CREATE', productId, userId, null, product);
     
     // UPDATE
     await loggerService.logProductAction('UPDATE', productId, userId, oldProduct, newProduct);
     
     // DELETE
     await loggerService.logProductAction('DELETE', productId, userId, product, null);
     ```
   - Log 記錄使用異步處理，不阻塞 API 響應

#### 2.6 前端離職用戶顯示

**前端新增 (spine-client)**:
1. `api/manager/user.js` (新檔案)
   ```javascript
   /**
    * 查詢用戶資訊（含離職狀態）
    * @param {string} userId - 用戶 ID
    * @returns {object} { userId, name, isDeleted }
    */
   export const getUserInfo = async (userId) => {
     const response = await axios.get(`/api/manager/user/${userId}`);
     return response.data;
   };
   ```

2. `components/manager/UserDisplay.jsx` (新檔案)
   ```jsx
   /**
    * 用戶顯示元件（處理已離職標記）
    * @param {string} userId - 用戶 ID
    */
   function UserDisplay({ userId }) {
     const [userInfo, setUserInfo] = useState(null);
     
     useEffect(() => {
       getUserInfo(userId).then(setUserInfo);
     }, [userId]);
     
     if (!userInfo) return <span>載入中...</span>;
     
     return (
       <span>
         {userInfo.name}
         {userInfo.isDeleted && (
           <span style={{ color: '#999', marginLeft: 8 }}>
             (已離職用戶)
           </span>
         )}
       </span>
     );
   }
   ```

3. `ProductPillowListPage.jsx` / `ProductMattressListPage.jsx`
   - 使用 `<UserDisplay userId={product.createId} />` 顯示創建者
   - 使用 `<UserDisplay userId={product.lastEditId} />` 顯示最近編輯者

4. `utils/dateFormatter.js` (新檔案)
   ```javascript
   /**
    * 格式化時間戳為 ISO 8601 顯示格式
    * @param {Timestamp} timestamp - Firestore Timestamp
    * @returns {string} YYYY-MM-DD HH:mm:ss
    */
   export const formatTimestamp = (timestamp) => {
     if (!timestamp) return '-';
     const date = timestamp.toDate();
     return date.toISOString().replace('T', ' ').substring(0, 19);
   };
   ```

---

### Phase 3: Testing & Deployment (待規劃)

**測試項目**:
1. **樂觀鎖測試**:
   - 模擬兩個用戶同時編輯同一商品
   - 驗證第二個用戶收到 409 Conflict
   - 驗證重新載入後可成功提交

2. **權限測試**:
   - 操作員可查看所屬店長的所有商品
   - 操作員可編輯所屬店長的商品
   - 操作員無法刪除商品（403 Forbidden）
   - 店長可正常刪除自己的商品

3. **Log 驗證**:
   - 所有 CREATE/UPDATE/DELETE 操作有對應 log
   - 大型欄位僅記錄 [MODIFIED]
   - Log 不影響 API 響應時間（< 500ms）

4. **UI 測試**:
   - 列表正確顯示創建者、最近編輯者
   - 已離職用戶顯示「已離職用戶」標記
   - 操作員看不到刪除按鈕
   - 時間格式正確（ISO 8601）

**部署步驟**:
1. 資料庫遷移：為現有商品新增 version, lastEditId, lastEditTime
2. 後端部署：spine-server 更新 services, models, logger
3. 前端部署：spine-client 更新 UI 與 API 呼叫
4. 監控 log 輸出確認記錄正確

---

## Success Criteria

### Phase 1 (✅ 已達成)
- [x] 操作員創建商品時，商品 userId 自動綁定為店長 ID
- [x] 商品列表顯示創建者（createId）資訊
- [x] 操作員設定頁面顯示綁定的店長資訊

### Phase 2 (待驗證)
- [ ] 操作員可查看所屬店長的所有商品（不限自己創建）
- [ ] 操作員可編輯所屬店長的任何商品
- [ ] 商品列表顯示最近編輯者（lastEditId）和編輯時間（lastEditTime）
- [ ] 兩個用戶同時編輯同一商品時，第二個用戶收到 409 Conflict
- [ ] 操作員無法刪除商品（403 Forbidden），店長可正常刪除
- [ ] 所有商品操作有對應的後端 log 記錄
- [ ] 已離職用戶在 UI 顯示「已離職用戶」標記
- [ ] API 響應時間維持在 500ms 內

---

## Risks & Mitigations

| 風險 | 影響 | 緩解措施 | 狀態 |
|------|------|----------|------|
| 樂觀鎖衝突率過高 | 用戶體驗差 | 前期監控衝突率，若 >5% 考慮改用悲觀鎖 | 監控中 |
| Log 記錄影響效能 | API 響應變慢 | 使用異步記錄，設定 timeout 防止阻塞 | 已緩解 |
| 資料遷移失敗 | 舊資料缺少新欄位 | 提供預設值處理，API 回傳前檢查欄位完整性 | 已緩解 |
| 操作員誤刪商品 | 資料遺失 | 前端隱藏刪除按鈕，後端強制驗證角色 | 已緩解 |
| 離職用戶資料查詢失敗 | UI 顯示異常 | 前端 fallback 顯示「未知用戶」 | 待實作 |

---

## Next Steps

1. **立即行動** (Phase 2):
   - 更新資料模型（version, lastEditId, lastEditTime 欄位）
   - 實作樂觀鎖邏輯於 productPillow/productMattress.service.js
   - 新增 logger.service.js 並整合到商品操作流程
   - 前端新增 UserDisplay 元件處理離職用戶顯示

2. **短期規劃** (1-2 週):
   - 完成 Phase 2 所有功能實作
   - 手動測試樂觀鎖和權限控制
   - 資料庫遷移腳本開發與執行
   - 監控 log 輸出與 API 效能

3. **長期優化** (1-2 月):
   - 根據 log 分析開發統計報表
   - 考慮引入自動化測試框架（Jest + Supertest）
   - 評估完整編輯歷史功能需求
