----
name: 客戶分析計算與型號建議
description: >
  脊椎分析系統「客戶新增 / 編輯」頁 (CreateEditCustomer.jsx) 的全部分析計算邏輯與最終
  「型號建議」組合規則。當使用者要求修改、調整、除錯、或檢索：
  初始高度、基準高度、標準體重、體重偏差、高度調整、頸椎點2-4 / 點3-7 / 點5-8 距離、
  推薦枕頭型號（A/AA/B 型枕）、墊片調整建議（半張 / 二個半張）、5-8點加高調整、
  「型號建議」最終命名（高度_墊片狀態_弧度類型）等任何相關欄位或公式時，務必載入此技能。
  關鍵字: 客戶分析、初始高度、標準體重、體重偏差、墊片調整、5-8點加高、推薦枕頭、
  型號建議、型號命名、A型枕、B型枕、AA型枕、CreateEditCustomer、spineRecommendation、
  calculateDefaultHeight。
----

## 適用範圍

本技能對應檔案：

- 主畫面：[frontend/src/components/manager/CreateEdit/CreateEditCustomer.jsx](../../../frontend/src/components/manager/CreateEdit/CreateEditCustomer.jsx)
- 計算工具：[frontend/src/utils/calculateDefaultHeight.js](../../../frontend/src/utils/calculateDefaultHeight.js)
- 計算工具：[frontend/src/utils/spineRecommendation.js](../../../frontend/src/utils/spineRecommendation.js)
- 比例尺換算：[frontend/src/utils/scaleConversion.js](../../../frontend/src/utils/scaleConversion.js)

頁面入口：
- 新增：[CustomerAddPage.jsx](../../../frontend/src/pages.spine/manager/CustomerAddPage.jsx)
- 編輯：[CustomerEditPage.jsx](../../../frontend/src/pages.spine/manager/CustomerEditPage.jsx)

---

## 一、所需欄位總覽

### 1.1 使用者輸入欄位（基本資訊）
| 欄位 | 必要性 | 用途 |
| --- | --- | --- |
| `name` 姓名 | 必填 | 基本資料 |
| `email` 電子郵件 | 必填 | 基本資料 |
| `phone` 電話 | 必填 | 基本資料 |
| `birthday` 生日 | 選填 | 自動推算 `age` |
| `age` 年齡 | 計算用 | 「初始高度」基準高度查表 |
| `gender` 性別（男 / 女 / 其他） | 計算用 | 「標準體重」公式選擇 |
| `height` 身高 (cm) | 計算用 | 基準高度查表、5-8點標準長度 |
| `weight` 體重 (kg) | 計算用 | 體重偏差、墊片狀態 |

### 1.2 來自頸椎分析結果的欄位（`analysisResults`）
從 `analysisResults` 中 **取最新** 一筆 `analysisType === 'spine'`，使用以下欄位：
- `points[0..4]`：頸椎標記點 1~5（陣列索引 0~4）
- `analysisData.scale`：比例尺（px → cm 換算係數，缺省 1.0）
- `analysisData.timestamp` / `createdAt`：用於排序找最新

### 1.3 自動計算欄位（皆唯讀顯示）
| 欄位 | 對應 state |
| --- | --- |
| 基準高度 | `baseHeight` |
| 標準體重 | `standardWeight` |
| 體重偏差 | `weightDeviation` |
| 高度調整 | `heightAdjustment` |
| 初始高度（最終高度） | `defaultHeight` |
| 點2-4 距離 | `spinePoint24Distance` |
| 推薦枕頭型號 | `spinePillowRecommendation` |
| 點3-7 距離 | `spinePoint37Distance` |
| 點5-8 距離 | `spinePoint58Distance` |
| 5-8點標準長度 | `spine58StandardLength` |

---

## 二、計算流程（依執行順序）

### 步驟 1 — 初始高度（基準高度）
函式：`calculateDefaultHeight(age, height)` 於 `calculateDefaultHeight.js`

**為什麼**：年齡決定發育階段，9 歲以上需以身高細分頸枕高度規格，避免成人沿用兒童規格。

| 條件 | 基準高度 |
| --- | --- |
| 0~2 歲 | 3 cm |
| 3~4 歲 | 4 cm |
| 5~6 歲 | 5 cm |
| 7~8 歲 | 6 cm |
| ≥ 9 歲且身高 ≤ 152 | 6 cm |
| 153~157 | 6.5 cm |
| 158~162 | 7 cm |
| 163~167 | 7.5 cm |
| 168~172 | 8 cm |
| 173~177 | 8.5 cm |
| 178~182 | 9 cm |
| 183~187 | 9.5 cm |
| 188~192 | 10 cm |
| 193~197 | 10.5 cm |
| ≥ 198 | 從 193cm=10.5cm 起，每 +5 cm 加 0.5 cm（向下取整） |

### 步驟 2 — 標準體重
函式：`calculateStandardWeight(height, gender)`

