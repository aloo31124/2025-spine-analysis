/**
 * 點位約束工具函數
 * 用於處理頸椎分析中點位之間的聯動約束邏輯
 */

/**
 * 點位約束關係定義
 * 
 * 頸椎約束（點2和點6）：
 * - 點6在點2右邊並保持平行
 * - 上下移動時：點2和點6同步移動（保持Y座標相同）
 * - 左右移動時：點2和點6各自獨立移動
 * 
 * 腰椎約束（點2和點3）：
 * - 點3與點2保持垂直關係
 * - 左右移動時：點2和點3同步移動（保持X座標相同）
 * - 上下移動時：點2和點3各自獨立移動
 */

/**
 * 應用點位拖曳約束
 * @param {Array} points - 所有點位陣列
 * @param {number} draggedPointIndex - 被拖曳的點位索引
 * @param {number} newX - 新的X座標
 * @param {number} newY - 新的Y座標
 * @param {Object} previousPoint - 拖曳前的點位資訊（用於計算偏移量）
 * @returns {Array} 更新後的所有點位陣列
 */
export const applyPointConstraints = (points, draggedPointIndex, newX, newY, previousPoint) => {
    const updatedPoints = [...points];
    const deltaX = newX - previousPoint.x;
    const deltaY = newY - previousPoint.y;

    // 更新被拖曳的點位
    updatedPoints[draggedPointIndex] = {
        ...updatedPoints[draggedPointIndex],
        x: newX,
        y: newY
    };

    // 頸椎約束：點2（索引1）和點6（索引5）的關係
    if (draggedPointIndex === 1) {
        // 拖曳點2時，點6跟隨上下移動（Y軸同步）
        if (updatedPoints[5]) {
            updatedPoints[5] = {
                ...updatedPoints[5],
                y: newY  // 保持Y座標相同（平行）
            };
        }
    } else if (draggedPointIndex === 5) {
        // 拖曳點6時，點2跟隨上下移動（Y軸同步）
        if (updatedPoints[1]) {
            updatedPoints[1] = {
                ...updatedPoints[1],
                y: newY  // 保持Y座標相同（平行）
            };
        }
    }

    // 腰椎約束：點2（索引1）和點3（索引2）的關係
    if (draggedPointIndex === 1) {
        // 拖曳點2時，點3跟隨左右移動（X軸同步）
        if (updatedPoints[2]) {
            updatedPoints[2] = {
                ...updatedPoints[2],
                x: newX  // 保持X座標相同（垂直）
            };
        }
    } else if (draggedPointIndex === 2) {
        // 拖曳點3時，點2跟隨左右移動（X軸同步）
        if (updatedPoints[1]) {
            updatedPoints[1] = {
                ...updatedPoints[1],
                x: newX  // 保持X座標相同（垂直）
            };
        }
        // 當點3左右移動時，點6也要跟隨（因為點6要保持與點2平行，而點2的X改變了）
        // 但點6的X不改變，只是為了保持與點2的Y座標相同
        // （這裡不需要額外處理，因為點3移動時只影響點2的X，不影響Y）
    }

    return updatedPoints;
};

/**
 * 初始化點位位置（含第六點位）
 * @param {number} containerWidth - 容器寬度
 * @param {number} containerHeight - 容器高度
 * @returns {Array} 初始化的點位陣列
 */
export const initializePoints = (containerWidth, containerHeight) => {
    // 六個點的初始位置（相對於容器的比例位置）
    const initialPointPositions = [
        { x: 0.3, y: 0.1 },    // 點1：頂部
        { x: 0.35, y: 0.2 },   // 點2：左側
        { x: 0.35, y: 0.3 },   // 點3：與點2垂直（X座標相同）
        { x: 0.3, y: 0.41 },   // 點4：左下
        { x: 0.24, y: 0.52 },  // 點5：右下
        { x: 0.45, y: 0.2 }    // 點6：在點2右邊並平行（Y座標相同）
    ];

    return initialPointPositions.map((pos, index) => ({
        id: index,
        x: pos.x * containerWidth,
        y: pos.y * containerHeight,
        isDraggable: index === 0
    }));
};

/**
 * 從相對位置初始化點位（用於從拍照頁面接收數據）
 * @param {Array} relativePoints - 相對位置陣列（0-1之間）
 * @param {Object} imageSize - 原始圖片尺寸 {width, height}
 * @param {number} containerWidth - 容器寬度
 * @param {number} containerHeight - 容器高度
 * @returns {Array} 轉換後的點位陣列
 */
export const initializePointsFromRelative = (relativePoints, imageSize, containerWidth, containerHeight) => {
    // 如果沒有圖片尺寸信息，使用簡單的轉換（向後兼容）
    if (!imageSize || !imageSize.width || !imageSize.height) {
        return relativePoints.map((pos, index) => ({
            id: index,
            x: pos.x * containerWidth,
            y: pos.y * containerHeight,
            isDraggable: index === 0
        }));
    }

    // 計算圖片在容器中的實際顯示尺寸（考慮 object-fit: contain）
    const imageAspect = imageSize.width / imageSize.height;
    const containerAspect = containerWidth / containerHeight;
    
    let displayWidth, displayHeight, offsetX, offsetY;
    
    if (containerAspect > imageAspect) {
        // 容器更寬，圖片以高度為準
        displayHeight = containerHeight;
        displayWidth = displayHeight * imageAspect;
        offsetX = (containerWidth - displayWidth) / 2;
        offsetY = 0;
    } else {
        // 容器更高，圖片以寬度為準
        displayWidth = containerWidth;
        displayHeight = displayWidth / imageAspect;
        offsetX = 0;
        offsetY = (containerHeight - displayHeight) / 2;
    }

    // 將相對位置（0-1）轉換為容器內的絕對位置
    return relativePoints.map((pos, index) => ({
        id: index,
        x: pos.x * displayWidth + offsetX,
        y: pos.y * displayHeight + offsetY,
        isDraggable: index === 0
    }));
};

/**
 * 獲取點位名稱（用於顯示）
 * @param {number} index - 點位索引
 * @returns {string} 點位名稱
 */
export const getPointName = (index) => {
    const pointNames = [
        '頂部點',      // 點1
        '頸椎基準點',  // 點2
        '腰椎點',      // 點3
        '左下點',      // 點4
        '右下點',      // 點5
        '頸椎參考點'   // 點6
    ];
    return pointNames[index] || `點${index + 1}`;
};

/**
 * 驗證點位約束是否正確應用
 * @param {Array} points - 點位陣列
 * @returns {Object} 驗證結果 {isValid, errors}
 */
export const validatePointConstraints = (points) => {
    const errors = [];
    
    // 驗證點2和點6的Y座標是否相同（平行約束）
    if (points[1] && points[5]) {
        if (Math.abs(points[1].y - points[5].y) > 0.1) {
            errors.push('點2和點6未保持平行（Y座標不同）');
        }
    }
    
    // 驗證點2和點3的X座標是否相同（垂直約束）
    if (points[1] && points[2]) {
        if (Math.abs(points[1].x - points[2].x) > 0.1) {
            errors.push('點2和點3未保持垂直（X座標不同）');
        }
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
};
