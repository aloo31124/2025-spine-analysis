/// <reference types="cypress" />
/**
 * 測試情境來源：
 *   區塊「頸凹點至後腦勺增加墊片」（點 3-7 距離）
 *
 *                              [最終基準高度] 非 .5      [最終基準高度] 為 .5
 *   3-7 距離 ≤ 1.5 cm    →    0 墊片（命名 .0）        0.5 張墊片（命名 .5）
 *   3-7 距離 1.6-2.1 cm  →    0.5 張墊片（命名 .5）     0.5 張墊片（命名 .5）
 *   3-7 距離 ≥ 2.2 cm    →    2.5 張墊片（命名 .2）     2.5 張墊片（命名 .2）
 */
import { computeShimAdjustment, isHalfHeight } from '../../src/utils/spineRecommendation';

describe('區塊三｜頸凹點至後腦勺增加墊片（點3-7 距離）', () => {
    context('最終基準高度「非 .5」（例：8.0）', () => {
        const finalHeight = 8.0;
        it('3-7 ≤ 1.5 cm → 0 墊片，命名 .0', () => {
            const r = computeShimAdjustment(1.5, finalHeight);
            expect(r).to.deep.eq({ shimText: '0 墊片', modelSuffix: '.0', sheets: 0 });
        });
        it('3-7 = 1.6-2.1 cm → 0.5 張墊片，命名 .5', () => {
            const r = computeShimAdjustment(1.8, finalHeight);
            expect(r).to.deep.eq({ shimText: '0.5 張墊片', modelSuffix: '.5', sheets: 0.5 });
        });
        it('3-7 ≥ 2.2 cm → 2.5 張墊片，命名 .2', () => {
            const r = computeShimAdjustment(2.5, finalHeight);
            expect(r).to.deep.eq({ shimText: '2.5 張墊片', modelSuffix: '.2', sheets: 2.5 });
        });
    });

    context('最終基準高度「為 .5」（例：8.5）', () => {
        const finalHeight = 8.5;
        it('isHalfHeight(8.5) 應為 true', () => {
            expect(isHalfHeight(finalHeight)).to.eq(true);
        });
        it('3-7 ≤ 1.5 cm → 0.5 張墊片，命名 .5（與非 .5 不同）', () => {
            const r = computeShimAdjustment(1.2, finalHeight);
            expect(r).to.deep.eq({ shimText: '0.5 張墊片', modelSuffix: '.5', sheets: 0.5 });
        });
        it('3-7 = 1.6-2.1 cm → 0.5 張墊片，命名 .5', () => {
            const r = computeShimAdjustment(2.0, finalHeight);
            expect(r.modelSuffix).to.eq('.5');
        });
        it('3-7 ≥ 2.2 cm → 2.5 張墊片，命名 .2', () => {
            const r = computeShimAdjustment(3.0, finalHeight);
            expect(r.modelSuffix).to.eq('.2');
        });
    });

    context('邊界與資料不足', () => {
        it('3-7 = 2.1 cm 邊界 → 0.5 張墊片（.5）', () => {
            expect(computeShimAdjustment(2.1, 8.0).modelSuffix).to.eq('.5');
        });
        it('3-7 = 2.2 cm 邊界 → 2.5 張墊片（.2）', () => {
            expect(computeShimAdjustment(2.2, 8.0).modelSuffix).to.eq('.2');
        });
        it('無點3-7距離（null）→ 回傳 null', () => {
            expect(computeShimAdjustment(null, 8.0)).to.eq(null);
        });
    });
});
