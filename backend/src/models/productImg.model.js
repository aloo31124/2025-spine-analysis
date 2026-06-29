
const db = require('../firestore');

// 儲存圖片名稱
exports.saveProductImage = async (productId, originalName, storedName) => {
    const docRef = db.collection('ProductImg').doc();
    await docRef.set({
        productId,
        originalName,
        storedName
    });

    //return { id: docRef.id, productId, name: imageName };
    return { id: docRef.id, docRef };
};


exports.deleteProductImgAll = async () => {
    try {
        const snapshot = await db.collection('ProductImg').get();
        const batch = db.batch();
        snapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
        });

        await batch.commit();
        console.log('ProductImg 表資料已清空 ');
    } catch (error) {
        console.error(`[Delete Error] ${error}`);
        throw new Error('刪除商品圖片時發生錯誤');
    }
};

/* 刪除個別圖片 */
exports.deleteProductImg = async (productId, storedName) => {
    try {
        const productImgRef = db.collection('ProductImg');
        const snapshot = await productImgRef
            .where('productId', '==', productId)
            .where('storedName', '==', storedName)
            .get();

        if (snapshot.empty) {
            console.warn(`Firestore 無對應圖片資料: ${productId}/${storedName}`);
        } else {
            snapshot.forEach(doc => doc.ref.delete());
            console.log(`Firestore 資料刪除成功: ${productId}/${storedName}`);
        }
        return { success: true };
    } catch (error) {
        throw new Error(`刪除圖片失敗: ${error}`);
    }
};


