/*
 * [model層] 負責商品 db 資料增刪修查
 */

const db = require('../firestore');
const Fuse = require('fuse.js');
const COLLECTION_NAME = 'ProdcutCategory';


class ProdcutCategory {
    constructor( id, name ) {
        this.id = id || "";
        this.name = name || "";
    }

    /** 匯入 所有 商品分類 進入空表, 不卡控, 使用於備份還原。 */
    static async importAllProdcutCategory(categoryList) {
        try {
            // 檢查表是否已存在資料
            const snapshot = await db.collection(COLLECTION_NAME).limit(1).get();
            if (!snapshot.empty) {
                console.log('[importAllProdcutCategory]: 表已存在資料，匯入中止。');
                return { message: '表已存在資料，匯入中止。' };
            }
            // 表無資料，開始匯入
            const batch = db.batch();
            categoryList.forEach(categorytData => {
                const category = new ProdcutCategory(
                    categorytData.id || "",
                    categorytData.name || "",
                );
                const docRef = db.collection(COLLECTION_NAME).doc(category.id.replace(/"/g, ''));
                batch.set(docRef, {
                    name: category.name.replace(/"/g, '') || "",
                });
            });
            await batch.commit();
            console.log('[importAllProdcutCategory]: 資料匯入成功。');
            return { message: '資料匯入成功。' };
        } catch (error) {
            console.error('[importAllProdcutCategory] error:', error);
            throw error;
        }
    }

    /* 取得 商品分類 列表 */
    static async getAllProductCategoryList() {
        const snapshot = await db.collection(COLLECTION_NAME).get();
        const productList = [];
        snapshot.forEach(doc => {
            productList.push({id:doc.id, ...doc.data()});
        });
        return productList;
    }

        
    /* 取得商品分類列表 */
    static async getProductCategoryList() {
        const snapshot = await db.collection(COLLECTION_NAME).get();
        const productCategoryList = [];
        snapshot.forEach(doc => {
            productCategoryList.push({id:doc.id, ...doc.data()});
        });
        return productCategoryList;
    }

    /* 新增商品分類 */
    static async addProductCategory(productCategory) {
        const docRef = await db.collection(COLLECTION_NAME).add(productCategory);
        const docSnapshot = await docRef.get();
        console.log("新增商品分類 : ", {id: docRef.id, ...docSnapshot.data()});
        return ({id: docRef.id, ...docSnapshot.data()})
    }

    /* 取得商品分類 */
    static async getProductCategory(id) {
        const doc = await db.collection(COLLECTION_NAME).doc(id).get();
        if (!doc.exists) {
            console.log('找無此商品分類');
            return null;
        }
        console.log("取得商品分類 : ", {id: doc.id, ...doc.data()});
        return {id: doc.id, ...doc.data()};
    }

    /* 更新商品分類 */
    static async updateProductCategory(productCategory) {
        const docRef = db.collection(COLLECTION_NAME).doc(productCategory.id);
        await docRef.update(productCategory);
        console.log("更新商品分類 : ", productCategory);
        return productCategory;
    }

    /* 刪除商品分類 */
    static async deleteProductCategory(id) {
        const docRef = db.collection(COLLECTION_NAME).doc(id);
        await docRef.delete();
        console.log("刪除商品分類 : ", id);
        return id;
    }

    /* 搜尋商品分類 */
    static async searchProductCategory(searchParam, pagingParam) {
        const { name, state, createDate, type, priceMin, priceMax } = searchParam;
        //const { page = 1, pageSize = 100 } = pagingParam; // 分頁參數
        let query = db.collection(COLLECTION_NAME);

        /*
        if (name) {
            query = query.where('name', '==', name);
        }
        */

        const snapshot = await query.get();
        const productCategoryList = [];
        snapshot.forEach(doc => {
            productCategoryList.push({id:doc.id, ...doc.data()});
        });

        if(!name) return productCategoryList;

        const fuse = new Fuse(productCategoryList, {
            keys: ['name'],
            threshold: 0.3,
            includeScore: false
        });
        return fuse.search(name).map(result => result.item);
    }

}
module.exports = ProdcutCategory;
