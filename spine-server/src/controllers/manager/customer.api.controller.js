/*
 * [控制層] 客戶處理
 *  - 客戶列表搜尋分頁
 *  - 客戶詳細資訊
 *  - 客戶新增、更新、刪除
 */

const customerService = require('../../services/customer.service');
const authService = require('../../services/auth.service');

const ERROR_HEADER = "[customer.api.controller.js]";

/* 取得客戶列表 */
exports.getCustomerList = async (req, res) => {
    try {
        console.log("[getCustomerList] start ");
        const {searchParam, pagingParam} = req.body;
        const payload = authService.verifyJwt(req);
        const result = await customerService.searchCustomer(searchParam, pagingParam, payload?.userId);
        res.status(200).json({ result });
    } catch (error) {
        console.error("[getCustomerList] error :", error);
        res.status(500).json({ result: error.message });
    }
};

/* 新增客戶 */
exports.postCustomer = async (req, res) => {
    console.log("[postCustomer] start : request =", req.body);
    try {
        const payload = authService.verifyJwt(req);
        const newCustomer = await customerService.addCustomer({ userId: payload.userId, ...req.body.newCustomer });
        console.log(" newCustomer : ", newCustomer);
        res.status(200).json({ result: '200', newCustomer });
    } catch (error) {
        console.error("[postCustomer] error :", error);
        res.status(500).json({ result: '500', error: error.message });
    }
};

/* 取得客戶 */
exports.getCustomer = async (req, res) => {
    console.log("[getCustomer] start : customerId =", req.params.id);
    try {
        const customer = await customerService.getCustomer(req.params.id);
        res.status(200).json({ result: '200', customer });
    } catch (error) {
        console.error("[getCustomer] error :", error);
        res.status(500).json({ result: '500', error: error.message });
    }
};

/* 更新客戶 */
exports.updateCustomer = async (req, res) => {
    console.log("[updateCustomer] start : updateData =", req.body.updateCustomer);
    try {
        const updatedCustomer = await customerService.updateCustomer(req.body.updateCustomer);
        res.status(200).json({ result: '200', updatedCustomer });
    } catch (error) {
        console.error("[updateCustomer] error :", error);
        res.status(500).json({ result: '500', error: error.message });
    }
};

/* 刪除客戶 */
exports.deleteCustomer = async (req, res) => {
    console.log("[deleteCustomer] start : customerId =", req.params.id);
    try {
        await customerService.deleteCustomer(req.params.id);
        res.status(200).json({ result: '200', message: '客戶刪除成功' });
    } catch (error) {
        console.error("[deleteCustomer] error :", error);
        res.status(500).json({ result: '500', error: error.message });
    }
};

/* 搜尋客戶 */
exports.searchCustomer = async (req, res) => {
    console.log("[searchCustomer] start : searchParam =", req.body.searchParam, "pagingParam =", req.body.pagingParam);
    try {
        const payload = authService.verifyJwt(req);
        const searchResult = await customerService.searchCustomer(req.body.searchParam, req.body.pagingParam, payload?.userId);
        res.status(200).json({ result: '200', searchResult });
    } catch (error) {
        console.error("[searchCustomer] error :", error);
        res.status(500).json({ result: '500', error: error.message });
    }
};

/* 匯入客戶 */
exports.importCustomer = async (req, res) => {
    console.log("[importCustomer] start : customerList =", req.body.customerList);
    try {
        const importResult = await customerService.importCustomer(req.body.customerList);
        res.status(200).json({ result: '200', importResult });
    } catch (error) {
        console.error("[importCustomer] error :", error);
        res.status(500).json({ result: '500', error: error.message });
    }
};