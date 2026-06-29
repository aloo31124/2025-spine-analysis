const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');

// 檢查是否為 Windows 且是否有 C 槽
const isWindows = process.platform === 'win32';
const hasCDrive = isWindows && fs.existsSync('C:/');

// 設定基礎存儲路徑
const BASE_UPLOAD_DIR = hasCDrive ? 'C:/shopStorage/product/' : 'shopStorage/product/';

// 确保目标目录存在
// fs.ensureDirSync(BASE_UPLOAD_DIR);

/* 取得商品圖片基礎路徑 */
exports.getProductImgBasePath = () => {
    return BASE_UPLOAD_DIR.toString();
};

/**
 * 設定 Multer 存儲與檔案命名方式，讓 productId 納入路徑
 */
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const productId = req.params.id || req.body.productId;
        if (!productId) {
            return cb(new Error('缺少 productId'));
        }

        const uploadPath = path.join(BASE_UPLOAD_DIR, productId);
        fs.ensureDirSync(uploadPath); // 確保目錄存在
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}${path.extname(file.originalname)}`);
    }
});

/**
 * 設定 Multer 限制：
 * - 檔案大小限制 5MB
 * - 允許的格式：JPG、PNG
 */
const uploadMulter = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 限制 5MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png'];
        if (!allowedTypes.includes(file.mimetype)) {
            return cb(new Error('檔案格式錯誤，僅支援 JPG/PNG'));
        }
        cb(null, true);
    }
});

/**
 * 上傳 Middleware（最多 10 張圖片）
 */
exports.uploadMiddleware = uploadMulter.array('files', 10);

/**
 * 回傳上傳後的圖片資訊
 */
exports.handleUpload = (req, productId) => {
    if (!req.files || req.files.length === 0) {
        throw new Error('未找到任何上傳檔案');
    }

    const productIdParam = productId || req.params.id || req.body.productId;
    if (!productIdParam) {
        throw new Error('缺少 productId');
    }

    return req.files.map(file => ({
        originalName: file.originalname,
        //originalname: Buffer.from(file.originalname, 'latin1').toString('utf8'),
        storedName: file.filename,
        path: `/uploads/product/${productIdParam}/${file.filename}` // 可用於提供 URL
    }));
};
