/**
 * 太醫床枕基準高度計算工具
 *
 * 名詞對照（依產品規範）：
 *  - 標準體重 (standardWeight)         ：依性別、身高計算的理想體重
 *  - 體重偏差 (weightDeviation)        ：實際體重 - 標準體重
 *  - 體重偏差調整 (heightAdjustment)    ：依「體重偏離調整表」換算的高度修正值 (cm)
 *  - 初始高度 (baseHeight)              ：依「初始高度對照表」(年齡 / 身高) 查得的高度 (cm)
 *  - 最終基準高度 (finalHeight)         ：初始高度 + 體重偏差調整
 */

/* ----------------------------- 初始高度 ----------------------------- */

/**
 * 計算初始高度（依年齡與身高對照表）
 *
 * 年齡優先（0-8 歲分段），9 歲以上或未填年齡則依身高分段；
 * 身高每超出 197 cm，每多 5 cm 加 0.5 cm。
 *
 * @param {number|string} age    年齡（歲）
 * @param {number|string} height 身高（公分）
 * @returns {number|null} 初始高度（公分），資料不足回傳 null
 */
export const calculateDefaultHeight = (age, height) => {
    const ageStr = age === null || age === undefined ? '' : String(age).trim();
    const ageProvided = ageStr !== '' && !isNaN(Number(ageStr)) && Number(ageStr) >= 0;
    const ageNum = ageProvided ? Number(ageStr) : null;

    if (ageProvided) {
        if (ageNum <= 2) return 3;
        if (ageNum <= 4) return 4;
        if (ageNum <= 6) return 5;
        if (ageNum <= 8) return 6;
        // 9 歲以上：續查身高表
    }

    const heightNum = Number(height);
    if (isNaN(heightNum) || heightNum <= 0) return null;

    if (heightNum <= 152) return 6;
    if (heightNum <= 157) return 6.5;
    if (heightNum <= 162) return 7;
    if (heightNum <= 167) return 7.5;
    if (heightNum <= 172) return 8;
    if (heightNum <= 177) return 8.5;
    if (heightNum <= 182) return 9;
    if (heightNum <= 187) return 9.5;
    if (heightNum <= 192) return 10;
    if (heightNum <= 197) return 10.5;

    // 197 cm 以上：每 5 cm 多 0.5 cm，從 193 cm = 10.5 cm 起算
    return 10.5 + Math.floor((heightNum - 193) / 5) * 0.5;
};

/**
 * 取得「初始高度」的判斷依據文字（依何條規則命中）
 *
 * @param {number|string} age
 * @param {number|string} height
 * @returns {string}
 */
export const getDefaultHeightBasis = (age, height) => {
    const ageStr = age === null || age === undefined ? '' : String(age).trim();
    const ageProvided = ageStr !== '' && !isNaN(Number(ageStr)) && Number(ageStr) >= 0;
    const ageNum = ageProvided ? Number(ageStr) : null;

    if (ageProvided) {
        if (ageNum <= 2) return '依年齡：嬰兒 0-2 歲 → 3 cm（使用低側）';
        if (ageNum <= 4) return '依年齡：嬰兒 3-4 歲 → 4 cm（使用高側）';
        if (ageNum <= 6) return '依年齡：兒童 5-6 歲 → 5 cm（使用低側）';
        if (ageNum <= 8) return '依年齡：兒童 7-8 歲 → 6 cm（使用高側）';
    }

    const heightNum = Number(height);
    if (isNaN(heightNum) || heightNum <= 0) return '請輸入年齡及身高';

    if (heightNum <= 152) return '依身高：152 cm 以下 → 6 cm';
    if (heightNum <= 157) return '依身高：153 - 157 cm → 6.5 cm';
    if (heightNum <= 162) return '依身高：158 - 162 cm → 7 cm';
    if (heightNum <= 167) return '依身高：163 - 167 cm → 7.5 cm';
    if (heightNum <= 172) return '依身高：168 - 172 cm → 8 cm';
    if (heightNum <= 177) return '依身高：173 - 177 cm → 8.5 cm';
    if (heightNum <= 182) return '依身高：178 - 182 cm → 9 cm';
    if (heightNum <= 187) return '依身高：183 - 187 cm → 9.5 cm';
    if (heightNum <= 192) return '依身高：188 - 192 cm → 10 cm';
    if (heightNum <= 197) return '依身高：193 - 197 cm → 10.5 cm';
    return `依身高：${heightNum} cm（197 cm 以上每 5 cm 多 0.5 cm 推算）`;
};

