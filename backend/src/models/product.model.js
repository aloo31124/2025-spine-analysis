/*
 * [model層] 負責商品 db 資料增刪修查
 */

const db = require('../firestore');
const Fuse = require('fuse.js');
const COLLECTION_NAME = 'Product';


class Product {
    constructor( id, name, price, state, type, userId ) {
        this.id = id || "";
        this.name = name || "";
        this.price = price || "";
        this.state = state || "";
        this.type = type || "";
        this.userId = userId || "";
    }

    /** 匯入 所有 商品資訊 進入空表, 不卡控, 使用於備份還原。 */
    static async importAllProduct(productList) {
        try {
            // 檢查表是否已存在資料
            const snapshot = await db.collection(COLLECTION_NAME).limit(1).get();
            if (!snapshot.empty) {
                console.log('[importAllProduct]: 表已存在資料，匯入中止。');
                return { message: '表已存在資料，匯入中止。' };
            }

            // 表無資料，開始匯入
            const batch = db.batch();
            productList.forEach(productData => {
                const product = new Product(
                    productData.id || "",
                    productData.name || "",
                    productData.price || "",
                    productData.state || "",
                    productData.type || "",
                    productData.userId || "",
                );
                const docRef = db.collection(COLLECTION_NAME).doc(product.id.replace(/"/g, ''));
                batch.set(docRef, {
                    name: product.name.replace(/"/g, '') || "",
                    price: product.price.replace(/"/g, '') || "",
                    state: product.state.replace(/"/g, '') || "",
                    type: product.type.replace(/"/g, '') || "",
                    userId: product.userId.replace(/"/g, '') || "",
                });
            });

            await batch.commit();
            console.log('[importAllProduct]: 資料匯入成功。');
            return { message: '資料匯入成功。' };
        } catch (error) {
            console.error('[importAllProduct] error:', error);
            throw error;
        }
    }

    /* 取得 商品資訊 列表 */
    static async getAllProductList() {
        const snapshot = await db.collection(COLLECTION_NAME).get();
        const productList = [];
        snapshot.forEach(doc => {
            productList.push({id:doc.id, ...doc.data()});
        });
        return productList;
    }
    
    /* 新增商品 */
    static async addProduct(product) {
        const docRef = await db.collection(COLLECTION_NAME).add(product);
        const docSnapshot = await docRef.get();
        console.log("新增商品 : ", {id: docRef.id, ...docSnapshot.data()});
        return ({id: docRef.id, ...docSnapshot.data()})
    }
    
    /* 取得商品 */
    static async getProduct(id) {
        const doc = await db.collection(COLLECTION_NAME).doc(id).get();
        if (!doc.exists) {
            console.log('找無此商品');
            return null;
        }
        console.log("取得商品 : ", {id: doc.id, ...doc.data()});
        return {id: doc.id, ...doc.data()};
    }
    
    /* 更新商品 */
    static async updateProduct(product) {
        const docRef = db.collection(COLLECTION_NAME).doc(product.id);
        await docRef.update(product);
        console.log("更新商品 : ", product);
        return product;
    }
    
    /* 刪除商品 */
    static async deleteProduct(id) {
        const docRef = db.collection(COLLECTION_NAME).doc(id);
        await docRef.delete();
        console.log("刪除商品 : ", id);
        return id;
    }
    
    /* 搜尋商品 */
    static async searchProduct(searchParam, pagingParam) {
        const { name, state, createDate, type, priceMin, priceMax } = searchParam;
        let { pageIndex, pageSize, sort, pageTotal, dataTotal } = pagingParam; // 分頁參數
        let query = db.collection(COLLECTION_NAME);
        const snapshot = await query.get();
        let productList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // 使用 Fuse.js 對 name 欄位進行模糊搜尋
        if(name) {
            const fuse = new Fuse(productList, {
                keys: ['name'],
                threshold: 0.3, // 設定匹配度（0 完全匹配，1 模糊匹配）
                includeScore: false,
            });
            productList = fuse.search(name).map(result => result.item);
        }
        // 其他欄位全文篩選
        productList = productList
            .sort((a, b) => a[sort] > b[sort] ? 1 : -1)
            .filter(result => 
                (state ? result.state === state : true)
                && (createDate ? result.createDate === createDate : true)
                && (type ? result.type === type : true)
                && (priceMin ? result.price >= priceMin : true)
                && (priceMax ? result.price <= priceMax : true)
            );
        // 分頁
        dataTotal = (productList.length);
        pageTotal = Math.ceil(productList.length / pageSize);
        productList = productList.slice((pageIndex - 1) * pageSize, pageIndex * pageSize);
        return {productList, pagingParam:{...pagingParam, pageTotal, dataTotal}};
    }
    
    /* 匯入商品 */
    static async importProduct(productList) {
        const batch = db.batch();
        productList.forEach(product => {
            const docRef = db.collection(COLLECTION_NAME).doc();
            batch.set(docRef, product);
        });
        await batch.commit();
        console.log("匯入商品 : ", productList);
        return productList;
    }
    

}
module.exports = Product;
