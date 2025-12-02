/*
 * [model層] 負責枕頭商品 db 資料增刪修查
 * 獨立於 product.model.js，不繼承 Product
 */

const db = require('../firestore');
const Fuse = require('fuse.js');
const COLLECTION_NAME = 'ProductPillow';


class ProductPillow {
    constructor(id, name, price, state, type, userId, shortHeight, longHeight, shortCurvature, mediumCurvature, longCurvature) {
        this.id = id || "";
        this.name = name || "";
        this.price = price || "";
        this.state = state || "";
        this.type = type || "";
        this.userId = userId || "";
        this.shortHeight = shortHeight || 0;       // 短高度
        this.longHeight = longHeight || 0;         // 長高度
        this.shortCurvature = shortCurvature || 0; // 短弧度
        this.mediumCurvature = mediumCurvature || 0; // 中弧度
        this.longCurvature = longCurvature || 0;   // 長弧度
    }

    /** 匯入 所有 枕頭商品資訊 進入空表, 不卡控, 使用於備份還原。 */
    static async importAllProductPillow(productPillowList) {
        try {
            // 檢查表是否已存在資料
            const snapshot = await db.collection(COLLECTION_NAME).limit(1).get();
            if (!snapshot.empty) {
                console.log('[importAllProductPillow]: 表已存在資料，匯入中止。');
                return { message: '表已存在資料，匯入中止。' };
            }

            // 表無資料，開始匯入
            const batch = db.batch();
            productPillowList.forEach(productPillowData => {
                const productPillow = new ProductPillow(
                    productPillowData.id || "",
                    productPillowData.name || "",
                    productPillowData.price || "",
                    productPillowData.state || "",
                    productPillowData.type || "",
                    productPillowData.userId || "",
                    productPillowData.shortHeight || 0,
                    productPillowData.longHeight || 0,
                    productPillowData.shortCurvature || 0,
                    productPillowData.mediumCurvature || 0,
                    productPillowData.longCurvature || 0,
                );
                const docRef = db.collection(COLLECTION_NAME).doc(productPillow.id.toString().replace(/"/g, ''));
                batch.set(docRef, {
                    name: (productPillow.name?.toString() || "").replace(/"/g, ''),
                    price: (productPillow.price?.toString() || "").replace(/"/g, ''),
                    state: (productPillow.state?.toString() || "").replace(/"/g, ''),
                    type: (productPillow.type?.toString() || "").replace(/"/g, ''),
                    userId: (productPillow.userId?.toString() || "").replace(/"/g, ''),
                    shortHeight: productPillow.shortHeight || 0,
                    longHeight: productPillow.longHeight || 0,
                    shortCurvature: productPillow.shortCurvature || 0,
                    mediumCurvature: productPillow.mediumCurvature || 0,
                    longCurvature: productPillow.longCurvature || 0,
                });
            });

            await batch.commit();
            console.log('[importAllProductPillow]: 資料匯入成功。');
            return { message: '資料匯入成功。' };
        } catch (error) {
            console.error('[importAllProductPillow] error:', error);
            throw error;
        }
    }

    /* 取得 枕頭商品資訊 列表 */
    static async getAllProductPillowList() {
        const snapshot = await db.collection(COLLECTION_NAME).get();
        const productPillowList = [];
        snapshot.forEach(doc => {
            productPillowList.push({ id: doc.id, ...doc.data() });
        });
        return productPillowList;
    }

    /* 新增枕頭商品 */
    static async addProductPillow(productPillow) {
        const docRef = await db.collection(COLLECTION_NAME).add(productPillow);
        const docSnapshot = await docRef.get();
        console.log("新增枕頭商品 : ", { id: docRef.id, ...docSnapshot.data() });
        return ({ id: docRef.id, ...docSnapshot.data() })
    }

    /* 取得枕頭商品 */
    static async getProductPillow(id) {
        const doc = await db.collection(COLLECTION_NAME).doc(id).get();
        if (!doc.exists) {
            console.log('找無此枕頭商品');
            return null;
        }
        console.log("取得枕頭商品 : ", { id: doc.id, ...doc.data() });
        return { id: doc.id, ...doc.data() };
    }

    /* 更新枕頭商品 */
    static async updateProductPillow(productPillow) {
        const docRef = db.collection(COLLECTION_NAME).doc(productPillow.id);
        await docRef.update(productPillow);
        console.log("更新枕頭商品 : ", productPillow);
        return productPillow;
    }

    /* 刪除枕頭商品 */
    static async deleteProductPillow(id) {
        const docRef = db.collection(COLLECTION_NAME).doc(id);
        await docRef.delete();
        console.log("刪除枕頭商品 : ", id);
        return id;
    }

    /* 搜尋枕頭商品 */
    static async searchProductPillow(searchParam, pagingParam) {
        const { name, state, createDate, type, priceMin, priceMax, shortHeightMin, shortHeightMax, longHeightMin, longHeightMax } = searchParam;
        let { pageIndex, pageSize, sort, pageTotal, dataTotal } = pagingParam; // 分頁參數
        let query = db.collection(COLLECTION_NAME);
        const snapshot = await query.get();
        let productPillowList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // 使用 Fuse.js 對 name 欄位進行模糊搜尋
        if (name) {
            const fuse = new Fuse(productPillowList, {
                keys: ['name'],
                threshold: 0.3, // 設定匹配度（0 完全匹配，1 模糊匹配）
                includeScore: false,
            });
            productPillowList = fuse.search(name).map(result => result.item);
        }
        // 其他欄位全文篩選
        productPillowList = productPillowList
            .sort((a, b) => a[sort] > b[sort] ? 1 : -1)
            .filter(result =>
                (state ? result.state === state : true)
                && (createDate ? result.createDate === createDate : true)
                && (type ? result.type === type : true)
                && (priceMin ? Number(result.price) >= Number(priceMin) : true)
                && (priceMax ? Number(result.price) <= Number(priceMax) : true)
                && (shortHeightMin ? Number(result.shortHeight) >= Number(shortHeightMin) : true)
                && (shortHeightMax ? Number(result.shortHeight) <= Number(shortHeightMax) : true)
                && (longHeightMin ? Number(result.longHeight) >= Number(longHeightMin) : true)
                && (longHeightMax ? Number(result.longHeight) <= Number(longHeightMax) : true)
            );
        // 分頁
        dataTotal = (productPillowList.length);
        pageTotal = Math.ceil(productPillowList.length / pageSize);
        productPillowList = productPillowList.slice((pageIndex - 1) * pageSize, pageIndex * pageSize);
        return { productPillowList, pagingParam: { ...pagingParam, pageTotal, dataTotal } };
    }

    /* 匯入枕頭商品 */
    static async importProductPillow(productPillowList) {
        const batch = db.batch();
        productPillowList.forEach(productPillow => {
            const docRef = db.collection(COLLECTION_NAME).doc();
            batch.set(docRef, productPillow);
        });
        await batch.commit();
        console.log("匯入枕頭商品 : ", productPillowList);
        return productPillowList;
    }


}
module.exports = ProductPillow;
