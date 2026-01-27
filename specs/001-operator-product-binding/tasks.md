# Tasks: 操作員商品創建權限綁定

**Input**: Design documents from `/specs/001-operator-product-binding/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: 本專案後端無自動化測試框架，採手動整合測試驗證。

**Organization**: 任務依用戶故事分組，確保每個故事可獨立實作和測試。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 可平行執行（不同檔案、無依賴）
- **[Story]**: 所屬用戶故事 (US1, US2, US3, US4)
- 描述包含確切檔案路徑

## Path Conventions

- **後端**: `spine-server/src/`
- **前端**: `spine-client/src/`

---

## Phase 1: Setup (共享基礎)

**Purpose**: 確認開發環境與分支準備就緒

- [x] T001 確認 feature branch `001-operator-product-binding` 已建立並切換
- [x] T002 [P] 確認 spine-server 可正常啟動 (`npm start`)
- [x] T003 [P] 確認 spine-client 可正常啟動 (`npm start`)

---

## Phase 2: Foundational (基礎前置作業)

**Purpose**: 所有用戶故事所需的核心基礎設施

**⚠️ CRITICAL**: 此階段完成前，不可開始任何用戶故事

- [x] T004 在 `spine-server/src/models/productPillow.model.js` 新增 `createId` 欄位定義
- [x] T005 [P] 在 `spine-server/src/models/productMattress.model.js` 新增 `createId` 欄位定義
- [x] T006 確認 `spine-server/src/services/storeManagerToOperator.service.js` 中 `isOperator()` 和 `getStoreManagerIdByOperatorId()` 方法可正常運作

**Checkpoint**: 基礎架構就緒 - 用戶故事實作可開始

---

## Phase 3: User Story 1 - 操作員創建商品並自動綁定店長 (Priority: P1) 🎯 MVP

**Goal**: 操作員新增商品時，系統自動將商品 userId 設為店長 ID，createId 設為操作員 ID

**Independent Test**: 以操作員登入，新增枕頭商品，驗證商品 userId = 店長 ID、createId = 操作員 ID

### Implementation for User Story 1

- [x] T007 [US1] 修改 `spine-server/src/services/productPillow.service.js` 中 `addProductPillow()` 實作完整綁定邏輯
- [x] T008 [US1] 修改 `spine-server/src/services/productMattress.service.js` 中 `addProductMattress()` 實作完整綁定邏輯
- [x] T009 [US1] 在 `spine-server/src/services/productPillow.service.js` 新增未綁定店長時的錯誤處理
- [x] T010 [US1] 在 `spine-server/src/services/productMattress.service.js` 新增未綁定店長時的錯誤處理
- [ ] T011 [US1] 手動測試：操作員創建枕頭商品，驗證 userId/createId 正確
- [ ] T012 [US1] 手動測試：操作員創建床墊商品，驗證 userId/createId 正確

**Checkpoint**: User Story 1 完成 - 操作員創建商品可正確綁定店長

---

## Phase 4: User Story 3 - 系統驗證操作員身份與綁定關係 (Priority: P1)

**Goal**: 未綁定店長的操作員嘗試創建商品時，系統拒絕並回傳明確錯誤訊息

**Independent Test**: 移除操作員綁定後嘗試創建商品，驗證系統拒絕並顯示「操作員未綁定店長」

### Implementation for User Story 3

- [x] T013 [US3] 確認 `spine-server/src/services/productPillow.service.js` 在綁定驗證失敗時拋出正確錯誤
- [x] T014 [US3] 確認 `spine-server/src/services/productMattress.service.js` 在綁定驗證失敗時拋出正確錯誤
- [x] T015 [US3] 修改 `spine-client/src/components/manager/CreateEdit/CreateEditProductPillow.jsx` 處理錯誤回應並顯示提示
- [x] T016 [US3] 修改 `spine-client/src/components/manager/CreateEdit/CreateEditProductMattress.jsx` 處理錯誤回應並顯示提示
- [ ] T017 [US3] 手動測試：未綁定操作員創建商品，驗證錯誤訊息正確顯示

**Checkpoint**: User Story 3 完成 - 系統可正確驗證操作員綁定關係

---

## Phase 5: User Story 2 - 店長查看操作員創建的商品 (Priority: P2)

**Goal**: 店長在商品列表和詳情頁可識別創建者，區分自己創建或操作員創建

**Independent Test**: 店長登入查看商品列表，確認可看到創建者欄位顯示正確名稱

### Implementation for User Story 2 (Backend)

- [x] T018 [US2] 修改 `spine-server/src/services/productPillow.service.js` 中 `getProductPillowList()` 返回創建者資訊
- [x] T019 [US2] 修改 `spine-server/src/services/productMattress.service.js` 中 `getProductMattressList()` 返回創建者資訊
- [x] T020 [US2] 在 Service 層新增查詢 User 資料取得創建者名稱的邏輯

### Implementation for User Story 2 (Frontend - List)

- [x] T021 [P] [US2] 修改 `spine-client/src/pages.spine/manager/ProductPillowListPage.jsx` 表格新增「創建者」欄位
- [x] T022 [P] [US2] 修改 `spine-client/src/pages.spine/manager/ProductMattressListPage.jsx` 表格新增「創建者」欄位

### Implementation for User Story 2 (Frontend - Detail)

- [x] T023 [P] [US2] 修改枕頭商品詳情元件顯示創建者資訊
- [x] T024 [P] [US2] 修改床墊商品詳情元件顯示創建者資訊
- [ ] T025 [US2] 手動測試：驗證商品列表和詳情頁正確顯示創建者

**Checkpoint**: User Story 2 完成 - 店長可識別商品創建者

---

## Phase 6: User Story 4 - 操作員設定頁面檢視綁定店長資訊 (Priority: P2)

**Goal**: 店長在「操作員設定」頁面可查看每位操作員綁定的店長資訊

**Independent Test**: 店長登入進入「操作員設定」頁面，確認可看到每位操作員對應的店長名稱和 email

### Implementation for User Story 4 (Backend)

- [x] T026 [US4] 修改 `spine-server/src/services/storeManagerToOperator.service.js` 新增 `getStoreManagerInfoByOperatorId()` 方法
- [x] T027 [US4] 修改 `spine-server/src/controllers/manager/storeManagerToOperator.api.controller.js` 新增 `/store-manager-info` API 端點
- [x] T028 [US4] 修改 `spine-server/src/index.js` 註冊新 API 路由
- [x] T029 [US4] 修改 `spine-server/src/services/storeManagerToOperator.service.js` 的 `getOperatorList()` 返回綁定店長資訊

### Implementation for User Story 4 (Frontend)

- [x] T030 [US4] 修改 `spine-client/src/api/manager/storeManagerToOperator.js` 新增取得店長資訊 API 呼叫
- [x] T031 [US4] 修改 `spine-client/src/pages.spine/manager/OperatorManagementPage.jsx` 在操作員列表顯示綁定店長欄位
- [ ] T032 [US4] 手動測試：驗證操作員設定頁面正確顯示綁定店長資訊

**Checkpoint**: User Story 4 完成 - 店長可在操作員設定頁面查看綁定關係

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: 品質確保與收尾工作

- [x] T033 [P] 更新 `specs/001-operator-product-binding/` 文件，記錄實作完成狀態
- [x] T034 [P] 在相關 Service 方法新增繁體中文註解說明綁定邏輯
- [ ] T035 手動測試：執行 quickstart.md 中的驗證清單確認所有功能正常
- [ ] T036 手動測試：檢查 API 響應時間，確保新增驗證不超過 200ms
- [x] T037 確認舊商品資料查詢時 createId 可正確補值為 userId（程式碼已實現）

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 無依賴 - 可立即開始
- **Foundational (Phase 2)**: 依賴 Setup 完成 - **阻擋所有用戶故事**
- **User Story 1 (Phase 3)**: 依賴 Foundational 完成
- **User Story 3 (Phase 4)**: 依賴 Foundational 完成，可與 US1 平行
- **User Story 2 (Phase 5)**: 依賴 Foundational 完成，建議 US1 完成後進行
- **User Story 4 (Phase 6)**: 依賴 Foundational 完成，可獨立進行
- **Polish (Phase 7)**: 依賴所有用戶故事完成

### User Story Dependencies

```
Phase 1 (Setup)
     │
     ▼
