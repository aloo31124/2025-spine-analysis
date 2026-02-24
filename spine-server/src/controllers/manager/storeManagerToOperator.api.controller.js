/*
 * [控制層] 店長綁定操作員處理
 *  - 獲取操作員列表
 *  - 新增操作員
 *  - 刪除操作員
 */

const storeManagerToOperatorService = require('../../services/storeManagerToOperator.service');
const userToRoleService = require('../../services/userToRole.service');
const authService = require('../../services/auth.service');

const ERROR_HEADER = "[storeManagerToOperator.api.controller.js]";

/**
 * 取得店長綁定的操作員列表
 */
exports.getOperatorList = async (req, res) => {
    try {
        console.log(`${ERROR_HEADER}[getOperatorList] start`);
        
        // 驗證 JWT 並取得當前使用者 ID
        const payload = authService.verifyJwt(req);
        const userId = payload?.userId;
        
        if (!userId) {
            return res.status(401).json({ result: '401', error: '未授權' });
        }
        
        // 檢查是否為店長
        const isStoreManager = await userToRoleService.isStoreManager(userId);
        if (!isStoreManager) {
            return res.status(403).json({ result: '403', error: '權限不足' });
        }
        
        // 獲取該店長綁定的操作員列表
        const operatorList = await storeManagerToOperatorService.getOperatorListByStoreManager(userId);
        
        res.status(200).json({ result: '200', operatorList });
    } catch (error) {
        console.error(`${ERROR_HEADER}[getOperatorList] error:`, error);
        res.status(500).json({ result: '500', error: error.message });
    }
};

/**
 * 新增操作員（店長綁定操作員）
 */
exports.addOperator = async (req, res) => {
    try {
        console.log(`${ERROR_HEADER}[addOperator] start:`, req.body);
        
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ result: '400', error: '缺少 email 參數' });
        }
        
        // 驗證 JWT 並取得當前使用者 ID
        const payload = authService.verifyJwt(req);
        const userId = payload?.userId;
        
        if (!userId) {
            return res.status(401).json({ result: '401', error: '未授權' });
        }
        
        // 檢查是否為店長
        const isStoreManager = await userToRoleService.isStoreManager(userId);
        if (!isStoreManager) {
            return res.status(403).json({ result: '403', error: '權限不足' });
        }
        
        // 新增操作員
        const newOperator = await storeManagerToOperatorService.addOperatorByEmail(email, userId);
        
        res.status(200).json({ result: '200', operator: newOperator });
    } catch (error) {
        console.error(`${ERROR_HEADER}[addOperator] error:`, error);
        
        // 根據錯誤訊息返回適當的狀態碼
        if (error.message === '操作員不存在User表中') {
            return res.status(404).json({ result: '404', error: error.message });
        }
        if (error.message === '該使用者已被其他角色綁定') {
            return res.status(409).json({ result: '409', error: error.message });
        }
        
        res.status(500).json({ result: '500', error: error.message });
    }
};

/**
 * 刪除操作員綁定
 */
exports.deleteOperator = async (req, res) => {
    try {
        console.log(`${ERROR_HEADER}[deleteOperator] start:`, req.params.id);
        
        const bindingId = req.params.id;
        
        if (!bindingId) {
            return res.status(400).json({ result: '400', error: '缺少 bindingId 參數' });
        }
        
        // 驗證 JWT 並取得當前使用者 ID
        const payload = authService.verifyJwt(req);
        const userId = payload?.userId;
        
        if (!userId) {
            return res.status(401).json({ result: '401', error: '未授權' });
        }
        
        // 檢查是否為店長
        const isStoreManager = await userToRoleService.isStoreManager(userId);
        if (!isStoreManager) {
            return res.status(403).json({ result: '403', error: '權限不足' });
        }
        
        // 刪除操作員
        const result = await storeManagerToOperatorService.deleteOperator(bindingId);
        
        res.status(200).json({ result: '200', ...result });
    } catch (error) {
        console.error(`${ERROR_HEADER}[deleteOperator] error:`, error);
        res.status(500).json({ result: '500', error: error.message });
    }
};

/**
 * 搜尋綁定關係（支援分頁）
 */
exports.searchBinding = async (req, res) => {
    try {
        console.log(`${ERROR_HEADER}[searchBinding] start:`, req.body);
        
        const { searchParam, pagingParam } = req.body;
        
        // 驗證 JWT 並取得當前使用者 ID
        const payload = authService.verifyJwt(req);
        const userId = payload?.userId;
        
        if (!userId) {
            return res.status(401).json({ result: '401', error: '未授權' });
        }
        
        // 檢查是否為店長
        const isStoreManager = await userToRoleService.isStoreManager(userId);
        if (!isStoreManager) {
            return res.status(403).json({ result: '403', error: '權限不足' });
        }
        
        // 搜尋綁定關係
        const searchResult = await storeManagerToOperatorService.searchBinding(searchParam, pagingParam);
        
        res.status(200).json({ result: '200', searchResult });
    } catch (error) {
        console.error(`${ERROR_HEADER}[searchBinding] error:`, error);
        res.status(500).json({ result: '500', error: error.message });
    }
};

/**
 * 取得當前操作員綁定的店長資訊
 * 操作員專用 API - 用於在設定頁顯示所屬店長
 */
exports.getStoreManagerInfo = async (req, res) => {
    try {
        console.log(`${ERROR_HEADER}[getStoreManagerInfo] start`);
        
        // 驗證 JWT 並取得當前使用者 ID
        const payload = authService.verifyJwt(req);
        const userId = payload?.userId;
        
        if (!userId) {
            return res.status(401).json({ result: '401', error: '未授權' });
        }
        
        // 檢查是否為操作員
        const isOperator = await storeManagerToOperatorService.isOperator(userId);
        if (!isOperator) {
            return res.status(403).json({ result: '403', error: '權限不足：非操作員身份' });
        }
        
        // 取得綁定的店長資訊
        const storeManagerInfo = await storeManagerToOperatorService.getStoreManagerInfoByOperatorId(userId);
        
        if (!storeManagerInfo) {
            return res.status(404).json({ result: '404', error: '尚未綁定店長' });
        }
        
        res.status(200).json({ result: '200', storeManagerInfo });
    } catch (error) {
        console.error(`${ERROR_HEADER}[getStoreManagerInfo] error:`, error);
        res.status(500).json({ result: '500', error: error.message });
    }
};
