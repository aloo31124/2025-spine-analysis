const db = require('../firestore');
const Fuse = require('fuse.js');
const COLLECTION_NAME = 'Payment';

class Payment {
    constructor(id, cost, desc, name, interval, type) {
        this.id = id;
        this.cost = cost;
        this.desc = desc;
        this.name = name;
        this.interval = interval;
        this.type = type;
    }

    /* [系統管理] 搜尋 [方案]  */
    static async search(payment) {
        //let { pageIndex, pageSize, sort, pageTotal, dataTotal } = pagingParam; // 分頁參數
        const {name, interval, type, costRange} = payment;
        let sort = "name";
        let query = db.collection(COLLECTION_NAME);
        const snapshot = await query.get();
        let paymentList = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
        
        // 進行模糊搜尋 (使用 Fuse.js )
        /*
        if(name && name !== 'all') {
            const fuse = new Fuse(paymentList, {
                keys: ['name'],
                threshold: 0.2, // 設定匹配度（0 完全匹配，1 模糊匹配）
                includeScore: false,
            });
            paymentList = fuse.search(name).map(result => result.item);
        }
        */

        // 必要條件搜尋
        paymentList = paymentList
            .sort((a, b) => a[sort] > b[sort] ? 1 : -1)
            .filter(payment => 
                (type ? (type === 'all' || payment.type === type) : true)
                && (interval ? (interval === 'all' || payment.interval === interval) : true)
                && (name ? (name === 'all' || payment.name.includes(name)) : true)
                && (Number(costRange?.min) ? Number(payment.cost) >= Number(costRange.min) : true) 
                && (Number(costRange?.max) ? Number(payment.cost) <= Number(costRange.max) : true) 
            )
        /*
        // 分頁設定
        dataTotal = (bookingList.length);
        pageTotal = Math.ceil(bookingList.length / pageSize);
        bookingList = bookingList.slice((pageIndex - 1) * pageSize, pageIndex * pageSize);
        return {bookingList, pagingParam:{...pagingParam, pageTotal, dataTotal}};
        */
        return paymentList;
    }

    /** 查詢方案, 依照 paymentid */
    static async find(id) {
        const doc = await db.collection(COLLECTION_NAME).doc(id).get();
        if (!doc.exists) {
            console.log('找無此 方案');
            return null;
        }
        console.log("取得 方案 : ", {id: doc.id, ...doc.data()});
        return {id: doc.id, ...doc.data()};
    }
    
    /* 新增 [方案] */
    static async add(payment) {
        const docRef = await db.collection(COLLECTION_NAME).add(payment);
        const docSnapshot = await docRef.get();
        console.log(" 新增 [方案] : ", {id: docRef.id, ...docSnapshot.data()});
        return ({id: docRef.id, ...docSnapshot.data()})
    }

    /* 更新 [方案] */
    static async update(payment) {
        const docRef = db.collection(COLLECTION_NAME).doc(payment.id);
        let {id, ..._payment} = payment;
        await docRef.update(_payment);
        console.log("更新後 [方案]  : ", payment);
        return payment;
    }

    /* 刪除 [方案] */
    static async delete(id) {
        const docRef = db.collection(COLLECTION_NAME).doc(id);
        await docRef.delete();
        console.log("刪除 [方案] : ", id);
        return id;
    }
     
    // 取得所有 方案費用 資訊
    static async getAllPaymentList() {
        const snapshot = await db.collection(COLLECTION_NAME).get();
        return snapshot.docs.map(doc => {
            const data = doc.data();
            return new Payment(
                doc.id,
                data.cost || "無 cost",
                data.desc || "無 desc",
                data.name || "無 name",
                data.interval || "無 interval",
                data.type || "無 type",
            );
        });
    }

    // 匯入 所有 付費方案 進入空表, 不卡控, 使用於備份還原。
    static async importAllPayment(paymentList) {
        try {
            // 檢查表是否已存在資料
            const snapshot = await db.collection(COLLECTION_NAME).limit(1).get();
            if (!snapshot.empty) {
                console.log('[importAllPayment]: 表已存在資料，匯入中止。');
                return { message: '表已存在資料，匯入中止。' };
            }

            // 表無資料，開始匯入
            const batch = db.batch();
            paymentList.forEach(paymentData => {
                const payment = new Payment(
                    paymentData.id.replace(/"/g, ''),
                    paymentData.cost.replace(/"/g, ''),
                    paymentData.desc.replace(/"/g, ''),
                    paymentData.name.replace(/"/g, ''),
                    paymentData.interval.replace(/"/g, ''),
                    paymentData.type.replace(/"/g, ''),
                );
                const docRef = db.collection(COLLECTION_NAME).doc(payment.id);
                batch.set(docRef, {
                    cost: payment.cost,
                    desc: payment.desc,
                    name: payment.name,
                    interval: payment.interval,
                    type: payment.type,
                });
            });

            await batch.commit();
            console.log('[importAllPayment]: 資料匯入成功。');
            return { message: '資料匯入成功。' };
        } catch (error) {
            console.error('[importAllPayment] error:', error);
            throw error;
        }
    }
}
module.exports = Payment;