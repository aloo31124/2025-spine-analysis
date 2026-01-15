/*
 * [服務層] 庫存業務邏輯處理
 * 處理店面與商品庫存的關聯
 */

const StoreToStock = require('../models/stock.model');
const ProductPillow = require('../models/productPillow.model');
const ProductMattress = require('../models/productMattress.model');
const Store = require('../models/store.model');

/**
 * 根據店長 ID 取得枕頭商品庫存列表
 * 包含店面資訊與庫存數量
 */
exports.getPillowInventoryByStoreManager = async (storeManagerId) => {
    try {
        console.log('[getPillowInventoryByStoreManager] 開始:', storeManagerId);
        
        // 1. 取得該店長管理的所有店面
        const stores = await Store.getStoresByStoreManagerId(storeManagerId);
        console.log('[getPillowInventoryByStoreManager] 找到', stores.length, '個店面');
        
        if (stores.length === 0) {
            return { pillowList: [], stores: [] };
        }
        
        const storeIds = stores.map(store => store.id);
        
        // 2. 取得所有枕頭商品
        const allPillows = await ProductPillow.getAllProductPillowList();
        console.log('[getPillowInventoryByStoreManager] 找到', allPillows.length, '個枕頭商品');
        
        // 3. 取得這些店面的枕頭庫存
        const stockList = await StoreToStock.findByStoreIdsAndType(storeIds, 'Pillow');
        console.log('[getPillowInventoryByStoreManager] 找到', stockList.length, '筆庫存紀錄');
        
        // 4. 組合資料：每個商品包含所有店面的庫存
        const pillowList = allPillows.map(pillow => {
            // 找出該商品在各店面的庫存
            const storeStocks = stores.map(store => {
                const stockRecord = stockList.find(
                    s => s.productId === pillow.id && s.storeId === store.id
                );
                return {
                    storeId: store.id,
                    storeName: store.name,
                    stock: stockRecord ? stockRecord.stock : 0,
                    stockRecordId: stockRecord ? stockRecord.id : null
                };
            });
            
            // 計算總庫存
            const totalStock = storeStocks.reduce((sum, s) => sum + s.stock, 0);
            
            return {
                id: pillow.id,
                name: pillow.name,
                type: pillow.type,
                price: pillow.price,
                shortHeight: pillow.shortHeight,
                longHeight: pillow.longHeight,
                shortCurvature: pillow.shortCurvature,
                mediumCurvature: pillow.mediumCurvature,
                longCurvature: pillow.longCurvature,
                totalStock,
                storeStocks  // 各店面的庫存詳情
            };
        });
        
        console.log('[getPillowInventoryByStoreManager] 返回', pillowList.length, '個商品');
        return { pillowList, stores };
    } catch (error) {
        console.error('[getPillowInventoryByStoreManager] 錯誤:', error);
        throw error;
    }
};

/**
 * 根據店長 ID 取得床墊商品庫存列表
 * 包含店面資訊與庫存數量
 */
exports.getMattressInventoryByStoreManager = async (storeManagerId) => {
    try {
        console.log('[getMattressInventoryByStoreManager] 開始:', storeManagerId);
        
        // 1. 取得該店長管理的所有店面
        const stores = await Store.getStoresByStoreManagerId(storeManagerId);
        console.log('[getMattressInventoryByStoreManager] 找到', stores.length, '個店面');
        
        if (stores.length === 0) {
            return { mattressList: [], stores: [] };
        }
        
        const storeIds = stores.map(store => store.id);
        
        // 2. 取得所有床墊商品
        const allMattresses = await ProductMattress.getAllProductMattressList();
        console.log('[getMattressInventoryByStoreManager] 找到', allMattresses.length, '個床墊商品');
        
        // 3. 取得這些店面的床墊庫存
        const stockList = await StoreToStock.findByStoreIdsAndType(storeIds, 'Mattress');
        console.log('[getMattressInventoryByStoreManager] 找到', stockList.length, '筆庫存紀錄');
        
        // 4. 組合資料：每個商品包含所有店面的庫存
        const mattressList = allMattresses.map(mattress => {
            // 找出該商品在各店面的庫存
            const storeStocks = stores.map(store => {
                const stockRecord = stockList.find(
                    s => s.productId === mattress.id && s.storeId === store.id
                );
                return {
                    storeId: store.id,
                    storeName: store.name,
                    stock: stockRecord ? stockRecord.stock : 0,
                    stockRecordId: stockRecord ? stockRecord.id : null
                };
            });
            
            // 計算總庫存
            const totalStock = storeStocks.reduce((sum, s) => sum + s.stock, 0);
            
            return {
                id: mattress.id,
                name: mattress.name,
                model: mattress.model,
                price: mattress.price,
                totalStock,
                storeStocks  // 各店面的庫存詳情
            };
        });
        
        console.log('[getMattressInventoryByStoreManager] 返回', mattressList.length, '個商品');
        return { mattressList, stores };
    } catch (error) {
        console.error('[getMattressInventoryByStoreManager] 錯誤:', error);
        throw error;
    }
};

