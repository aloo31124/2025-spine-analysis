# Tasks: 操作員商品創建與編輯權限綁定

**Input**: Design documents from `/specs/001-operator-product-binding/`
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/api-contracts.md

**Feature Branch**: `001-operator-product-binding`
**Tech Stack**: Node.js 20 (Express 4.21, Firebase Admin 13.0) + React 19 (React Router DOM 7.1, Axios 1.7)

**Tests**: Not explicitly requested in specification - focusing on implementation only.

**Organization**: Tasks are grouped by user story (US1-US7) to enable independent implementation and testing of each story. Phase 1 tasks are completed. Phase 2 focuses on expanded permissions, optimistic locking, and audit logging.

---

## Format: `- [ ] [ID] [P?] [Story?] Description`

- **Checkbox**: `- [ ]` for pending, `- [x]` for completed
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (✅ Completed - 2026-01-27)

**Purpose**: Phase 1 basic operator product creation binding

- [x] T001 Add `createId` field to ProductPillow model in spine-server/src/models/productPillow.model.js
- [x] T002 Add `createId` field to ProductMattress model in spine-server/src/models/productMattress.model.js
- [x] T003 Implement operator binding logic in spine-server/src/services/productPillow.service.js createProduct()
- [x] T004 Implement operator binding logic in spine-server/src/services/productMattress.service.js createProduct()
- [x] T005 Add `getStoreManagerInfoByOperatorId()` to spine-server/src/services/storeManagerToOperator.service.js
- [x] T006 Display creator information in spine-client/src/pages.spine/manager/ProductPillowListPage.jsx
- [x] T007 Display creator information in spine-client/src/pages.spine/manager/ProductMattressListPage.jsx
- [x] T008 Display bound store manager in spine-client/src/pages.spine/manager/OperatorManagementPage.jsx

**Checkpoint**: Phase 1 complete - Operators can create products with automatic binding to store manager

---

## Phase 2: Foundational (Blocking Prerequisites for Phase 2)

**Purpose**: Core infrastructure that MUST be complete before ANY Phase 2 user story can be implemented

**⚠️ CRITICAL**: No Phase 2 user story work can begin until this phase is complete

- [x] T009 Add `lastEditId`, `lastEditTime`, `version` fields to ProductPillow model in spine-server/src/models/productPillow.model.js
- [x] T010 Add `lastEditId`, `lastEditTime`, `version` fields to ProductMattress model in spine-server/src/models/productMattress.model.js
- [x] T011 [P] Add `isDeleted` field support to User model in spine-server/src/models/user.model.js
- [x] T012 [P] Create logger.service.js in spine-server/src/services/ with structured logging methods
- [x] T013 [P] Create user.service.js in spine-server/src/services/ with getUserInfo() method
- [x] T014 [P] Create dateFormatter.js utility in spine-client/src/utils/ for ISO 8601 formatting
- [x] T015 Create database migration script to add version=1, lastEditId=createId, lastEditTime=createDate for existing products

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - 操作員創建商品並自動綁定店長 (Priority: P1) 🎯 MVP

**Goal**: 操作員新增商品時，商品所有權自動歸屬於綁定的店長，同時記錄實際創建者和首次編輯者

**Independent Test**: 操作員登入系統，新增一筆商品，驗證商品的 userId 為店長 ID，createId 為操作員 ID，lastEditId 為操作員 ID，version 為 1

**Status**: ✅ Phase 1 completed, Phase 2 enhancements needed

### Implementation for User Story 1

- [x] T016 [US1] Update createProduct() in spine-server/src/services/productPillow.service.js to set lastEditId=operatorId, lastEditTime=now(), version=1
- [x] T017 [US1] Update createProduct() in spine-server/src/services/productMattress.service.js to set lastEditId=operatorId, lastEditTime=now(), version=1
- [x] T018 [US1] Add log call to logger.service.logProductAction('CREATE') in productPillow.service.js createProduct()
- [x] T019 [US1] Add log call to logger.service.logProductAction('CREATE') in productMattress.service.js createProduct()

