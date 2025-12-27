/*
 * [model層] 負責客戶 db 資料增刪修查
 */

const db = require('../firestore');
const Fuse = require('fuse.js');
const COLLECTION_NAME = 'Customer';

class Customer {
    constructor( id, name, email, phone, address, birthday, gender, state, notes, userId, createDate, updateDate, age ) {
        this.id = id || "";
        this.name = name || "";
        this.email = email || "";
        this.phone = phone || "";
        this.address = address || "";
        this.birthday = birthday || "";
        this.gender = gender || "";
        this.state = state || "正常";
        this.notes = notes || "";
        this.userId = userId || "";
        this.createDate = createDate || new Date().toISOString();
        this.updateDate = updateDate || new Date().toISOString();
        this.age = age || null;
    }

    /** 匯入 所有 客戶資訊 進入空表, 不卡控, 使用於備份還原。 */
    static async importAllCustomer(customerList) {
        try {
            // 檢查表是否已存在資料
            const snapshot = await db.collection(COLLECTION_NAME).limit(1).get();
            if (!snapshot.empty) {
                console.log('[importAllCustomer]: 表已存在資料，匯入中止。');
                return { message: '表已存在資料，匯入中止。' };
            }

            // 表無資料，開始匯入
            const batch = db.batch();
            customerList.forEach(customerData => {
                const customer = new Customer(
                    customerData.id || "",
                    customerData.name || "",
                    customerData.email || "",
                    customerData.phone || "",
                    customerData.address || "",
                    customerData.birthday || "",
                    customerData.gender || "",
                    customerData.state || "正常",
                    customerData.notes || "",
                    customerData.userId || "",
                    customerData.createDate || new Date().toISOString(),
                    customerData.updateDate || new Date().toISOString(),
                    customerData.age || null
                );
                const docRef = db.collection(COLLECTION_NAME).doc(customer.id.replace(/"/g, ''));
                batch.set(docRef, {
                    name: customer.name.replace(/"/g, '') || "",
                    email: customer.email.replace(/"/g, '') || "",
                    phone: customer.phone.replace(/"/g, '') || "",
                    address: customer.address.replace(/"/g, '') || "",
                    birthday: customer.birthday.replace(/"/g, '') || "",
                    gender: customer.gender.replace(/"/g, '') || "",
                    state: customer.state.replace(/"/g, '') || "正常",
                    notes: customer.notes.replace(/"/g, '') || "",
                    userId: customer.userId.replace(/"/g, '') || "",
                    createDate: customer.createDate,
                    updateDate: customer.updateDate,
                    age: customer.age || null
                });
            });

            await batch.commit();
            console.log('[importAllCustomer]: 資料匯入成功。');
            return { message: '資料匯入成功。' };
        } catch (error) {
            console.error('[importAllCustomer] error:', error);
            throw error;
        }
    }

    /* 取得 客戶資訊 列表 */
    static async getAllCustomerList() {
        const snapshot = await db.collection(COLLECTION_NAME).get();
        const customerList = [];
        snapshot.forEach(doc => {
            customerList.push({id:doc.id, ...doc.data()});
        });
        return customerList;
    }
    
    /* 新增客戶 */
    static async addCustomer(customer) {
        const customerData = {
            ...customer,
            createDate: new Date().toISOString(),
            updateDate: new Date().toISOString()
        };
        const docRef = await db.collection(COLLECTION_NAME).add(customerData);
        const docSnapshot = await docRef.get();
        console.log("新增客戶 : ", {id: docRef.id, ...docSnapshot.data()});
        return ({id: docRef.id, ...docSnapshot.data()})
    }
    
    /* 取得客戶 */
    static async getCustomer(id) {
        const doc = await db.collection(COLLECTION_NAME).doc(id).get();
        if (!doc.exists) {
            console.log('找無此客戶');
            return null;
        }
        console.log("取得客戶 : ", {id: doc.id, ...doc.data()});
        return {id: doc.id, ...doc.data()};
    }
    
    /* 更新客戶 */
    static async updateCustomer(customer) {
        const updateData = {
            ...customer,
            updateDate: new Date().toISOString()
        };
        const docRef = db.collection(COLLECTION_NAME).doc(customer.id);
        await docRef.update(updateData);
        console.log("更新客戶 : ", updateData);
        return updateData;
    }
    
    /* 刪除客戶 */
    static async deleteCustomer(id) {
        const docRef = db.collection(COLLECTION_NAME).doc(id);
        await docRef.delete();
        console.log("刪除客戶 : ", id);
        return id;
    }
    
    /* 搜尋客戶 */
    static async searchCustomer(searchParam, pagingParam) {
        const { keyword, state, phone, email } = searchParam;
        let { pageIndex, pageSize, sort, pageTotal, dataTotal } = pagingParam; // 分頁參數
        let query = db.collection(COLLECTION_NAME);
        const snapshot = await query.get();
        let customerList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // 使用 Fuse.js 對 name, email 欄位進行模糊搜尋
        if(keyword) {
            const fuse = new Fuse(customerList, {
                keys: ['name', 'email'],
                threshold: 0.3, // 設定匹配度（0 完全匹配，1 模糊匹配）
                includeScore: false,
            });
            customerList = fuse.search(keyword).map(result => result.item);
        }
        
        // 其他欄位全文篩選
        customerList = customerList
            .sort((a, b) => {
                const sortField = sort || 'createDate';
                return new Date(b[sortField]) - new Date(a[sortField]); // 預設按建立時間降序排列
            })
            .filter(result => 
                (state ? result.state === state : true)
                && (phone ? result.phone && result.phone.includes(phone) : true)
                && (email ? result.email && result.email.includes(email) : true)
            );
            
        // 分頁
        dataTotal = (customerList.length);
        pageTotal = Math.ceil(customerList.length / pageSize);
        customerList = customerList.slice((pageIndex - 1) * pageSize, pageIndex * pageSize);
        return {customerList, pagingParam:{...pagingParam, pageTotal, dataTotal}};
    }
    
    /* 匯入客戶 */
    static async importCustomer(customerList) {
        const batch = db.batch();
        customerList.forEach(customer => {
            const customerData = {
                ...customer,
                createDate: new Date().toISOString(),
                updateDate: new Date().toISOString()
            };
            const docRef = db.collection(COLLECTION_NAME).doc();
            batch.set(docRef, customerData);
        });
        await batch.commit();
        console.log("匯入客戶 : ", customerList);
        return customerList;
    }
}

module.exports = Customer;