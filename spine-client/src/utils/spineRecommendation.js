/**
 * 頸椎分析推薦工具
 * 
 * 計算枕骨(點2)至第七頸椎(點4)的距離，並根據距離推薦枕頭型號
 */

import { convertPxToCm } from './scaleConversion';

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
 * 根據距離推薦枕頭型號
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

/**
 * 根據點5-8距離與標準長度，計算額外加高值
 *
 * @param {number|null} dist58Cm - 點5-8距離（公分）
 * @param {number} standardLength - 5-8點標準長度（公分），預設 25 cm
 * @returns {number | null} 額外加高（公分），0 表示不需要加高
 */
export const computeExtra58Height = (dist58Cm, standardLength = 25) => {
    if (dist58Cm === null || dist58Cm === undefined) return null;
    const excess = dist58Cm - standardLength;
    if (excess <= 0) return 0;
    // 每超過 0.5 cm，高度額外增加 0.5 cm
    return Math.floor(excess / 0.5) * 0.5;
};
