/*
 * [控制層] 床墊商品處理
 *  - 床墊商品列表搜尋分頁
 *  - 床墊商品詳細資訊
 *  - 床墊商品新增、更新、刪除
 */

const productMattressService = require('../../services/productMattress.service');
const authService = require('../../services/auth.service');

const ERROR_HEADER = "[productMattress.api.controller.js]";

/* 取得床墊商品列表 */
exports.getProductMattressList = async (req, res) => {
    try {
        console.log("[getProductMattressList] start ");
        const { searchParam, pagingParam } = req.body;
        const payload = authService.verifyJwt(req);
        const result = await productMattressService.searchProductMattress(searchParam || {}, pagingParam || {}, payload?.userId);
        res.status(200).json({ result });
    } catch (error) {
        console.error("[getProductMattressList] error :", error);
        res.status(500).json({ result: error.message });
    }
};

/* 新增床墊商品 */
exports.postProductMattress = async (req, res) => {
    console.log("[postProductMattress] start : request =", req.body);
    try {
        const payload = authService.verifyJwt(req);
        const newProductMattress = await productMattressService.addProductMattress({ 
            userId: payload.userId, 
            ...req.body.newProductMattress 
        });
        console.log(" newProductMattress : ", newProductMattress);
        res.status(200).json({ result: '200', newProductMattress });
    } catch (error) {
        console.error("[postProductMattress] error :", error);
        res.status(500).json({ result: '500', error: error.message });
    }
};

/* 取得床墊商品 */
exports.getProductMattress = async (req, res) => {
    console.log("[getProductMattress] start : productMattressId =", req.params.id);
    try {
        const productMattress = await productMattressService.getProductMattress(req.params.id);
        res.status(200).json({ result: '200', productMattress });
    } catch (error) {
        console.error("[getProductMattress] error :", error);
        res.status(500).json({ result: '500', error: error.message });
    }
};

/* 更新床墊商品 */
exports.updateProductMattress = async (req, res) => {
    console.log("[updateProductMattress] start : updateData =", req.body.updateProductMattress);
    try {
        const payload = authService.verifyJwt(req);
        const updatedProductMattress = await productMattressService.updateProductMattress(
            req.body.updateProductMattress,
            payload.userId
        );
        res.status(200).json({ result: '200', updatedProductMattress });
    } catch (error) {
        console.error("[updateProductMattress] error :", error);
        
        // 處理版本衝突錯誤（樂觀鎖）
        if (error.code === 'VERSION_CONFLICT') {
            res.status(409).json({ 
                result: '409', 
                error: error.message,
                latestProduct: error.latestProduct
            });
            return;
        }
        
        res.status(500).json({ result: '500', error: error.message });
    }
};

/* 刪除床墊商品 */
exports.deleteProductMattress = async (req, res) => {
    console.log("[deleteProductMattress] start : productMattressId =", req.params.id);
    try {
        const payload = authService.verifyJwt(req);
        await productMattressService.deleteProductMattress(req.params.id, payload.userId);
        res.status(200).json({ result: '200', message: '床墊商品刪除成功' });
    } catch (error) {
        console.error("[deleteProductMattress] error :", error);
        
        // 處理操作員無刪除權限錯誤
        if (error.code === 'OPERATOR_CANNOT_DELETE') {
            res.status(403).json({ 
                result: '403', 
                error: error.message
            });
            return;
        }
        
        res.status(500).json({ result: '500', error: error.message });
    }
};

/* 搜尋床墊商品 */
exports.searchProductMattress = async (req, res) => {
    console.log("[searchProductMattress] start : searchParam =", req.body.searchParam, "pagingParam =", req.body.pagingParam);
    try {
        const payload = authService.verifyJwt(req);
        const searchResult = await productMattressService.searchProductMattress(
            req.body.searchParam || {}, 
            req.body.pagingParam || {},
            payload?.userId
        );
        res.status(200).json({ result: '200', searchResult });
    } catch (error) {
        console.error("[searchProductMattress] error :", error);
        res.status(500).json({ result: '500', error: error.message });
    }
};

/* 匯入床墊商品 */
exports.importProductMattress = async (req, res) => {
    console.log("[importProductMattress] start : productMattressList =", req.body.productMattressList);
    try {
        const importResult = await productMattressService.importProductMattress(req.body.productMattressList);
        res.status(200).json({ result: '200', importResult });
    } catch (error) {
        console.error("[importProductMattress] error :", error);
        res.status(500).json({ result: '500', error: error.message });
    }
};
