/**
 * 太醫床枕｜頸椎分析統一計算工具
 *
 * 統一管理以下四大計算：
 *   1. 最終基準高度（初始高度 + 體重偏差調整）
 *   2. 弧度醫學枕型號（依點2-4距離推薦 B / A / AA 型枕）
 *   3. 墊片加高（依點3-7距離決定半張 / 二個半張墊片）
 *   4. 5-8點標準長度（依身高等比例計算）+ 5-8點加高調整
 *
 * 並提供「型號命名」組合：高度_墊片狀態_弧度類型。
 *
 * 名詞對照（依產品規範）：
 *  - 標準體重 (standardWeight)         ：依性別、身高計算的理想體重
 *  - 體重偏差 (weightDeviation)        ：實際體重 - 標準體重
 *  - 體重偏差調整 (heightAdjustment)    ：依「體重偏離調整表」換算的高度修正值 (cm)
 *  - 初始高度 (baseHeight)              ：依「初始高度對照表」(年齡 / 身高) 查得的高度 (cm)
 *  - 最終基準高度 (finalHeight)         ：初始高度 + 體重偏差調整
 */

import { convertPxToCm } from './scaleConversion';

/* ============================================================
 *  區塊一｜最終基準高度
 * ============================================================ */

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

    if (heightNum <= 152) return '依成人身高：152 cm 以下 範圍 → 6 cm';
    if (heightNum <= 157) return '依成人身高：153 - 157 cm 範圍 → 6.5 cm';
    if (heightNum <= 162) return '依成人身高：158 - 162 cm 範圍 → 7 cm';
    if (heightNum <= 167) return '依成人身高：163 - 167 cm 範圍 → 7.5 cm';
    if (heightNum <= 172) return '依成人身高：168 - 172 cm 範圍 → 8 cm';
    if (heightNum <= 177) return '依成人身高：173 - 177 cm 範圍 → 8.5 cm';
    if (heightNum <= 182) return '依成人身高：178 - 182 cm 範圍 → 9 cm';
    if (heightNum <= 187) return '依成人身高：183 - 187 cm 範圍 → 9.5 cm';
    if (heightNum <= 192) return '依成人身高：188 - 192 cm 範圍 → 10 cm';
    if (heightNum <= 197) return '依成人身高：193 - 197 cm 範圍 → 10.5 cm';
    return `依成人身高：${heightNum} cm（197 cm 以上每 5 cm 多 0.5 cm 推算）`;
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

/* ============================================================
 *  區塊二｜弧度醫學枕型號（點2-4 距離）
 * ============================================================ */

/**
 * 計算兩點之間的距離（像素）
 */
export const calculateDistance = (point1, point2) => {
    if (!point1 || !point2) return null;
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    return Math.sqrt(dx * dx + dy * dy);
};

/**
 * 根據距離推薦枕頭型號（弧度醫學枕）
 * @param {number} distanceCm - 距離（公分）
 * @returns {string} 推薦型號
 *
 * 規則：
 * - 8.4 cm 以下 → B 型枕
 * - 8.5 - 10 cm → A 型枕
 * - 10.1 cm 以上 → AA 型枕
 */
export const recommendPillowType = (distanceCm) => {
    if (distanceCm === null || distanceCm === undefined) return '';

    if (distanceCm <= 8.4) {
        return 'B 型枕';
    } else if (distanceCm >= 8.5 && distanceCm <= 10.0) {
        return 'A 型枕';
    } else if (distanceCm >= 10.1) {
        return 'AA 型枕';
    }

    return '';
};

/**
 * 從分析結果中提取點2到點4的距離和推薦型號
 * @param {Array} analysisResults - 分析結果陣列
 * @returns {Object|null} { distance: number (cm), recommendation: string, pixelDistance: number }
 */
export const extractSpineRecommendation = (analysisResults) => {
    if (!analysisResults || analysisResults.length === 0) {
        return null;
    }

    // 找到最新的頸椎分析結果
    const spineAnalysis = analysisResults
        .filter(result => result.analysisType === 'spine')
        .sort((a, b) => {
            // 按日期排序，最新的在前
            const dateA = new Date(a.analysisData?.timestamp || a.createdAt || 0);
            const dateB = new Date(b.analysisData?.timestamp || b.createdAt || 0);
            return dateB - dateA;
        })[0];

    if (!spineAnalysis || !spineAnalysis.points || spineAnalysis.points.length < 4) {
        return null;
    }

    // 點2 (索引1) 和 點4 (索引3)
    const point2 = spineAnalysis.points[1];
    const point4 = spineAnalysis.points[3];

    if (!point2 || !point4) {
        return null;
    }

    // 計算像素距離
    const pixelDistance = calculateDistance(point2, point4);

    if (pixelDistance === null) {
        return null;
    }

    // 從分析數據中獲取比例尺係數
    const scaleFactor = spineAnalysis.analysisData?.scale || 1.0;

    // 轉換為公分（使用與 AnalysisSpine.jsx 相同的轉換方法）
    const distanceCm = convertPxToCm(pixelDistance, scaleFactor);

    if (distanceCm === null || distanceCm === undefined) {
        return null;
    }

    // 推薦型號
    const recommendation = recommendPillowType(distanceCm);

    return {
        distance: distanceCm,
        recommendation: recommendation,
        pixelDistance: pixelDistance,
        scaleFactor: scaleFactor
    };
};

