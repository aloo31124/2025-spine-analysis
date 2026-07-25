/// <reference types="cypress" />
/**
 * 測試情境來源：
 *   區塊「型號命名建議」
 *
 *   命名格式：高度.墊片[+F]弧度型號
 *     高度     ：[最終基準高度] 的第一個數字（整數位）
 *     墊片     ：.5 / .2 / .0
 *     F        ：若墊片為 .5 則加入 F
 *     弧度型號 ：依點2-4距離判定 A / B / AA
 *
 *   CSV 命名範例：8.5FAA、7.2B、9.0A、8.5FA
 */
import { composeModelName } from '../../src/utils/spineRecommendation';

describe('區塊五｜型號命名建議', () => {
    const build = (finalHeight, modelSuffix, pillowRecommendation) =>
        composeModelName({
            finalHeight,
            shimAdj: { modelSuffix },
            pillowRecommendation,
        });

    it('CSV 範例1：8.5 + .5(F) + AA 型枕 → 8.5FAA', () => {
        expect(build(8.5, '.5', 'AA 型枕').modelName).to.eq('8.5FAA');
    });

    it('CSV 範例2：7.x + .2 + B 型枕 → 7.2B', () => {
        expect(build(7.0, '.2', 'B 型枕').modelName).to.eq('7.2B');
    });

    it('CSV 範例3：9.x + .0 + A 型枕 → 9.0A', () => {
        expect(build(9.0, '.0', 'A 型枕').modelName).to.eq('9.0A');
    });

    it('CSV 範例4：8.x + .5(F) + A 型枕 → 8.5FA', () => {
        expect(build(8.5, '.5', 'A 型枕').modelName).to.eq('8.5FA');
    });

    context('命名組成拆解', () => {
        it('高度取整數位（8.5 → 8）', () => {
            expect(build(8.5, '.5', 'A 型枕').heightDigit).to.eq(8);
        });
        it('墊片 .5 會加入 F 參數', () => {
            expect(build(8.5, '.5', 'A 型枕').fParam).to.eq('F');
        });
        it('墊片 .2 / .0 不加 F 參數', () => {
            expect(build(7.0, '.2', 'B 型枕').fParam).to.eq('');
            expect(build(9.0, '.0', 'A 型枕').fParam).to.eq('');
        });
        it('弧度型號去除「型枕」與空白（AA 型枕 → AA）', () => {
            expect(build(8.5, '.5', 'AA 型枕').arcCode).to.eq('AA');
        });
    });

    context('資料不足時不產生命名', () => {
        it('缺最終基準高度 → modelName 為 null', () => {
            expect(build(null, '.5', 'A 型枕').modelName).to.eq(null);
        });
        it('缺弧度型號 → modelName 為 null', () => {
            expect(build(8.5, '.5', '').modelName).to.eq(null);
        });
    });
});