- 男性：`(身高 − 80) × 0.7`
- 女性：`(身高 − 70) × 0.6`
- 其他性別 / 缺值 → `null`

### 步驟 3 — 體重偏差
`calculateWeightDeviation(weight, standardWeight)` = `weight − standardWeight`

### 步驟 4 — 高度調整（依體重偏差）
函式：`calculateHeightAdjustment(weightDeviation)`

| 體重偏差（kg） | 高度調整 |
| --- | --- |
| 絕對值 ≤ 4 | 0 |
| ≤ −5 | −0.5 |
| +5 ~ +9 | +0.5（**1 張整片墊片**） |
| +10 ~ +14 | +1.0 |
| +15 ~ +18 | +1.5 |
| +19 ~ +22 | +2.0 |
| ≥ +23 | +2.5 |

> ⚠️ **重要約定**：當 `heightAdjustment === 0.5` 時代表「已因體重加了一張整片墊片」，後續墊片建議文字會改寫為「取代原體重整張墊片」，避免雙重加片。見步驟 7。

### 步驟 5 — 最終初始高度
`defaultHeight = baseHeight + heightAdjustment`

由 `calculateAdjustedDefaultHeight(age, height, gender, weight)` 一次回傳 `{ baseHeight, standardWeight, weightDeviation, heightAdjustment, finalHeight }`。

### 步驟 6 — 點2-4 距離 → 推薦枕頭型號（弧度類型）
函式：`extractSpineRecommendation(analysisResults)` + `recommendPillowType(distanceCm)`

1. 取最新 spine 分析結果 `points[1]`、`points[3]` 計算像素距離。
2. 透過 `convertPxToCm(pixelDistance, scaleFactor)` 換算為公分。
3. 依下表推薦：

| 點2-4 距離 (cm) | 推薦型號 |
| --- | --- |
| ≤ 8.4 | `B 型枕` |
| 8.5 ~ 10.0 | `A 型枕` |
| ≥ 10.1 | `AA 型枕` |

### 步驟 7 — 點3-7 距離 → 墊片調整建議
函式：`extractSpinePointDistances(analysisResults)`、`computeShimAdjustment(dist37Cm, heightAdjustment)`

**幾何意義**：點3-7 距離 = 頸椎凹點到「點1—點4」連線的水平距離（後腦勺方向）。
計算方式：以 `point3.y` 作水平線，求其與線段 point1→point4 的交點 `point7`，再求 `point3` 到 `point7` 的距離。

| 點3-7 距離 (cm) | 行為 | `modelSuffix` | 文字（一般） | 文字（heightAdjustment=0.5 時） |
| --- | --- | --- | --- | --- |
| < 1.6 | 無需墊片 | `''` | 無需墊片調整 | 同左 |
| 1.6 ~ 2.1 | 半張墊片 | `.5` | 增加「半張墊片」 | 改為「半張墊片」（取代原體重整張墊片） |
| ≥ 2.2 | 二個半張墊片 | `.2` | 增加「二個半張墊片」 | 改為「二個半張墊片」（取代原體重整張墊片） |

### 步驟 8 — 點5-8 距離 → 5-8點加高調整
函式：`calculateStandardLength58(height)`、`computeExtra58Height(dist58Cm, height)`

**幾何意義**：點5-8 距離 = 頸椎凹點(point3)的水平線與背部凸點(point5)的垂直線之交點 `point8`，再求 `point5` 到 `point8` 的垂直距離。

- 標準長度公式：`10 × (1 + (height − 166) / 166)`，基準身高 166 cm = 10 cm。
- 加高公式：`excess = dist58Cm − standardLength`
  - `excess ≤ 0` → 加高 0
  - 否則 `Math.floor(excess / 0.5) * 0.5`（每超過 0.5 cm 額外加 0.5 cm）

> 注意：目前此「5-8點加高」**只顯示為提示**，並未被合併進「型號建議」最終命名。

---

## 三、型號建議 — 最終組合規則

「型號建議」由頁面上的 IIFE（位於 `CreateEditCustomer.jsx` 約 700 行附近）即時組合，**不寫入資料庫**。

### 3.1 三個輸入來源
| 組件 | 來源欄位 | 對應計算步驟 |
| --- | --- | --- |
| `heightLabel`（高度） | `defaultHeight` | 步驟 5 |
| `shimLabel`（墊片狀態） | `computeShimAdjustment().modelSuffix` | 步驟 7 |
| `arcLabel`（弧度類型） | `spinePillowRecommendation` | 步驟 6 |

### 3.2 標籤轉換規則
- **高度 → 中文**：以 `cnDigits` 對照表逐字轉換，小數點 `.` 轉「點」，並加上「公分」。
  - 例：`6.5` → `六點五公分`、`7` → `七公分`、`8.5` → `八點五公分`。
- **墊片狀態**（依 `modelSuffix`）：
  - `''` → `無墊片`
  - `.5` → `半張墊片`
  - `.2` → `二個半張墊片`
