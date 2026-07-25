/**
 * 螢幕物理尺寸轉換工具
 * 用於在空白畫面模式下，根據螢幕實際 DPI 將像素轉換為公分
 * 讓使用者用真實尺子在螢幕上測量的距離與系統計算結果一致
 */

/**
 * 根據螢幕 DPI 將像素距離轉換為真實的公分距離
 * @param {number} pxDistance - 像素距離
 * @returns {number} 公分距離
 */
export const convertScreenPxToCm = (pxDistance) => {
    const CM_PER_INCH = 2.54;  // 1 英寸 = 2.54 公分
    const STANDARD_DPI = 96;    // Windows 標準 DPI
    const pixelRatio = window.devicePixelRatio || 1;  // 獲取設備像素比
    const effectiveDPI = STANDARD_DPI * pixelRatio;   // 計算實際有效 DPI
    
    // 公式：公分 = (像素 / 有效DPI) × 每英寸公分數
    const cmDistance = (pxDistance / effectiveDPI) * CM_PER_INCH;
    
    return cmDistance;
};

/**
 * 格式化距離顯示文字
 * 在空白畫面模式下使用螢幕實際 DPI 轉換，否則使用比例尺邏輯
 * @param {number} pxDistance - 像素距離
 * @param {boolean} useScreenConversion - 是否使用螢幕轉換（空白畫面模式）
 * @param {function} fallbackFormatter - 非空白畫面模式時使用的格式化函數
 * @returns {string} 格式化後的距離文字，例如："123.45 px (3.25 cm)"
 */
export const formatDistanceWithMode = (pxDistance, useScreenConversion, fallbackFormatter) => {
    if (useScreenConversion) {
        // 空白畫面模式：使用螢幕實際 DPI 轉換
        const cmDistance = convertScreenPxToCm(pxDistance);
        return `${pxDistance.toFixed(2)} px (${cmDistance.toFixed(2)} cm)`;
    } else {
        // 正常模式：使用比例尺邏輯
        return fallbackFormatter(pxDistance);
    }
};
