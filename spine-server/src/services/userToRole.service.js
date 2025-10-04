const UserToRole = require("../models/userToRole.model");
const User = require('../models/user.model');


/* 搜尋 使用者對應角色, 依照 userId */
exports.getUserRoleByUserId = async (userId) => {
    console.log("[getUserRoleByUserId] 開始 userId :", userId);
    try {
        return await UserToRole.findByUserId(userId);
    } catch (error) {
        console.log("[getUserRoleByUserId] 失敗", error);
        throw new Error("[getUserRoleByUserId] 新增使用者失敗");
    }
};


/* 新增 該使用者 對應之 角色 */
exports.addUserToRole = async (userToRole) => {
    console.log("[addUserToRole] 開始 userToRole :", userToRole);
    try {
        return await UserToRole.add(userToRole);
    } catch (error) {
        console.log("[addUserToRole] 失敗", error);
        throw new Error("[addUserToRole] 新增使用者失敗");
    }
};


/** 搜尋 [使用者角色], 使用者 join 使用者信箱, 方案 */
exports.joinUserRole = async (email, role) => {
    try {
        console.log(`[joinUserRole] 開始  email: ${email} , role: ${role}`);
        const pagingParam = { pageIndex: 1, pageSize: 1000, sort: "asc", pageTotal:-1, dataTotal:-1 };

        // 篩選 使用者
        const userList = (await User.search({email}, pagingParam)).userList;

        // 篩選 使用者角色
        const userToRoleList = (await UserToRole.search({role}, pagingParam)).userToRoleList;

        // 合併 表
        return userToRoleList.map((userToRole) => {
            const user = userList.find((user) => user.id === userToRole.userId);
            if(!user) return null;
            return {
                email: user.email,
                ...userToRole,
            }
        })
        .filter((userToRole) => userToRole !== null);
    } catch (error) {
        console.error("[joinUserRole] Error:", error);
    }
}

