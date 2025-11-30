/*
 * [控制層] 客戶購買枕頭商品關聯處理
 *  - 客戶購買枕頭商品紀錄列表
 *  - 新增、更新、刪除購買紀錄
 *  - 批量新增購買紀錄
 */

const customerToProductPillowService = require('../../services/customerToProductPillow.service');

const ERROR_HEADER = "[customerToProductPillow.api.controller.js]";

/* 取得所有客戶購買枕頭商品紀錄列表 */
exports.getAllCustomerToProductPillowList = async (req, res) => {
    try {
        console.log("[getAllCustomerToProductPillowList] start");
        const result = await customerToProductPillowService.getAllCustomerToProductPillowList();
        res.status(200).json({ result });
    } catch (error) {
        console.error("[getAllCustomerToProductPillowList] error:", error);
        res.status(500).json({ result: error.message });
    }
};

/* 新增客戶購買枕頭商品紀錄 */
exports.addCustomerToProductPillow = async (req, res) => {
    console.log("[addCustomerToProductPillow] start : request =", req.body);
    try {
        const newRecord = await customerToProductPillowService.addCustomerToProductPillow(req.body.newCustomerToProductPillow);
        res.status(200).json({ result: '200', newRecord });
    } catch (error) {
        console.error("[addCustomerToProductPillow] error:", error);
        res.status(500).json({ result: '500', error: error.message });
    }
};

/* 批量新增客戶購買枕頭商品紀錄 */
exports.addMultipleCustomerToProductPillow = async (req, res) => {
    console.log("[addMultipleCustomerToProductPillow] start : request =", req.body);
    try {
        const { customerToProductPillowList } = req.body;
        if (!customerToProductPillowList || !Array.isArray(customerToProductPillowList)) {
            return res.status(400).json({ success: false, message: '請提供有效的購買紀錄列表' });
        }
        
        const results = await customerToProductPillowService.addMultipleCustomerToProductPillow(customerToProductPillowList);
        res.status(200).json({ success: true, results, message: `成功新增 ${results.length} 筆購買紀錄` });
    } catch (error) {
        console.error("[addMultipleCustomerToProductPillow] error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

/* 取得特定客戶購買枕頭商品紀錄 */
exports.getCustomerToProductPillow = async (req, res) => {
    console.log("[getCustomerToProductPillow] start : id =", req.params.id);
    try {
        const record = await customerToProductPillowService.getCustomerToProductPillow(req.params.id);
        res.status(200).json({ result: '200', record });
    } catch (error) {
        console.error("[getCustomerToProductPillow] error:", error);
        res.status(500).json({ result: '500', error: error.message });
    }
};

/* 根據客戶ID取得購買枕頭商品紀錄 */
exports.getCustomerToProductPillowByCustomerId = async (req, res) => {
    console.log("[getCustomerToProductPillowByCustomerId] start : customerId =", req.params.customerId);
    try {
        const records = await customerToProductPillowService.getCustomerToProductPillowByCustomerId(req.params.customerId);
        res.status(200).json({ result: '200', records });
    } catch (error) {
        console.error("[getCustomerToProductPillowByCustomerId] error:", error);
        res.status(500).json({ result: '500', error: error.message });
    }
};

/* 根據枕頭商品ID取得購買紀錄 */
exports.getCustomerToProductPillowByProductPillowId = async (req, res) => {
    console.log("[getCustomerToProductPillowByProductPillowId] start : productPillowId =", req.params.productPillowId);
    try {
        const records = await customerToProductPillowService.getCustomerToProductPillowByProductPillowId(req.params.productPillowId);
        res.status(200).json({ result: '200', records });
    } catch (error) {
        console.error("[getCustomerToProductPillowByProductPillowId] error:", error);
        res.status(500).json({ result: '500', error: error.message });
    }
};

/* 更新客戶購買枕頭商品紀錄 */
exports.updateCustomerToProductPillow = async (req, res) => {
    console.log("[updateCustomerToProductPillow] start : updateData =", req.body.updateCustomerToProductPillow);
    try {
        const updatedRecord = await customerToProductPillowService.updateCustomerToProductPillow(req.body.updateCustomerToProductPillow);
        res.status(200).json({ result: '200', updatedRecord });
    } catch (error) {
        console.error("[updateCustomerToProductPillow] error:", error);
        res.status(500).json({ result: '500', error: error.message });
    }
};

/* 刪除客戶購買枕頭商品紀錄 */
exports.deleteCustomerToProductPillow = async (req, res) => {
    console.log("[deleteCustomerToProductPillow] start : id =", req.params.id);
    try {
        await customerToProductPillowService.deleteCustomerToProductPillow(req.params.id);
        res.status(200).json({ result: '200', message: '購買紀錄刪除成功' });
    } catch (error) {
        console.error("[deleteCustomerToProductPillow] error:", error);
        res.status(500).json({ result: '500', error: error.message });
    }
};

/* 搜尋客戶購買枕頭商品紀錄 */
exports.searchCustomerToProductPillow = async (req, res) => {
    console.log("[searchCustomerToProductPillow] start : searchParam =", req.body.searchParam);
    try {
        const searchResult = await customerToProductPillowService.searchCustomerToProductPillow(
            req.body.searchParam || {},
            req.body.pagingParam || {}
        );
        res.status(200).json({ result: '200', searchResult });
    } catch (error) {
        console.error("[searchCustomerToProductPillow] error:", error);
        res.status(500).json({ result: '500', error: error.message });
    }
};

/* 取得客戶購買枕頭商品統計 */
exports.getCustomerPurchaseStats = async (req, res) => {
    console.log("[getCustomerPurchaseStats] start : customerId =", req.params.customerId);
    try {
        const stats = await customerToProductPillowService.getCustomerPurchaseStats(req.params.customerId);
        res.status(200).json({ result: '200', stats });
    } catch (error) {
        console.error("[getCustomerPurchaseStats] error:", error);
        res.status(500).json({ result: '500', error: error.message });
    }
};
