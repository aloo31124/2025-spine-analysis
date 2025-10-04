const db = require('../firestore');
const Fuse = require('fuse.js');
const COLLECTION_NAME = 'PaymentHistory';

class PaymentHistory {
    constructor(id, userId, paymentId, message) {
        this.id = id;
        this.userId = userId;
        this.paymentId = paymentId;
        this.message = message;
        this.createdAt = new Date();
    }

    /** 查詢方案, 依照 paymentid */
    static async find(id) {
        const doc = await db.collection(COLLECTION_NAME).doc(id).get();
        if (!doc.exists) {
            console.log('找無此 方案 購買紀錄');
            return null;
        }
        console.log("取得 方案 購買紀錄: ", {id: doc.id, ...doc.data()});
        return {id: doc.id, ...doc.data()};
    }
    
    /* 新增 [方案][購買紀錄] */
    static async add(history) {
        const docRef = await db.collection(COLLECTION_NAME).add({...history, createdAt: new Date()});
        const docSnapshot = await docRef.get();
        console.log(" 新增 [方案][購買紀錄] : ", {id: docRef.id, ...docSnapshot.data()});
        return ({id: docRef.id, ...docSnapshot.data()})
    }

    /* 搜尋 [金流紀錄] */
    static async search(paymentHistory, pagingParam) {
        const { userId, paymentId } = paymentHistory;
        let { pageIndex, pageSize, sort, pageTotal, dataTotal } = pagingParam; // 分頁參數
        //const pageIndex = 1;const pageSize = 3;const sort = 'name' ; // 分頁參數
        let query = db.collection(COLLECTION_NAME);
        const snapshot = await query.get();
        let historyList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // 無模糊搜尋

        historyList = historyList
            .sort((a, b) => a[sort] > b[sort] ? 1 : -1)
            .filter(result => 
                (userId ? result.userId === userId : true)
                && (paymentId ? result.paymentId === paymentId : true)
            )
        
        // 分頁設定
        dataTotal = (historyList.length);
        pageTotal = Math.ceil(historyList.length / pageSize);
        historyList = historyList.slice((pageIndex - 1) * pageSize, pageIndex * pageSize);

        return {historyList, pagingParam:{...pagingParam, pageTotal, dataTotal}};

    }
}
module.exports = PaymentHistory;