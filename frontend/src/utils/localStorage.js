/**
 * LocalStorage 統一管理模組
 * 集中管理所有 localStorage 的 key 和操作方法
 */

// ==================== LocalStorage Keys ====================
export const STORAGE_KEYS = {
    // 認證相關
    JWT_TOKEN: 'jwt',
    USER_ROLES: 'userRoles',
    USER_ID: 'userId',
    
    // 店長相關
    SELECTED_STORE_MANAGER_ID: 'selectedStoreManagerId',
    
    // 登入相關
    SAVED_EMAIL: 'savedEmail',
    SAVED_EMAIL_TIME: 'savedEmailTime',
    
    // 分析相關
    SPINE_ANALYSIS_PHOTO: 'spineAnalysisPhoto',
    SPINE_ANALYSIS_PHOTO_TIMESTAMP: 'spineAnalysisPhotoTimestamp',
    PENDING_ANALYSIS_DATA: 'pendingAnalysisData',
    
    // 分頁設定
    CUSTOMER_LIST_PAGE_SIZE: 'customerListPageSize',
    PILLOW_LIST_PAGE_SIZE: 'pillowListPageSize',
    MATTRESS_LIST_PAGE_SIZE: 'mattressListPageSize',
};

// ==================== 基礎操作方法 ====================

/**
 * 獲取 localStorage 項目
 * @param {string} key - storage key
 * @param {any} defaultValue - 預設值
 * @returns {any} 儲存的值或預設值
 */
export const getItem = (key, defaultValue = null) => {
    try {
        const item = localStorage.getItem(key);
        return item !== null ? item : defaultValue;
    } catch (error) {
        console.error(`[localStorage] 讀取 ${key} 失敗:`, error);
        return defaultValue;
    }
};

/**
 * 設定 localStorage 項目
 * @param {string} key - storage key
 * @param {any} value - 要儲存的值
 */
export const setItem = (key, value) => {
    try {
        localStorage.setItem(key, value);
    } catch (error) {
        console.error(`[localStorage] 儲存 ${key} 失敗:`, error);
    }
};

/**
 * 移除 localStorage 項目
 * @param {string} key - storage key
 */
export const removeItem = (key) => {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.error(`[localStorage] 移除 ${key} 失敗:`, error);
    }
};

/**
 * 清除所有 localStorage
 */
export const clearAll = () => {
    try {
        localStorage.clear();
        console.log('[localStorage] 已清除所有資料');
    } catch (error) {
        console.error('[localStorage] 清除失敗:', error);
    }
};

// ==================== 特定功能的輔助方法 ====================

/**
 * 獲取 JWT Token
 * @returns {string|null}
 */
export const getJwtToken = () => {
    return getItem(STORAGE_KEYS.JWT_TOKEN);
};

/**
 * 設定 JWT Token
 * @param {string} token
 */
export const setJwtToken = (token) => {
    setItem(STORAGE_KEYS.JWT_TOKEN, token);
};

/**
 * 移除 JWT Token
 */
export const removeJwtToken = () => {
    removeItem(STORAGE_KEYS.JWT_TOKEN);
};

/**
 * 獲取使用者 ID
 * @returns {string}
 */
export const getUserId = () => {
    return getItem(STORAGE_KEYS.USER_ID, '');
};

/**
 * 設定使用者 ID
 * @param {string} userId
 */
export const setUserId = (userId) => {
    setItem(STORAGE_KEYS.USER_ID, userId);
};

/**
 * 獲取使用者角色列表
 * @returns {Array}
 */
export const getUserRoles = () => {
    try {
        const rolesStr = getItem(STORAGE_KEYS.USER_ROLES);
        return rolesStr ? JSON.parse(rolesStr) : [];
    } catch (error) {
        console.error('[localStorage] 解析 userRoles 失敗:', error);
        return [];
    }
};

/**
 * 設定使用者角色列表
 * @param {Array} roles
 */
export const setUserRoles = (roles) => {
    setItem(STORAGE_KEYS.USER_ROLES, JSON.stringify(roles));
};

/**
 * 獲取已選擇的店長 ID
 * @returns {string|null}
 */
export const getSelectedStoreManagerId = () => {
    return getItem(STORAGE_KEYS.SELECTED_STORE_MANAGER_ID);
};

/**
 * 設定已選擇的店長 ID
 * @param {string} managerId
 */
export const setSelectedStoreManagerId = (managerId) => {
    setItem(STORAGE_KEYS.SELECTED_STORE_MANAGER_ID, managerId);
};

/**
 * 移除已選擇的店長 ID
 */
export const removeSelectedStoreManagerId = () => {
    removeItem(STORAGE_KEYS.SELECTED_STORE_MANAGER_ID);
};

/**
 * 獲取已儲存的登入 Email
 * @returns {string|null}
 */
export const getSavedEmail = () => {
    return getItem(STORAGE_KEYS.SAVED_EMAIL);
};

/**
 * 設定已儲存的登入 Email
 * @param {string} email
 */
export const setSavedEmail = (email) => {
    setItem(STORAGE_KEYS.SAVED_EMAIL, email);
    setItem(STORAGE_KEYS.SAVED_EMAIL_TIME, new Date().getTime().toString());
};

/**
 * 移除已儲存的登入 Email
 */
export const removeSavedEmail = () => {
    removeItem(STORAGE_KEYS.SAVED_EMAIL);
    removeItem(STORAGE_KEYS.SAVED_EMAIL_TIME);
};

/**
 * 檢查已儲存的 Email 是否過期（7天）
 * @returns {boolean}
 */
