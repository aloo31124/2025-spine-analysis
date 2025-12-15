/*
 * [model層] 負責床墊商品 db 資料增刪修查
 * 參考 productPillow.model.js 創建
 */

const db = require('../firestore');
const Fuse = require('fuse.js');
const COLLECTION_NAME = 'ProductMattress';


class ProductMattress {
    constructor(id, name, price, state, model, userId) {
        this.id = id || "";
        this.name = name || "";          // 床墊名稱
        this.price = price || "";        // 床墊價錢
        this.state = state || "";        // 狀態
        this.model = model || "";        // 床墊型號
        this.userId = userId || "";      // 用戶ID
    }

    /** 匯入 所有 床墊商品資訊 進入空表, 不卡控, 使用於備份還原。 */
    static async importAllProductMattress(productMattressList) {
        try {
            // 檢查表是否已存在資料
            const snapshot = await db.collection(COLLECTION_NAME).limit(1).get();
            if (!snapshot.empty) {
                console.log('[importAllProductMattress]: 表已存在資料，匯入中止。');
                return { message: '表已存在資料，匯入中止。' };
            }

            // 表無資料，開始匯入
            const batch = db.batch();
            productMattressList.forEach(productMattressData => {
                const productMattress = new ProductMattress(
                    productMattressData.id || "",
                    productMattressData.name || "",
                    productMattressData.price || "",
                    productMattressData.state || "",
                    productMattressData.model || "",
                    productMattressData.userId || ""
                );
                const docRef = db.collection(COLLECTION_NAME).doc(productMattress.id.toString().replace(/"/g, ''));
                batch.set(docRef, {
                    name: (productMattress.name?.toString() || "").replace(/"/g, ''),
                    price: (productMattress.price?.toString() || "").replace(/"/g, ''),
                    state: (productMattress.state?.toString() || "").replace(/"/g, ''),
                    model: (productMattress.model?.toString() || "").replace(/"/g, ''),
                    userId: (productMattress.userId?.toString() || "").replace(/"/g, '')
                });
            });

            await batch.commit();
            console.log('[importAllProductMattress]: 資料匯入成功。');
            return { message: '資料匯入成功。' };
        } catch (error) {
            console.error('[importAllProductMattress] error:', error);
            throw error;
        }
    }

    /* 取得 床墊商品資訊 列表 */
    static async getAllProductMattressList() {
        const snapshot = await db.collection(COLLECTION_NAME).get();
        const productMattressList = [];
        snapshot.forEach(doc => {
            productMattressList.push({ id: doc.id, ...doc.data() });
        });
        return productMattressList;
    }

    /* 新增床墊商品 */
    static async addProductMattress(productMattress) {
        const docRef = await db.collection(COLLECTION_NAME).add(productMattress);
        const docSnapshot = await docRef.get();
        console.log("新增床墊商品 : ", { id: docRef.id, ...docSnapshot.data() });
        return ({ id: docRef.id, ...docSnapshot.data() })
    }

    /* 取得床墊商品 */
    static async getProductMattress(id) {
        const doc = await db.collection(COLLECTION_NAME).doc(id).get();
        if (!doc.exists) {
            console.log('找無此床墊商品');
            return null;
        }
        console.log("取得床墊商品 : ", { id: doc.id, ...doc.data() });
        return { id: doc.id, ...doc.data() };
    }

    /* 更新床墊商品 */
    static async updateProductMattress(productMattress) {
        const docRef = db.collection(COLLECTION_NAME).doc(productMattress.id);
        await docRef.update(productMattress);
        console.log("更新床墊商品 : ", productMattress);
        return productMattress;
    }

    /* 刪除床墊商品 */
    static async deleteProductMattress(id) {
        const docRef = db.collection(COLLECTION_NAME).doc(id);
        await docRef.delete();
        console.log("刪除床墊商品 : ", id);
        return id;
    }

    /* 搜尋床墊商品 */
    static async searchProductMattress(searchParam, pagingParam) {
        const { name, state, createDate, model, priceMin, priceMax } = searchParam;
        let { pageIndex, pageSize, sort, pageTotal, dataTotal } = pagingParam; // 分頁參數
        let query = db.collection(COLLECTION_NAME);
        const snapshot = await query.get();
        let productMattressList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // 使用 Fuse.js 對 name 欄位進行模糊搜尋
        if (name) {
            const fuse = new Fuse(productMattressList, {
                keys: ['name'],
                threshold: 0.3, // 設定匹配度（0 完全匹配，1 模糊匹配）
                includeScore: false,
            });
            productMattressList = fuse.search(name).map(result => result.item);
        }
        
        // 其他欄位全文篩選
        productMattressList = productMattressList
            .sort((a, b) => a[sort] > b[sort] ? 1 : -1)
            .filter(result =>
                (state ? result.state === state : true)
                && (createDate ? result.createDate === createDate : true)
                && (model ? result.model === model : true)
                && (priceMin ? Number(result.price) >= Number(priceMin) : true)
                && (priceMax ? Number(result.price) <= Number(priceMax) : true)
            );
        
        // 分頁
        dataTotal = (productMattressList.length);
        pageTotal = Math.ceil(productMattressList.length / pageSize);
        productMattressList = productMattressList.slice((pageIndex - 1) * pageSize, pageIndex * pageSize);
        return { productMattressList, pagingParam: { ...pagingParam, pageTotal, dataTotal } };
    }

    /* 匯入床墊商品 */
    static async importProductMattress(productMattressList) {
        const batch = db.batch();
        productMattressList.forEach(productMattress => {
            const docRef = db.collection(COLLECTION_NAME).doc();
            batch.set(docRef, productMattress);
        });
        await batch.commit();
        console.log("匯入床墊商品 : ", productMattressList);
        return productMattressList;
    }
}

module.exports = ProductMattress;
