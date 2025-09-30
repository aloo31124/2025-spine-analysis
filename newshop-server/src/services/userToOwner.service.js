const UserToOwner = require('../models/userToOwner.model');
const UserToRole = require('../models/userToRole.model');
const User = require('../models/user.model');

/* 匯出 全部 使用擁有者 */
exports.getUserToOwner = async () => {
    try {
        return await UserToOwner.getAllUserToOwnerList();
    } catch (error) {
        console.error("[getUserToOwner] Error:", error);
    }
}

/* 找尋 擁有者 依照 預約者id, userId */
exports.findOwnerByUserId = async (userId) => {
    try {
        return await UserToOwner.findByUserId(userId);
    } catch (error) {
        console.error("[findOwnerByUserId] Error:", error);
    }
}

/* 新增 預約者 對應 擁有者 */
exports.addUserToOwner = async (userToOwner) => {
    try {
        return await UserToOwner.create(userToOwner);
    } catch (error) {
        console.error("[addUserToOwner] Error:", error);
    }
}

/* 查詢 擁有者, 依照 email */
exports.getOwnerByEmail = async (email) => {
    try {
        // 查詢該信箱使用者
        const owner = await User.findByMail(email);
        if(!owner) {
            console.error("[getUserToOwnerExportList] 查無此帳號 email :", email);
            return {error: "查無此帳號 email :" + email};
        }
        // 查詢該使用者是否為 擁有者
        const userToRole = await UserToRole.findByUserId(owner.id);
        if(!userToRole) {
            console.error("[getUserToOwnerExportList] 此使用者非擁有者 :", owner);
            return {error: "此使用者非擁有者 :" + owner};
        }
        console.log("[getUserToOwnerExportList] 查詢到該 擁有者 owner :", owner);
        return owner;
    } catch (error) {
        console.error("[getUserToOwnerExportList] Error:", error);
    }
}
