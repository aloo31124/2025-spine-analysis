const productImgService = require('../../services/productImgFireStorage.service');

/* 批次上傳商品圖片 */
exports.uploadFile = async (req, res) => {
    console.log("[uploadFile] start : productId =", req.params.id, "files =", req.files);
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ result: '400', error: '沒有找到任何上傳文件' });
        }

        const uploadedUrls = await Promise.all(
            req.files.map(file => productImgService.uploadFile(file, req.params.id))
        );

        res.status(200).json({ result: '200', files: uploadedUrls });
    } catch (error) {
        console.error("[uploadFile] error :", error);
        res.status(500).json({ result: '500', error: error.message });
    }
};

/* 取得所有商品圖片 URL */
exports.getProductImgList = async (req, res) => {
    console.log("[getProductImgList] start : productId =", req.params.id);
    try {
        const imageList = await productImgService.getProductImgList(req.params.id);
        console.log(`[getProductImgList] imageList : ${imageList}`);
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
        await productImgService.deleteProductImg(req.params.productId, req.params.storedName);
        res.status(200).json({ result: '200', message: '圖片刪除成功' });
    } catch (error) {
        console.error("[deleteProductImg] error :", error);
        res.status(500).json({ result: '500', error: error.message });
    }
};
