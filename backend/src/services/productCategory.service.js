/*
 * [服務層] 負責商品分類 db 資料增刪修查
 */
const db = require('../firestore');
const Fuse = require('fuse.js');
const ProdcutCategory = require('../models/productCategory.model');

/* 匯出所有商品列表 */
exports.exportAllProductCategoryList = async () => {
    return ProdcutCategory.getAllProductCategoryList();
}

/* 匯入 所有 商品 進入空表, 不卡控, 使用於備份還原。 */
exports.importAllProductCategory = async (categoryList) => {
    try {
        return await ProdcutCategory.importAllProdcutCategory(categoryList);
    } catch (error) {
        console.error("[importAllProductCategory] error :", error);
    }
}

/* 取得商品分類列表 */
exports.getProductCategoryList = async () => {
    try {
        return await ProdcutCategory.getProductCategoryList();
    } catch (error) {
        console.error("[getProductCategoryList] error :", error);
    }
}

/* 新增商品分類 */
exports.addProductCategory = async (productCategory) => {
    try {
        return await ProdcutCategory.addProductCategory(productCategory);
    } catch (error) {
        console.error("[addProductCategory] error :", error);
    }
}

/* 取得商品分類 */
exports.getProductCategory = async (id) => {
    try {
        return await ProdcutCategory.getProductCategory(id);
    } catch (error) {
        console.error("[getProductCategory] error :", error);
    }
}

/* 更新商品分類 */
exports.updateProductCategory = async (productCategory) => {
    try {
        return await ProdcutCategory.updateProductCategory(productCategory);
    } catch (error) {
        console.error("[updateProductCategory] error :", error);
    }
}

/* 刪除商品分類 */
exports.deleteProductCategory = async (id) => {
    try {
        return await ProdcutCategory.deleteProductCategory(id);
    } catch (error) {
        console.error("[deleteProductCategory] error :", error);
    }
}

/* 搜尋商品分類 */
exports.searchProductCategory = async (searchParam, pagingParam) => {
    try {
        return await ProdcutCategory.searchProductCategory(searchParam, pagingParam);
    } catch (error) {
        console.error("[searchProductCategory] error :", error);
    }
}
