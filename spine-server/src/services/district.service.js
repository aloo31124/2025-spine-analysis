const District = require('../models/district.model');
const DistrictManagerToDistrict = require('../models/districtManagerToDistrict.model');
const DistrictToStoreManager = require('../models/districtToStoreManager.model');
const User = require('../models/user.model');
const UserToRole = require('../models/userToRole.model');
const authPermissionService = require('./authPermission.service');

const ERROR_HEADER = "[district.service.js]";

/**
 * 取得所有區域列表 (僅系統管理員和總經理可用)
 */
exports.getAllDistrictList = async (userId) => {
    console.log(`${ERROR_HEADER}[getAllDistrictList] 開始 userId:`, userId);
    try {
        // 1. 檢查權限
        const isAdmin = await authPermissionService.isAdmin(userId);
        const isGeneralManager = await authPermissionService.isGeneralManager(userId);

        if (!isAdmin && !isGeneralManager) {
            throw new Error('角色權限不符，只有系統管理員和總經理可以查看區域列表');
        }

        // 2. 查詢所有區域
        const districtList = await District.getAllDistrictList();
        
        console.log(`${ERROR_HEADER} 找到 ${districtList.length} 個區域`);
        return districtList;
    } catch (error) {
        console.error(`${ERROR_HEADER}[getAllDistrictList] 失敗:`, error);
        throw error;
    }
};

/**
 * 新增區域 (僅系統管理員和總經理可用)
 */
exports.addDistrict = async (districtData, userId) => {
    console.log(`${ERROR_HEADER}[addDistrict] 開始`, districtData);
    try {
        // 1. 檢查權限
        const isAdmin = await authPermissionService.isAdmin(userId);
        const isGeneralManager = await authPermissionService.isGeneralManager(userId);

        if (!isAdmin && !isGeneralManager) {
            throw new Error('角色權限不符，只有系統管理員和總經理可以新增區域');
        }

        // 2. 新增區域
        const district = await District.addDistrict({
            name: districtData.name
        });

        console.log(`${ERROR_HEADER} 成功新增區域`, district);
        return district;
    } catch (error) {
        console.error(`${ERROR_HEADER}[addDistrict] 失敗:`, error);
        throw error;
    }
};

/**
 * 更新區域 (僅系統管理員和總經理可用)
 */
exports.updateDistrict = async (districtData, userId) => {
    console.log(`${ERROR_HEADER}[updateDistrict] 開始`, districtData);
    try {
        // 1. 檢查權限
        const isAdmin = await authPermissionService.isAdmin(userId);
        const isGeneralManager = await authPermissionService.isGeneralManager(userId);

        if (!isAdmin && !isGeneralManager) {
            throw new Error('角色權限不符，只有系統管理員和總經理可以更新區域');
        }

        // 2. 更新區域
        const district = await District.updateDistrict(districtData);

        console.log(`${ERROR_HEADER} 成功更新區域`, district);
        return district;
    } catch (error) {
        console.error(`${ERROR_HEADER}[updateDistrict] 失敗:`, error);
        throw error;
    }
};

/**
 * 刪除區域 (僅系統管理員和總經理可用)
 */
exports.deleteDistrict = async (districtId, userId) => {
    console.log(`${ERROR_HEADER}[deleteDistrict] 開始 districtId:`, districtId);
    try {
        // 1. 檢查權限
        const isAdmin = await authPermissionService.isAdmin(userId);
        const isGeneralManager = await authPermissionService.isGeneralManager(userId);

        if (!isAdmin && !isGeneralManager) {
            throw new Error('角色權限不符，只有系統管理員和總經理可以刪除區域');
        }

        // 2. 刪除相關綁定關係
        await DistrictManagerToDistrict.deleteByDistrictId(districtId);
        await DistrictToStoreManager.deleteByDistrictId(districtId);

        // 3. 刪除區域
        const result = await District.deleteDistrict(districtId);

        console.log(`${ERROR_HEADER} 成功刪除區域 districtId:`, districtId);
        return result;
    } catch (error) {
        console.error(`${ERROR_HEADER}[deleteDistrict] 失敗:`, error);
        throw error;
    }
};

/**
 * 取得區域詳細資訊（包含綁定的店長列表）
 */
exports.getDistrictWithStoreManagers = async (districtId, userId) => {
    console.log(`${ERROR_HEADER}[getDistrictWithStoreManagers] 開始 districtId:`, districtId);
    try {
        // 1. 檢查權限
        const isAdmin = await authPermissionService.isAdmin(userId);
        const isGeneralManager = await authPermissionService.isGeneralManager(userId);

        if (!isAdmin && !isGeneralManager) {
            throw new Error('角色權限不符，只有系統管理員和總經理可以查看區域詳情');
        }

        // 2. 取得區域資訊
        const district = await District.getDistrict(districtId);

        // 3. 取得該區域綁定的店長
        const bindings = await DistrictToStoreManager.getStoreManagersByDistrictId(districtId);
        
        if (bindings.length === 0) {
            return {
                ...district,
                storeManagers: []
            };
        }

        // 4. 取得店長詳細資訊
        const pagingParam = { 
            pageIndex: 1, 
            pageSize: 1000, 
            sort: "asc", 
            pageTotal: -1, 
            dataTotal: -1 
        };
        const userList = (await User.search({}, pagingParam)).userList;

        const storeManagers = bindings.map(binding => {
            const user = userList.find(u => u.id === binding.storeManagerUserId);
            if (!user) {
                return null;
            }
            return {
                bindingId: binding.id,
                userId: user.id,
                account: user.account,
                mail: user.mail
            };
        }).filter(item => item !== null);

        console.log(`${ERROR_HEADER} 找到 ${storeManagers.length} 位店長`);
        
        return {
            ...district,
            storeManagers
        };
    } catch (error) {
        console.error(`${ERROR_HEADER}[getDistrictWithStoreManagers] 失敗:`, error);
        throw error;
    }
};

