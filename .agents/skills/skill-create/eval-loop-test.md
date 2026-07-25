# Eval Loop：如何真正測試一個 Skill
寫 skill 不測試就像寫程式不跑一樣。
Anthropic Skill Creator 2026 年 3 月更新加入 eval、improve、benchmark 模式，
把這件事形式化成任何 skill 作者都能遵循的方法論。

## 四步驟流程
第一步：寫 2-3 個測試 prompt。 要寫實 -- 用真實使用者會打的措辭和 context。
不是「test the skill」而是「我剛完成 auth 模組重構。Review 這個 branch 上的改動，告訴我是否可以安全 merge。」

第二步：跑有 skill vs 無 skill 對比。 Skill 有改善輸出嗎？這是唯一重要的問題。
Agent 不用 skill 也能產出同等結果的話，skill 就是花 context 成本沒帶來價值。

第三步：讀完整逐字稿。 不只輸出 -- 推理過程。Agent 有載入 skill 嗎？有遵循指令嗎？在哪偏離？在哪浪費時間？

第四步：迭代。 根據發現修 skill，重跑，再檢視。
Skill Creator 用四個可組合的子 agent（executor、grader、comparator、analyzer）自動化這個 loop 
-- 對 eval prompt 跑 skill、評分輸出、在版本之間做盲測 A/B 對比、挖出聚合統計可能藏住的模式。

## Description 最佳化
Skill Creator 的 description 最佳化值得特別關注。
用 train/test split：60% eval query 當訓練集，40% 留作測試。
系統跑每個訓練 query 3 次來評估當前 description 的觸發率，根據失敗案例提改進 description，再評估，再迭代。

改善觸發準確率最系統化的方式。
即使沒工具，原則一樣：量測、分析失敗、改進、再量測。
多數 skill 作者寫一次 description 就再也不碰。所以多數 skill undertrigger。

## 多面板的優勢
迭代測試 loop（改 skill、跑 prompt、看逐字稿、再改）就是多終端面板並排的價值所在。
SKILL.md 在一個面板、agent session 在另一個、逐字稿或輸出在第三個。
不切 tab、不丟 context，就是緊湊的 feedback loop。

