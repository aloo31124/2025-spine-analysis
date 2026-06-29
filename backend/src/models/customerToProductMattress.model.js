/*
 * [model層] 負責客戶購買床墊商品關聯 db 資料增刪修查
 * 參考 customerToProductPillow.model.js
 */

const db = require('../firestore');
const COLLECTION_NAME = 'CustomerToProductMattress';

class CustomerToProductMattress {
    constructor(id, customerId, productMattressId, quantity, purchaseDate, price, notes, state, createDate, updateDate) {
        this.id = id || "";
        this.customerId = customerId || "";
        this.productMattressId = productMattressId || "";
        this.quantity = quantity || 1;
        this.purchaseDate = purchaseDate || new Date().toISOString();
        this.price = price || 0;
        this.notes = notes || "";
        this.state = state || "正常";
        this.createDate = createDate || new Date().toISOString();
        this.updateDate = updateDate || new Date().toISOString();
    }

    /* 取得所有客戶購買床墊商品紀錄 */
    static async getAllCustomerToProductMattressList() {
        const snapshot = await db.collection(COLLECTION_NAME).get();
        const customerToProductMattressList = [];
        snapshot.forEach(doc => {
            customerToProductMattressList.push({ id: doc.id, ...doc.data() });
        });
        return customerToProductMattressList;
    }

    /* 新增客戶購買床墊商品紀錄 */
    static async addCustomerToProductMattress(customerToProductMattress) {
        const customerToProductMattressData = {
            ...customerToProductMattress,
            createDate: new Date().toISOString(),
            updateDate: new Date().toISOString()
        };
        const docRef = await db.collection(COLLECTION_NAME).add(customerToProductMattressData);
        const docSnapshot = await docRef.get();
        console.log("新增客戶購買床墊商品紀錄 : ", { id: docRef.id, ...docSnapshot.data() });
        return { id: docRef.id, ...docSnapshot.data() };
    }

    /* 批量新增客戶購買床墊商品紀錄 */
    static async addMultipleCustomerToProductMattress(customerToProductMattressList) {
        const batch = db.batch();
        const results = [];

        for (const item of customerToProductMattressList) {
            const customerToProductMattressData = {
                ...item,
                createDate: new Date().toISOString(),
                updateDate: new Date().toISOString()
            };
            const docRef = db.collection(COLLECTION_NAME).doc();
            batch.set(docRef, customerToProductMattressData);
            results.push({ id: docRef.id, ...customerToProductMattressData });
        }

        await batch.commit();
        console.log("批量新增客戶購買床墊商品紀錄 : ", results);
        return results;
    }

    /* 取得特定客戶購買床墊商品紀錄 */
    static async getCustomerToProductMattress(id) {
        const doc = await db.collection(COLLECTION_NAME).doc(id).get();
        if (!doc.exists) {
            console.log('找無此購買床墊商品紀錄');
            return null;
        }
        console.log("取得客戶購買床墊商品紀錄 : ", { id: doc.id, ...doc.data() });
        return { id: doc.id, ...doc.data() };
    }

    /* 根據客戶ID取得購買床墊商品紀錄 */
    static async getCustomerToProductMattressByCustomerId(customerId) {
        const snapshot = await db.collection(COLLECTION_NAME)
            .where('customerId', '==', customerId)
            .get();

        const customerToProductMattressList = [];
        snapshot.forEach(doc => {
            customerToProductMattressList.push({ id: doc.id, ...doc.data() });
        });

        // 在記憶體中進行排序，避免需要建立複合索引
        customerToProductMattressList.sort((a, b) => {
            const dateA = new Date(a.purchaseDate);
            const dateB = new Date(b.purchaseDate);
            return dateB - dateA; // 由新到舊排序
        });

        console.log(`取得客戶 ${customerId} 的購買床墊商品紀錄 : `, customerToProductMattressList);
        return customerToProductMattressList;
    }