/**
 * 綁定店長到區域
 */
exports.bindStoreManagerToDistrict = async (districtId, storeManagerUserId, userId) => {
    console.log(`${ERROR_HEADER}[bindStoreManagerToDistrict] 開始 districtId:${districtId}, storeManagerUserId:${storeManagerUserId}`);
    try {
        // 1. 檢查權限
        const isAdmin = await authPermissionService.isAdmin(userId);
        const isGeneralManager = await authPermissionService.isGeneralManager(userId);

        if (!isAdmin && !isGeneralManager) {
            throw new Error('角色權限不符，只有系統管理員和總經理可以綁定店長到區域');
        }

        // 2. 檢查店長是否已經綁定到該區域
        const existingBindings = await DistrictToStoreManager.getStoreManagersByDistrictId(districtId);
        const isAlreadyBound = existingBindings.some(b => b.storeManagerUserId === storeManagerUserId);
        
        if (isAlreadyBound) {
            throw new Error('該店長已經綁定到此區域');
        }

        // 3. 新增綁定關係
        const binding = await DistrictToStoreManager.addBinding({
            districtId,
            storeManagerUserId
        });

        console.log(`${ERROR_HEADER} 成功綁定店長到區域`, binding);
        return binding;
    } catch (error) {
        console.error(`${ERROR_HEADER}[bindStoreManagerToDistrict] 失敗:`, error);
        throw error;
    }
};

/**
 * 解除店長與區域的綁定
 */
exports.unbindStoreManagerFromDistrict = async (bindingId, userId) => {
    console.log(`${ERROR_HEADER}[unbindStoreManagerFromDistrict] 開始 bindingId:`, bindingId);
    try {
        // 1. 檢查權限
        const isAdmin = await authPermissionService.isAdmin(userId);
        const isGeneralManager = await authPermissionService.isGeneralManager(userId);

        if (!isAdmin && !isGeneralManager) {
            throw new Error('角色權限不符，只有系統管理員和總經理可以解除綁定');
        }

        // 2. 刪除綁定關係
        const result = await DistrictToStoreManager.deleteBinding(bindingId);

        console.log(`${ERROR_HEADER} 成功解除綁定 bindingId:`, bindingId);
        return result;
    } catch (error) {
        console.error(`${ERROR_HEADER}[unbindStoreManagerFromDistrict] 失敗:`, error);
        throw error;
    }
};

/**
 * 綁定區經理到區域
 */
exports.bindDistrictManagerToDistrict = async (districtId, districtManagerUserId, userId) => {
    console.log(`${ERROR_HEADER}[bindDistrictManagerToDistrict] 開始 districtId:${districtId}, districtManagerUserId:${districtManagerUserId}`);
    try {
        // 1. 檢查權限
        const isAdmin = await authPermissionService.isAdmin(userId);
        const isGeneralManager = await authPermissionService.isGeneralManager(userId);

        if (!isAdmin && !isGeneralManager) {
            throw new Error('角色權限不符，只有系統管理員和總經理可以綁定區經理到區域');
        }

        // 2. 檢查區經理是否已經綁定到該區域
        const existingBindings = await DistrictManagerToDistrict.getDistrictManagersByDistrictId(districtId);
        const isAlreadyBound = existingBindings.some(b => b.districtManagerUserId === districtManagerUserId);
        
        if (isAlreadyBound) {
            throw new Error('該區經理已經綁定到此區域');
        }

        // 3. 新增綁定關係
        const binding = await DistrictManagerToDistrict.addBinding({
            districtId,
            districtManagerUserId
        });

        console.log(`${ERROR_HEADER} 成功綁定區經理到區域`, binding);
        return binding;
    } catch (error) {
        console.error(`${ERROR_HEADER}[bindDistrictManagerToDistrict] 失敗:`, error);
        throw error;
    }
};

/**
 * 解除區經理與區域的綁定
 */
exports.unbindDistrictManagerFromDistrict = async (bindingId, userId) => {
    console.log(`${ERROR_HEADER}[unbindDistrictManagerFromDistrict] 開始 bindingId:`, bindingId);
    try {
        // 1. 檢查權限
        const isAdmin = await authPermissionService.isAdmin(userId);
        const isGeneralManager = await authPermissionService.isGeneralManager(userId);

        if (!isAdmin && !isGeneralManager) {
            throw new Error('角色權限不符，只有系統管理員和總經理可以解除綁定');
        }

        // 2. 刪除綁定關係
        const result = await DistrictManagerToDistrict.deleteBinding(bindingId);

        console.log(`${ERROR_HEADER} 成功解除綁定 bindingId:`, bindingId);
        return result;
    } catch (error) {
        console.error(`${ERROR_HEADER}[unbindDistrictManagerFromDistrict] 失敗:`, error);
        throw error;
    }
};
