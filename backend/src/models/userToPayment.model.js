const db = require('../firestore');
const Fuse = require('fuse.js');
const COLLECTION_NAME = 'UserToPayment';

class UserToPayment {
    constructor(id, paymentId, userId, purchaseDate, expiryDate, createAt) {
        this.id = id;
        this.paymentId = paymentId;
        this.userId = userId;
        this.purchaseDate = purchaseDate;
        this.expiryDate = expiryDate;
        this.createAt = createAt;
    }
    
    /* 新增 [使用者方案] */
    static async add(userToPayment) {
        const docRef = await db.collection(COLLECTION_NAME).add(userToPayment);
        const docSnapshot = await docRef.get();
        console.log(" 新增 [使用者方案] : ", {id: docRef.id, ...docSnapshot.data()});
        return ({id: docRef.id, ...docSnapshot.data()})
    }
     
    // 取得所有 使用者 擁有者 id 比對 資訊
    static async getAllUserToPaymentList() {
        const snapshot = await db.collection(COLLECTION_NAME).get();
        return snapshot.docs.map(doc => {
            const data = doc.data();
            return new UserToPayment(
                doc.id,
                data.paymentId || "無 paymentId",
                data.userId || "無 userId",
                data.purchaseDate || "無 purchaseDate",
                data.expiryDate || "無 expiryDate",
                data.createAt || "無 createAt"
            );
        });
    }

    // 匯入 所有 使用者對應方案 進入空表, 不卡控, 使用於備份還原。
    static async importAllUserToPayment(userToPaymentList) {
        try {
            // 檢查 Room 表是否已存在資料
            const snapshot = await db.collection(COLLECTION_NAME).limit(1).get();
            if (!snapshot.empty) {
                console.log('[importAllUserToPayment]: 資料表已存在資料，匯入中止。');
                return { message: '資料表已存在資料，匯入中止。' };
            }

            // Room 表無資料，開始匯入
            const batch = db.batch();
            userToPaymentList.forEach(userData => {
                const user = new UserToPayment(
                    userData.id.replace(/"/g, ''),
                    userData.paymentId.replace(/"/g, ''),
                    userData.userId.replace(/"/g, ''),
                    userData.purchaseDate.replace(/"/g, ''),
                    userData.expiryDate.replace(/"/g, ''),
                    userData.createAt.replace(/"/g, ''),
                );
                const docRef = db.collection(COLLECTION_NAME).doc(user.id);
                batch.set(docRef, {
                    paymentId: user.paymentId,
                    userId: user.userId,
                    purchaseDate: user.purchaseDate,
                    expiryDate: user.expiryDate,
                    createAt: user.createAt,
                });
            });

            await batch.commit();
            console.log('[importAllUserToPayment]: 資料匯入成功。');
            return { message: '資料匯入成功。' };
        } catch (error) {
            console.error('[importAllUserToPayment] error:', error);
            throw error;
        }
    }

    static async findByUserId(userId) {
        const snapshot = await db.collection(COLLECTION_NAME).where('userId', '==', userId).get();
        return snapshot.empty ? [] : 
            snapshot.docs.map(doc => {
                return {id: doc.id, ...doc.data()};
            });
    }
}
module.exports = UserToPayment;