**Checkpoint**: User Story 1 enhanced - operators create products with complete tracking (creator, editor, version)

---

## Phase 4: User Story 2 - 操作員檢視所屬店長的所有商品 (Priority: P1)

**Goal**: 操作員可以查看所屬店長的所有商品（不僅限於自己創建的商品）

**Independent Test**: 操作員登入系統後進入商品列表頁，應能看到所有歸屬於其綁定店長的商品（包括店長本人創建的和其他操作員創建的）

### Implementation for User Story 2

- [x] T020 [P] [US2] Modify getProductList() in spine-server/src/services/productPillow.service.js to query by bound store manager's userId for operators
- [x] T021 [P] [US2] Modify getProductList() in spine-server/src/services/productMattress.service.js to query by bound store manager's userId for operators
- [x] T022 [US2] Update API call in spine-client/src/api/manager/product.js to support role-based product listing
- [x] T023 [US2] Update ProductPillowListPage.jsx to display all store manager's products for operators
- [x] T024 [US2] Update ProductMattressListPage.jsx to display all store manager's products for operators

**Checkpoint**: User Story 2 complete - operators can view all products belonging to their bound store manager

---

## Phase 5: User Story 3 - 操作員編輯所屬店長的所有商品 (Priority: P1)

**Goal**: 操作員可以編輯所屬店長的任何商品（不論創建者是誰），編輯後系統自動更新「最近編輯者」為該操作員

**Independent Test**: 操作員登入後選擇任一商品（包括店長或其他操作員創建的）進行編輯，確認可成功儲存，並驗證 lastEditId 更新為該操作員 ID

### Implementation for User Story 3

- [x] T025 [US3] Implement optimistic locking in updateProduct() in spine-server/src/services/productPillow.service.js with version check
- [x] T026 [US3] Implement optimistic locking in updateProduct() in spine-server/src/services/productMattress.service.js with version check
- [x] T027 [US3] Update updateProduct() to set lastEditId=currentUserId, lastEditTime=now(), version=version+1 in productPillow.service.js
- [x] T028 [US3] Update updateProduct() to set lastEditId=currentUserId, lastEditTime=now(), version=version+1 in productMattress.service.js
- [x] T029 [US3] Add permission check for operators (verify product.userId equals bound store manager ID) in productPillow.service.js
- [x] T030 [US3] Add permission check for operators (verify product.userId equals bound store manager ID) in productMattress.service.js
- [x] T031 [US3] Add log call to logger.service.logProductAction('UPDATE') in productPillow.service.js updateProduct()
- [x] T032 [US3] Add log call to logger.service.logProductAction('UPDATE') in productMattress.service.js updateProduct()
- [x] T033 [US3] Handle 409 Conflict error in product.api.controller.js and return latest product data
- [x] T034 [US3] Update CreateEditProductPillow.jsx to store and send version field in update requests
- [x] T035 [US3] Update CreateEditProductMattress.jsx to store and send version field in update requests
- [x] T036 [US3] Add 409 Conflict handling in CreateEditProductPillow.jsx to show reload prompt
- [x] T037 [US3] Add 409 Conflict handling in CreateEditProductMattress.jsx to show reload prompt
- [x] T038 [US3] Ensure userId and createId are not modifiable during product updates in productPillow.service.js
- [x] T039 [US3] Ensure userId and createId are not modifiable during product updates in productMattress.service.js

**Checkpoint**: User Story 3 complete - operators can edit any product belonging to their store manager with optimistic locking

---

## Phase 6: User Story 4 - 商品列表顯示最近編輯者資訊 (Priority: P2)

**Goal**: 在商品列表頁中，每筆商品除了顯示創建者外，還應顯示「最近編輯者」的名稱及編輯時間

**Independent Test**: 進入商品列表頁，確認每筆商品顯示「創建者」和「最近編輯者」欄位，且資訊正確對應資料庫中的 createId 和 lastEditId

### Implementation for User Story 4

