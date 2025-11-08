/*
 * [model層] 負責客戶購買商品關聯 db 資料增刪修查
 */

const db = require('../firestore');
const COLLECTION_NAME = 'CustomerToProduct';

class CustomerToProduct {
    constructor(id, customerId, productId, quantity, purchaseDate, price, notes, state, createDate, updateDate) {
        this.id = id || "";
        this.customerId = customerId || "";
        this.productId = productId || "";
        this.quantity = quantity || 1;
        this.purchaseDate = purchaseDate || new Date().toISOString();
        this.price = price || 0;
        this.notes = notes || "";
        this.state = state || "正常";
        this.createDate = createDate || new Date().toISOString();
        this.updateDate = updateDate || new Date().toISOString();
    }

    /* 取得所有客戶購買紀錄 */
    static async getAllCustomerToProductList() {
        const snapshot = await db.collection(COLLECTION_NAME).get();
        const customerToProductList = [];
        snapshot.forEach(doc => {
            customerToProductList.push({id: doc.id, ...doc.data()});
        });
        return customerToProductList;
    }

    /* 新增客戶購買紀錄 */
    static async addCustomerToProduct(customerToProduct) {
        const customerToProductData = {
            ...customerToProduct,
            createDate: new Date().toISOString(),
            updateDate: new Date().toISOString()
        };
        const docRef = await db.collection(COLLECTION_NAME).add(customerToProductData);
        const docSnapshot = await docRef.get();
        console.log("新增客戶購買紀錄 : ", {id: docRef.id, ...docSnapshot.data()});
        return {id: docRef.id, ...docSnapshot.data()};
    }

    /* 批量新增客戶購買紀錄 */
    static async addMultipleCustomerToProduct(customerToProductList) {
        const batch = db.batch();
        const results = [];
        
        for (const item of customerToProductList) {
            const customerToProductData = {
                ...item,
                createDate: new Date().toISOString(),
                updateDate: new Date().toISOString()
            };
            const docRef = db.collection(COLLECTION_NAME).doc();
            batch.set(docRef, customerToProductData);
            results.push({id: docRef.id, ...customerToProductData});
        }
        
        await batch.commit();
        console.log("批量新增客戶購買紀錄 : ", results);
        return results;
    }

    /* 取得特定客戶購買紀錄 */
    static async getCustomerToProduct(id) {
        const doc = await db.collection(COLLECTION_NAME).doc(id).get();
        if (!doc.exists) {
            console.log('找無此購買紀錄');
            return null;
        }
        console.log("取得客戶購買紀錄 : ", {id: doc.id, ...doc.data()});
        return {id: doc.id, ...doc.data()};
    }

    /* 根據客戶ID取得購買紀錄 */
    static async getCustomerToProductByCustomerId(customerId) {
        const snapshot = await db.collection(COLLECTION_NAME)
            .where('customerId', '==', customerId)
            .orderBy('purchaseDate', 'desc')
            .get();
        
        const customerToProductList = [];
        snapshot.forEach(doc => {
            customerToProductList.push({id: doc.id, ...doc.data()});
        });
        
        console.log(`取得客戶 ${customerId} 的購買紀錄 : `, customerToProductList);
        return customerToProductList;
    }

    /* 根據商品ID取得購買紀錄 */
    static async getCustomerToProductByProductId(productId) {
        const snapshot = await db.collection(COLLECTION_NAME)
            .where('productId', '==', productId)
            .orderBy('purchaseDate', 'desc')
            .get();
        
        const customerToProductList = [];
        snapshot.forEach(doc => {
            customerToProductList.push({id: doc.id, ...doc.data()});
        });
        
        console.log(`取得商品 ${productId} 的購買紀錄 : `, customerToProductList);
        return customerToProductList;
    }

    /* 更新客戶購買紀錄 */
    static async updateCustomerToProduct(customerToProduct) {
        const updateData = {
            ...customerToProduct,
            updateDate: new Date().toISOString()
        };
        const docRef = db.collection(COLLECTION_NAME).doc(customerToProduct.id);
        await docRef.update(updateData);
        console.log("更新客戶購買紀錄 : ", updateData);
        return updateData;
    }

    /* 刪除客戶購買紀錄 */
    static async deleteCustomerToProduct(id) {
        const docRef = db.collection(COLLECTION_NAME).doc(id);
        await docRef.delete();
        console.log("刪除客戶購買紀錄 : ", id);
        return id;
    }

    /* 搜尋客戶購買紀錄 */
    static async searchCustomerToProduct(searchParam, pagingParam) {
        const { customerId, productId, purchaseDateStart, purchaseDateEnd, state } = searchParam;
        let { pageIndex, pageSize, sort, pageTotal, dataTotal } = pagingParam;
        
        let query = db.collection(COLLECTION_NAME);
        
        // 建立查詢條件
        if (customerId) {
            query = query.where('customerId', '==', customerId);
        }
        if (productId) {
            query = query.where('productId', '==', productId);
        }
        if (state) {
            query = query.where('state', '==', state);
        }
        
        const snapshot = await query.get();
        let customerToProductList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // 日期範圍篩選
        if (purchaseDateStart || purchaseDateEnd) {
            customerToProductList = customerToProductList.filter(item => {
                const purchaseDate = new Date(item.purchaseDate);
                const start = purchaseDateStart ? new Date(purchaseDateStart) : null;
                const end = purchaseDateEnd ? new Date(purchaseDateEnd) : null;
                
                return (!start || purchaseDate >= start) && (!end || purchaseDate <= end);
            });
        }
        
        // 排序
        customerToProductList = customerToProductList.sort((a, b) => {
            const sortField = sort || 'purchaseDate';
            return new Date(b[sortField]) - new Date(a[sortField]);
        });
        
        // 分頁
        dataTotal = customerToProductList.length;
        pageTotal = Math.ceil(customerToProductList.length / pageSize);
        customerToProductList = customerToProductList.slice((pageIndex - 1) * pageSize, pageIndex * pageSize);
        
        return {customerToProductList, pagingParam: {...pagingParam, pageTotal, dataTotal}};
    }

    /* 取得客戶購買統計 */
    static async getCustomerPurchaseStats(customerId) {
        const snapshot = await db.collection(COLLECTION_NAME)
            .where('customerId', '==', customerId)
            .get();
        
        let totalPurchases = 0;
        let totalQuantity = 0;
        let totalAmount = 0;
        const productStats = {};
        
        snapshot.forEach(doc => {
            const data = doc.data();
            totalPurchases++;
            totalQuantity += data.quantity || 0;
            totalAmount += (data.price || 0) * (data.quantity || 0);
            
            if (productStats[data.productId]) {
                productStats[data.productId].quantity += data.quantity || 0;
                productStats[data.productId].amount += (data.price || 0) * (data.quantity || 0);
            } else {
                productStats[data.productId] = {
                    quantity: data.quantity || 0,
                    amount: (data.price || 0) * (data.quantity || 0)
                };
            }
        });
        
        return {
            totalPurchases,
            totalQuantity,
            totalAmount,
            productStats
        };
    }
}

module.exports = CustomerToProduct;