/* ----------------------------- 標準體重 ----------------------------- */

/**
 * 計算標準體重
 *  - 男性：(身高 - 80) × 70%
 *  - 女性：(身高 - 70) × 60%
 *
 * @param {number|string} height 身高（公分）
 * @param {string} gender 性別 '男' / '女'
 * @returns {number|null}
 */
export const calculateStandardWeight = (height, gender) => {
    const heightNum = Number(height);
    if (isNaN(heightNum) || heightNum <= 0) return null;

    if (gender === '男') return (heightNum - 80) * 0.7;
    if (gender === '女') return (heightNum - 70) * 0.6;
    return null;
};

/* ----------------------------- 體重偏差 ----------------------------- */

/**
 * 計算體重偏差 = 實際體重 - 標準體重
 *
 * @param {number|string} weight
 * @param {number|null} standardWeight
 * @returns {number|null}
 */
export const calculateWeightDeviation = (weight, standardWeight) => {
    const weightNum = Number(weight);
    if (isNaN(weightNum) || weightNum <= 0) return null;
    if (standardWeight === null || standardWeight === undefined) return null;
    return weightNum - standardWeight;
};

/* ------------------------- 體重偏差調整 (cm) ------------------------- */

/**
 * 依「體重偏離調整表」計算體重偏差調整 (cm)
 *
 *   正負 4 kg 以內    →  0
 *   超出 5-9 kg       → +0.5
 *   超出 10-14 kg     → +1.0
 *   超出 15-18 kg     → +1.5
 *   超出 19-22 kg     → +2.0
 *   超出 23 kg 以上   → +2.5
 *   低於 5 kg 以下    → -0.5
 *
 * @param {number|null} weightDeviation
 * @returns {number} 高度調整 (cm)
 */
export const calculateHeightAdjustment = (weightDeviation) => {
    if (weightDeviation === null || weightDeviation === undefined) return 0;

    if (weightDeviation <= -5) return -0.5;
    if (weightDeviation < 5)   return 0;       // -4 ~ +4 視為不變
    if (weightDeviation <= 9)  return 0.5;
    if (weightDeviation <= 14) return 1.0;
    if (weightDeviation <= 18) return 1.5;
    if (weightDeviation <= 22) return 2.0;
    return 2.5;
};

/**
 * 取得「體重偏差調整」的判斷依據文字
 *
 * @param {number|null} weightDeviation
 * @returns {string}
 */
export const getHeightAdjustmentBasis = (weightDeviation) => {
    if (weightDeviation === null || weightDeviation === undefined) return '請輸入體重';
    if (weightDeviation <= -5) return '低於標準 5 kg 以下 → -0.5 cm';
    if (weightDeviation < 5)   return '正負 4 kg 以內 → 不變';
    if (weightDeviation <= 9)  return '超出 5 - 9 kg → +0.5 cm';
    if (weightDeviation <= 14) return '超出 10 - 14 kg → +1.0 cm';
    if (weightDeviation <= 18) return '超出 15 - 18 kg → +1.5 cm';
    if (weightDeviation <= 22) return '超出 19 - 22 kg → +2.0 cm';
    return '超出 23 kg 以上 → +2.5 cm';
};

/* --------------------------- 最終基準高度 --------------------------- */

/**
 * 計算最終基準高度 = 初始高度 + 體重偏差調整
 *
 * @param {number|string} age
 * @param {number|string} height
 * @param {string} gender
 * @param {number|string} weight
 * @returns {{
 *   baseHeight: number|null,        // 初始高度
 *   standardWeight: number|null,    // 標準體重
 *   weightDeviation: number|null,   // 體重偏差
 *   heightAdjustment: number,       // 體重偏差調整 (cm)
 *   finalHeight: number|null        // 最終基準高度
 * }}
 */
export const calculateAdjustedDefaultHeight = (age, height, gender, weight) => {
    const baseHeight = calculateDefaultHeight(age, height);
    const standardWeight = calculateStandardWeight(height, gender);
    const weightDeviation = calculateWeightDeviation(weight, standardWeight);
    const heightAdjustment = calculateHeightAdjustment(weightDeviation);

    return {
        baseHeight,
        standardWeight,
        weightDeviation,
        heightAdjustment,
        finalHeight: baseHeight === null ? null : baseHeight + heightAdjustment,
    };
};