/**
 * 從分析結果中提取點3-7距離（頸椎凹點至後腦勺）與點5-8距離（頸椎凹點至背部凸點）
 * 計算方式與 AnalysisSpine.jsx 的 calculateAllDistancesAndAngles 相同
 *
 * @param {Array} analysisResults - 分析結果陣列
 * @returns {Object|null} { dist37: number|null (cm), dist58: number|null (cm), scaleFactor: number }
 */
export const extractSpinePointDistances = (analysisResults) => {
    if (!analysisResults || analysisResults.length === 0) return null;

    // 取最新的頸椎分析結果
    const spineAnalysis = analysisResults
        .filter(result => result.analysisType === 'spine')
        .sort((a, b) => {
            const dateA = new Date(a.analysisData?.timestamp || a.createdAt || 0);
            const dateB = new Date(b.analysisData?.timestamp || b.createdAt || 0);
            return dateB - dateA;
        })[0];

    if (!spineAnalysis || !spineAnalysis.points || spineAnalysis.points.length < 5) {
        return null;
    }

    const scaleFactor = spineAnalysis.analysisData?.scale || 1.0;
    const point1 = spineAnalysis.points[0]; // 點1
    const point3 = spineAnalysis.points[2]; // 點3
    const point4 = spineAnalysis.points[3]; // 點4
    const point5 = spineAnalysis.points[4]; // 點5

    if (!point1 || !point3 || !point4 || !point5) return null;

    // 計算點7：水平線3（y = point3.y）與線段 點1—點4 的交點（水平距離）
    let dist37Cm = null;
    const dy14 = point4.y - point1.y;
    if (dy14 !== 0) {
        const t7 = (point3.y - point1.y) / dy14;
        if (t7 >= 0 && t7 <= 1) {
            const intersection7 = {
                x: point1.x + t7 * (point4.x - point1.x),
                y: point3.y,
            };
            const dist37Px = calculateDistance(point3, intersection7);
            dist37Cm = convertPxToCm(dist37Px, scaleFactor);
        }
    }

    // 計算點8：垂直線5（x = point5.x）與水平線3（y = point3.y）的交點（垂直距離）
    const intersection8 = { x: point5.x, y: point3.y };
    const dist58Px = calculateDistance(point5, intersection8);
    const dist58Cm = convertPxToCm(dist58Px, scaleFactor);

    return {
        dist37: dist37Cm,
        dist58: dist58Cm,
        scaleFactor,
    };
};

/* ============================================================
 *  區塊三｜墊片加高（點3-7 距離）
 * ============================================================ */

/**
 * 根據點3-7距離與體重調整值，計算墊片調整建議
 *
 * @param {number|null} dist37Cm - 點3-7距離（公分）
 * @param {number} heightAdjustment - 體重高度調整值（公分，0.5 表示因體重已加整張墊片）
 * @returns {{ shimText: string, modelSuffix: string, hasWeightSheet: boolean } | null}
 */
export const computeShimAdjustment = (dist37Cm, heightAdjustment) => {
    if (dist37Cm === null || dist37Cm === undefined) return null;

    const hasWeightSheet = heightAdjustment === 0.5; // 因體重已加 0.5cm（整張）

    if (dist37Cm >= 1.6 && dist37Cm <= 2.1) {
        const shimText = hasWeightSheet
            ? '改為「半張墊片」（取代原體重整張墊片）'
            : '增加「半張墊片」';
        return { shimText, modelSuffix: '.5', hasWeightSheet };
    }

    if (dist37Cm >= 2.2) {
        const shimText = hasWeightSheet
            ? '改為「二個半張墊片」（取代原體重整張墊片）'
            : '增加「二個半張墊片」';
        return { shimText, modelSuffix: '.2', hasWeightSheet };
    }

    return { shimText: '無需墊片調整', modelSuffix: '', hasWeightSheet };
};

/* ============================================================
 *  區塊四｜標準長度與 5-8 點加高（點5-8 距離）
 * ============================================================ */

/**
 * 根據身高計算5-8點的標準長度
 *
 * 基準：身高 166 cm 時，5-8點標準長度為 10 cm
 * 公式：標準長度 = 10 * {1 + [(身高 - 166) / 166]}
 *
 * 範例：
 * - 身高 160 cm: 10 * {1 - [(166-160)/166]} = 10 * 0.964 = 9.64 cm
 * - 身高 166 cm: 10 * {1 + 0} = 10 cm
 * - 身高 180 cm: 10 * {1 + [(180-166)/166]} = 10 * 1.084 = 10.84 cm
 *
 * @param {number|string|null} height - 身高（公分）
 * @returns {number|null} 標準長度（公分），如果身高無效則返回 null
 */
