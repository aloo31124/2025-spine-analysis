/*
 * [service層] 負責客戶購買床墊商品關聯業務邏輯
 * 參考 customerToProductPillow.service.js
 */

const CustomerToProductMattress = require('../models/customerToProductMattress.model');
const ProductMattress = require('../models/productMattress.model');

/* 取得所有客戶購買床墊商品紀錄 */
exports.getAllCustomerToProductMattressList = async () => {
    return CustomerToProductMattress.getAllCustomerToProductMattressList();
}

/* 新增客戶購買床墊商品紀錄 */
exports.addCustomerToProductMattress = async (customerToProductMattress) => {
    return CustomerToProductMattress.addCustomerToProductMattress(customerToProductMattress);
}

/* 批量新增客戶購買床墊商品紀錄 */
exports.addMultipleCustomerToProductMattress = async (customerToProductMattressList) => {
    return CustomerToProductMattress.addMultipleCustomerToProductMattress(customerToProductMattressList);
}

/* 取得特定客戶購買床墊商品紀錄 */
exports.getCustomerToProductMattress = async (id) => {
    return CustomerToProductMattress.getCustomerToProductMattress(id);
}

/* 根據客戶ID取得購買床墊商品紀錄，並帶入床墊商品詳細資料 */
exports.getCustomerToProductMattressByCustomerId = async (customerId) => {
    const purchaseRecords = await CustomerToProductMattress.getCustomerToProductMattressByCustomerId(customerId);
    
    // 串接床墊商品詳細資料
    const recordsWithProduct = await Promise.all(purchaseRecords.map(async (record) => {
        const productMattress = await ProductMattress.getProductMattress(record.productMattressId);
        return {
            ...record,
            productMattress: productMattress || null
        };
    }));
    
    return recordsWithProduct;
}

/* 根據床墊商品ID取得購買紀錄 */
exports.getCustomerToProductMattressByProductMattressId = async (productMattressId) => {
    return CustomerToProductMattress.getCustomerToProductMattressByProductMattressId(productMattressId);
}

/* 更新客戶購買床墊商品紀錄 */
exports.updateCustomerToProductMattress = async (customerToProductMattress) => {
    return CustomerToProductMattress.updateCustomerToProductMattress(customerToProductMattress);
}

/* 刪除客戶購買床墊商品紀錄 */
exports.deleteCustomerToProductMattress = async (id) => {
    return CustomerToProductMattress.deleteCustomerToProductMattress(id);
}

/* 搜尋客戶購買床墊商品紀錄 */
exports.searchCustomerToProductMattress = async (searchParam, pagingParam) => {
    return CustomerToProductMattress.searchCustomerToProductMattress(searchParam, pagingParam);
}

/* 取得客戶購買床墊商品統計 */
exports.getCustomerPurchaseStats = async (customerId) => {
    return CustomerToProductMattress.getCustomerPurchaseStats(customerId);
}
