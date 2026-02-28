/**
 * 幾何計算工具函數
 * 共用於頸椎 / 尾椎分析頁面
 */

/**
 * 計算兩點之間的歐氏距離
 * @param {Object} p1 - {x, y}
 * @param {Object} p2 - {x, y}
 * @returns {number} 距離（像素）
 */
export const calculateDistance = (p1, p2) => {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
};

/**
 * 計算三點之間的角度（以 vertex 為頂點）
 * @param {Object} pointA - 端點 A
 * @param {Object} vertex  - 頂點
 * @param {Object} pointC - 端點 C
 * @returns {number} 角度（度）
 */
export const calculateAngle = (pointA, vertex, pointC) => {
    const vectorAV = { x: pointA.x - vertex.x, y: pointA.y - vertex.y };
    const vectorCV = { x: pointC.x - vertex.x, y: pointC.y - vertex.y };

    const dotProduct = vectorAV.x * vectorCV.x + vectorAV.y * vectorCV.y;
    const magnitudeAV = Math.sqrt(vectorAV.x * vectorAV.x + vectorAV.y * vectorAV.y);
    const magnitudeCV = Math.sqrt(vectorCV.x * vectorCV.x + vectorCV.y * vectorCV.y);

    if (magnitudeAV === 0 || magnitudeCV === 0) return 0;

    const cosAngle = Math.max(-1, Math.min(1, dotProduct / (magnitudeAV * magnitudeCV)));
    return Math.acos(cosAngle) * 180 / Math.PI;
};
