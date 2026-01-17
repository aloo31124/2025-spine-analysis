const authPermissionService = require('../../services/authPermission.service');
const authService = require('../../services/auth.service');

const ERROR_HEADER = "[authPermission.api.controller.js]";

/**
 * 檢查使用者角色權限
 */
exports.checkUserRole = async (req, res) => {
    console.log(`${ERROR_HEADER}[checkUserRole] 開始檢查使用者角色`);
    try {
        const payload = authService.verifyJwt(req);
        const userId = payload?.userId; // 從 JWT token 中取得
        const roleData = await authPermissionService.checkUserRole(userId);
        res.status(200).json(roleData);
    } catch (error) {
        console.error(`${ERROR_HEADER}[checkUserRole] 錯誤:`, error);
        res.status(500).json({ 
            success: false, 
            message: error.message || '檢查角色失敗' 
        });
    }
};

/**
 * 取得所有店長列表 (僅總經理和系統管理員可使用)
 */
exports.getStoreManagerList = async (req, res) => {
    console.log(`${ERROR_HEADER}[getStoreManagerList] 開始取得店長列表`);
    try {
        const payload = authService.verifyJwt(req);
        const userId = payload?.userId;
        const storeManagerList = await authPermissionService.getStoreManagerList(userId);
        res.status(200).json({
            success: true,
            data: storeManagerList
        });
    } catch (error) {
        console.error(`${ERROR_HEADER}[getStoreManagerList] 錯誤:`, error);
        res.status(403).json({ 
            success: false, 
            message: error.message || '取得店長列表失敗' 
        });
    }
};
