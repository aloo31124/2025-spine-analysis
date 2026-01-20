/*
 * [控制層] 庫存處理
 * - 取得店長管理的商品庫存列表
 * - 更新店面商品庫存
 * - 批量更新商品庫存
 */

const stockService = require('../../services/stock.service');
const userToRoleService = require('../../services/userToRole.service');
const storeService = require('../../services/store.service');
const authService = require('../../services/auth.service');

const ERROR_HEADER = "[stock.api.controller.js]";

/**
 * 取得枕頭商品庫存列表
 * 根據當前使用者（店長）取得其管理的所有店面的枕頭庫存
 */
exports.getPillowInventory = async (req, res) => {
    try {
        console.log("[getPillowInventory] 開始");
        
        // 1. 從 JWT 取得 userId
        const payload = authService.verifyJwt(req);
        const userId = payload?.userId;
        
        if (!userId) {
            return res.status(401).json({ result: '401', message: '未授權' });
        }
        
        console.log("[getPillowInventory] userId:", userId);
        
        // 2. 檢查是否為店長
        const isManager = await userToRoleService.isStoreManager(userId);
        if (!isManager) {
            return res.status(403).json({ result: '403', message: '權限不足：您不是店長' });
        }
        
        // 3. 取得該店長管理的所有店面
        const stores = await storeService.getStoresByStoreManagerId(userId);
        console.log("[getPillowInventory] 找到", stores.length, "個店面");
        
        if (stores.length === 0) {
            return res.status(200).json({ 
                result: '200', 
                data: { pillowList: [], stores: [] },
                message: '您目前沒有管理任何店面'
            });
        }
        
        // 4. 取得枕頭商品庫存列表
        const data = await stockService.getPillowInventoryByStoreManager(userId);
        
        res.status(200).json({ result: '200', data });
    } catch (error) {
        console.error("[getPillowInventory] 錯誤:", error);
        res.status(500).json({ result: '500', error: error.message });
    }
};

/**
 * 取得床墊商品庫存列表
 * 根據當前使用者（店長）取得其管理的所有店面的床墊庫存
 */
exports.getMattressInventory = async (req, res) => {
    try {
        console.log("[getMattressInventory] 開始");
        
        // 1. 從 JWT 取得 userId
        const payload = authService.verifyJwt(req);
        const userId = payload?.userId;
        
        if (!userId) {
            return res.status(401).json({ result: '401', message: '未授權' });
        }
        
        console.log("[getMattressInventory] userId:", userId);
        
        // 2. 檢查是否為店長
        const isManager = await userToRoleService.isStoreManager(userId);
        if (!isManager) {
            return res.status(403).json({ result: '403', message: '權限不足：您不是店長' });
        }
        
        // 3. 取得該店長管理的所有店面
        const stores = await storeService.getStoresByStoreManagerId(userId);
        console.log("[getMattressInventory] 找到", stores.length, "個店面");
        
        if (stores.length === 0) {
            return res.status(200).json({ 
                result: '200', 
                data: { mattressList: [], stores: [] },
                message: '您目前沒有管理任何店面'
            });
        }
        
        // 4. 取得床墊商品庫存列表
        const data = await stockService.getMattressInventoryByStoreManager(userId);
        
        res.status(200).json({ result: '200', data });
    } catch (error) {
        console.error("[getMattressInventory] 錯誤:", error);
        res.status(500).json({ result: '500', error: error.message });
    }
};

/**
 * 更新單一店面的商品庫存
 * Body: { productId, productType, storeId, stock }
 */
exports.updateStoreStock = async (req, res) => {
    try {
        console.log("[updateStoreStock] 開始:", req.body);
        
        // 1. 從 JWT 取得 userId
        const payload = authService.verifyJwt(req);
        const userId = payload?.userId;
        
        if (!userId) {
            return res.status(401).json({ result: '401', message: '未授權' });
        }
        
        // 2. 檢查是否為店長
        const isManager = await userToRoleService.isStoreManager(userId);
        if (!isManager) {
            return res.status(403).json({ result: '403', message: '權限不足：您不是店長' });
        }
        
        // 3. 檢查店面是否屬於該店長
        const stores = await storeService.getStoresByStoreManagerId(userId);
        const storeIds = stores.map(s => s.id);
        
        if (!storeIds.includes(req.body.storeId)) {
            return res.status(403).json({ result: '403', message: '權限不足：該店面不屬於您管理' });
        }
        
        // 4. 更新庫存
        const result = await stockService.updateStoreStock(req.body);
        
        res.status(200).json({ result: '200', data: result, message: '庫存更新成功' });
    } catch (error) {
        console.error("[updateStoreStock] 錯誤:", error);
        res.status(500).json({ result: '500', error: error.message });
    }
};

