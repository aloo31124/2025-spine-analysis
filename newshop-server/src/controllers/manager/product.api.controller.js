/*
 * [控制層] 商品處理
 *  - 商品列表搜尋分頁
 *  - 商品詳細資訊
 *  - 商品新增、更新、刪除
 */

const productService = require('../../services/product.service');
const productImgService = require('../../services/productImg.service')
const authService = require('../../services/auth.service');

const ERROR_HEADER = "[product.api.controller.js]";

/* 取得商品列表 */
exports.getProductList = async (req, res) => {
    try {
        console.log("[getProductList] start ");
        const {searchParam, pagingParam} = req.body;
        const result = await productService.searchProductJoinCategoryPromotion(searchParam, pagingParam);
        res.status(200).json({ result });
    } catch (error) {
        console.error("[getProductList] error :", error);
        res.status(500).json({ result: error.message });
    }
};

/* 新增商品 */
exports.postProduct = async (req, res) => {
    console.log("[postProduct] start : request =", req.body);
    try {
        const payload = authService.verifyJwt(req);
        const tempId = req.body.newProduct.tempId;
        const newProduct = await productService.addProduct({ userId: payload.userId, ...req.body.newProduct });
        console.log(" newProduct, tempId : ", newProduct, tempId);
        await productImgService.changeProductImgPath(tempId, newProduct.id);
        res.status(200).json({ result: '200', newProduct });
    } catch (error) {
        console.error("[postProduct] error :", error);
        res.status(500).json({ result: '500', error: error.message });
    }
};

/* 取得商品 */
exports.getProduct = async (req, res) => {
    console.log("[getProduct] start : productId =", req.params.id);
    try {
        const product = await productService.getProduct(req.params.id);
        res.status(200).json({ result: '200', product });
    } catch (error) {
        console.error("[getProduct] error :", error);
        res.status(500).json({ result: '500', error: error.message });
    }
};

/* 更新商品 */
exports.updateProduct = async (req, res) => {
    console.log("[updateProduct] start : updateData =", req.body.updateProduct);
    try {
        const updatedProduct = await productService.updateProduct(req.body.updateProduct);
        res.status(200).json({ result: '200', updatedProduct });
    } catch (error) {
        console.error("[updateProduct] error :", error);
        res.status(500).json({ result: '500', error: error.message });
    }
};

/* 刪除商品 */
exports.deleteProduct = async (req, res) => {
    console.log("[deleteProduct] start : productId =", req.params.id);
    try {
        await productService.deleteProduct(req.params.id);
        res.status(200).json({ result: '200', message: '商品刪除成功' });
    } catch (error) {
        console.error("[deleteProduct] error :", error);
        res.status(500).json({ result: '500', error: error.message });
    }
};

/* 搜尋商品 */
exports.searchProduct = async (req, res) => {
    console.log("[searchProduct] start : searchParam =", req.body.searchParam, "pagingParam =", req.body.pagingParam);
    try {
        const searchResult = await productService.searchProductJoinCategoryPromotion(req.body.searchParam, req.body.pagingParam);
        res.status(200).json({ result: '200', searchResult });
    } catch (error) {
        console.error("[searchProduct] error :", error);
        res.status(500).json({ result: '500', error: error.message });
    }
};

/* 匯入商品 */
exports.importProduct = async (req, res) => {
    console.log("[importProduct] start : productList =", req.body.productList);
    try {
        const importResult = await productService.importProduct(req.body.productList);
        res.status(200).json({ result: '200', importResult });
    } catch (error) {
        console.error("[importProduct] error :", error);
        res.status(500).json({ result: '500', error: error.message });
    }
};
