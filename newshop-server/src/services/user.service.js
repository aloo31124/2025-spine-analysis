
const db = require('../firestore');
const User = require("../models/user.model");

/* 匯出所有 使用者 列表 */
exports.getAllUserList = async () => {
    try {
        return await User.getAllUserList();
    } catch (error) {
        console.error("[getAllUserList] error :", error);
    }
}

/* 匯入 所有 使用者 進入空表, 不卡控, 使用於備份還原。 */
exports.importAllUser = async (userList) => {
    try {
        return await User.importAllUser(userList);
    } catch (error) {
        console.error("[importAllUser] error :", error);
    }
}

/* 取得使用者資訊, 依mail */
exports.getUserByEmail = async (email) => {
    const snapshot = await db.collection('User').where('mail', '==', email).get();
    if(snapshot.empty) {
        console.log('找無 email 使用者資訊, email :', email);
        return;
    }
    const doc = snapshot.docs[0];
    return {id: doc.id, ...doc.data()};
}

/* 取得使用者資訊, 依account */
exports.getUserByAccount = async (account) => {
    const snapshot = await db.collection('User').where('account', '==', account).get();
    if(snapshot.empty) {
        console.log('取得使用者資訊, account為空');
        return;
    }
    const doc = snapshot.docs[0];
    return {id: doc.id, ...doc.data()};
}

/* 新增使用者 */
exports.addUser = async (user) => {
    const snapshot = await db.collection('User').where('mail', '==', user.mail).get();
    if(!snapshot.empty) {
        console.log('已有該信件使用者 mail : ', user.mail);
        return snapshot;
    }
    const docRef = await db.collection('User').add(user);
    const docSnapshot = await docRef.get();
    console.log('建立使用者 mail : ', user.mail);
    return ({id: docRef.id, ...docSnapshot.data()});
}

/* 更新使用者資訊 */
exports.updateUser = async (user) => {
    const snapshot = await db.collection('User').where('mail', '==', user.mail).get();
    if(snapshot.empty) {
        console.log('無該信件使用者 mail : ', user.mail);
        return {};
    }
    const doc = snapshot.docs[0];
    const docRef = doc.ref;
    const { mail:_, ...fieldsToUpdate} = user;
    docRef.update(fieldsToUpdate);
    const docSnapshot = await docRef.get();
    return {id:docRef.id, ...docSnapshot.data()};
}

/* 登入 */
exports.login = async (email, password) => {
    const snapshot = await db.collection('User').where("mail", "==", email).get();
    if(snapshot.empty) {
        console.log('登入無此帳號');
        return false;
    }
    const doc = snapshot.docs[0];
    const docRef = doc.ref;
    const docSnapshot = await docRef.get();
    const user = {id: docRef.id, ...docSnapshot.data()};
    return await user.password === password;
}