    /* 根據床墊商品ID取得購買紀錄 */
    static async getCustomerToProductMattressByProductMattressId(productMattressId) {
        const snapshot = await db.collection(COLLECTION_NAME)
            .where('productMattressId', '==', productMattressId)
            .get();

        const customerToProductMattressList = [];
        snapshot.forEach(doc => {
            customerToProductMattressList.push({ id: doc.id, ...doc.data() });
        });

        // 在記憶體中進行排序，避免需要建立複合索引
        customerToProductMattressList.sort((a, b) => {
            const dateA = new Date(a.purchaseDate);
            const dateB = new Date(b.purchaseDate);
            return dateB - dateA; // 由新到舊排序
        });

        console.log(`取得床墊商品 ${productMattressId} 的購買紀錄 : `, customerToProductMattressList);
        return customerToProductMattressList;
    }

    /* 更新客戶購買床墊商品紀錄 */
    static async updateCustomerToProductMattress(customerToProductMattress) {
        const updateData = {
            ...customerToProductMattress,
            updateDate: new Date().toISOString()
        };
        const docRef = db.collection(COLLECTION_NAME).doc(customerToProductMattress.id);
        await docRef.update(updateData);
        console.log("更新客戶購買床墊商品紀錄 : ", updateData);
        return updateData;
    }

    /* 刪除客戶購買床墊商品紀錄 */
    static async deleteCustomerToProductMattress(id) {
        const docRef = db.collection(COLLECTION_NAME).doc(id);
        await docRef.delete();
        console.log("刪除客戶購買床墊商品紀錄 : ", id);
        return id;
    }

    /* 搜尋客戶購買床墊商品紀錄 */
    static async searchCustomerToProductMattress(searchParam, pagingParam) {
        const { customerId, productMattressId, purchaseDateStart, purchaseDateEnd, state } = searchParam;
        let { pageIndex, pageSize, sort, pageTotal, dataTotal } = pagingParam;

        const snapshot = await db.collection(COLLECTION_NAME).get();
        let customerToProductMattressList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // 篩選
        customerToProductMattressList = customerToProductMattressList.filter(record =>
            (customerId ? record.customerId === customerId : true)
            && (productMattressId ? record.productMattressId === productMattressId : true)
            && (state ? record.state === state : true)
            && (purchaseDateStart ? new Date(record.purchaseDate) >= new Date(purchaseDateStart) : true)
            && (purchaseDateEnd ? new Date(record.purchaseDate) <= new Date(purchaseDateEnd) : true)
        );

        // 排序
        customerToProductMattressList.sort((a, b) => {
            const dateA = new Date(a.purchaseDate);
            const dateB = new Date(b.purchaseDate);
            return dateB - dateA;
        });

        // 分頁
        dataTotal = customerToProductMattressList.length;
        pageTotal = Math.ceil(customerToProductMattressList.length / pageSize);
        if (pageIndex && pageSize) {
            customerToProductMattressList = customerToProductMattressList.slice((pageIndex - 1) * pageSize, pageIndex * pageSize);
        }

        return { customerToProductMattressList, pagingParam: { ...pagingParam, pageTotal, dataTotal } };
    }

    /* 取得客戶購買床墊商品統計 */
    static async getCustomerPurchaseStats(customerId) {
        const purchaseRecords = await this.getCustomerToProductMattressByCustomerId(customerId);

        const stats = {
            totalPurchases: purchaseRecords.length,
            totalQuantity: 0,
            totalAmount: 0,
            lastPurchaseDate: null
        };

        purchaseRecords.forEach(record => {
            stats.totalQuantity += record.quantity || 1;
            stats.totalAmount += (record.price || 0) * (record.quantity || 1);
        });

        if (purchaseRecords.length > 0) {
            stats.lastPurchaseDate = purchaseRecords[0].purchaseDate;
        }

        return stats;
    }
}

module.exports = CustomerToProductMattress;
