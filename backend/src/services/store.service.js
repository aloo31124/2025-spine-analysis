/*
 * [服務層] 店面業務邏輯處理
 */

const Store = require('../models/store.model');

/** 取得所有店面列表 */
exports.getAllStoreList = async () => {
    try {
        return await Store.getAllStoreList();
    } catch (error) {
        console.error('[getAllStoreList] 錯誤:', error);
        throw error;
    }
};

/** 搜尋店面 */
exports.searchStore = async (searchParam, pagingParam) => {
    try {
        console.log('[searchStore] 開始搜尋:', { searchParam, pagingParam });
        
        // 取得所有店面，並進行篩選
        const { keyword, region, storeManagerId } = searchParam;
        const allStores = await Store.getAllStoreList();
        
        let storeList = allStores.filter(store => {
            let match = true;
            
            // 關鍵字搜尋（店面名稱、地址、電話）
            if (keyword) {
                match = match && (
                    (store.name && store.name.includes(keyword)) ||
                    (store.address && store.address.includes(keyword)) ||
                    (store.phone && store.phone.includes(keyword))
                );
            }
            
            // 區域篩選
            if (region) {
                match = match && store.region === region;
            }
            
            // 店長篩選
            if (storeManagerId) {
                match = match && store.storeManagerId === storeManagerId;
            }
            
            return match;
        });

        // 分頁處理
        let { pageIndex, pageSize, sort } = pagingParam;
        if (pageIndex && pageSize) {
            pagingParam.dataTotal = storeList.length;
            pagingParam.pageTotal = Math.ceil(storeList.length / pageSize);
            storeList = storeList.slice((pageIndex - 1) * pageSize, pageIndex * pageSize);
        }
        
        console.log('[searchStore] 搜尋結果:', { storeList, pagingParam });
        return { storeList, pagingParam };
    } catch (error) {
        console.error('[searchStore] 錯誤:', error);
        throw error;
    }
};

/** 新增店面 */
exports.addStore = async (storeData) => {
    try {
        return await Store.addStore(storeData);
    } catch (error) {
        console.error('[addStore] 錯誤:', error);
        throw error;
    }
};

/** 取得單一店面 */
exports.getStore = async (id) => {
    try {
        return await Store.getStore(id);
    } catch (error) {
        console.error('[getStore] 錯誤:', error);
        throw error;
    }
};

/** 更新店面 */
exports.updateStore = async (storeData) => {
    try {
        return await Store.updateStore(storeData);
    } catch (error) {
        console.error('[updateStore] 錯誤:', error);
        throw error;
    }
};

/** 刪除店面 */
exports.deleteStore = async (id) => {
    try {
        return await Store.deleteStore(id);
    } catch (error) {
        console.error('[deleteStore] 錯誤:', error);
        throw error;
    }
};

/** 根據店長 ID 取得管理的店面 */
exports.getStoresByStoreManagerId = async (storeManagerId) => {
    try {
        return await Store.getStoresByStoreManagerId(storeManagerId);
    } catch (error) {
        console.error('[getStoresByStoreManagerId] 錯誤:', error);
        throw error;
    }
};

/** 匯出所有店面列表（用於備份） */
exports.exportAllStoreList = async () => {
    try {
        return await Store.getAllStoreList();
    } catch (error) {
        console.error('[exportAllStoreList] 錯誤:', error);
        throw error;
    }
};

/** 匯入店面資料（用於備份還原） */
exports.importAllStore = async (storeList) => {
    try {
        return await Store.importAllStore(storeList);
    } catch (error) {
        console.error('[importAllStore] 錯誤:', error);
        throw error;
    }
};
