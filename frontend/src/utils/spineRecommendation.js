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

/* ---------------------- 計算公式呈現（最終基準高度） ---------------------- */
/*
 * 以下 describe* 函式皆回傳 { value, formula, process }，
 * 供畫面「完整呈現計算公式」使用：
 *   value   ：計算結果
 *   formula ：通用公式（文字）
 *   process ：代入實際數值的計算過程（資料不足時為 null）
 */

/** 標準體重：男性 (身高-80)×70%；女性 (身高-70)×60% */
export const describeStandardWeight = (height, gender) => {
    const formula = '男性：(身高 - 80) × 70%；女性：(身高 - 70) × 60%';
    const value = calculateStandardWeight(height, gender);
    if (value === null) return { value, formula, process: null };

    const h = Number(height);
    const process = gender === '男'
        ? `(${h} - 80) × 70% = ${h - 80} × 0.7 = ${value.toFixed(1)} kg`
        : `(${h} - 70) × 60% = ${h - 70} × 0.6 = ${value.toFixed(1)} kg`;
    return { value, formula, process };
};

/** 體重偏差 = 實際體重 - 標準體重 */
export const describeWeightDeviation = (weight, standardWeight) => {
    const formula = '體重偏差 = 實際體重 - 標準體重';
    const value = calculateWeightDeviation(weight, standardWeight);
    if (value === null) return { value, formula, process: null };

    const sign = value > 0 ? '+' : '';
    const process = `${weight} - ${standardWeight.toFixed(1)} = ${sign}${value.toFixed(1)} kg`;
    return { value, formula, process };
};

/** 體重偏差高度調整：參考「體重偏離調整表」 */
export const describeHeightAdjustment = (weightDeviation) => ({
    value: calculateHeightAdjustment(weightDeviation),
    formula: '參考「體重偏離調整表」',
    process: weightDeviation === null ? null : getHeightAdjustmentBasis(weightDeviation),
});

/** 初始高度：參考「初始高度對照表」（依年齡 / 身高判斷） */
export const describeInitialHeight = (age, height) => ({
    value: calculateDefaultHeight(age, height),
    formula: '參考「初始高度對照表」（依年齡 / 身高判斷）',
    process: getDefaultHeightBasis(age, height),
});

/** 最終基準高度 = 初始高度 + 體重偏差高度調整 */
export const describeFinalHeight = (baseHeight, heightAdjustment) => {
    const formula = '最終基準高度 = 初始高度 + 體重偏差高度調整';
    if (baseHeight === null || baseHeight === undefined) {
        return { value: null, formula, process: null };
    }
    const value = baseHeight + heightAdjustment;
    const sign = heightAdjustment > 0 ? '+' : '';
    const process = `${baseHeight} + (${sign}${heightAdjustment}) = ${value} cm`;
    return { value, formula, process };
};

/**
 * 8 歲以下分高低處墊片（純文字提示，依「初始高度對照表」高低側）
 * @returns {string|null} 無對應時回傳 null
 */
