const districtManagerService = require('../../services/districtManager.service');
const authService = require('../../services/auth.service');

const ERROR_HEADER = "[districtManager.api.controller.js]";

/**
 * 取得區經理列表
 */
exports.getDistrictManagerList = async (req, res) => {
    console.log(`${ERROR_HEADER}[getDistrictManagerList] 開始取得區經理列表`);
    try {
        const payload = authService.verifyJwt(req);
        const userId = payload?.userId; // 從 JWT token 中取得
        const districtManagerList = await districtManagerService.getDistrictManagerList(userId);
        res.status(200).json({
            success: true,
            data: districtManagerList
        });
    } catch (error) {
        console.error(`${ERROR_HEADER}[getDistrictManagerList] 錯誤:`, error);
        res.status(403).json({ 
            success: false, 
            message: error.message || '取得區經理列表失敗' 
        });
    }
};

/**
 * 透過 email 新增區經理
 */
exports.addDistrictManagerByEmail = async (req, res) => {
    console.log(`${ERROR_HEADER}[addDistrictManagerByEmail] 開始新增區經理`);
    try {
        const payload = authService.verifyJwt(req);
        const userId = payload?.userId; // 從 JWT token 中取得
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'email 為必填欄位'
            });
        }

        const result = await districtManagerService.addDistrictManagerByEmail(email, userId);
        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error(`${ERROR_HEADER}[addDistrictManagerByEmail] 錯誤:`, error);
        res.status(400).json({ 
            success: false, 
            message: error.message || '新增區經理失敗' 
        });
    }
};

/**
 * 刪除區經理
 */
exports.deleteDistrictManager = async (req, res) => {
    console.log(`${ERROR_HEADER}[deleteDistrictManager] 開始刪除區經理`);
    try {
        const payload = authService.verifyJwt(req);
        const userId = payload?.userId; // 從 JWT token 中取得
        const { roleId } = req.params;

        if (!roleId) {
            return res.status(400).json({
                success: false,
                message: 'roleId 為必填參數'
            });
        }

        const result = await districtManagerService.deleteDistrictManager(roleId, userId);
        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error(`${ERROR_HEADER}[deleteDistrictManager] 錯誤:`, error);
        res.status(400).json({ 
            success: false, 
            message: error.message || '刪除區經理失敗' 
        });
    }
};
