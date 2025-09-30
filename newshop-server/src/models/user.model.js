const db = require('../firestore');
const COLLECTION_NAME = 'User';

class User {
    constructor({id, account, mail, status, phone, role, pay, password, createdAt}) {
        this.id = id || ""; // 不能納入 firestore 欄位
        this.account = account || "";
        this.mail = mail || "";
        this.status = status || "無 狀態 status ";
        this.phone = phone || "";
        this.role = role || "無 role";
        this.pay = pay || "無 pay";
        this.password = password || "";
        this.createdAt = createdAt || new Date();
    }

    // 取得所有使用者資訊, 完整資訊
    static async getAllUserList() {
        const snapshot = await db.collection(COLLECTION_NAME).get();
        
        if (snapshot.empty) {
            return []; // 若無資料則回傳空陣列
        }

        // 轉換 Firestore Document 為 JSON 陣列
        const userList = snapshot.docs.map(doc => ({
            id: doc.id, // Firestore 自動生成的 document ID
            ...doc.data()
        }));

        return userList;
    }

    /** 匯入 所有 排程工作 進入空表, 不卡控, 使用於備份還原。 */
    static async importAllUser(userList) {
        try {
            // 檢查表是否已存在資料
            const snapshot = await db.collection(COLLECTION_NAME).limit(1).get();
            if (!snapshot.empty) {
                console.log('[importAllUser]: 表已存在資料，匯入中止。');
                return { message: '表已存在資料，匯入中止。' };
            }

            // 表無資料，開始匯入
            const batch = db.batch();
            userList.forEach(userData => {
                const user = new User({
                    id: userData.id || "",
                    account: userData.account || "",
                    mail: userData.mail || "",
                    status: userData.status || "",
                    phone: userData.phone || "",
                    role: userData.role || "",
                    pay: userData.pay || "",
                    password: userData.password || "",
                    createdAt: userData.createdAt || "",
                });
                const docRef = db.collection(COLLECTION_NAME).doc(user.id.replace(/"/g, ''));
                batch.set(docRef, {
                    account: user.account.replace(/"/g, '') || "",
                    mail: user.mail.replace(/"/g, '') || "",
                    status: user.status.replace(/"/g, '') || "",
                    phone: user.phone.replace(/"/g, '') || "",
                    role: user.role.replace(/"/g, '') || "",
                    pay: user.pay.replace(/"/g, '') || "",
                    password: user.password.replace(/"/g, '') || "",
                    createdAt: user.createdAt.replace(/"/g, '') || "",
                });
            });

            await batch.commit();
            console.log('[importAllUser]: 資料匯入成功。');
            return { message: '資料匯入成功。' };
        } catch (error) {
            console.error('[importAllUser] error:', error);
            throw error;
        }
    }

    // 將 User 類實例轉為純對象
    toPlainObject() {
        return { ...this };
    }

    static async findByAccount(account) {
        const snapshot = await db.collection(COLLECTION_NAME).where('account', '==', account).get();
        return snapshot.empty ? null : { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
    }

    static async findByMail(mail) {
        const snapshot = await db.collection(COLLECTION_NAME).where('mail', '==', mail).get();
        return snapshot.empty ? null : { id: snapshot.docs[0].id, ...snapshot.docs[0].data(), ref: snapshot.docs[0].ref };
    }

    static async create(user) {
        const docRef = await db.collection(COLLECTION_NAME).add(user);
        const docSnapshot = await docRef.get();
        return { id: docRef.id, ...docSnapshot.data() };
    }

    static async update(userRef, fieldsToUpdate) {
        await userRef.update(fieldsToUpdate);
        const updatedSnapshot = await userRef.get();
        return { id: userRef.id, ...updatedSnapshot.data() };
    }
}

module.exports = User;