- [ ] T040 [P] [US4] Create UserDisplay.jsx component in spine-client/src/components/manager/ to display user info with "已離職用戶" label
- [ ] T041 [P] [US4] Create user.js API client in spine-client/src/api/manager/ with getUserInfo() method
- [ ] T042 [US4] Add "最近編輯者" column to ProductPillowListPage.jsx using UserDisplay component
- [ ] T043 [US4] Add "最近編輯者" column to ProductMattressListPage.jsx using UserDisplay component
- [ ] T044 [US4] Add "最後編輯時間" column to ProductPillowListPage.jsx using dateFormatter utility
- [ ] T045 [US4] Add "最後編輯時間" column to ProductMattressListPage.jsx using dateFormatter utility
- [ ] T046 [US4] Update creator display in ProductPillowListPage.jsx to use UserDisplay component
- [ ] T047 [US4] Update creator display in ProductMattressListPage.jsx to use UserDisplay component

**Checkpoint**: User Story 4 complete - product lists show both creator and last editor with proper formatting

---

## Phase 7: User Story 5 - 店長查看操作員創建的商品 (Priority: P2)

**Goal**: 店長可以查看和管理所有歸屬於自己的商品，包括由操作員創建的商品，並可識別實際創建者和最近編輯者

**Independent Test**: 店長登入系統後查看商品列表，能看到所有歸屬於自己的商品（包括操作員創建的），商品詳情中可識別創建者和最近編輯者資訊

### Implementation for User Story 5

- [ ] T048 [P] [US5] Ensure getProductList() in productPillow.service.js returns all products with userId=storeManagerId for store managers
- [ ] T049 [P] [US5] Ensure getProductList() in productMattress.service.js returns all products with userId=storeManagerId for store managers
- [ ] T050 [US5] Display creator info in product detail pages (if not already implemented)
- [ ] T051 [US5] Display last editor info in product detail pages
- [ ] T052 [US5] Ensure store managers can edit operator-created products (permission check should allow)
- [ ] T053 [US5] Add log recording when store manager edits or deletes operator-created products

**Checkpoint**: User Story 5 complete - store managers have full visibility and control over all their products

---

## Phase 8: User Story 6 - 系統驗證操作員身份與綁定關係 (Priority: P1)

**Goal**: 系統在操作員創建商品前，必須驗證該用戶為操作員角色且已綁定至店長

**Independent Test**: 嘗試以未綁定店長的操作員身份創建商品，系統應拒絕操作；以已綁定的操作員創建則應成功

### Implementation for User Story 6

- [ ] T054 [US6] Add validation in createProduct() in productPillow.service.js to check operator binding before allowing product creation
- [ ] T055 [US6] Add validation in createProduct() in productMattress.service.js to check operator binding before allowing product creation
- [ ] T056 [US6] Return appropriate error (400 Bad Request) with message "操作員未綁定店長" when binding not found
- [ ] T057 [US6] Add error handling in frontend CreateEditProductPillow.jsx to display binding error
- [ ] T058 [US6] Add error handling in frontend CreateEditProductMattress.jsx to display binding error

**Checkpoint**: User Story 6 complete - system validates operator binding before allowing product creation

---

## Phase 9: User Story 7 - 操作員設定頁面檢視綁定店長資訊 (Priority: P2)

**Goal**: 店長在「操作員設定」頁面管理操作員時，可以查看每位操作員綁定至哪位店長的詳細資訊

**Independent Test**: 店長登入後進入「操作員設定」頁面，在操作員列表中可以看到每位操作員對應的綁定店長名稱或 ID

**Status**: ✅ Partially completed in Phase 1 (T008), enhancements may be needed

### Implementation for User Story 7

- [ ] T059 [US7] Review and enhance OperatorManagementPage.jsx to display complete binding info (store manager name, email, binding time)
- [ ] T060 [US7] Add visual indicator in OperatorManagementPage.jsx to highlight operators belonging to current store manager
- [ ] T061 [US7] Add operator detail view/modal showing full binding relationship information

**Checkpoint**: User Story 7 complete - store managers can see detailed operator binding information

