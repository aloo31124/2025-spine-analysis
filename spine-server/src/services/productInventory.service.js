/*
 * [service層] 負責商品庫存業務邏輯
 * 處理枕頭商品與床墊商品的庫存查詢與更新
 */

const ProductPillow = require('../models/productPillow.model');
const ProductMattress = require('../models/productMattress.model');

/**
 * 取得枕頭商品庫存清單
 * @param {string} userId - 使用者ID
 * @returns {Promise<Array>} 庫存清單，包含 id, name, type, stock
 */
exports.getPillowInventoryList = async (userId) => {
    try {
        console.log("[getPillowInventoryList] start, userId:", userId);
        
        // 取得所有枕頭商品
        let productPillowList = await ProductPillow.getAllProductPillowList();
        
        // 如果提供 userId，則只返回該用戶的商品
        if (userId) {
            productPillowList = productPillowList.filter(p => p.userId === userId);
        }
        
        // 只返回庫存相關欄位
        const inventoryList = productPillowList.map(product => ({
            id: product.id,
            name: product.name,
            type: product.type,        // 枕頭型號作為商品編號
            stock: product.stock || 0,
            price: product.price,
            state: product.state
        }));
        
        console.log("[getPillowInventoryList] end, result count:", inventoryList.length);
        return inventoryList;
    } catch (error) {
        console.error("[getPillowInventoryList] error:", error);
        throw error;
    }
};

/**
 * 取得床墊商品庫存清單
 * @param {string} userId - 使用者ID
 * @returns {Promise<Array>} 庫存清單，包含 id, name, model, stock
 */
exports.getMattressInventoryList = async (userId) => {
    try {
        console.log("[getMattressInventoryList] start, userId:", userId);
        
        // 取得所有床墊商品
        let productMattressList = await ProductMattress.getAllProductMattressList();
        
        // 如果提供 userId，則只返回該用戶的商品
        if (userId) {
            productMattressList = productMattressList.filter(p => p.userId === userId);
        }
        
        // 只返回庫存相關欄位
        const inventoryList = productMattressList.map(product => ({
            id: product.id,
            name: product.name,
            model: product.model,      // 床墊型號作為商品編號
            stock: product.stock || 0,
            price: product.price,
            state: product.state
        }));
        
        console.log("[getMattressInventoryList] end, result count:", inventoryList.length);
        return inventoryList;
    } catch (error) {
        console.error("[getMattressInventoryList] error:", error);
        throw error;
    }
};

/**
 * 更新枕頭商品庫存
 * @param {string} productId - 商品ID
 * @param {number} stock - 新庫存數量
 * @returns {Promise<Object>} 更新後的商品資料
 */
exports.updatePillowStock = async (productId, stock) => {
    try {
        console.log("[updatePillowStock] start, productId:", productId, "stock:", stock);
        
        // 取得原商品資料
        const product = await ProductPillow.getProductPillow(productId);
        if (!product) {
            throw new Error('找不到此枕頭商品');
        }
        
        // 更新庫存
        product.stock = Number(stock) || 0;
        const result = await ProductPillow.updateProductPillow(product);
        
        console.log("[updatePillowStock] end, result:", result);
        return result;
    } catch (error) {
        console.error("[updatePillowStock] error:", error);
        throw error;
    }
};

/**
 * 更新床墊商品庫存
 * @param {string} productId - 商品ID
 * @param {number} stock - 新庫存數量
 * @returns {Promise<Object>} 更新後的商品資料
 */
exports.updateMattressStock = async (productId, stock) => {
    try {
        console.log("[updateMattressStock] start, productId:", productId, "stock:", stock);
        
        // 取得原商品資料
        const product = await ProductMattress.getProductMattress(productId);
        if (!product) {
            throw new Error('找不到此床墊商品');
        }
        
        // 更新庫存
        product.stock = Number(stock) || 0;
        const result = await ProductMattress.updateProductMattress(product);
        
        console.log("[updateMattressStock] end, result:", result);
        return result;
    } catch (error) {
        console.error("[updateMattressStock] error:", error);
        throw error;
    }
};
