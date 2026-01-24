const generalManagerService = require('../../services/generalManager.service');
const authService = require('../../services/auth.service');

const ERROR_HEADER = "[generalManager.api.controller.js]";

/**
 * 取得總經理列表
 */
exports.getGeneralManagerList = async (req, res) => {
    console.log(`${ERROR_HEADER}[getGeneralManagerList] 開始取得總經理列表`);
    try {
        const payload = authService.verifyJwt(req);
        const userId = payload?.userId; // 從 JWT token 中取得
        const generalManagerList = await generalManagerService.getGeneralManagerList(userId);
        res.status(200).json({
            success: true,
            data: generalManagerList
        });
    } catch (error) {
        console.error(`${ERROR_HEADER}[getGeneralManagerList] 錯誤:`, error);
        res.status(403).json({ 
            success: false, 
            message: error.message || '取得總經理列表失敗' 
        });
    }
};

/**
 * 透過 email 新增總經理
 */
exports.addGeneralManagerByEmail = async (req, res) => {
    console.log(`${ERROR_HEADER}[addGeneralManagerByEmail] 開始新增總經理`);
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

        const result = await generalManagerService.addGeneralManagerByEmail(email, userId);
        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error(`${ERROR_HEADER}[addGeneralManagerByEmail] 錯誤:`, error);
        res.status(400).json({ 
            success: false, 
            message: error.message || '新增總經理失敗' 
        });
    }
};

/**
 * 刪除總經理
 */
exports.deleteGeneralManager = async (req, res) => {
    console.log(`${ERROR_HEADER}[deleteGeneralManager] 開始刪除總經理`);
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

        const result = await generalManagerService.deleteGeneralManager(roleId, userId);
        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error(`${ERROR_HEADER}[deleteGeneralManager] 錯誤:`, error);
        res.status(400).json({ 
            success: false, 
            message: error.message || '刪除總經理失敗' 
        });
    }
};
