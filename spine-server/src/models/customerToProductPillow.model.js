/*
 * [model層] 負責客戶購買枕頭商品關聯 db 資料增刪修查
 * 獨立於 customerToProduct.model.js
 */

const db = require('../firestore');
const COLLECTION_NAME = 'CustomerToProductPillow';

class CustomerToProductPillow {
    constructor(id, customerId, productPillowId, quantity, purchaseDate, price, notes, state, createDate, updateDate) {
        this.id = id || "";
        this.customerId = customerId || "";
        this.productPillowId = productPillowId || "";
        this.quantity = quantity || 1;
        this.purchaseDate = purchaseDate || new Date().toISOString();
        this.price = price || 0;
        this.notes = notes || "";
        this.state = state || "正常";
        this.createDate = createDate || new Date().toISOString();
        this.updateDate = updateDate || new Date().toISOString();
    }

    /* 取得所有客戶購買枕頭商品紀錄 */
    static async getAllCustomerToProductPillowList() {
        const snapshot = await db.collection(COLLECTION_NAME).get();
        const customerToProductPillowList = [];
        snapshot.forEach(doc => {
            customerToProductPillowList.push({ id: doc.id, ...doc.data() });
        });
        return customerToProductPillowList;
    }

    /* 新增客戶購買枕頭商品紀錄 */
    static async addCustomerToProductPillow(customerToProductPillow) {
        const customerToProductPillowData = {
            ...customerToProductPillow,
            createDate: new Date().toISOString(),
            updateDate: new Date().toISOString()
        };
        const docRef = await db.collection(COLLECTION_NAME).add(customerToProductPillowData);
        const docSnapshot = await docRef.get();
        console.log("新增客戶購買枕頭商品紀錄 : ", { id: docRef.id, ...docSnapshot.data() });
        return { id: docRef.id, ...docSnapshot.data() };
    }

    /* 批量新增客戶購買枕頭商品紀錄 */
    static async addMultipleCustomerToProductPillow(customerToProductPillowList) {
        const batch = db.batch();
        const results = [];

        for (const item of customerToProductPillowList) {
            const customerToProductPillowData = {
                ...item,
                createDate: new Date().toISOString(),
                updateDate: new Date().toISOString()
            };
            const docRef = db.collection(COLLECTION_NAME).doc();
            batch.set(docRef, customerToProductPillowData);
            results.push({ id: docRef.id, ...customerToProductPillowData });
        }

        await batch.commit();
        console.log("批量新增客戶購買枕頭商品紀錄 : ", results);
        return results;
    }

    /* 取得特定客戶購買枕頭商品紀錄 */
    static async getCustomerToProductPillow(id) {
        const doc = await db.collection(COLLECTION_NAME).doc(id).get();
        if (!doc.exists) {
            console.log('找無此購買枕頭商品紀錄');
            return null;
        }
        console.log("取得客戶購買枕頭商品紀錄 : ", { id: doc.id, ...doc.data() });
        return { id: doc.id, ...doc.data() };
    }

    /* 根據客戶ID取得購買枕頭商品紀錄 */
    static async getCustomerToProductPillowByCustomerId(customerId) {
        const snapshot = await db.collection(COLLECTION_NAME)
            .where('customerId', '==', customerId)
            .get();

        const customerToProductPillowList = [];
        snapshot.forEach(doc => {
            customerToProductPillowList.push({ id: doc.id, ...doc.data() });
        });

        // 在記憶體中進行排序，避免需要建立複合索引
        customerToProductPillowList.sort((a, b) => {
            const dateA = new Date(a.purchaseDate);
            const dateB = new Date(b.purchaseDate);
            return dateB - dateA; // 由新到舊排序
        });

        console.log(`取得客戶 ${customerId} 的購買枕頭商品紀錄 : `, customerToProductPillowList);
        return customerToProductPillowList;
    }

    /* 根據枕頭商品ID取得購買紀錄 */
    static async getCustomerToProductPillowByProductPillowId(productPillowId) {
        const snapshot = await db.collection(COLLECTION_NAME)
            .where('productPillowId', '==', productPillowId)
            .get();

        const customerToProductPillowList = [];
        snapshot.forEach(doc => {
            customerToProductPillowList.push({ id: doc.id, ...doc.data() });
        });

        // 在記憶體中進行排序，避免需要建立複合索引
        customerToProductPillowList.sort((a, b) => {
            const dateA = new Date(a.purchaseDate);
            const dateB = new Date(b.purchaseDate);
            return dateB - dateA; // 由新到舊排序
        });

        console.log(`取得枕頭商品 ${productPillowId} 的購買紀錄 : `, customerToProductPillowList);
        return customerToProductPillowList;
    }

    /* 更新客戶購買枕頭商品紀錄 */
    static async updateCustomerToProductPillow(customerToProductPillow) {
        const updateData = {
            ...customerToProductPillow,
            updateDate: new Date().toISOString()
        };
        const docRef = db.collection(COLLECTION_NAME).doc(customerToProductPillow.id);
        await docRef.update(updateData);
        console.log("更新客戶購買枕頭商品紀錄 : ", updateData);
        return updateData;
    }

    /* 刪除客戶購買枕頭商品紀錄 */
    static async deleteCustomerToProductPillow(id) {
        const docRef = db.collection(COLLECTION_NAME).doc(id);
        await docRef.delete();
        console.log("刪除客戶購買枕頭商品紀錄 : ", id);
        return id;
    }

    /* 搜尋客戶購買枕頭商品紀錄 */
    static async searchCustomerToProductPillow(searchParam, pagingParam) {
        const { customerId, productPillowId, purchaseDateStart, purchaseDateEnd, state } = searchParam;
        let { pageIndex, pageSize, sort, pageTotal, dataTotal } = pagingParam;

        const snapshot = await db.collection(COLLECTION_NAME).get();
        let customerToProductPillowList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // 篩選
        customerToProductPillowList = customerToProductPillowList.filter(record =>
            (customerId ? record.customerId === customerId : true)
            && (productPillowId ? record.productPillowId === productPillowId : true)
            && (state ? record.state === state : true)
            && (purchaseDateStart ? new Date(record.purchaseDate) >= new Date(purchaseDateStart) : true)
            && (purchaseDateEnd ? new Date(record.purchaseDate) <= new Date(purchaseDateEnd) : true)
        );

        // 排序
        customerToProductPillowList.sort((a, b) => {
            const dateA = new Date(a.purchaseDate);
            const dateB = new Date(b.purchaseDate);
            return dateB - dateA;
        });

        // 分頁
        dataTotal = customerToProductPillowList.length;
        pageTotal = Math.ceil(customerToProductPillowList.length / pageSize);
        if (pageIndex && pageSize) {
            customerToProductPillowList = customerToProductPillowList.slice((pageIndex - 1) * pageSize, pageIndex * pageSize);
        }

        return { customerToProductPillowList, pagingParam: { ...pagingParam, pageTotal, dataTotal } };
    }

    /* 取得客戶購買枕頭商品統計 */
    static async getCustomerPurchaseStats(customerId) {
        const purchaseRecords = await this.getCustomerToProductPillowByCustomerId(customerId);

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

module.exports = CustomerToProductPillow;
