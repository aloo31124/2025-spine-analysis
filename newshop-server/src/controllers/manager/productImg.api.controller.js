/*
 * [控制層] 商品處理圖片
 *  - 圖片上傳、刪除
 *  - 圖片靜態檔取得
 */

const productImgService = require('../../services/productImg.service');

/* 批次上傳商品圖片 */
exports.uploadFile = async (req, res) => {
    console.log("[uploadFile] start : productId =", req.params.id, "files =", req.files);
    try {
        const result = await productImgService.uploadFile(req, req.params.id);
        res.status(200).json({ result: '200', files: result });
    } catch (error) {
        console.error("[uploadFile] error :", error);
        res.status(500).json({ result: '500', error: error.message });
    }
};

/* 取得所有商品圖片 URL */
exports.getProductImgList = async (req, res) => {
    console.log("[getProductImgList] start : productId =", req.params.id);
    try {
        const productId = req.params.id;
        if (!productId) {
            return res.status(400).json({ result: '400', error: '缺少 productId' });
        }
        const imageList = await productImgService.getProductImgList(productId);
        res.status(200).json({ result: '200', imageList });
    } catch (error) {
        console.error("[getProductImgList] error :", error);
        res.status(500).json({ result: '500', error: error.message });
    }
};

/* 刪除所有商品圖片 */
exports.deleteProductImgAll = async (req, res) => {
    console.log("[deleteProductImgAll] start");
    try {
        await productImgService.deleteProductImgAll();
        res.status(200).json({ result: '200', message: '所有商品圖片已刪除' });
    } catch (error) {
        console.error("[deleteProductImgAll] error :", error);
        res.status(500).json({ result: '500', error: error.message });
    }
};

/* 刪除個別圖片 */
exports.deleteProductImg = async (req, res) => {
    console.log("[deleteProductImg] start : productId =", req.params.productId, "storedName =", req.params.storedName);
    try {
        const { productId, storedName } = req.params;
        if (!productId || !storedName) {
            return res.status(400).json({ result: '400', error: '缺少 productId 或 storedName' });
        }
        await productImgService.deleteProductImg(productId, storedName);
        res.status(200).json({ result: '200', message: '圖片刪除成功' });
    } catch (error) {
        console.error("[deleteProductImg] error :", error);
        res.status(500).json({ result: '500', error: error.message });
    }
};

