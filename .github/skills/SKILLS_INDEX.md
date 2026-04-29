# Skills 索引

本專案的 Skills 文檔位於 `.github/skills/` 目錄。
進行相關功能開發時，請優先閱讀對應的 SKILL.md。

## 可用 Skills

### 客戶分析計算與型號建議
- **文檔**: `.github/skills/customer-model-recommendation/SKILL.md`
- **適用情境**:
    * 修改、除錯或檢索「客戶新增 / 編輯」頁 (`CreateEditCustomer.jsx`) 的計算欄位與最終「型號建議」命名邏輯。
    * 涉及檔案：`utils/calculateDefaultHeight.js`、`utils/spineRecommendation.js`、`utils/scaleConversion.js`。
    * 關鍵字：初始高度、基準高度、標準體重、體重偏差、高度調整、點2-4 / 點3-7 / 點5-8 距離、推薦枕頭、墊片調整、5-8點加高、型號建議、型號命名、A型枕、B型枕、AA型枕。

### skills 文件創建6原則
- **文檔**: `.github/skills/skill-design-6-principles/SKILL.md`
- **補充參考**: `.github/skills/skill-design-6-principles/eval-loop-test.md`
- **適用情境**: 
    * 創建 skills 文件時，必須閱讀此文件，包含:
    * 已經存在之功能需另外創建新 skills 文件說明。
    * 或使用 speckit、openspec 等工具開發之新功能完成後，也必須創建新的 skills 文件說明。
    * 關鍵字: skills、產生skills、speckit.implement、開發完成。