/**
 * 更新單一店面的商品庫存
 */
exports.updateStoreStock = async (stockData) => {
    try {
        console.log('[updateStoreStock] 更新庫存:', stockData);
        const { productId, productType, storeId, stock } = stockData;
        
        // 驗證必填欄位
        if (!productId || !productType || !storeId || stock === undefined) {
            throw new Error('缺少必填欄位');
        }
        
        // 驗證商品類型
        if (!['Pillow', 'Mattress'].includes(productType)) {
            throw new Error('商品類型錯誤');
        }
        
        // 驗證庫存數量
        if (stock < 0) {
            throw new Error('庫存數量不可為負數');
        }
        
        // 更新或新增庫存
        const result = await StoreToStock.upsert({
            productId,
            productType,
            storeId,
            stock: Number(stock)
        });
        
        console.log('[updateStoreStock] 更新成功');
        return result;
    } catch (error) {
        console.error('[updateStoreStock] 錯誤:', error);
        throw error;
    }
};

/**
 * 批量更新商品在多個店面的庫存
 * 用於商品新增/編輯頁面儲存
 */
exports.batchUpdateProductStock = async (productId, productType, storeStockList) => {
    try {
        console.log('[batchUpdateProductStock] 批量更新:', { productId, productType, storeStockList });
        
        // 驗證必填欄位
        if (!productId || !productType) {
            throw new Error('缺少必填欄位');
        }
        
        // 驗證商品類型
        if (!['Pillow', 'Mattress'].includes(productType)) {
            throw new Error('商品類型錯誤');
        }
        
        // 準備批量更新資料
        const stockDataList = storeStockList.map(item => ({
            productId,
            productType,
            storeId: item.storeId,
            stock: Number(item.stock) || 0
        }));
        
        // 執行批量更新
        const results = await StoreToStock.batchUpsert(stockDataList);
        
        console.log('[batchUpdateProductStock] 批量更新成功,', results.length, '筆');
        return results;
    } catch (error) {
        console.error('[batchUpdateProductStock] 錯誤:', error);
        throw error;
    }
};

/**
 * 根據商品 ID 取得所有店面的庫存
 */
exports.getProductStockByStores = async (productId, productType, storeIds) => {
    try {
        console.log('[getProductStockByStores] 查詢:', { productId, productType, storeIds });
        
        // 取得該商品的所有庫存紀錄
        const stockList = await StoreToStock.findByProductId(productId);
        
        // 取得店面資訊
        const stores = await Store.getAllStoreList();
        const targetStores = stores.filter(store => storeIds.includes(store.id));
        
        // 組合資料
        const storeStocks = targetStores.map(store => {
            const stockRecord = stockList.find(s => s.storeId === store.id);
            return {
                storeId: store.id,
                storeName: store.name,
                stock: stockRecord ? stockRecord.stock : 0,
                stockRecordId: stockRecord ? stockRecord.id : null
            };
        });
        
        console.log('[getProductStockByStores] 返回', storeStocks.length, '個店面庫存');
        return storeStocks;
    } catch (error) {
        console.error('[getProductStockByStores] 錯誤:', error);
        throw error;
    }
};

/**
 * 刪除商品的所有庫存紀錄
 */
exports.deleteProductStock = async (productId) => {
    try {
        console.log('[deleteProductStock] 刪除商品庫存:', productId);
        await StoreToStock.deleteByProductId(productId);
        console.log('[deleteProductStock] 刪除成功');
        return true;
    } catch (error) {
        console.error('[deleteProductStock] 錯誤:', error);
        throw error;
    }
};
