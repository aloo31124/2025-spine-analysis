const CM_PER_SEGMENT = 10;
const PIXELS_PER_SEGMENT = 40;
const CM_PER_PIXEL = CM_PER_SEGMENT / PIXELS_PER_SEGMENT;

const toNumberOrZero = (value) => (Number.isFinite(value) ? value : 0);

const roundToPrecision = (value, precision = 2) => {
    const safeValue = toNumberOrZero(value);
    const factor = 10 ** precision;
    return Math.round(safeValue * factor) / factor;
};

export const SCALE_REFERENCE = {
    cmPerSegment: CM_PER_SEGMENT,
    pxPerSegment: PIXELS_PER_SEGMENT,
    cmPerPx: CM_PER_PIXEL
};

/**
 * 將像素值轉換為公分
 * @param {number} pxValue - 像素值
 * @param {number} scaleFactor - 比例尺縮放因子（預設為 1.0）
 * @param {number} precision - 精度（小數位數）
 * @returns {number} 公分值
 */
export const convertPxToCm = (pxValue, scaleFactor = 1.0, precision = 2) => {
    const cmValue = toNumberOrZero(pxValue) * CM_PER_PIXEL * scaleFactor;
    return roundToPrecision(cmValue, precision);
};

/**
 * 格式化像素值並顯示對應的公分值
 * @param {number} pxValue - 像素值
 * @param {number} scaleFactor - 比例尺縮放因子（預設為 1.0）
 * @param {number} precision - 精度（小數位數）
 * @returns {string} 格式化的字串
 */
export const formatPxCmText = (pxValue, scaleFactor = 1.0, precision = 2) => {
    const pxText = roundToPrecision(pxValue, precision).toFixed(precision);
    const cmText = convertPxToCm(pxValue, scaleFactor, precision).toFixed(precision);
    return `${pxText} px (${cmText} cm)`;
};

/**
 * 建立長度摘要，包含像素和公分值
 * @param {number} pxValue - 像素值
 * @param {number} scaleFactor - 比例尺縮放因子（預設為 1.0）
 * @param {number} precision - 精度（小數位數）
 * @returns {object} 包含 px 和 cm 屬性的物件
 */
export const buildLengthSummary = (pxValue, scaleFactor = 1.0, precision = 2) => ({
    px: roundToPrecision(pxValue, precision),
    cm: convertPxToCm(pxValue, scaleFactor, precision)
});
