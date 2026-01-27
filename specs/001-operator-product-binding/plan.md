# Implementation Plan: 操作員商品創建權限綁定

**Branch**: `001-operator-product-binding` | **Date**: 2026-01-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-operator-product-binding/spec.md`

## Summary

實作操作員 (Operator) 創建商品時的自動綁定邏輯：
- 操作員新增商品時，商品 `userId`（所有者）自動設為綁定的店長 ID
- 商品 `createId`（創建者）記錄操作員自己的 userId
- 在商品列表與詳情頁顯示創建者資訊
- 在操作員設定頁面顯示綁定的店長資訊

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
**Performance Goals**: 商品創建 API 響應時間 < 500ms
**Constraints**: 新增驗證邏輯不得增加超過 200ms 響應時間
**Scale/Scope**: 單店多操作員模式，預估每店 1-5 位操作員

## Constitution Check

*GATE: 依據 FlowEngine 專案憲法檢查設計決策*

| 原則 | 狀態 | 說明 |
|------|------|------|
| I. 分層架構強制分離 | ✅ 符合 | 綁定邏輯實作於 Service 層，Controller 僅負責請求解析 |
| II. 測試必要性 | ⚠️ 部分符合 | 後端無自動化測試框架，需手動整合測試驗證 |
| III. MVP 優先 | ✅ 符合 | 僅實作當前需求的綁定邏輯，不預先設計統計報表等功能 |
| IV. 業務正確性優先 | ✅ 符合 | 優先確保 userId/createId 正確綁定，再處理 UI 優化 |
| V. 向後相容性 | ✅ 符合 | 新增 createId 欄位不影響現有 API，舊資料預設為 userId |
| VI. 文件與註解規範 | ✅ 符合 | 所有新增方法使用繁體中文註解 |

**Gate 結果**: ✅ 通過 - 可進入 Phase 0

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
│   │   ├── productPillow.service.js               # [修改] 枕頭商品服務 - 綁定邏輯
│   │   ├── productMattress.service.js             # [修改] 床墊商品服務 - 綁定邏輯
│   │   ├── storeManagerToOperator.service.js      # [修改] 操作員綁定服務 - 新增查詢
│   │   └── userToRole.service.js                  # 用戶角色服務
│   ├── models/
│   │   ├── productPillow.model.js                 # [修改] 枕頭商品模型 - createId 欄位
│   │   ├── productMattress.model.js               # [修改] 床墊商品模型 - createId 欄位
│   │   └── storeManagerToOperator.model.js        # 操作員綁定模型
│   └── index.js                                   # 路由設定
│
spine-client/                    # 前端應用
├── src/
│   ├── api/
│   │   └── manager/
│   │       └── storeManagerToOperator.js          # [修改] 操作員 API - 新增店長查詢
│   ├── pages.spine/
│   │   └── manager/
│   │       ├── OperatorManagementPage.jsx         # [修改] 操作員設定頁面 - 顯示綁定店長
│   │       ├── ProductPillowListPage.jsx          # [修改] 枕頭列表 - 顯示創建者
│   │       └── ProductMattressListPage.jsx        # [修改] 床墊列表 - 顯示創建者
│   └── components/
│       └── manager/
│           └── CreateEdit/
│               ├── CreateEditProductPillow.jsx    # 枕頭新增編輯元件
│               └── CreateEditProductMattress.jsx  # 床墊新增編輯元件
```

**Structure Decision**: 採用現有 Web Application 結構（spine-server + spine-client），
遵循既有的 MVC 分層架構，修改集中於 Service 層以符合分層原則。

## Complexity Tracking

> 無憲法違反需要追蹤
