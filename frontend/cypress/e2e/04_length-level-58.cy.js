/// <reference types="cypress" />
/**
 * 測試情境來源：
 *   區塊「頸凹點至背凸點級距」（點 5-8 距離）
 *
 *   標準長度      ：固定 10 cm
 *   標準長比差    ：標準長度 × { 1 - ( |身高 - 166| / 166 ) }
 *   .5 級距       ：⌊ (患者[5-8距離] - 標準長比差) / 0.5 ⌋ × 0.5
 *                  （結果 0.5, 1, 1.5, 2 …，純文字顯示，不影響墊片與命名）
 */
import {
    STANDARD_LENGTH_58,
    calculateStandardLengthRatio,
    calculateLevel58,
} from '../../src/utils/spineRecommendation';

describe('區塊四｜頸凹點至背凸點級距（點5-8 距離）', () => {
    it('標準長度固定為 10 cm', () => {
        expect(STANDARD_LENGTH_58).to.eq(10);
    });

    context('標準長比差 = 10 × {1 - (|身高 - 166|/166)}', () => {
        it('身高 166 cm（基準）→ 10 cm', () => {
            expect(calculateStandardLengthRatio(166)).to.be.closeTo(10, 1e-6);
        });
        it('身高 175 cm → 10 × (1 - 9/166) ≈ 9.4578 cm', () => {
            const expected = 10 * (1 - Math.abs(175 - 166) / 166);
            expect(calculateStandardLengthRatio(175)).to.be.closeTo(expected, 1e-6);
        });
        it('身高 150 cm → 10 × (1 - 16/166) ≈ 9.0361 cm', () => {
            const expected = 10 * (1 - Math.abs(150 - 166) / 166);
            expect(calculateStandardLengthRatio(150)).to.be.closeTo(expected, 1e-6);
        });
        it('身高無效（0）→ null', () => {
            expect(calculateStandardLengthRatio(0)).to.eq(null);
        });
    });

    context('.5 級距 = ⌊(5-8距離 - 標準長比差)/0.5⌋ × 0.5', () => {
        it('身高 166、5-8 距離 11 cm → 級距 1.0 cm', () => {
            // 標準長比差 = 10；(11 - 10)/0.5 = 2 → 2 × 0.5 = 1.0
            expect(calculateLevel58(11, 166)).to.eq(1.0);
        });
        it('身高 166、5-8 距離 11.4 cm → 級距 1.0 cm（無條件捨去）', () => {
            // (11.4 - 10)/0.5 = 2.8 → ⌊2.8⌋ = 2 → 1.0
            expect(calculateLevel58(11.4, 166)).to.eq(1.0);
        });
        it('身高 166、5-8 距離 10.2 cm → 級距 0（捨去後為 0）', () => {
            // (10.2 - 10)/0.5 = 0.4 → ⌊0.4⌋ = 0 → 0
            expect(calculateLevel58(10.2, 166)).to.eq(0);
        });
        it('5-8 距離小於標準長比差 → 級距下限 0（不為負）', () => {
            expect(calculateLevel58(8, 166)).to.eq(0);
        });
        it('無點5-8距離（null）→ null', () => {
            expect(calculateLevel58(null, 166)).to.eq(null);
        });
    });
});
