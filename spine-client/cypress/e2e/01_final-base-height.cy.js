/// <reference types="cypress" />
/**
 * 測試情境來源：
 *   文件/2025.Q4.頸椎分析系統.v1.2.20250920 - 客戶頁面_醫枕分析推薦.csv
 *   區塊「最終基準高度」、「初始高度對照表」、「體重偏離調整表」
 *
 * 最終基準高度 = 初始高度 + 體重偏差高度調整
 */
import {
    calculateDefaultHeight,
    calculateStandardWeight,
    calculateWeightDeviation,
    calculateHeightAdjustment,
    calculateAdjustedDefaultHeight,
} from '../../src/utils/spineRecommendation';

describe('區塊一｜最終基準高度', () => {
    context('初始高度對照表（依年齡，8 歲以下）', () => {
        const ageCases = [
            { age: 1, expected: 3, desc: '嬰兒 0-2 歲 → 3 cm（低側）' },
            { age: 2, expected: 3, desc: '嬰兒 0-2 歲 邊界 → 3 cm' },
            { age: 3, expected: 4, desc: '嬰兒 3-4 歲 → 4 cm（高側）' },
            { age: 4, expected: 4, desc: '嬰兒 3-4 歲 邊界 → 4 cm' },
            { age: 5, expected: 5, desc: '兒童 5-6 歲 → 5 cm（低側）' },
            { age: 6, expected: 5, desc: '兒童 5-6 歲 邊界 → 5 cm' },
            { age: 7, expected: 6, desc: '兒童 7-8 歲 → 6 cm（高側）' },
            { age: 8, expected: 6, desc: '兒童 7-8 歲 邊界 → 6 cm' },
        ];
        ageCases.forEach(({ age, expected, desc }) => {
            it(`年齡 ${age} 歲：${desc}`, () => {
                // 8 歲以下年齡優先，身高給任意值不影響
                expect(calculateDefaultHeight(age, 170)).to.eq(expected);
            });
        });
    });

    context('初始高度對照表（依身高，9 歲以上 / 成人）', () => {
        const heightCases = [
            { height: 150, expected: 6, desc: '152 cm 以下 → 6 cm' },
            { height: 152, expected: 6, desc: '152 cm 邊界 → 6 cm' },
            { height: 155, expected: 6.5, desc: '153-157 cm → 6.5 cm' },
            { height: 160, expected: 7, desc: '158-162 cm → 7 cm' },
            { height: 165, expected: 7.5, desc: '163-167 cm → 7.5 cm' },
            { height: 170, expected: 8, desc: '168-172 cm → 8 cm' },
            { height: 175, expected: 8.5, desc: '173-177 cm → 8.5 cm' },
            { height: 180, expected: 9, desc: '178-182 cm → 9 cm' },
            { height: 185, expected: 9.5, desc: '183-187 cm → 9.5 cm' },
            { height: 190, expected: 10, desc: '188-192 cm → 10 cm' },
            { height: 195, expected: 10.5, desc: '193-197 cm → 10.5 cm' },
        ];
        heightCases.forEach(({ height, expected, desc }) => {
            it(`身高 ${height} cm：${desc}`, () => {
                // 9 歲以上：年齡不再決定初始高度，改依身高
                expect(calculateDefaultHeight(20, height)).to.eq(expected);
            });
        });

        it('身高 198 cm 以上：每 5 cm 多 0.5 cm（202 cm → 11 cm）', () => {
            expect(calculateDefaultHeight(30, 202)).to.eq(11);
        });

        it('資料不足（無身高、無年齡）回傳 null', () => {
            expect(calculateDefaultHeight('', '')).to.eq(null);
        });
    });

    context('標準體重（依性別、身高）', () => {
        it('男性：(身高 - 80) × 70%，175 cm → 66.5 kg', () => {
            expect(calculateStandardWeight(175, '男')).to.eq(66.5);
        });
        it('女性：(身高 - 70) × 60%，160 cm → 54 kg', () => {
            expect(calculateStandardWeight(160, '女')).to.eq(54);
        });
        it('未填性別 → null', () => {
            expect(calculateStandardWeight(170, '')).to.eq(null);
        });
    });

    context('體重偏差 = 實際體重 - 標準體重', () => {
        it('實際 80、標準 66.5 → +13.5 kg', () => {
            expect(calculateWeightDeviation(80, 66.5)).to.eq(13.5);
        });
        it('實際 50、標準 66.5 → -16.5 kg', () => {
            expect(calculateWeightDeviation(50, 66.5)).to.eq(-16.5);
        });
    });

    context('體重偏差高度調整（體重偏離調整表）', () => {
        const cases = [
            { dev: 0, adj: 0, desc: '正負 4 kg 以內 → 不變' },
            { dev: 4, adj: 0, desc: '+4 kg 邊界 → 不變' },
            { dev: -4, adj: 0, desc: '-4 kg 邊界 → 不變' },
            { dev: 7, adj: 0.5, desc: '超出 5-9 kg → +0.5' },
            { dev: 12, adj: 1.0, desc: '超出 10-14 kg → +1.0' },
            { dev: 16, adj: 1.5, desc: '超出 15-18 kg → +1.5' },
            { dev: 20, adj: 2.0, desc: '超出 19-22 kg → +2.0' },
            { dev: 25, adj: 2.5, desc: '超出 23 kg 以上 → +2.5' },
            { dev: -7, adj: -0.5, desc: '低於 5 kg 以下 → -0.5' },
        ];
        cases.forEach(({ dev, adj, desc }) => {
            it(`體重偏差 ${dev} kg：${desc}`, () => {
                expect(calculateHeightAdjustment(dev)).to.eq(adj);
            });
        });
    });

    context('最終基準高度 = 初始高度 + 體重偏差高度調整（整合）', () => {
        it('男 175cm/80kg：初始 8.5 + 調整 1.0 = 9.5 cm', () => {
            const r = calculateAdjustedDefaultHeight(30, 175, '男', 80);
            expect(r.baseHeight).to.eq(8.5);
            expect(r.standardWeight).to.eq(66.5);
            expect(r.weightDeviation).to.eq(13.5);
            expect(r.heightAdjustment).to.eq(1.0);
            expect(r.finalHeight).to.eq(9.5);
        });

        it('女 160cm/48kg：初始 7 + 調整 -0.5 = 6.5 cm', () => {
            const r = calculateAdjustedDefaultHeight(30, 160, '女', 48);
            expect(r.baseHeight).to.eq(7);
            expect(r.standardWeight).to.eq(54);
            expect(r.weightDeviation).to.eq(-6);
            expect(r.heightAdjustment).to.eq(-0.5);
            expect(r.finalHeight).to.eq(6.5);
        });

        it('身高未填 → finalHeight 為 null', () => {
            const r = calculateAdjustedDefaultHeight(30, '', '男', 80);
            expect(r.finalHeight).to.eq(null);
        });
    });
});