---

## Phase 10: 刪除權限控制 (Priority: P1)

**Goal**: 僅店長可刪除商品，操作員無刪除權限

**Independent Test**: 操作員登入後不應看到刪除按鈕；操作員嘗試刪除商品應返回 403 錯誤；店長可正常刪除商品

### Implementation

- [x] T062 [P] Add role check in deleteProduct() in spine-server/src/services/productPillow.service.js to reject operators (403 Forbidden)
- [x] T063 [P] Add role check in deleteProduct() in spine-server/src/services/productMattress.service.js to reject operators (403 Forbidden)
- [x] T064 [P] Add log call to logger.service.logProductAction('DELETE') in productPillow.service.js deleteProduct()
- [x] T065 [P] Add log call to logger.service.logProductAction('DELETE') in productMattress.service.js deleteProduct()
- [x] T066 Conditionally hide delete button in ProductPillowListPage.jsx based on userRole (operators cannot see)
- [x] T067 Conditionally hide delete button in ProductMattressListPage.jsx based on userRole (operators cannot see)
- [x] T068 Handle 403 error in product.api.controller.js and return error message "操作員無商品刪除權限"

**Checkpoint**: Delete permission control complete - only store managers can delete products

---

## Phase 11: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T069 [P] Update API documentation in specs/001-operator-product-binding/contracts/api-contracts.md with new fields (lastEditId, lastEditTime, version)
- [ ] T070 [P] Update quickstart.md with Phase 2 testing scenarios (optimistic locking, permission checks, edit tracking)
- [ ] T071 Code review and refactoring across all modified services
- [ ] T072 Performance testing: verify API response time < 500ms for create/update operations
- [ ] T073 [P] Monitor log output to verify structured logging works correctly
- [ ] T074 Security review: ensure userId and createId cannot be modified by clients
- [ ] T075 Verify database migration completed successfully for all existing products

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: ✅ Completed 2026-01-27
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all Phase 2 user stories
- **User Stories (Phase 3-10)**: All depend on Foundational phase completion
  - US1, US2, US3, US6 are P1 (high priority) - should be implemented first
  - US4, US5, US7 are P2 (medium priority) - can be implemented after P1
  - Delete permission control is P1 but separate phase due to its cross-cutting nature
- **Polish (Phase 11)**: Depends on all desired user stories being complete

### User Story Dependencies

- **US1** (操作員創建商品): Can start after Foundational (Phase 2) - No dependencies on other stories
- **US2** (操作員檢視所有商品): Can start after Foundational (Phase 2) - No dependencies on other stories
- **US3** (操作員編輯所有商品): Can start after Foundational (Phase 2) - No dependencies on other stories (but logically builds on US2)
- **US4** (列表顯示編輯者): Can start after Foundational (Phase 2) - Should come after US3 for logical flow
- **US5** (店長查看商品): Can start after Foundational (Phase 2) - Independent of other stories
- **US6** (驗證操作員身份): Can start after Foundational (Phase 2) - Independent of other stories
- **US7** (操作員設定頁面): Can start after Foundational (Phase 2) - Independent of other stories

### Within Each User Story

- Models before services (foundational phase handles this)
- Services before API controllers
- API controllers before frontend components
- Core implementation before error handling
- Story complete before moving to next priority

### Parallel Opportunities

**Within Foundational Phase (T009-T015)**: Most tasks can run in parallel as they modify different files
- T009, T010, T011 can run in parallel (different model files)
- T012, T013, T014 can run in parallel (new service files)
- T015 should run last (depends on model changes)

**Across User Stories**: Once Foundational completes, multiple stories can be worked on simultaneously by different team members
- US1, US2, US6 can all start in parallel (P1 priorities)
- US3 should wait for US2 to complete (logical dependency)
- US4 should wait for US3 to complete (displays editing info)
- US5, US7 are independent and can run in parallel with other stories

