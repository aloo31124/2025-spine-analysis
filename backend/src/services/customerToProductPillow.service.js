/*
 * [service層] 負責客戶購買枕頭商品關聯業務邏輯
 * 獨立於 customerToProduct.service.js
 */

const CustomerToProductPillow = require('../models/customerToProductPillow.model');
const ProductPillow = require('../models/productPillow.model');

/* 取得所有客戶購買枕頭商品紀錄 */
exports.getAllCustomerToProductPillowList = async () => {
    return CustomerToProductPillow.getAllCustomerToProductPillowList();
}

/* 新增客戶購買枕頭商品紀錄 */
exports.addCustomerToProductPillow = async (customerToProductPillow) => {
    return CustomerToProductPillow.addCustomerToProductPillow(customerToProductPillow);
}

/* 批量新增客戶購買枕頭商品紀錄 */
exports.addMultipleCustomerToProductPillow = async (customerToProductPillowList) => {
    return CustomerToProductPillow.addMultipleCustomerToProductPillow(customerToProductPillowList);
}

/* 取得特定客戶購買枕頭商品紀錄 */
exports.getCustomerToProductPillow = async (id) => {
    return CustomerToProductPillow.getCustomerToProductPillow(id);
}

/* 根據客戶ID取得購買枕頭商品紀錄，並帶入枕頭商品詳細資料 */
exports.getCustomerToProductPillowByCustomerId = async (customerId) => {
    const purchaseRecords = await CustomerToProductPillow.getCustomerToProductPillowByCustomerId(customerId);
    
    // 串接枕頭商品詳細資料
    const recordsWithProduct = await Promise.all(purchaseRecords.map(async (record) => {
        const productPillow = await ProductPillow.getProductPillow(record.productPillowId);
        return {
            ...record,
            productPillow: productPillow || null
        };
    }));
    
    return recordsWithProduct;
}

/* 根據枕頭商品ID取得購買紀錄 */
exports.getCustomerToProductPillowByProductPillowId = async (productPillowId) => {
    return CustomerToProductPillow.getCustomerToProductPillowByProductPillowId(productPillowId);
}

/* 更新客戶購買枕頭商品紀錄 */
exports.updateCustomerToProductPillow = async (customerToProductPillow) => {
    return CustomerToProductPillow.updateCustomerToProductPillow(customerToProductPillow);
}

/* 刪除客戶購買枕頭商品紀錄 */
exports.deleteCustomerToProductPillow = async (id) => {
    return CustomerToProductPillow.deleteCustomerToProductPillow(id);
}

/* 搜尋客戶購買枕頭商品紀錄 */
exports.searchCustomerToProductPillow = async (searchParam, pagingParam) => {
    return CustomerToProductPillow.searchCustomerToProductPillow(searchParam, pagingParam);
}

/* 取得客戶購買枕頭商品統計 */
exports.getCustomerPurchaseStats = async (customerId) => {
    return CustomerToProductPillow.getCustomerPurchaseStats(customerId);
}
