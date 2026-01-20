const UserToRole = require('../models/userToRole.model');
const User = require('../models/user.model');

const ERROR_HEADER = "[authPermission.service.js]";

/**
 * 檢查使用者角色權限
 */
exports.checkUserRole = async (userId) => {
    console.log(`${ERROR_HEADER}[checkUserRole] 開始檢查 userId:`, userId);
    try {
        if (!userId) {
            throw new Error('使用者 ID 不存在');
        }

        // 查詢使用者角色
        const pagingParam = { 
            pageIndex: 1, 
            pageSize: 100, 
            sort: "asc", 
            pageTotal: -1, 
            dataTotal: -1 
        };
        const userRoles = (await UserToRole.findByUserId(userId));

        console.log(`${ERROR_HEADER} 找到 ${userRoles.length} 個角色`);
        return {
            userId,
            roles: userRoles.map(r => ({ role: r.role, id: r.id }))
        };
    } catch (error) {
        console.error(`${ERROR_HEADER}[checkUserRole] 失敗:`, error);
        throw error;
    }
};

/**
 * 取得所有店長列表 (僅總經理和系統管理員可使用)
 */
exports.getStoreManagerList = async (userId) => {
    console.log(`${ERROR_HEADER}[getStoreManagerList] 開始 userId:`, userId);
    try {
        // 1. 檢查當前使用者角色
        const roleData = await this.checkUserRole(userId);
        const roles = roleData.roles.map(r => r.role);
        
        const isGeneralManager = roles.includes('GeneralManager');
        const isAdmin = roles.includes('Admin');

        if (!isGeneralManager && !isAdmin) {
            throw new Error('角色權限不符，無法取得店長清單');
        }

        // 2. 查詢所有店長角色
        const pagingParam = { 
            pageIndex: 1, 
            pageSize: 1000, 
            sort: "asc", 
            pageTotal: -1, 
            dataTotal: -1 
        };
        const storeManagerRoles = (await UserToRole.search({ role: 'StoreManager' }, pagingParam)).userToRoleList;
        
        console.log(`${ERROR_HEADER} 找到 ${storeManagerRoles.length} 位店長`);

        if (storeManagerRoles.length === 0) {
            return [];
        }

        // 3. 取得店長的用戶資料
        const userIds = storeManagerRoles.map(r => r.userId);
        const userList = (await User.search({}, pagingParam)).userList;

        // 4. 組合結果
        const storeManagerList = storeManagerRoles.map(role => {
            const user = userList.find(u => u.id === role.userId);
            if (!user) {
                console.warn(`${ERROR_HEADER} 找不到 userId=${role.userId} 的用戶`);
                return null;
            }
            return {
                userId: user.id,
                account: user.account || '',
                mail: user.mail || '',
                roleId: role.id
            };
        }).filter(item => item !== null);

        console.log(`${ERROR_HEADER} 返回 ${storeManagerList.length} 位店長資料`);
        return storeManagerList;
    } catch (error) {
        console.error(`${ERROR_HEADER}[getStoreManagerList] 失敗:`, error);
        throw error;
    }
};

/**
 * 檢查使用者是否為總經理
 */
exports.isGeneralManager = async (userId) => {
    console.log(`${ERROR_HEADER}[isGeneralManager] 開始檢查 userId:`, userId);
    try {
        if (!userId) {
            return false;
        }
        
        const userRole = await UserToRole.findByUserIdAndRole(userId, 'GeneralManager');
        const isGM = !!userRole;
        
        console.log(`${ERROR_HEADER} userId=${userId} 是否為總經理: ${isGM}`);
        return isGM;
    } catch (error) {
        console.error(`${ERROR_HEADER}[isGeneralManager] Error:`, error);
        return false;
    }
};

/**
 * 檢查使用者是否為系統管理員
 */
exports.isAdmin = async (userId) => {
    console.log(`${ERROR_HEADER}[isAdmin] 開始檢查 userId:`, userId);
    try {
        if (!userId) {
            return false;
        }
        
        const userRole = await UserToRole.findByUserIdAndRole(userId, 'Admin');
        const isAdm = !!userRole;
        
        console.log(`${ERROR_HEADER} userId=${userId} 是否為系統管理員: ${isAdm}`);
        return isAdm;
    } catch (error) {
        console.error(`${ERROR_HEADER}[isAdmin] Error:`, error);
        return false;
    }
};