**Within User Stories**:
- US2: T020 and T021 can run in parallel (different service files)
- US3: T025-T032 can be parallelized (different services), T034-T037 can be parallelized (frontend components)
- US4: T040, T041, T042-T047 can be largely parallelized
- Delete control: T062-T065 can run in parallel, T066-T067 can run in parallel

---

## Parallel Example: User Story 3 (編輯權限)

```bash
# Backend team can work in parallel:
# Developer A:
git checkout -b feat/us3-pillow-optimistic-lock
# Work on T025, T027, T029, T031, T038 (productPillow.service.js)

# Developer B:
git checkout -b feat/us3-mattress-optimistic-lock
# Work on T026, T028, T030, T032, T039 (productMattress.service.js)

# Developer C:
git checkout -b feat/us3-controller-error-handling
# Work on T033 (product.api.controller.js)

# Frontend team can work in parallel:
# Developer D:
git checkout -b feat/us3-pillow-version-handling
# Work on T034, T036 (CreateEditProductPillow.jsx)

# Developer E:
git checkout -b feat/us3-mattress-version-handling
# Work on T035, T037 (CreateEditProductMattress.jsx)

# All merge to feat/user-story-3 branch, then to main
```

---

## Implementation Strategy

### MVP Scope (Immediate Implementation)
The MVP should include:
- **Foundational Phase (T009-T015)**: Core data model and infrastructure
- **User Story 1 (T016-T019)**: Enhanced product creation with tracking
- **User Story 2 (T020-T024)**: Operator view permissions
- **User Story 3 (T025-T039)**: Operator edit permissions with optimistic locking
- **User Story 6 (T054-T058)**: Operator binding validation
- **Delete Control (T062-T068)**: Permission enforcement

This provides a complete, secure, and auditable system for operator product management.

### Post-MVP Enhancements
After MVP is validated:
- **User Story 4 (T040-T047)**: UI enhancements for editor tracking
- **User Story 5 (T048-T053)**: Store manager visibility features
- **User Story 7 (T059-T061)**: Operator management enhancements
- **Polish Phase (T069-T075)**: Documentation, testing, optimization

### Recommended Approach
1. Complete Foundational phase in 1-2 days (single developer or parallel team)
2. Implement MVP user stories in priority order: US1 → US2 → US3 → US6 → Delete Control (2-3 weeks)
3. Test MVP thoroughly with real operator workflows
4. Implement post-MVP enhancements based on user feedback (1-2 weeks)
5. Polish and documentation (3-5 days)

**Total Estimated Time**: 4-6 weeks for complete implementation

---

## Success Criteria

### Phase 1 (✅ Completed)
- [x] 操作員創建商品時，商品 userId 自動綁定為店長 ID
- [x] 商品列表顯示創建者（createId）資訊
- [x] 操作員設定頁面顯示綁定的店長資訊

### Phase 2 (Pending Verification)
- [ ] 操作員可查看所屬店長的所有商品（不限自己創建）
- [ ] 操作員可編輯所屬店長的任何商品
- [ ] 商品列表顯示最近編輯者（lastEditId）和編輯時間（lastEditTime）
- [ ] 兩個用戶同時編輯同一商品時，第二個用戶收到 409 Conflict
- [ ] 操作員無法刪除商品（403 Forbidden），店長可正常刪除
- [ ] 所有商品操作有對應的後端 log 記錄
- [ ] 已離職用戶在 UI 顯示「已離職用戶」標記
- [ ] API 響應時間維持在 500ms 內
- [ ] userId 和 createId 在商品編輯時不可被修改
- [ ] 未綁定店長的操作員無法創建商品

---

## Notes

- Tasks T001-T008 from Phase 1 are marked as completed (✅)
- All Phase 2 tasks (T009 onwards) are pending implementation
- Tests are not explicitly required per specification, but integration testing is recommended
- Each user story is independently testable once its phase is complete
- Optimistic locking (version field) is critical for US3 - must be implemented correctly
- Logger service should use async operations to avoid blocking API responses
- Database migration (T015) is essential before deploying Phase 2 to production
- Frontend UserDisplay component (T040) is reusable across multiple pages
