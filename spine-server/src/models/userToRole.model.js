const db = require('../firestore');
const Fuse = require('fuse.js');
const COLLECTION_NAME = 'UserToRole';

class UserToRole {

    constructor(id, userId, role) {
        this.id = id;
        this.userId = userId;
        this.role = role;
    }

    // 查詢符合條件的使用者
    static async search(userToRole, pagingParam) {
        const { role } = userToRole;
        let { pageIndex, pageSize, sort, pageTotal, dataTotal } = pagingParam; // 分頁參數
        //const pageIndex = 1;const pageSize = 3;const sort = 'name' ; // 分頁參數
        let query = db.collection(COLLECTION_NAME);
        const snapshot = await query.get();
        let userToRoleList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        userToRoleList = userToRoleList
            .sort((a, b) => a[sort] > b[sort] ? 1 : -1)
            .filter(result => 
                (role ? result.role === role : true)
            )
        
        // 分頁設定
        dataTotal = (userToRoleList.length);
        pageTotal = Math.ceil(userToRoleList.length / pageSize);
        userToRoleList = userToRoleList.slice((pageIndex - 1) * pageSize, pageIndex * pageSize);

        return {userToRoleList, pagingParam:{...pagingParam, pageTotal, dataTotal}};
    }

    // 新增 該使用者 對應之 角色
    static async add(userToRole) {
        const docRef = await db.collection(COLLECTION_NAME).add(userToRole);
        const docSnapshot = await docRef.get();
        return { id: docRef.id, ...docSnapshot.data() };
    }
     
    // 取得所有 全部 使用者 權限 資訊
    static async getAllUserToRole() {
        const snapshot = await db.collection(COLLECTION_NAME).get();
        return snapshot.docs.map(doc => {
            const data = doc.data();
            return new UserToPermission(
                doc.id,
                data.userId || "無 userId",
                data.role || "無 role"
            );
        });
    }

    // 匯入 所有 使用者對應權限 進入空表, 不卡控, 使用於備份還原。
    static async importAllUserToRole(userToRoleList) {
        try {
            // 檢查 Room 表是否已存在資料
            const snapshot = await db.collection(COLLECTION_NAME).limit(1).get();
            if (!snapshot.empty) {
                console.log('[importAllUserToRole]: 資料表已存在資料，匯入中止。');
                return { message: '資料表已存在資料，匯入中止。' };
            }

            // Room 表無資料，開始匯入
            const batch = db.batch();
            userToRoleList.forEach(userToRoleData => {
                const userToRole = new UserToRole(
                    userToRoleData.id.replace(/"/g, ''),
                    userToRoleData.role.replace(/"/g, ''),
                    userToRoleData.userId.replace(/"/g, ''),
                );
                const docRef = db.collection(COLLECTION_NAME).doc(userToRole.id);
                batch.set(docRef, {
                    role: userToRole.role,
                    userId: userToRole.userId,
                });
            });

            await batch.commit();
            console.log('[importAllUserToRole]: 資料匯入成功。');
            return { message: '資料匯入成功。' };
        } catch (error) {
            console.error('[importAllUserToRole] error:', error);
            throw error;
        }
    }

    // 搜尋 使用者對應角色, 依照 userId
    static async findByUserId(userId) {
        const snapshot = await db.collection(COLLECTION_NAME).where('userId', '==', userId).get();
        //return snapshot.empty ? null : { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
        return snapshot.empty ? [] :
            snapshot.docs.map(doc => {
                return {id: doc.id, ...doc.data()};
            });
    }

    // 刪除使用者角色對應關係
    static async delete(id) {
        try {
            await db.collection(COLLECTION_NAME).doc(id).delete();
            return { success: true, message: '角色刪除成功' };
        } catch (error) {
            console.error('[UserToRole.delete] error:', error);
            throw error;
        }
    }

    // 根據 userId 和 role 查找
    static async findByUserIdAndRole(userId, role) {
        const snapshot = await db.collection(COLLECTION_NAME)
            .where('userId', '==', userId)
            .where('role', '==', role)
            .get();
        return snapshot.empty ? null : { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
    }
}
module.exports = UserToRole;

