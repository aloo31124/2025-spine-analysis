/// <reference types="cypress" />
/**
 * 測試情境來源：整份 CSV 的完整推薦流程（端到端）
 *
 * 流程：基本資訊 → 最終基準高度 → 弧度型號（點2-4） →
 *       墊片（點3-7） → 級距（點5-8，純文字） → 型號命名
 */
import {
    calculateAdjustedDefaultHeight,
    recommendPillowType,
    computeShimAdjustment,
    calculateLevel58,
    composeModelName,
} from '../../src/utils/spineRecommendation';

describe('整合情境｜完整醫枕分析推薦流程', () => {
    const runFlow = (p) => {
        const { finalHeight } = calculateAdjustedDefaultHeight(p.age, p.height, p.gender, p.weight);
        const pillowRecommendation = recommendPillowType(p.dist24);
        const shimAdj = computeShimAdjustment(p.dist37, finalHeight);
        const level58 = calculateLevel58(p.dist58, p.height);
        const { modelName } = composeModelName({ finalHeight, shimAdj, pillowRecommendation });
        return { finalHeight, pillowRecommendation, shimAdj, level58, modelName };
    };

    it('案例 A：男 175cm/80kg，點2-4=11、3-7=1.8、5-8=11 → 9.5FAA', () => {
        const r = runFlow({
            age: 30, height: 175, gender: '男', weight: 80,
            dist24: 11, dist37: 1.8, dist58: 11,
        });
        expect(r.finalHeight).to.eq(9.5);
        expect(r.pillowRecommendation).to.eq('AA 型枕');
        expect(r.shimAdj.modelSuffix).to.eq('.5');
        // 標準長比差 = 10×(1-9/166) ≈ 9.458；(11-9.458)/0.5 ≈ 3.08 → ⌊3⌋×0.5 = 1.5
        expect(r.level58).to.eq(1.5); // 純文字級距，不影響命名
        expect(r.modelName).to.eq('9.5FAA');
    });

    it('案例 B：女 160cm/48kg，點2-4=8.0、3-7=1.0、5-8=9 → 6.5FB', () => {
        const r = runFlow({
            age: 25, height: 160, gender: '女', weight: 48,
            dist24: 8.0, dist37: 1.0, dist58: 9,
        });
        expect(r.finalHeight).to.eq(6.5);
        expect(r.pillowRecommendation).to.eq('B 型枕');
        expect(r.shimAdj.modelSuffix).to.eq('.5'); // 最終基準高度為 .5
        expect(r.modelName).to.eq('6.5FB');
    });

    it('案例 C：男 180cm/75kg，點2-4=9.0、3-7=2.5、5-8=12 → 9.2A', () => {
        // 初始 9（178-182）；標準體重 (180-80)*0.7=70，偏差 5 → +0.5；最終 9.5?
        // 9.5 為 .5；3-7=2.5 ≥2.2 → .2；點2-4=9 → A 型枕
        const r = runFlow({
            age: 30, height: 180, gender: '男', weight: 75,
            dist24: 9.0, dist37: 2.5, dist58: 12,
        });
        expect(r.finalHeight).to.eq(9.5);
        expect(r.pillowRecommendation).to.eq('A 型枕');
        expect(r.shimAdj.modelSuffix).to.eq('.2');
        expect(r.modelName).to.eq('9.2A');
    });

    it('資料不足（無身高）→ 無法產生最終命名', () => {
        const r = runFlow({
            age: 30, height: '', gender: '男', weight: 80,
            dist24: 11, dist37: 1.8, dist58: 11,
        });
        expect(r.finalHeight).to.eq(null);
        expect(r.modelName).to.eq(null);
    });
});