/**
 * 批量更新商品在多個店面的庫存
 * Body: { productId, productType, storeStockList: [{ storeId, stock }] }
 */
exports.batchUpdateProductStock = async (req, res) => {
    try {
        console.log("[batchUpdateProductStock] 開始:", req.body);
        
        // 1. 從 JWT 取得 userId
        const payload = authService.verifyJwt(req);
        const userId = payload?.userId;
        
        if (!userId) {
            return res.status(401).json({ result: '401', message: '未授權' });
        }
        
        // 2. 檢查是否為店長
        const isManager = await userToRoleService.isStoreManager(userId);
        if (!isManager) {
            return res.status(403).json({ result: '403', message: '權限不足：您不是店長' });
        }
        
        // 3. 檢查所有店面是否屬於該店長
        const stores = await storeService.getStoresByStoreManagerId(userId);
        const storeIds = stores.map(s => s.id);
        const requestStoreIds = req.body.storeStockList.map(item => item.storeId);
        
        const invalidStores = requestStoreIds.filter(id => !storeIds.includes(id));
        if (invalidStores.length > 0) {
            return res.status(403).json({ 
                result: '403', 
                message: '權限不足：部分店面不屬於您管理',
                invalidStores
            });
        }
        
        // 4. 批量更新庫存
        const { productId, productType, storeStockList } = req.body;
        const results = await stockService.batchUpdateProductStock(productId, productType, storeStockList);
        
        res.status(200).json({ 
            result: '200', 
            data: results, 
            message: `成功更新 ${results.length} 筆庫存` 
        });
    } catch (error) {
        console.error("[batchUpdateProductStock] 錯誤:", error);
        res.status(500).json({ result: '500', error: error.message });
    }
};

/**
 * 取得商品在指定店面的庫存資訊
 * Query: productId, productType
 */
exports.getProductStock = async (req, res) => {
    try {
        console.log("[getProductStock] 開始:", req.query);
        
        // 1. 從 JWT 取得 userId
        const payload = authService.verifyJwt(req);
        const userId = payload?.userId;
        
        if (!userId) {
            return res.status(401).json({ result: '401', message: '未授權' });
        }
        
        // 2. 檢查是否為店長
        const isManager = await userToRoleService.isStoreManager(userId);
        if (!isManager) {
            return res.status(403).json({ result: '403', message: '權限不足：您不是店長' });
        }
        
        // 3. 取得該店長管理的所有店面
        const stores = await storeService.getStoresByStoreManagerId(userId);
        const storeIds = stores.map(s => s.id);
        
        // 4. 取得商品庫存
        const { productId, productType } = req.query;
        const storeStocks = await stockService.getProductStockByStores(productId, productType, storeIds);
        
        res.status(200).json({ result: '200', data: { storeStocks, stores } });
    } catch (error) {
        console.error("[getProductStock] 錯誤:", error);
        res.status(500).json({ result: '500', error: error.message });
    }
};

/**
 * 刪除商品的所有庫存紀錄
 * Params: productId
 */
exports.deleteProductStock = async (req, res) => {
    try {
        console.log("[deleteProductStock] 開始:", req.params.productId);
        
        // 1. 從 JWT 取得 userId
        const payload = authService.verifyJwt(req);
        const userId = payload?.userId;
        
        if (!userId) {
            return res.status(401).json({ result: '401', message: '未授權' });
        }
        
        // 2. 檢查是否為店長
        const isManager = await userToRoleService.isStoreManager(userId);
        if (!isManager) {
            return res.status(403).json({ result: '403', message: '權限不足：您不是店長' });
        }
        
        // 3. 刪除商品庫存
        await stockService.deleteProductStock(req.params.productId);
        
        res.status(200).json({ result: '200', message: '庫存刪除成功' });
    } catch (error) {
        console.error("[deleteProductStock] 錯誤:", error);
        res.status(500).json({ result: '500', error: error.message });
    }
};
