const { getStorage } = require('firebase-admin/storage');

const bucket = getStorage().bucket();

/* 上傳單張圖片到 Firebase */
exports.uploadFile = async (file, productId) => {
    if (!file) throw new Error('沒有找到要上傳的文件');
    if (!productId) throw new Error('缺少 productId');

    const fileName = `${productId}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}${file.originalname}`;
    const fileUpload = bucket.file(fileName);

    const stream = fileUpload.createWriteStream({
        metadata: { contentType: file.mimetype }
    });

    return new Promise((resolve, reject) => {
        stream.on('error', reject);
        stream.on('finish', async () => {
            await fileUpload.makePublic();
            //fileUpload.publicUrl();
            resolve(`https://storage.googleapis.com/${bucket.name}/${fileName}`);
        });
        stream.end(file.buffer);
    });
};

/* 取得商品所有圖片列表 */ 
exports.getProductImgList = async (productId) => {
    if (!productId) throw new Error('缺少 productId');
    
    const [files] = await bucket.getFiles({ prefix: `${productId}/` });
    return files.map(file => {
        console.log(`[getProductImgList] file.publicUrl(): ${file.publicUrl()}`);
        return {
            productId,
            storageName: file.name.replace(`${productId}/`, ``), // storageName 多出 productId, 將其移除, 不知何時修改規則 ="=
            //imgUrl : `https://storage.googleapis.com/${bucket.name}/${file.name}`
            imgUrl: file.publicUrl()
        }
    });
};

/* 刪除所有商品圖片 */
exports.deleteProductImgAll = async () => {
    const [files] = await bucket.getFiles();
    await Promise.all(files.map(file => file.delete()));
};

/* 刪除特定商品圖片 */
exports.deleteProductImg = async (productId, storedName) => {
    if (!productId || !storedName) throw new Error('缺少 productId 或 storedName');

    const filePath = `${productId}/${storedName}`;
    const file = bucket.file(filePath);
    await file.delete();
};
