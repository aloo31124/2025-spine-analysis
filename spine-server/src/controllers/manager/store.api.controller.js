/*
 * [控制層] 店面管理處理
 *  - 店面列表搜尋分頁
 *  - 店面詳細資訊
 *  - 店面新增、更新、刪除
 */

const storeService = require('../../services/store.service');
const authService = require('../../services/auth.service');
const userToRoleService = require('../../services/userToRole.service');

const ERROR_HEADER = '[store.api.controller.js]';

/** 取得店面列表 */
exports.getStoreList = async (req, res) => {
    try {
        console.log('[getStoreList] 開始');
        const { searchParam, pagingParam } = req.body;
        const result = await storeService.searchStore(searchParam || {}, pagingParam || {});
        res.status(200).json({ result });
    } catch (error) {
        console.error('[getStoreList] 錯誤:', error);
        res.status(500).json({ result: error.message });
    }
};

/** 新增店面 */
exports.postStore = async (req, res) => {
    console.log('[postStore] 開始，請求內容:', req.body);
    try {
        const payload = authService.verifyJwt(req);
        const newStore = await storeService.addStore(req.body.newStore);
        console.log('[postStore] 新店面:', newStore);
        res.status(200).json({ result: '200', newStore });
    } catch (error) {
        console.error('[postStore] 錯誤:', error);
        res.status(500).json({ result: '500', error: error.message });
    }
};

/** 取得單一店面 */
exports.getStore = async (req, res) => {
    console.log('[getStore] 開始，店面 ID:', req.params.id);
    try {
        const store = await storeService.getStore(req.params.id);
        res.status(200).json({ result: '200', store });
    } catch (error) {
        console.error('[getStore] 錯誤:', error);
        res.status(500).json({ result: '500', error: error.message });
    }
};

/** 更新店面 */
exports.updateStore = async (req, res) => {
    console.log('[updateStore] 開始，更新資料:', req.body.updateStore);
    try {
        const updatedStore = await storeService.updateStore(req.body.updateStore);
        res.status(200).json({ result: '200', updatedStore });
    } catch (error) {
        console.error('[updateStore] 錯誤:', error);
        res.status(500).json({ result: '500', error: error.message });
    }
};

/** 刪除店面 */
exports.deleteStore = async (req, res) => {
    console.log('[deleteStore] 開始，店面 ID:', req.params.id);
    try {
        await storeService.deleteStore(req.params.id);
        res.status(200).json({ result: '200', message: '店面刪除成功' });
    } catch (error) {
        console.error('[deleteStore] 錯誤:', error);
        res.status(500).json({ result: '500', error: error.message });
    }
};

/** 搜尋店面 */
exports.searchStore = async (req, res) => {
    console.log('[searchStore] 開始，搜尋參數:', req.body.searchParam, '分頁參數:', req.body.pagingParam);
    try {
        const searchResult = await storeService.searchStore(req.body.searchParam, req.body.pagingParam);
        res.status(200).json({ result: '200', searchResult });
    } catch (error) {
        console.error('[searchStore] 錯誤:', error);
        res.status(500).json({ result: '500', error: error.message });
    }
};

/** 根據店長 ID 取得管理的店面 */
exports.getStoresByStoreManagerId = async (req, res) => {
    console.log('[getStoresByStoreManagerId] 開始，店長 ID:', req.params.storeManagerId);
    try {
        const stores = await storeService.getStoresByStoreManagerId(req.params.storeManagerId);
        res.status(200).json({ result: '200', stores });
    } catch (error) {
        console.error('[getStoresByStoreManagerId] 錯誤:', error);
        res.status(500).json({ result: '500', error: error.message });
    }
};

/** 取得當前店長管理的店面 (從 JWT 取得店長 ID) */
exports.getMyStores = async (req, res) => {
    console.log('[getMyStores] 開始');
    try {
        // 從 JWT 取得 userId
        const payload = authService.verifyJwt(req);
        const userId = payload?.userId;
        
        if (!userId) {
            return res.status(401).json({ result: '401', message: '未授權' });
        }
        
        console.log('[getMyStores] userId:', userId);
        
        // 檢查是否為店長
        const isManager = await userToRoleService.isStoreManager(userId);
        if (!isManager) {
            return res.status(403).json({ result: '403', message: '權限不足：您不是店長' });
        }
        
        // 取得該店長管理的所有店面
        const stores = await storeService.getStoresByStoreManagerId(userId);
        res.status(200).json({ result: '200', stores });
    } catch (error) {
        console.error('[getMyStores] 錯誤:', error);
        res.status(500).json({ result: '500', error: error.message });
    }
};

/** 匯入店面資料 */
exports.importStore = async (req, res) => {
    console.log('[importStore] 開始，店面列表:', req.body.storeList);
    try {
        const importResult = await storeService.importAllStore(req.body.storeList);
        res.status(200).json({ result: '200', importResult });
    } catch (error) {
        console.error('[importStore] 錯誤:', error);
        res.status(500).json({ result: '500', error: error.message });
    }
};
