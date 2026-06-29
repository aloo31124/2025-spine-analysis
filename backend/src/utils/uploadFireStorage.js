const multer = require('multer');
const { getStorage } = require('firebase-admin/storage');
const path = require('path');

// 初始化 Firebase
/*
const admin = require('firebase-admin');
const serviceAccount = require('../firestroekey.json'); // 确保 JSON 文件路径正确
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "gs://newshop-e45ca.firebasestorage.app" // 你的 Firebase Storage Bucket
});
*/
const bucket = getStorage().bucket();

// Multer 配置（使用内存存储，避免在服务器磁盘上存放）
const upload = multer({ storage: multer.memoryStorage() });

/**
 * 上傳 Middleware（最多 10 張圖片）
 */
exports.uploadMiddleware = upload.array('files', 10);

/**
 * 上傳檔案到 Firebase Storage
 */
exports.uploadToFirebase = async (file, productId) => {
    if (!file) throw new Error('沒有找到要上傳的文件');
    if (!productId) throw new Error('缺少 productId');

    const fileExt = path.extname(file.originalname);
    const fileName = `${productId}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}${fileExt}`;
    const fileUpload = bucket.file(fileName);

    const stream = fileUpload.createWriteStream({
        metadata: {
            contentType: file.mimetype
        }
    });

    return new Promise((resolve, reject) => {
        stream.on('error', (error) => reject(error));
        stream.on('finish', async () => {
            await fileUpload.makePublic(); // 讓該圖片公開
            resolve(`https://storage.googleapis.com/${bucket.name}/${fileName}`);
        });
        stream.end(file.buffer);
    });
};
