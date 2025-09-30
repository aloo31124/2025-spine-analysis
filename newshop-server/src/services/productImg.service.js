

const fs = require('fs-extra');
const path = require('path');
const productImgModel = require('../models/productImg.model');
const upload = require('../utils/upload');
const IMAGE_BASE_URL = 'http://localhost:8081/api/manager/product/img';

exports.getProductImgList = async (productId) => {
    try {
        const productDir = path.join(upload.getProductImgBasePath() , productId);

        // 檢查目錄是否存在
        if (!fs.existsSync(productDir)) {
            return [];
        }

        // 讀取目錄下的所有檔案
        const files = fs.readdirSync(productDir);

        // 過濾只包含圖片 (jpg, png, jpeg)
        const imageFiles = files.filter(file => /\.(jpg|jpeg|png)$/i.test(file));

        // 產生完整圖片 URL
        return imageFiles.map(storedName => {
            return {
                    productId,
                    storedName,
                    imgUrl: `${IMAGE_BASE_URL}/${productId}/${storedName}`
                }
        });
    } catch (error) {
        throw new Error(`無法取得圖片列表: ${error}`);
    }
};


exports.uploadFile = async (req, productId) => {
    try {
        // 取得上傳後的圖片資訊
        const uploadedFiles = upload.handleUpload(req, productId);

        // 將檔案名稱存入 Firestore (ProductImg 表)
        const savedFiles = await Promise.all(
            uploadedFiles.map(async (file) => {
                return await productImgModel.saveProductImage(productId, file.originalName, file.storedName);
            })
        );

        return { success: true, uploadedFiles: savedFiles };
    } catch (error) {
        throw new Error(`檔案上傳失敗: ${error}`);
    }
};


exports.deleteProductImgAll = async () => {
    try {
        // ** 刪除 product 資料夾下所有圖片**
        if (fs.existsSync(upload.getProductImgBasePath())) {
            await fs.emptyDir(upload.getProductImgBasePath()); // 清空資料夾
            console.log('商品圖片資料夾已清空');
        }

        productImgModel.deleteProductImgAll();
    } catch (error) {
        console.error(`[Delete Error] ${error}`);
        throw new Error('刪除商品圖片時發生錯誤');
    }
};

/* 刪除個別圖片 */
exports.deleteProductImg = async (productId, storedName) => {
    try {
        const imagePath = path.join(upload.getProductImgBasePath(), productId, storedName);

        // 刪除本地端圖片**
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
            console.log(`圖片刪除成功: ${imagePath}`);
        } else {
            console.warn(`圖片不存在: ${imagePath}`);
        }

        productImgModel.deleteProductImg(productId, storedName);

        return { success: true };
    } catch (error) {
        throw new Error(`刪除圖片失敗: ${error}`);
    }
};

/* 移動圖片路徑 */
//exports.changeProductImgPath = async (oldPath, newPath) => {}

/* 移動圖片路徑 */
exports.changeProductImgPath = async (oldPath, newPath) => {
    console.log("[changeProductImgPath] start : oldPath =", oldPath, ", newPath =", newPath);

    try {
        // 确保目标文件夹存在
        const targetDir = path.join(upload.getProductImgBasePath(), newPath);
        await fs.ensureDir(targetDir);

        // 获取旧路径中的所有图片
        const oldDir = path.join(upload.getProductImgBasePath(), oldPath);
        const files = await fs.readdir(oldDir);

        if (files.length === 0) {
            console.warn(`[changeProductImgPath] Warning: No images found in ${oldDir}`);
            return;
        }

        // 移动每个图片到新路径
        for (const file of files) {
            const oldFilePath = path.join(oldDir, file);
            const newFilePath = path.join(targetDir, file);
            await fs.move(oldFilePath, newFilePath, { overwrite: true });
            console.log(`[changeProductImgPath] Moved: ${oldFilePath} -> ${newFilePath}`);
        }

        // 移除旧的文件夹
        await fs.remove(oldDir);
        console.log(`[changeProductImgPath] Removed old directory: ${oldDir}`);
    } catch (error) {
        console.error("[changeProductImgPath] error :", error);
    }
};

