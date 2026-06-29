/*
 * [service層] Logger服務 - 提供商品操作的結構化日誌記錄
 * 支援分級記錄策略：標準欄位記錄完整內容，大型欄位僅記錄 [MODIFIED] 標記
 */

/**
 * 記錄商品操作
 * @param {string} action - 操作類型 ('CREATE', 'UPDATE', 'DELETE')
 * @param {string} productId - 商品 ID
 * @param {string} userId - 操作者 ID
 * @param {object} beforeData - 操作前資料（UPDATE/DELETE 時使用）
 * @param {object} afterData - 操作後資料（CREATE/UPDATE 時使用）
 */
exports.logProductAction = async (action, productId, userId, beforeData = null, afterData = null) => {
    try {
        const timestamp = new Date().toISOString();
        
        const logEntry = {
            timestamp,
            action,
            productId,
            userId,
            before: beforeData ? _sanitizeLogData(beforeData) : null,
            after: afterData ? _sanitizeLogData(afterData) : null,
            changes: (action === 'UPDATE' && beforeData && afterData) ? _calculateChanges(beforeData, afterData) : null
        };

        // 輸出到控制台（生產環境可改為寫入專用 log collection 或外部服務）
        console.log(`[PRODUCT_LOG] ${JSON.stringify(logEntry)}`);
        
        return logEntry;
    } catch (error) {
        // Log 失敗不應阻塞主流程
        console.error('[logProductAction] 記錄失敗:', error);
    }
};

/**
 * 計算欄位變更（分級記錄策略）
 * @private
 * @param {object} before - 變更前資料
 * @param {object} after - 變更後資料
 * @returns {object} 變更摘要
 */
function _calculateChanges(before, after) {
    const changes = {};
    const allKeys = new Set([...Object.keys(before || {}), ...Object.keys(after || {})]);
    
    allKeys.forEach(key => {
        const beforeValue = before[key];
        const afterValue = after[key];
        
        if (JSON.stringify(beforeValue) !== JSON.stringify(afterValue)) {
            changes[key] = {
                from: _sanitizeValue(beforeValue),
                to: _sanitizeValue(afterValue)
            };
        }
    });
    
    return changes;
}

/**
 * 淨化單個值（大型內容標記為 [MODIFIED]）
 * @private
 * @param {any} value - 欄位值
 * @returns {any} 淨化後的值
 */
function _sanitizeValue(value) {
    if (value === null || value === undefined) return value;
    
    // 字串類型：超過 500 字元標記為 [MODIFIED]
    if (typeof value === 'string' && value.length > 500) {
        return '[MODIFIED]';
    }
    
    // 物件類型：檢查是否為圖片資料（含 base64 或 url）
    if (typeof value === 'object') {
        const str = JSON.stringify(value);
        if (str.includes('data:image') || str.includes('base64') || str.length > 1000) {
            return '[MODIFIED]';
        }
    }
    
    return value;
}

/**
 * 淨化整個物件的資料（遞迴處理）
 * @private
 * @param {object} data - 原始資料
 * @returns {object} 淨化後的資料
 */
function _sanitizeLogData(data) {
    if (!data) return data;
    
    const sanitized = {};
    Object.keys(data).forEach(key => {
        sanitized[key] = _sanitizeValue(data[key]);
    });
    
    return sanitized;
}
