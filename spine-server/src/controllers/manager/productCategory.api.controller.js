/*
 * [控制層] 商品種類處理
 *  - 商品種類列表
 *  - 商品種類詳細資訊
 *  - 商品種類新增、更新、刪除、搜尋
 */

const productCategoryService = require('../../services/productCategory.service');

const ERROR_HEADER = "[productCategory.api.controller.js]";

/* 取得商品種類列表 */
exports.getProductCategoryList = async (req, res) => {
    console.log("[getProductCategoryList] start : request =", req.query);
    try {
        const result = await productCategoryService.getProductCategoryList();
        res.status(200).json({ result });
    } catch (error) {
        console.error("[getProductCategoryList] error :", error);
        res.status(200).json({ result: error.message });
    }
};

/* 新增商品種類 */
exports.addProductCategory = async (req, res) => {
    console.log("[addProductCategory] start : request =", req.body);
    try {
        const newProductCategory = await productCategoryService.addProductCategory(req.body.newProductCategory);
        res.status(200).json({ result: '200', newProductCategory });
    } catch (error) {
        console.error("[addProductCategory] error :", error);
        res.status(500).json({ result: '500', error: error.message });
    }
};

/* 取得商品種類 */
exports.getProductCategory = async (req, res) => {
    console.log("[getProductCategory] start : categoryId =", req.params.id);
    try {
        const productCategory = await productCategoryService.getProductCategory(req.params.id);
        res.status(200).json({ result: '200', productCategory });
    } catch (error) {
        console.error("[getProductCategory] error :", error);
        res.status(500).json({ result: '500', error: error.message });
    }
};

/* 更新商品種類 */
exports.updateProductCategory = async (req, res) => {
    console.log("[updateProductCategory] start : updateData =", req.body.updateProductCategory);
    try {
        const updatedCategory = await productCategoryService.updateProductCategory(req.body.updateProductCategory);
        res.status(200).json({ result: '200', updatedCategory });
    } catch (error) {
        console.error("[updateProductCategory] error :", error);
        res.status(500).json({ result: '500', error: error.message });
    }
};

/* 刪除商品種類 */
exports.deleteProductCategory = async (req, res) => {
    console.log("[deleteProductCategory] start : categoryId =", req.params.id);
    try {
        await productCategoryService.deleteProductCategory(req.params.id);
        res.status(200).json({ result: '200', message: '商品種類刪除成功' });
    } catch (error) {
        console.error("[deleteProductCategory] error :", error);
        res.status(500).json({ result: '500', error: error.message });
    }
};

/* 搜尋商品種類 */
exports.searchProductCategory = async (req, res) => {
    console.log("[searchProductCategory] start : searchParam =", req.body.searchParam);
    try {
        const searchResult = await productCategoryService.searchProductCategory(req.body.searchParam);
        res.status(200).json({ result: '200', searchResult });
    } catch (error) {
        console.error("[searchProductCategory] error :", error);
        res.status(500).json({ result: '500', error: error.message });
    }
};
