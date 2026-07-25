# 頸椎分析系統｜Cypress 測試

測試情境依據文件：
`文件/2025.Q4.頸椎分析系統.v1.2.20250920 - 客戶頁面_醫枕分析推薦.csv`

驗證對象為統一計算工具 [`src/utils/spineRecommendation.js`](../src/utils/spineRecommendation.js)，
涵蓋 CSV 中各「醫枕分析推薦」計算區塊。

## 執行

```bash
# 跑全部測試並產生 HTML 報告（cypress/reports/report.html）
npm run cy:test

# 互動式開啟 Cypress
npm run cy:open

# 僅執行測試（不產報告）
npm run cy:run
```

> ⚠️ 若環境中設有 `ELECTRON_RUN_AS_NODE=1`（部分終端／IDE 預設），
> Cypress 的 Electron 會被當成純 Node 執行而啟動失敗
> （錯誤訊息：`bad option: --no-sandbox`）。
> 上述 npm script 已於指令前清除此變數，可正常執行。

## 測試情境對照（共 80 條）

| Spec | CSV 區塊 | 內容 |
| --- | --- | --- |
| `01_final-base-height.cy.js` | 最終基準高度 / 初始高度對照表 / 體重偏離調整表 | 初始高度（年齡 0-8 歲、成人身高分段）、標準體重（男女公式）、體重偏差、體重偏差調整、最終基準高度整合 |
| `02_pillow-curve-type.cy.js` | 枕骨七頸椎對應枕型 / 頸椎長度與型號表 | 點2-4 距離 → B / A / AA 型枕（含邊界 8.4 / 8.5 / 10.0 / 10.1） |
| `03_shim-adjustment.cy.js` | 頸凹點至後腦勺增加墊片 | 點3-7 距離 × 最終基準高度是否為 .5 → 墊片張數與命名 .0 / .5 / .2 |
| `04_length-level-58.cy.js` | 頸凹點至背凸點級距 | 標準長度 10cm、標準長比差、.5 級距（無條件捨去） |
| `05_model-naming.cy.js` | 型號命名建議 | 高度.墊片[+F]弧度，驗證 CSV 範例 8.5FAA / 7.2B / 9.0A / 8.5FA |
| `06_full-recommendation-flow.cy.js` | 整份流程整合 | 由基本資訊→最終命名的端到端案例（含資料不足情境） |

## 報告

執行 `npm run cy:test` 後，於 `cypress/reports/report.html`
產生 mochawesome 互動式測試報告（單一檔案、可直接以瀏覽器開啟）。
