/*
 * [控制層] 枕頭商品處理
 *  - 枕頭商品列表搜尋分頁
 *  - 枕頭商品詳細資訊
 *  - 枕頭商品新增、更新、刪除
 */

const productPillowService = require('../../services/productPillow.service');
const authService = require('../../services/auth.service');

const ERROR_HEADER = "[productPillow.api.controller.js]";

/* 取得枕頭商品列表 */
exports.getProductPillowList = async (req, res) => {
    try {
        console.log("[getProductPillowList] start ");
        const { searchParam, pagingParam } = req.body;
        const payload = authService.verifyJwt(req);
        const result = await productPillowService.searchProductPillow(searchParam || {}, pagingParam || {}, payload?.userId);
        res.status(200).json({ result });
    } catch (error) {
        console.error("[getProductPillowList] error :", error);
        res.status(500).json({ result: error.message });
    }
};

/* 新增枕頭商品 */
exports.postProductPillow = async (req, res) => {
    console.log("[postProductPillow] start : request =", req.body);
    try {
        const payload = authService.verifyJwt(req);
        const newProductPillow = await productPillowService.addProductPillow({ 
            userId: payload.userId, 
            ...req.body.newProductPillow 
        });
        console.log(" newProductPillow : ", newProductPillow);
        res.status(200).json({ result: '200', newProductPillow });
    } catch (error) {
        console.error("[postProductPillow] error :", error);
        res.status(500).json({ result: '500', error: error.message });
    }
};

/* 取得枕頭商品 */
exports.getProductPillow = async (req, res) => {
    console.log("[getProductPillow] start : productPillowId =", req.params.id);
    try {
        const productPillow = await productPillowService.getProductPillow(req.params.id);
        res.status(200).json({ result: '200', productPillow });
    } catch (error) {
        console.error("[getProductPillow] error :", error);
        res.status(500).json({ result: '500', error: error.message });
    }
};

/* 更新枕頭商品 */
exports.updateProductPillow = async (req, res) => {
    console.log("[updateProductPillow] start : updateData =", req.body.updateProductPillow);
    try {
        const updatedProductPillow = await productPillowService.updateProductPillow(req.body.updateProductPillow);
        res.status(200).json({ result: '200', updatedProductPillow });
    } catch (error) {
        console.error("[updateProductPillow] error :", error);
        res.status(500).json({ result: '500', error: error.message });
    }
};

/* 刪除枕頭商品 */
exports.deleteProductPillow = async (req, res) => {
    console.log("[deleteProductPillow] start : productPillowId =", req.params.id);
    try {
        await productPillowService.deleteProductPillow(req.params.id);
        res.status(200).json({ result: '200', message: '枕頭商品刪除成功' });
    } catch (error) {
        console.error("[deleteProductPillow] error :", error);
        res.status(500).json({ result: '500', error: error.message });
    }
};

/* 搜尋枕頭商品 */
exports.searchProductPillow = async (req, res) => {
    console.log("[searchProductPillow] start : searchParam =", req.body.searchParam, "pagingParam =", req.body.pagingParam);
    try {
        const payload = authService.verifyJwt(req);
        const searchResult = await productPillowService.searchProductPillow(
            req.body.searchParam || {}, 
            req.body.pagingParam || {},
            payload?.userId
        );
        res.status(200).json({ result: '200', searchResult });
    } catch (error) {
        console.error("[searchProductPillow] error :", error);
        res.status(500).json({ result: '500', error: error.message });
    }
};

/* 匯入枕頭商品 */
exports.importProductPillow = async (req, res) => {
    console.log("[importProductPillow] start : productPillowList =", req.body.productPillowList);
    try {
        const importResult = await productPillowService.importProductPillow(req.body.productPillowList);
        res.status(200).json({ result: '200', importResult });
    } catch (error) {
        console.error("[importProductPillow] error :", error);
        res.status(500).json({ result: '500', error: error.message });
    }
};
