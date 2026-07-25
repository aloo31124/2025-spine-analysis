const UserToRole = require('../models/userToRole.model');
const User = require('../models/user.model');
const authPermissionService = require('./authPermission.service');

const ERROR_HEADER = "[generalManager.service.js]";

/**
 * 取得總經理列表 (僅系統管理員和總經理可用)
 */
exports.getGeneralManagerList = async (userId) => {
    console.log(`${ERROR_HEADER}[getGeneralManagerList] 開始 userId:`, userId);
    try {
        // 1. 檢查權限
        const isAdmin = await authPermissionService.isAdmin(userId);
        const isGeneralManager = await authPermissionService.isGeneralManager(userId);

        if (!isAdmin && !isGeneralManager) {
            throw new Error('角色權限不符，只有系統管理員和總經理可以查看總經理列表');
        }

        // 2. 查詢所有總經理角色
        const pagingParam = { 
            pageIndex: 1, 
            pageSize: 1000, 
            sort: "asc", 
            pageTotal: -1, 
            dataTotal: -1 
        };
        const generalManagerRoles = (await UserToRole.search({ role: 'GeneralManager' }, pagingParam)).userToRoleList;
        
        console.log(`${ERROR_HEADER} 找到 ${generalManagerRoles.length} 位總經理`);

        if (generalManagerRoles.length === 0) {
            return [];
        }

        // 3. 取得總經理的用戶資料
        const userIds = generalManagerRoles.map(r => r.userId);
        const userList = (await User.search({}, pagingParam)).userList;

        // 4. 組合結果
        const generalManagerList = generalManagerRoles.map(role => {
            const user = userList.find(u => u.id === role.userId);
            if (!user) {
                console.warn(`${ERROR_HEADER} 找不到 userId=${role.userId} 的用戶`);
                return null;
            }
            return {
                id: role.id,              // UserToRole 的 id
                userId: user.id,          // User 的 id
                userEmail: user.mail,     // 總經理 email
                userAccount: user.account, // 總經理帳號
                role: 'GeneralManager',
                createdAt: role.createdAt
            };
        }).filter(item => item !== null);

        console.log(`${ERROR_HEADER} 返回 ${generalManagerList.length} 位總經理資料`);
        return generalManagerList;
    } catch (error) {
        console.error(`${ERROR_HEADER}[getGeneralManagerList] 失敗:`, error);
        throw error;
    }
};

/**
 * 透過 email 新增總經理 (僅系統管理員和總經理可用)
 */
exports.addGeneralManagerByEmail = async (email, currentUserId) => {
    console.log(`${ERROR_HEADER}[addGeneralManagerByEmail] 開始 email:`, email);
    try {
        // 1. 檢查權限
        const isAdmin = await authPermissionService.isAdmin(currentUserId);
        const isGeneralManager = await authPermissionService.isGeneralManager(currentUserId);

        if (!isAdmin && !isGeneralManager) {
            throw new Error('角色權限不符，只有系統管理員和總經理可以新增總經理');
        }

        // 2. 根據 email 查找用戶
        const user = await User.findByMail(email);
        if (!user) {
            throw new Error('該 mail 不存在 User 表中，無法新增總經理');
        }

        // 3. 檢查該用戶是否已經有其他角色
        const pagingParam = { 
            pageIndex: 1, 
            pageSize: 100, 
            sort: "asc", 
            pageTotal: -1, 
            dataTotal: -1 
        };
        const existingRoles = (await UserToRole.findByUserId(user.id));
        
        if (existingRoles.length > 0) {
            throw new Error('當前 User 已有角色，無法新增總經理');
        }

        // 4. 新增 GeneralManager 角色到 UserToRole
        const newRole = await UserToRole.add({ 
            userId: user.id, 
            role: 'GeneralManager' 
        });

        console.log(`${ERROR_HEADER} 成功新增總經理:`, newRole);
        return {
            id: newRole.id,
            userId: user.id,
            email: user.mail,
            userName: user.account,
            role: 'GeneralManager'
        };
    } catch (error) {
        console.error(`${ERROR_HEADER}[addGeneralManagerByEmail] 失敗:`, error);
        throw error;
    }
};

/**
 * 刪除總經理 (僅系統管理員和總經理可用)
 */
exports.deleteGeneralManager = async (roleId, currentUserId) => {
    console.log(`${ERROR_HEADER}[deleteGeneralManager] 開始 roleId:`, roleId);
    try {
        // 1. 檢查權限
        const isAdmin = await authPermissionService.isAdmin(currentUserId);
        const isGeneralManager = await authPermissionService.isGeneralManager(currentUserId);

        if (!isAdmin && !isGeneralManager) {
            throw new Error('角色權限不符，只有系統管理員和總經理可以刪除總經理');
        }

        // 2. 獲取角色資料
        const role = await UserToRole.findById(roleId);
        if (!role) {
            throw new Error('找不到該角色');
        }

        if (role.role !== 'GeneralManager') {
            throw new Error('該角色不是總經理');
        }

        // 3. 刪除角色
        await UserToRole.delete(roleId);

        console.log(`${ERROR_HEADER} 成功刪除總經理 roleId:`, roleId);
        return { 
            success: true, 
            message: '總經理已刪除' 
        };
    } catch (error) {
        console.error(`${ERROR_HEADER}[deleteGeneralManager] 失敗:`, error);
        throw error;
    }
};
