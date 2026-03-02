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