Phase 2 (Foundational) ─── GATE ───
     │
     ├──────────────┬──────────────┬──────────────┐
     ▼              ▼              ▼              ▼
 Phase 3        Phase 4        Phase 5        Phase 6
 [US1 P1]       [US3 P1]       [US2 P2]       [US4 P2]
 核心綁定        驗證錯誤        顯示創建者      顯示綁定店長
     │              │              │              │
     └──────────────┴──────────────┴──────────────┘
                         │
                         ▼
                   Phase 7 (Polish)
```

### Parallel Opportunities

**Phase 2 內部平行**:
- T004 和 T005 可平行執行（不同 Model 檔案）

**User Story 平行**:
- US1 (Phase 3) 和 US3 (Phase 4) 可平行進行
- US4 (Phase 6) 可與其他故事平行進行

**Phase 5 內部平行**:
- T021、T022、T023、T024 可平行執行（不同前端檔案）

---

## Parallel Example: User Story 2 (Phase 5)

```bash
# 開發者 A：後端 API 修改
T018 → T019 → T020

# 開發者 B：前端列表頁 (與 A 平行)
T021 ─┬─ (parallel)
T022 ─┘

# 開發者 C：前端詳情頁 (與 A, B 平行)
T023 ─┬─ (parallel)
T024 ─┘

# 整合測試 (等待全部完成)
T025
```

---

## Implementation Strategy

### MVP 範圍 (建議優先完成)

**核心功能**: Phase 1 → Phase 2 → Phase 3 (US1)

完成後即可交付：
- ✅ 操作員可創建商品
- ✅ 商品自動歸屬店長
- ✅ createId 正確記錄創建者

### 增量交付順序

1. **Sprint 1**: Setup + Foundational + US1 + US3 (核心綁定 + 錯誤處理)
2. **Sprint 2**: US2 (創建者顯示)
3. **Sprint 3**: US4 + Polish (操作員設定頁面 + 收尾)

---

## Summary

| 類別 | 任務數 |
|------|--------|
| Setup | 3 |
| Foundational | 3 |
| User Story 1 (P1) | 6 |
| User Story 3 (P1) | 5 |
| User Story 2 (P2) | 8 |
| User Story 4 (P2) | 7 |
| Polish | 5 |
| **Total** | **37** |

| 用戶故事 | 可平行任務 | 獨立測試標準 |
|----------|-----------|--------------|
| US1 | 0 | 操作員創建商品，驗證 userId/createId 正確 |
| US3 | 0 | 未綁定操作員創建商品，驗證錯誤訊息 |
| US2 | 4 (T021-T024) | 店長查看商品列表，確認創建者欄位 |
| US4 | 0 | 操作員設定頁面顯示綁定店長資訊 |

**MVP Scope**: Phase 1-4 (Setup + Foundational + US1 + US3) = 17 tasks