export const calculateStandardLength58 = (height) => {
    const heightNum = parseFloat(height);
    if (!heightNum || heightNum <= 0) return null;

    const baseHeight = 166; // 基準身高
    const baseLength = 10;  // 基準標準長度

    // 標準長度 = 10 * {1 + [(身高 - 166) / 166]}
    const standardLength = baseLength * (1 + (heightNum - baseHeight) / baseHeight);

    return standardLength;
};

/**
 * 根據點5-8距離、身高計算額外加高值
 *
 * 計算邏輯：
 * 1. 根據身高計算標準長度（使用 calculateStandardLength58）
 * 2. 計算實際測量值與標準長度的差距
 * 3. 如果差距超過 0.5 cm，每超過 0.5 cm 增加 0.5 cm 高度
 *
 * 範例A（身高 160 cm）：
 * - 標準長度：9.64 cm
 * - 實際測量：10.25 cm
 * - 差距：0.61 cm > 0.5 cm
 * - 調整：floor(0.61 / 0.5) * 0.5 = 1 * 0.5 = 0.5 cm
 *
 * 範例B（身高 180 cm）：
 * - 標準長度：10.84 cm
 * - 實際測量：12 cm
 * - 差距：1.16 cm > 0.5 cm
 * - 調整：floor(1.16 / 0.5) * 0.5 = 2 * 0.5 = 1.0 cm
 *
 * @param {number|null} dist58Cm - 點5-8距離（公分）
 * @param {number|string|null} height - 身高（公分）
 * @returns {number | null} 額外加高（公分），0 表示不需要加高
 */
export const computeExtra58Height = (dist58Cm, height) => {
    if (dist58Cm === null || dist58Cm === undefined) return null;

    // 根據身高計算標準長度
    const standardLength = calculateStandardLength58(height);
    if (standardLength === null) return null;

    // 計算差距
    const excess = dist58Cm - standardLength;
    if (excess <= 0) return 0;

    // 每超過 0.5 cm，高度額外增加 0.5 cm
    return Math.floor(excess / 0.5) * 0.5;
};

/* ============================================================
 *  區塊五｜型號命名組合
 *
 *  將「最終基準高度」、「墊片狀態」、「弧度類型」組合為型號名稱，
 *  例如：「八公分_半張墊片_AA型」。
 * ============================================================ */

const CN_DIGITS = {
    '0': '零', '1': '一', '2': '二', '3': '三', '4': '四',
    '5': '五', '6': '六', '7': '七', '8': '八', '9': '九',
};

/**
 * 將數字高度轉換為中文（例：6.5 → 六點五公分）
 * @param {number|null} h
 * @returns {string|null}
 */
export const heightToChinese = (h) => {
    if (h === null || h === undefined) return null;
    return String(h).split('').map(c => c === '.' ? '點' : (CN_DIGITS[c] || c)).join('') + '公分';
};

/**
 * 由墊片建議推導「墊片狀態」標籤
 * @param {{ modelSuffix: string }|null} shimAdj
 * @returns {string|null}
 */
export const extractShimLabel = (shimAdj) => {
    if (!shimAdj) return null;
    if (!shimAdj.modelSuffix) return '無墊片';
    if (shimAdj.modelSuffix === '.5') return '半張墊片';
    if (shimAdj.modelSuffix === '.2') return '二個半張墊片';
    return null;
};

/**
 * 由推薦枕頭型號推導「弧度類型」標籤（例：'AA 型枕' → 'AA型'）
 * @param {string} recommendation
 * @returns {string|null}
 */
export const extractArcLabel = (recommendation) => {
    if (!recommendation) return null;
    return recommendation.replace(/\s+/g, '').replace('枕', '');
};

/**
 * 組合型號名稱：「高度_墊片狀態_弧度類型」
 *
 * @param {Object} params
 * @param {number|null} params.finalHeight       - 最終基準高度（公分）
 * @param {{ modelSuffix: string }|null} params.shimAdj - 墊片調整建議
 * @param {string} params.pillowRecommendation   - 弧度醫學枕型號（例：'AA 型枕'）
 * @returns {{ heightLabel:string|null, shimLabel:string|null, arcLabel:string|null, modelName:string|null }}
 */
export const composeModelName = ({ finalHeight, shimAdj, pillowRecommendation }) => {
    const heightLabel = heightToChinese(finalHeight);
    const shimLabel   = extractShimLabel(shimAdj);
    const arcLabel    = extractArcLabel(pillowRecommendation);

    const allReady = heightLabel && shimLabel && arcLabel;
    const modelName = allReady ? `${heightLabel}_${shimLabel}_${arcLabel}` : null;

    return { heightLabel, shimLabel, arcLabel, modelName };
};
