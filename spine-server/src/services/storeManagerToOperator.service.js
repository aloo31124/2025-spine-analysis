const StoreManagerToOperator = require('../models/storeManagerToOperator.model');
const UserToRole = require('../models/userToRole.model');
const User = require('../models/user.model');

const ERROR_HEADER = "[storeManagerToOperator.service.js]";

/**
 * 根據店長ID獲取其綁定的所有操作員列表
 */
exports.getOperatorListByStoreManager = async (storeManagerId) => {
    console.log(`${ERROR_HEADER}[getOperatorListByStoreManager] 開始 storeManagerId:`, storeManagerId);
    try {
        // 1. 從 StoreManagerToOperator 表找出綁定關係
        const bindingList = await StoreManagerToOperator.findByStoreManagerId(storeManagerId);
        console.log(`${ERROR_HEADER} 找到 ${bindingList.length} 位操作員綁定`);
        
        if (bindingList.length === 0) {
            return [];
        }
        
        // 2. 取得所有操作員的用戶資料
        const operatorIds = bindingList.map(b => b.operatorId);
        const pagingParam = { pageIndex: 1, pageSize: 1000, sort: "asc", pageTotal: -1, dataTotal: -1 };
        const userList = (await User.search({}, pagingParam)).userList;
        
        // 3. 組合結果
        const operatorList = bindingList.map((binding) => {
            const user = userList.find((u) => u.id === binding.operatorId);
            if (!user) {
                console.warn(`${ERROR_HEADER} 找不到 userId=${binding.operatorId} 的用戶`);
                return null;
            }
            return {
                id: binding.id,              // StoreManagerToOperator 的 id
                userId: user.id,             // User 的 id（operatorId）
                operatorId: user.id,         // 操作員 userId
                userName: user.mail,         // 顯示名稱
                userEmail: user.mail,        // 操作員 email
                userAccount: user.account,   // 操作員帳號
                createdAt: binding.createdAt
            };
        }).filter((item) => item !== null);
        
        console.log(`${ERROR_HEADER} 返回 ${operatorList.length} 位操作員資料`);
        return operatorList;
    } catch (error) {
        console.error(`${ERROR_HEADER}[getOperatorListByStoreManager] 失敗:`, error);
        throw error;
    }
};

/**
 * 新增操作員（店長綁定操作員）
 */
exports.addOperatorByEmail = async (email, storeManagerId) => {
    console.log(`${ERROR_HEADER}[addOperatorByEmail] 開始 email:`, email, "storeManagerId:", storeManagerId);
    try {
        // 1. 根據 email 查找用戶
        const user = await User.findByMail(email);
        if (!user) {
            throw new Error("操作員不存在User表中");
        }
        
        // 2. 檢查該用戶是否已經有其他角色
        const existingRoles = (await UserToRole.findByUserId(user.id));
        
        if (existingRoles.length > 0) {
            throw new Error("該使用者已被其他角色綁定");
        }
        
        // 3. 新增 Operator 角色到 UserToRole
        await UserToRole.add({ userId: user.id, role: 'Operator' });
        
        // 4. 新增店長綁定操作員關係
        const binding = await StoreManagerToOperator.add({
            storeManagerId: storeManagerId,
            operatorId: user.id
        });
        
        return {
            ...binding,
            email: user.mail,
            userName: user.account
        };
    } catch (error) {
        console.error(`${ERROR_HEADER}[addOperatorByEmail] 失敗:`, error);
        throw error;
    }
};

/**
 * 刪除操作員綁定
 */
exports.deleteOperator = async (bindingId) => {
    console.log(`${ERROR_HEADER}[deleteOperator] 開始 bindingId:`, bindingId);
    try {
        // 1. 獲取綁定資料
        const binding = await StoreManagerToOperator.findById(bindingId);
        if (!binding) {
            throw new Error("找不到該綁定關係");
        }
        
        // 2. 刪除 UserToRole 中的 Operator 角色
        const pagingParam = { pageIndex: 1, pageSize: 1000, sort: "asc", pageTotal: -1, dataTotal: -1 };
        const userRoles = (await UserToRole.search({ userId: binding.operatorId }, pagingParam)).userToRoleList;
        const operatorRole = userRoles.find(r => r.role === 'Operator');
        
        if (operatorRole) {
            await UserToRole.delete(operatorRole.id);
        }
        
        // 3. 刪除店長綁定操作員關係
        await StoreManagerToOperator.delete(bindingId);
        
        return { success: true, message: '操作員已刪除' };
    } catch (error) {
        console.error(`${ERROR_HEADER}[deleteOperator] 失敗:`, error);
        throw error;
    }
};

/**
 * 檢查使用者是否為操作員
 */
exports.isOperator = async (userId) => {
    console.log(`${ERROR_HEADER}[isOperator] 開始檢查 userId:`, userId);
    try {
        if (!userId) {
            return false;
        }
        
        const userRole = await UserToRole.findByUserIdAndRole(userId, 'Operator');
        const isOp = !!userRole;
        
        console.log(`${ERROR_HEADER} userId=${userId} 是否為操作員: ${isOp}`);
        return isOp;
    } catch (error) {
        console.error(`${ERROR_HEADER}[isOperator] Error:`, error);
        return false;
    }
};

/**
 * 根據操作員ID獲取其綁定的店長ID
 */
exports.getStoreManagerIdByOperatorId = async (operatorId) => {
    console.log(`${ERROR_HEADER}[getStoreManagerIdByOperatorId] 開始 operatorId:`, operatorId);
    try {
        const binding = await StoreManagerToOperator.findByOperatorId(operatorId);
        if (!binding) {
            return null;
        }
        return binding.storeManagerId;
    } catch (error) {
        console.error(`${ERROR_HEADER}[getStoreManagerIdByOperatorId] 失敗:`, error);
        throw error;
    }
};

/**
 * 搜尋綁定關係（支援分頁）
 */
exports.searchBinding = async (searchParam, pagingParam) => {
    console.log(`${ERROR_HEADER}[searchBinding] 開始`);
    try {
        return await StoreManagerToOperator.search(searchParam, pagingParam);
    } catch (error) {
        console.error(`${ERROR_HEADER}[searchBinding] 失敗:`, error);
        throw error;
    }
};
