const UserToRole = require('../models/userToRole.model');
const User = require('../models/user.model');
const authPermissionService = require('./authPermission.service');

const ERROR_HEADER = "[districtManager.service.js]";

/**
 * 取得區經理列表 (僅系統管理員和總經理可用)
 */
exports.getDistrictManagerList = async (userId) => {
    console.log(`${ERROR_HEADER}[getDistrictManagerList] 開始 userId:`, userId);
    try {
        // 1. 檢查權限
        const isAdmin = await authPermissionService.isAdmin(userId);
        const isGeneralManager = await authPermissionService.isGeneralManager(userId);

        if (!isAdmin && !isGeneralManager) {
            throw new Error('角色權限不符，只有系統管理員和總經理可以查看區經理列表');
        }

        // 2. 查詢所有區經理角色
        const pagingParam = { 
            pageIndex: 1, 
            pageSize: 1000, 
            sort: "asc", 
            pageTotal: -1, 
            dataTotal: -1 
        };
        const districtManagerRoles = (await UserToRole.search({ role: 'DistrictManager' }, pagingParam)).userToRoleList;
        
        console.log(`${ERROR_HEADER} 找到 ${districtManagerRoles.length} 位區經理`);

        if (districtManagerRoles.length === 0) {
            return [];
        }

        // 3. 取得區經理的用戶資料
        const userIds = districtManagerRoles.map(r => r.userId);
        const userList = (await User.search({}, pagingParam)).userList;

        // 4. 組合結果
        const districtManagerList = districtManagerRoles.map(role => {
            const user = userList.find(u => u.id === role.userId);
            if (!user) {
                console.warn(`${ERROR_HEADER} 找不到 userId=${role.userId} 的用戶`);
                return null;
            }
            return {
                id: role.id,              // UserToRole 的 id
                userId: user.id,          // User 的 id
                userEmail: user.mail,     // 區經理 email
                userAccount: user.account, // 區經理帳號
                role: 'DistrictManager',
                createdAt: role.createdAt
            };
        }).filter(item => item !== null);

        console.log(`${ERROR_HEADER} 返回 ${districtManagerList.length} 位區經理資料`);
        return districtManagerList;
    } catch (error) {
        console.error(`${ERROR_HEADER}[getDistrictManagerList] 失敗:`, error);
        throw error;
    }
};

/**
 * 透過 email 新增區經理 (僅系統管理員和總經理可用)
 */
exports.addDistrictManagerByEmail = async (email, currentUserId) => {
    console.log(`${ERROR_HEADER}[addDistrictManagerByEmail] 開始 email:`, email);
    try {
        // 1. 檢查權限
        const isAdmin = await authPermissionService.isAdmin(currentUserId);
        const isGeneralManager = await authPermissionService.isGeneralManager(currentUserId);

        if (!isAdmin && !isGeneralManager) {
            throw new Error('角色權限不符，只有系統管理員和總經理可以新增區經理');
        }

        // 2. 根據 email 查找用戶
        const user = await User.findByMail(email);
        if (!user) {
            throw new Error('該 mail 不存在 User 表中，無法新增區經理');
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
            throw new Error('當前 User 已有角色，無法新增區經理');
        }

        // 4. 新增 DistrictManager 角色到 UserToRole
        const newRole = await UserToRole.insert({
            userId: user.id,
            role: 'DistrictManager'
        });

        console.log(`${ERROR_HEADER} 成功新增區經理 userId=${user.id}`);
        
        return {
            id: newRole.id,
            userId: user.id,
            userEmail: user.mail,
            userAccount: user.account,
            role: 'DistrictManager'
        };
    } catch (error) {
        console.error(`${ERROR_HEADER}[addDistrictManagerByEmail] 失敗:`, error);
        throw error;
    }
};

/**
 * 刪除區經理 (僅系統管理員和總經理可用)
 */
exports.deleteDistrictManager = async (roleId, currentUserId) => {
    console.log(`${ERROR_HEADER}[deleteDistrictManager] 開始 roleId:`, roleId);
    try {
        // 1. 檢查權限
        const isAdmin = await authPermissionService.isAdmin(currentUserId);
        const isGeneralManager = await authPermissionService.isGeneralManager(currentUserId);

        if (!isAdmin && !isGeneralManager) {
            throw new Error('角色權限不符，只有系統管理員和總經理可以刪除區經理');
        }

        // 2. 查詢該角色是否存在
        const role = await UserToRole.findById(roleId);
        if (!role) {
            throw new Error('找不到該區經理角色');
        }

        if (role.role !== 'DistrictManager') {
            throw new Error('該角色不是區經理，無法刪除');
        }

        // 3. 刪除角色
        await UserToRole.delete(roleId);

        console.log(`${ERROR_HEADER} 成功刪除區經理 roleId=${roleId}`);
        
        return { success: true, message: '刪除區經理成功' };
    } catch (error) {
        console.error(`${ERROR_HEADER}[deleteDistrictManager] 失敗:`, error);
        throw error;
    }
};
