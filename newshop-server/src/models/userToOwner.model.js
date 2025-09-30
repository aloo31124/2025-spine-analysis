const db = require('../firestore');
const Fuse = require('fuse.js');
const COLLECTION_NAME = 'UserToOwner';

class UserToOwner {
    constructor(id, ownerId, userId) {
        this.id = id;
        this.ownerId = ownerId;
        this.userId = userId;
    }

    // 建立 UserToOwner 
    static async create(userToOwner) {
        const docRef = await db.collection(COLLECTION_NAME).add(userToOwner);
        const docSnapshot = await docRef.get();
        return { id: docRef.id, ...docSnapshot.data() };
    }

    // 找 擁有者 依照 ownerId
    static async findByOwnerId(ownerId) {
        const snapshot = await db.collection(COLLECTION_NAME).where('ownerId', '==', ownerId).get();
        let list = [];
        snapshot.forEach(doc => {
            list.push({id:doc.id, ...doc.data()});
        });
        return list;
    }

    // 找 擁有者 依照 userId
    static async findByUserId(userId) {
        const snapshot = await db.collection(COLLECTION_NAME).where('userId', '==', userId).get();
        let list = [];
        snapshot.forEach(doc => {
            list.push({id:doc.id, ...doc.data()});
        });
        return list;
    }
     
    // 取得所有 使用者 擁有者 id 比對 資訊
    static async getAllUserToOwnerList() {
        const snapshot = await db.collection(COLLECTION_NAME).get();
        return snapshot.docs.map(doc => {
            const data = doc.data();
            return new UserToOwner(
                doc.id,
                data.ownerId || "無 ownerId",
                data.userId || "無 userId"
            );
        });
    }

    // 匯入 所有 使用者對應擁有者 進入空表, 不卡控, 使用於備份還原。
    static async importAllUserToOwner(userToOwnerList) {
        try {
            // 檢查 Room 表是否已存在資料
            const snapshot = await db.collection(COLLECTION_NAME).limit(1).get();
            if (!snapshot.empty) {
                console.log('[importAllUserToOwner]: 資料表已存在資料，匯入中止。');
                return { message: '資料表已存在資料，匯入中止。' };
            }

            // Room 表無資料，開始匯入
            const batch = db.batch();
            userToOwnerList.forEach(userData => {
                const user = new UserToOwner(
                    userData.id.replace(/"/g, ''),
                    userData.ownerId.replace(/"/g, ''),
                    userData.userId.replace(/"/g, ''),
                );
                const docRef = db.collection(COLLECTION_NAME).doc(user.id);
                batch.set(docRef, {
                    ownerId: user.ownerId,
                    userId: user.userId,
                });
            });

            await batch.commit();
            console.log('[importAllUserToOwner]: 資料匯入成功。');
            return { message: '資料匯入成功。' };
        } catch (error) {
            console.error('[importAllUserToOwner] error:', error);
            throw error;
        }
    }
}
module.exports = UserToOwner;