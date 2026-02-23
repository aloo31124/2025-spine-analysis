/**
 * 日期格式化工具
 * 將 Firestore Timestamp 轉換為人類可讀的 ISO 8601 格式
 */

/**
 * 格式化時間戳為 ISO 8601 顯示格式（YYYY-MM-DD HH:mm:ss）
 * @param {Date|Timestamp|string|number} timestamp - Firestore Timestamp、Date 物件、ISO 字串或毫秒數
 * @returns {string} 格式化後的時間字串，例如 "2026-01-28 10:30:45"
 */
export const formatTimestamp = (timestamp) => {
    if (!timestamp) return '-';
    
    try {
        let date;
        
        // 處理 Firestore Timestamp 物件
        if (timestamp.toDate && typeof timestamp.toDate === 'function') {
            date = timestamp.toDate();
        }
        // 處理 Date 物件
        else if (timestamp instanceof Date) {
            date = timestamp;
        }
        // 處理字串或數字
        else {
            date = new Date(timestamp);
        }
        
        // 檢查日期是否有效
        if (isNaN(date.getTime())) {
            console.warn('[formatTimestamp] 無效的時間戳:', timestamp);
            return '-';
        }
        
        // 轉換為本地時間的 ISO 8601 格式：YYYY-MM-DD HH:mm:ss
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    } catch (error) {
        console.error('[formatTimestamp] 格式化失敗:', error);
        return '-';
    }
};

/**
 * 格式化時間戳為簡短日期格式（YYYY-MM-DD）
 * @param {Date|Timestamp|string|number} timestamp - 時間戳
 * @returns {string} 格式化後的日期字串，例如 "2026-01-28"
 */
export const formatDate = (timestamp) => {
    const formatted = formatTimestamp(timestamp);
    return formatted === '-' ? '-' : formatted.split(' ')[0];
};

/**
 * 格式化時間戳為相對時間（例如：2小時前、昨天）
 * @param {Date|Timestamp|string|number} timestamp - 時間戳
 * @returns {string} 相對時間字串
 */
export const formatRelativeTime = (timestamp) => {
    if (!timestamp) return '-';
    
    try {
        let date;
        
        if (timestamp.toDate && typeof timestamp.toDate === 'function') {
            date = timestamp.toDate();
        } else if (timestamp instanceof Date) {
            date = timestamp;
        } else {
            date = new Date(timestamp);
        }
        
        if (isNaN(date.getTime())) return '-';
        
        const now = new Date();
        const diffMs = now - date;
        const diffMinutes = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        
        if (diffMinutes < 1) return '剛剛';
        if (diffMinutes < 60) return `${diffMinutes} 分鐘前`;
        if (diffHours < 24) return `${diffHours} 小時前`;
        if (diffDays === 1) return '昨天';
        if (diffDays < 7) return `${diffDays} 天前`;
        
        // 超過一週，顯示具體日期
        return formatDate(timestamp);
    } catch (error) {
        console.error('[formatRelativeTime] 格式化失敗:', error);
        return '-';
    }
};
