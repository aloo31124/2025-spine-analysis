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

/* 刪除使用者角色對應關係 */
exports.deleteUserToRole = async (id) => {
    console.log("[deleteUserToRole] 開始 id :", id);
    try {
        return await UserToRole.delete(id);
    } catch (error) {
        console.log("[deleteUserToRole] 失敗", error);
        throw new Error("[deleteUserToRole] 刪除失敗");
    }
};

/* 根據 email 查找用戶並新增 StoreManager 角色 */
exports.addStoreManagerByEmail = async (email) => {
    console.log("[addStoreManagerByEmail] 開始 email :", email);
    try {
        // 1. 根據 email 查找用戶
        const user = await User.findByMail(email);
        if (!user) {
            throw new Error("找不到該用戶");
        }

        // 2. 檢查是否已經是 StoreManager
        const existingRole = await UserToRole.findByUserIdAndRole(user.id, 'StoreManager');
        if (existingRole) {
            throw new Error("該用戶已經是店長");
        }

        // 3. 新增 StoreManager 角色
        const newRole = await UserToRole.add({ userId: user.id, role: 'StoreManager' });
        
        return {
            ...newRole,
            email: user.mail,
            userName: user.account
        };
    } catch (error) {
        console.log("[addStoreManagerByEmail] 失敗", error);
        throw error;
    }
};

/* 取得所有店長列表 */
exports.getStoreManagerList = async () => {
    console.log("[getStoreManagerList] 開始");
    try {
        const pagingParam = { pageIndex: 1, pageSize: 1000, sort: "asc", pageTotal:-1, dataTotal:-1 };
        
        // 步驟1: 從 UserToRole 表找出所有 role='StoreManager' 的資料
        const userToRoleList = (await UserToRole.search({role: 'StoreManager'}, pagingParam)).userToRoleList;
        console.log(`[getStoreManagerList] 找到 ${userToRoleList.length} 位店長`);
        
        // 步驟2: 取得所有用戶資料
        const userList = (await User.search({}, pagingParam)).userList;
        
        // 步驟3: 根據 userId 到 User 表找出對應資料，並組合結果
        const storeManagerList = userToRoleList.map((userToRole) => {
            const user = userList.find((u) => u.id === userToRole.userId);
            if (!user) {
                console.warn(`[getStoreManagerList] 找不到 userId=${userToRole.userId} 的用戶`);
                return null;
            }
            return {
                id: userToRole.id,           // UserToRole 的 id
                userId: user.id,             // User 的 id（用於保存到 Store.storeManagerId）
                role: userToRole.role,       // 角色：StoreManager
                userName: user.mail,         // 顯示名稱（使用 mail 欄位）
                userEmail: user.mail,        // User 的 email
                userAccount: user.account    // User 的 account
            };
        }).filter((item) => item !== null);
        
        console.log(`[getStoreManagerList] 返回 ${storeManagerList.length} 位店長資料`);
        return storeManagerList;
    } catch (error) {
        console.error("[getStoreManagerList] Error:", error);
        throw error;
    }
}