export const getUnderEightShimNote = (age) => {
    const a = Number(age);
    if (age === '' || age === null || age === undefined || isNaN(a) || a < 0 || a > 8) return null;
    if (a <= 2) return '0-2 歲：墊片使用低側';
    if (a <= 4) return '3-4 歲：墊片使用高側';
    if (a <= 6) return '5-6 歲：墊片使用低側';
    return '7-8 歲：墊片使用高側';
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

/** 對應枕型的判斷依據文字（依「頸椎長度與型號表」） */
export const getPillowTypeBasis = (distanceCm) => {
    if (distanceCm === null || distanceCm === undefined) return '需要頸椎分析結果';
    if (distanceCm <= 8.4) return '≤ 8.4 cm → B 型枕';
    if (distanceCm <= 10.0) return '8.5 - 10 cm → A 型枕';
    return '≥ 10.1 cm → AA 型枕';
};

/** 對應枕型：依點2-4距離，參考「頸椎長度與型號表」 */
export const describePillowType = (distanceCm) => ({
    value: recommendPillowType(distanceCm),
    formula: '參考「頸椎長度與型號表」（依點2-4距離判斷）',
    process: getPillowTypeBasis(distanceCm),
});

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
 *  區塊三｜頸凹點至後腦勺增加墊片（點3-7 距離）
 * ============================================================ */

/** 判斷「最終基準高度」是否為 .5 結尾（如 6.5、7.5） */
export const isHalfHeight = (finalHeight) =>
    finalHeight !== null && finalHeight !== undefined &&
    Math.abs((finalHeight % 1) - 0.5) < 1e-9;

/**
 * 依「頸凹點至後腦勺增加墊片」表計算墊片配置
 *
 * 規則（依 [3-7點距離] 與 [最終基準高度是否為 .5]）：
 *   3-7 ≤ 1.5 cm  ：最終基準高度非 .5 → 0 墊片（命名 .0）
 *                    最終基準高度為 .5 → 0.5 張墊片（命名 .5）
 *   3-7 1.6-2.1 cm：0.5 張墊片（命名 .5）
 *   3-7 ≥ 2.2 cm  ：2.5 張墊片（命名 .2）
 *
 * @param {number|null} dist37Cm   - 點3-7距離（公分）
 * @param {number|null} finalHeight - 最終基準高度（公分）
 * @returns {{ shimText: string, modelSuffix: string, sheets: number } | null}
 */
export const computeShimAdjustment = (dist37Cm, finalHeight) => {
    if (dist37Cm === null || dist37Cm === undefined) return null;

    if (dist37Cm <= 1.5) {
        return isHalfHeight(finalHeight)
            ? { shimText: '0.5 張墊片', modelSuffix: '.5', sheets: 0.5 }
            : { shimText: '0 墊片', modelSuffix: '.0', sheets: 0 };
    }
    if (dist37Cm <= 2.1) {
        return { shimText: '0.5 張墊片', modelSuffix: '.5', sheets: 0.5 };
    }
    return { shimText: '2.5 張墊片', modelSuffix: '.2', sheets: 2.5 };
};

/** 墊片配置的判斷依據文字 */
export const getShimBasis = (dist37Cm, finalHeight) => {
    if (dist37Cm === null || dist37Cm === undefined) return '需要頸椎分析結果';
    if (dist37Cm <= 1.5) {
        return isHalfHeight(finalHeight)
            ? '≤ 1.5 cm（最終基準高度為 .5）→ 0.5 張墊片（命名 .5）'
            : '≤ 1.5 cm（最終基準高度非 .5）→ 0 墊片（命名 .0）';
    }
    if (dist37Cm <= 2.1) return '1.6 - 2.1 cm → 0.5 張墊片（命名 .5）';
    return '≥ 2.2 cm → 2.5 張墊片（命名 .2）';
};

/** 墊片配置：依點3-7距離與最終基準高度，參考墊片對照表 */
export const describeShimAdjustment = (dist37Cm, finalHeight) => {
    const shimAdj = computeShimAdjustment(dist37Cm, finalHeight);
    return {
        value: shimAdj ? shimAdj.shimText : null,
        modelSuffix: shimAdj ? shimAdj.modelSuffix : null,
        formula: '參考「頸凹點至後腦勺增加墊片」表（依點3-7距離與最終基準高度是否為 .5）',
        process: getShimBasis(dist37Cm, finalHeight),
    };
};

/* ============================================================
 *  區塊四｜頸凹點至背凸點級距（點5-8 距離）
 * ============================================================ */

/** 5-8 點標準長度：固定 10 cm */
export const STANDARD_LENGTH_58 = 10;

/**
 * 標準長比差 = 標準長度 × { 1 - ( |身高 - 166| / 166 ) }
 *
 * @param {number|string|null} height - 身高（公分）
 * @returns {number|null} 標準長比差（公分），身高無效則回傳 null
 */
export const calculateStandardLengthRatio = (height) => {
    const h = parseFloat(height);
    if (!h || h <= 0) return null;
    return STANDARD_LENGTH_58 * (1 - Math.abs(h - 166) / 166);
};

/**
 * .5 級距 = { [ (患者[5-8點距離] - 標準長比差) / 0.5 ] 無條件捨去 } × 0.5
 *
 * 結果為 0.5, 1, 1.5, 2 …（純文字顯示，不影響墊片與命名）。
 *
 * @param {number|null} dist58Cm - 點5-8距離（公分）
 * @param {number|string|null} height - 身高（公分）
 * @returns {number|null} .5 級距（公分），資料不足則回傳 null
 */
export const calculateLevel58 = (dist58Cm, height) => {
    if (dist58Cm === null || dist58Cm === undefined) return null;
    const ratio = calculateStandardLengthRatio(height);
    if (ratio === null) return null;
    const level = Math.floor((dist58Cm - ratio) / 0.5) * 0.5;
    return level < 0 ? 0 : level;
};

/** 標準長比差：標準長度 × {1 - (|身高 - 166| / 166)} */
export const describeStandardLengthRatio = (height) => {
    const value = calculateStandardLengthRatio(height);
    const formula = '標準長比差 = 標準長度 × { 1 - ( |身高 - 166| / 166 ) }';
    if (value === null) return { value, formula, process: null };
    const h = parseFloat(height);
    const diff = Math.abs(h - 166);
    const process =
        `${STANDARD_LENGTH_58} × { 1 - ( |${h} - 166| / 166 ) } = ` +
        `${STANDARD_LENGTH_58} × ( 1 - ${(diff / 166).toFixed(4)} ) = ${value.toFixed(2)} cm`;
    return { value, formula, process };
};

/** .5 級距：⌊(5-8距離 - 標準長比差) / 0.5⌋ × 0.5 */
export const describeLevel58 = (dist58Cm, height) => {
    const value = calculateLevel58(dist58Cm, height);
    const formula = '.5 級距 = { [ (5-8點距離 - 標準長比差) / 0.5 ] 無條件捨去 } × 0.5';
    if (value === null) return { value, formula, process: null };
    const ratio = calculateStandardLengthRatio(height);
    const steps = Math.floor((dist58Cm - ratio) / 0.5);
    const process =
        `{ [ (${dist58Cm.toFixed(2)} - ${ratio.toFixed(2)}) / 0.5 ] 無條件捨去 } × 0.5 = ` +
        `${Math.max(0, steps)} × 0.5 = ${value} cm`;
    return { value, formula, process };
};

/* ============================================================
 *  區塊五｜型號命名建議
 *
 *  依文件命名格式：高度.墊片[+F]弧度型號
 *  例：8.5FAA、7.2B、9.0A、8.5FA
 * ============================================================ */

/** 高度參數：取「最終基準高度」的第一個數字（整數位） */
export const getHeightDigit = (finalHeight) => {
    if (finalHeight === null || finalHeight === undefined) return null;
    return Math.floor(finalHeight);
};

/** 墊片參數：由墊片建議的命名後綴取數字（.5 → '5'、.2 → '2'、.0 → '0'） */
export const getShimDigit = (shimAdj) => {
    if (!shimAdj || !shimAdj.modelSuffix) return null;
    return shimAdj.modelSuffix.replace('.', '');
};

/** F 參數：墊片為 .5 時加入 'F' */
export const getFParam = (shimAdj) => (getShimDigit(shimAdj) === '5' ? 'F' : '');

/** 弧度型號：由推薦枕頭型號取 A / B / AA（例：'AA 型枕' → 'AA'） */
export const getArcCode = (recommendation) => {
    if (!recommendation) return null;
    return recommendation.replace(/\s+/g, '').replace('型枕', '');
};

/**
 * 組合型號名稱：高度.墊片[+F]弧度型號（例：8.5FAA）
 *
 * @param {Object} params
 * @param {number|null} params.finalHeight       - 最終基準高度（公分）
 * @param {{ modelSuffix: string }|null} params.shimAdj - 墊片配置
 * @param {string} params.pillowRecommendation   - 弧度醫學枕型號（例：'AA 型枕'）
 * @returns {{ heightDigit:number|null, shimDigit:string|null, fParam:string, arcCode:string|null, modelName:string|null }}
 */
export const composeModelName = ({ finalHeight, shimAdj, pillowRecommendation }) => {
    const heightDigit = getHeightDigit(finalHeight);
    const shimDigit   = getShimDigit(shimAdj);
    const fParam      = getFParam(shimAdj);
    const arcCode     = getArcCode(pillowRecommendation);

    const allReady = heightDigit !== null && shimDigit !== null && arcCode;
    const modelName = allReady
        ? `${heightDigit}.${shimDigit}${fParam}${arcCode}`
        : null;

    return { heightDigit, shimDigit, fParam, arcCode, modelName };
};