export const isSavedEmailExpired = () => {
    const savedTime = getItem(STORAGE_KEYS.SAVED_EMAIL_TIME);
    if (!savedTime) return true;
    
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    return new Date().getTime() - parseInt(savedTime) > sevenDays;
};

/**
 * 獲取脊椎分析照片
 * @returns {{photo: string|null, timestamp: string|null}}
 */
export const getSpineAnalysisPhoto = () => {
    return {
        photo: getItem(STORAGE_KEYS.SPINE_ANALYSIS_PHOTO),
        timestamp: getItem(STORAGE_KEYS.SPINE_ANALYSIS_PHOTO_TIMESTAMP)
    };
};

/**
 * 設定脊椎分析照片
 * @param {string} imageData
 */
export const setSpineAnalysisPhoto = (imageData) => {
    setItem(STORAGE_KEYS.SPINE_ANALYSIS_PHOTO, imageData);
    setItem(STORAGE_KEYS.SPINE_ANALYSIS_PHOTO_TIMESTAMP, Date.now().toString());
};

/**
 * 移除脊椎分析照片
 */
export const removeSpineAnalysisPhoto = () => {
    removeItem(STORAGE_KEYS.SPINE_ANALYSIS_PHOTO);
    removeItem(STORAGE_KEYS.SPINE_ANALYSIS_PHOTO_TIMESTAMP);
};

/**
 * 獲取待處理的分析資料
 * @returns {Object|null}
 */
export const getPendingAnalysisData = () => {
    try {
        const dataStr = getItem(STORAGE_KEYS.PENDING_ANALYSIS_DATA);
        return dataStr ? JSON.parse(dataStr) : null;
    } catch (error) {
        console.error('[localStorage] 解析 pendingAnalysisData 失敗:', error);
        return null;
    }
};

/**
 * 設定待處理的分析資料
 * @param {Object} data
 */
export const setPendingAnalysisData = (data) => {
    setItem(STORAGE_KEYS.PENDING_ANALYSIS_DATA, JSON.stringify(data));
};

/**
 * 移除待處理的分析資料
 */
export const removePendingAnalysisData = () => {
    removeItem(STORAGE_KEYS.PENDING_ANALYSIS_DATA);
};

/**
 * 獲取分頁大小設定
 * @param {string} listType - 'customer', 'pillow', 或 'mattress'
 * @returns {number}
 */
export const getPageSize = (listType) => {
    const keyMap = {
        customer: STORAGE_KEYS.CUSTOMER_LIST_PAGE_SIZE,
        pillow: STORAGE_KEYS.PILLOW_LIST_PAGE_SIZE,
        mattress: STORAGE_KEYS.MATTRESS_LIST_PAGE_SIZE,
    };
    
    const key = keyMap[listType];
    if (!key) {
        console.warn(`[localStorage] 未知的 listType: ${listType}`);
        return 10;
    }
    
    const size = getItem(key, '10');
    return parseInt(size) || 10;
};

/**
 * 設定分頁大小
 * @param {string} listType - 'customer', 'pillow', 或 'mattress'
 * @param {number} size
 */
export const setPageSize = (listType, size) => {
    const keyMap = {
        customer: STORAGE_KEYS.CUSTOMER_LIST_PAGE_SIZE,
        pillow: STORAGE_KEYS.PILLOW_LIST_PAGE_SIZE,
        mattress: STORAGE_KEYS.MATTRESS_LIST_PAGE_SIZE,
    };
    
    const key = keyMap[listType];
    if (!key) {
        console.warn(`[localStorage] 未知的 listType: ${listType}`);
        return;
    }
    
    setItem(key, size.toString());
};

/**
 * 清除所有使用者相關資料（登出時使用）
 * 保留一些不需要清除的設定，如分頁大小等
 */
export const clearUserData = () => {
    console.log('[localStorage] 開始清除使用者資料...');
    
    // 需要清除的 keys
    const keysToRemove = [
        STORAGE_KEYS.JWT_TOKEN,
        STORAGE_KEYS.USER_ROLES,
        STORAGE_KEYS.USER_ID,
        STORAGE_KEYS.SELECTED_STORE_MANAGER_ID,
        STORAGE_KEYS.SPINE_ANALYSIS_PHOTO,
        STORAGE_KEYS.SPINE_ANALYSIS_PHOTO_TIMESTAMP,
        STORAGE_KEYS.PENDING_ANALYSIS_DATA,
    ];
    
    keysToRemove.forEach(key => {
        removeItem(key);
    });
    
    console.log('[localStorage] 使用者資料已清除');
};

/**
 * 清除所有資料（完全重置）
 */
export const clearAllData = () => {
    clearAll();
};

// 預設匯出所有功能
export default {
    STORAGE_KEYS,
    getItem,
    setItem,
    removeItem,
    clearAll,
    getJwtToken,
    setJwtToken,
    removeJwtToken,
    getUserId,
    setUserId,
    getUserRoles,
    setUserRoles,
    getSelectedStoreManagerId,
    setSelectedStoreManagerId,
    removeSelectedStoreManagerId,
    getSavedEmail,
    setSavedEmail,
    removeSavedEmail,
    isSavedEmailExpired,
    getSpineAnalysisPhoto,
    setSpineAnalysisPhoto,
    removeSpineAnalysisPhoto,
    getPendingAnalysisData,
    setPendingAnalysisData,
    removePendingAnalysisData,
    getPageSize,
    setPageSize,
    clearUserData,
    clearAllData,
};
