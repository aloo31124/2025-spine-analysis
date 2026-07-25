2026.05.19


## git commit
[refactor] #4 [頸椎計算] 整合於 spineRecommendation.js。
[why]
基準高度計算程式於:
spine-client\src\utils\calculateDefaultHeight.js
後續此檔案整合於
spine-client\src\utils\spineRecommendation.js
統一計算:
- 計算 最終基準高度
- 計算 弧度醫學枕型號
- 計算 墊片加高
- 計算 標準長度

並確保上述計算邏輯確實從
spine-client\src\components\manager\CreateEdit\CreateEditCustomer.jsx
抽離出來。
[how]
spine-client/src/utils/spineRecommendation.js — 改造為統一計算模組，依產品文件章節分為五個區塊：

區塊一｜最終基準高度（含 calculateDefaultHeight / 標準體重 / 體重偏差 / 體重偏差調整 / calculateAdjustedDefaultHeight）
區塊二｜弧度醫學枕型號（recommendPillowType / extractSpineRecommendation / extractSpinePointDistances）
區塊三｜墊片加高（computeShimAdjustment）
區塊四｜標準長度與 5-8 點加高（calculateStandardLength58 / computeExtra58Height）
區塊五｜型號命名組合（新增 heightToChinese / extractShimLabel / extractArcLabel / composeModelName）
spine-client/src/utils/calculateDefaultHeight.js — 已刪除。

spine-client/src/components/manager/CreateEdit/CreateEditCustomer.jsx：

import 統一改為從 spineRecommendation 取得
「型號建議」區塊內原本內嵌在 JSX 的 30 行型號命名邏輯（中文數字轉換、墊片標籤、弧度標籤、組合 modelName）抽離為單一 composeModelName({ finalHeight, shimAdj, pillowRecommendation }) 呼叫
JSX 仍保留的內嵌算式（如 CreateEditCustomer.jsx:894-918 5-8 點標準長度的逐步顯示）為純顯示用途的呈現格式化，不屬於業務計算，因此保留於畫面層。

## prompt

基準高度計算程式於:
spine-client\src\utils\calculateDefaultHeight.js
後續此檔案整合於
spine-client\src\utils\spineRecommendation.js
統一計算:
- 計算 最終基準高度
- 計算 弧度醫學枕型號
- 計算 墊片加高
- 計算 標準長度

並確保上述計算邏輯確實從
spine-client\src\components\manager\CreateEdit\CreateEditCustomer.jsx
抽離出來。


### 相關程式
spine-client\src\utils\spineRecommendation.js
spine-client\src\utils\calculateDefaultHeight.js



