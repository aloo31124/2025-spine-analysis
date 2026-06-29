/// <reference types="cypress" />
/**
 * 測試情境來源：
 *   區塊「枕骨七頸椎對應枕型」、「頸椎長度與型號表」
 *
 * 依點 2-4 距離（枕骨至第七頸椎）對應 B / A / AA 型醫枕：
 *   ≤ 8.4 cm   → B 型枕
 *   8.5 - 10 cm → A 型枕
 *   ≥ 10.1 cm  → AA 型枕
 */
import { recommendPillowType, getArcCode } from '../../src/utils/spineRecommendation';

describe('區塊二｜弧度醫學枕型號（點2-4 距離）', () => {
    const cases = [
        { dist: 7.0, type: 'B 型枕', arc: 'B', desc: '8.4 cm 以下 → B 型枕' },
        { dist: 8.4, type: 'B 型枕', arc: 'B', desc: '8.4 cm 邊界 → B 型枕' },
        { dist: 8.5, type: 'A 型枕', arc: 'A', desc: '8.5 cm 邊界 → A 型枕' },
        { dist: 9.3, type: 'A 型枕', arc: 'A', desc: '8.5-10 cm → A 型枕' },
        { dist: 10.0, type: 'A 型枕', arc: 'A', desc: '10 cm 邊界 → A 型枕' },
        { dist: 10.1, type: 'AA 型枕', arc: 'AA', desc: '10.1 cm 邊界 → AA 型枕' },
        { dist: 12.0, type: 'AA 型枕', arc: 'AA', desc: '10.1 cm 以上 → AA 型枕' },
    ];

    cases.forEach(({ dist, type, arc, desc }) => {
        it(`點2-4 距離 ${dist} cm：${desc}`, () => {
            expect(recommendPillowType(dist)).to.eq(type);
            expect(getArcCode(type)).to.eq(arc);
        });
    });

    it('無頸椎分析結果（null）→ 回傳空字串', () => {
        expect(recommendPillowType(null)).to.eq('');
    });
});