- **弧度類型**：把 `spinePillowRecommendation` 移除空白和「枕」字。
  - `A 型枕` → `A型`、`AA 型枕` → `AA型`、`B 型枕` → `B型`

### 3.3 最終命名格式
```
modelName = `${heightLabel}_${shimLabel}_${arcLabel}`
```

**完整範例**：
- `defaultHeight = 7`、`modelSuffix = ''`、`pillow = 'A 型枕'`
  → `七公分_無墊片_A型`
- `defaultHeight = 8.5`、`modelSuffix = '.5'`、`pillow = 'AA 型枕'`
  → `八點五公分_半張墊片_AA型`
- `defaultHeight = 6.5`、`modelSuffix = '.2'`、`pillow = 'B 型枕'`
  → `六點五公分_二個半張墊片_B型`

### 3.4 顯示守則
- 三個值任一為 `null` / 空字串 → 顯示「資料不完整，請確認上方三項數值」，不輸出組合字串。
- 顯示成功時背景色 `#e8f5e9`、文字綠色 `#2e7d32` 並加粗，並另渲染「參數來源總覽」區塊，列出年齡、身高、性別、體重、點3-7、點2-4 各來源值。

---

## 四、欄位 ↔ 計算 ↔ 結果 對應速查表

| UI 欄位 | 直接依賴 | 影響的最終結果 |
| --- | --- | --- |
| 年齡 | 步驟 1 基準高度 | 高度標籤、型號命名 |
| 身高 | 步驟 1、2、8 | 基準高度、標準體重、5-8 標準長度 |
| 性別 | 步驟 2 | 標準體重 → 體重偏差 → 高度調整 |
| 體重 | 步驟 3、4 | 高度調整 → 初始高度、影響墊片文字 |
| 頸椎分析 points[1]/[3] | 步驟 6 | 推薦枕頭型號 → `arcLabel` |
| 頸椎分析 points[0],[2],[3] | 步驟 7 | 點3-7 → 墊片狀態 → `modelSuffix` |
| 頸椎分析 points[2],[4] | 步驟 8 | 5-8 加高（提示用，不入命名） |
| analysisData.scale | 步驟 6/7/8 | 所有 px→cm 換算 |

---

## 五、修改 / 除錯時的常見陷阱

1. **修改高度區間**：必須同步調整 `calculateDefaultHeight.js` 的對照表與頁面右側 `<small>` 內提示文字（如 `(≤ 8.4 cm → B 型枕)`），否則 UI 與實際邏輯會不一致。
2. **新增推薦類型**（例如 `AAA 型枕`）：除了 `recommendPillowType`，還要更新 `extractArcLabel` 的字串處理（目前只有 `replace('枕', '')`），確保命名不殘留中文。
3. **體重墊片雙重加片**：判斷 `heightAdjustment === 0.5` 是「整張體重墊片」的隱含協定，若新增 `+1.0` 也屬「兩張整片」的情境，需要重新設計 `computeShimAdjustment` 的判斷條件，否則會誤導使用者。
4. **比例尺缺失**：`analysisData.scale` 為 `undefined` 時 fallback 為 `1.0`，會直接把像素當公分使用 — 出現「點2-4 距離」異常巨大時，多半是分析資料未正確存入比例尺。
5. **點位不足**：頸椎推薦需要 ≥ 4 個點、點距離計算需要 ≥ 5 個點。`points` 不足時整個區塊靜默回傳 `null`，UI 會顯示「無頸椎分析數據」而不報錯。
6. **「型號建議」並未持久化**：它是純 render 時計算，不在 `clickAddCustomer` / `clickUpdateCustomer` 提交範圍內。若要存入資料庫，需新增 state 或在送出時即時計算後寫入。
7. **5-8 加高 vs 型號命名**：目前 5-8 點加高只在 UI 顯示，**不影響** `modelName`。若需求要納入，需擴充 `modelName` 組合公式並更新本文件。

---

## 六、相關文件

- 商品推薦規格：[spec.md](../../../specs/001-operator-product-binding/spec.md)
- 頸椎點位優化說明：[notes/3.1.2026.Q1.第三期.客製1.0303會前/1.1.頸椎點位優化.md](../../../notes/3.1.2026.Q1.第三期.客製1.0303會前/1.1.頸椎點位優化.md)
- 推薦型號規則：[notes/3.1.2026.Q1.第三期.客製1.0303會前/4.1.頸椎程度.推薦型號.md](../../../notes/3.1.2026.Q1.第三期.客製1.0303會前/4.1.頸椎程度.推薦型號.md)
- 型號命名建議：[notes/3.2.2026.Q1.第三期.客製2.0303會後/3.1.文件[五]型號命名建議.md](../../../notes/3.2.2026.Q1.第三期.客製2.0303會後/3.1.文件%5B五%5D型號命名建議.md)
