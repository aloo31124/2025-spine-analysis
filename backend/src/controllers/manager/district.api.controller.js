const districtService = require('../../services/district.service');
const authService = require('../../services/auth.service');

const ERROR_HEADER = "[district.api.controller.js]";

/**
 * 取得所有區域列表
 */
exports.getAllDistrictList = async (req, res) => {
    console.log(`${ERROR_HEADER}[getAllDistrictList] 開始取得區域列表`);
    try {
        const payload = authService.verifyJwt(req);
        const userId = payload?.userId;
        const districtList = await districtService.getAllDistrictList(userId);
        res.status(200).json({
            success: true,
            data: districtList
        });
    } catch (error) {
        console.error(`${ERROR_HEADER}[getAllDistrictList] 錯誤:`, error);
        res.status(403).json({ 
            success: false, 
            message: error.message || '取得區域列表失敗' 
        });
    }
};

/**
 * 新增區域
 */
exports.addDistrict = async (req, res) => {
    console.log(`${ERROR_HEADER}[addDistrict] 開始新增區域`);
    try {
        const payload = authService.verifyJwt(req);
        const userId = payload?.userId;
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'name 為必填欄位'
            });
        }

        const result = await districtService.addDistrict({ name }, userId);
        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error(`${ERROR_HEADER}[addDistrict] 錯誤:`, error);
        res.status(400).json({ 
            success: false, 
            message: error.message || '新增區域失敗' 
        });
    }
};

/**
 * 更新區域
 */
exports.updateDistrict = async (req, res) => {
    console.log(`${ERROR_HEADER}[updateDistrict] 開始更新區域`);
    try {
        const payload = authService.verifyJwt(req);
        const userId = payload?.userId;
        const { id, name } = req.body;

        if (!id || !name) {
            return res.status(400).json({
                success: false,
                message: 'id 和 name 為必填欄位'
            });
        }

        const result = await districtService.updateDistrict({ id, name }, userId);
        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error(`${ERROR_HEADER}[updateDistrict] 錯誤:`, error);
        res.status(400).json({ 
            success: false, 
            message: error.message || '更新區域失敗' 
        });
    }
};

/**
 * 刪除區域
 */
exports.deleteDistrict = async (req, res) => {
    console.log(`${ERROR_HEADER}[deleteDistrict] 開始刪除區域`);
    try {
        const payload = authService.verifyJwt(req);
        const userId = payload?.userId;
        const { districtId } = req.params;

        if (!districtId) {
            return res.status(400).json({
                success: false,
                message: 'districtId 為必填參數'
            });
        }

        const result = await districtService.deleteDistrict(districtId, userId);
        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error(`${ERROR_HEADER}[deleteDistrict] 錯誤:`, error);
        res.status(400).json({ 
            success: false, 
            message: error.message || '刪除區域失敗' 
        });
    }
};

/**
 * 取得區域詳細資訊（包含綁定的店長列表）
 */
exports.getDistrictWithStoreManagers = async (req, res) => {
    console.log(`${ERROR_HEADER}[getDistrictWithStoreManagers] 開始取得區域詳情`);
    try {
        const payload = authService.verifyJwt(req);
        const userId = payload?.userId;
        const { districtId } = req.params;

        if (!districtId) {
            return res.status(400).json({
                success: false,
                message: 'districtId 為必填參數'
            });
        }

        const result = await districtService.getDistrictWithStoreManagers(districtId, userId);
        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error(`${ERROR_HEADER}[getDistrictWithStoreManagers] 錯誤:`, error);
        res.status(400).json({ 
            success: false, 
            message: error.message || '取得區域詳情失敗' 
        });
    }
};

/**
 * 綁定店長到區域
 */
exports.bindStoreManagerToDistrict = async (req, res) => {
    console.log(`${ERROR_HEADER}[bindStoreManagerToDistrict] 開始綁定店長到區域`);
    try {
        const payload = authService.verifyJwt(req);
        const userId = payload?.userId;
        const { districtId, storeManagerUserId } = req.body;

        if (!districtId || !storeManagerUserId) {
            return res.status(400).json({
                success: false,
                message: 'districtId 和 storeManagerUserId 為必填欄位'
            });
        }

        const result = await districtService.bindStoreManagerToDistrict(districtId, storeManagerUserId, userId);
        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error(`${ERROR_HEADER}[bindStoreManagerToDistrict] 錯誤:`, error);
        res.status(400).json({ 
            success: false, 
            message: error.message || '綁定店長到區域失敗' 
        });
    }
};

/**
 * 解除店長與區域的綁定
 */
exports.unbindStoreManagerFromDistrict = async (req, res) => {
    console.log(`${ERROR_HEADER}[unbindStoreManagerFromDistrict] 開始解除綁定`);
    try {
        const payload = authService.verifyJwt(req);
        const userId = payload?.userId;
        const { bindingId } = req.params;

        if (!bindingId) {
            return res.status(400).json({
                success: false,
                message: 'bindingId 為必填參數'
            });
        }

        const result = await districtService.unbindStoreManagerFromDistrict(bindingId, userId);
        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error(`${ERROR_HEADER}[unbindStoreManagerFromDistrict] 錯誤:`, error);
        res.status(400).json({ 
            success: false, 
            message: error.message || '解除綁定失敗' 
        });
    }
};

/**
 * 綁定區經理到區域
 */
exports.bindDistrictManagerToDistrict = async (req, res) => {
    console.log(`${ERROR_HEADER}[bindDistrictManagerToDistrict] 開始綁定區經理到區域`);
    try {
        const payload = authService.verifyJwt(req);
        const userId = payload?.userId;
        const { districtId, districtManagerUserId } = req.body;

        if (!districtId || !districtManagerUserId) {
            return res.status(400).json({
                success: false,
                message: 'districtId 和 districtManagerUserId 為必填欄位'
            });
        }

        const result = await districtService.bindDistrictManagerToDistrict(districtId, districtManagerUserId, userId);
        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error(`${ERROR_HEADER}[bindDistrictManagerToDistrict] 錯誤:`, error);
        res.status(400).json({ 
            success: false, 
            message: error.message || '綁定區經理到區域失敗' 
        });
    }
};

/**
 * 解除區經理與區域的綁定
 */
exports.unbindDistrictManagerFromDistrict = async (req, res) => {
    console.log(`${ERROR_HEADER}[unbindDistrictManagerFromDistrict] 開始解除綁定`);
    try {
        const payload = authService.verifyJwt(req);
        const userId = payload?.userId;
        const { bindingId } = req.params;

        if (!bindingId) {
            return res.status(400).json({
                success: false,
                message: 'bindingId 為必填參數'
            });
        }

        const result = await districtService.unbindDistrictManagerFromDistrict(bindingId, userId);
        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error(`${ERROR_HEADER}[unbindDistrictManagerFromDistrict] 錯誤:`, error);
        res.status(400).json({ 
            success: false, 
            message: error.message || '解除綁定失敗' 
        });
    }
};
