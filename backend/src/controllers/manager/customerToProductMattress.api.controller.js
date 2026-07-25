/*
 * [控制層] 客戶購買床墊商品關聯處理
 * 參考 customerToProductPillow.api.controller.js
 *  - 客戶購買床墊商品紀錄列表
 *  - 新增、更新、刪除購買紀錄
 *  - 批量新增購買紀錄
 */

const customerToProductMattressService = require('../../services/customerToProductMattress.service');

const ERROR_HEADER = "[customerToProductMattress.api.controller.js]";

/* 取得所有客戶購買床墊商品紀錄列表 */
exports.getAllCustomerToProductMattressList = async (req, res) => {
    try {
        console.log("[getAllCustomerToProductMattressList] start");
        const result = await customerToProductMattressService.getAllCustomerToProductMattressList();
        res.status(200).json({ result });
    } catch (error) {
        console.error("[getAllCustomerToProductMattressList] error:", error);
        res.status(500).json({ result: error.message });
    }
};

/* 新增客戶購買床墊商品紀錄 */
exports.addCustomerToProductMattress = async (req, res) => {
    console.log("[addCustomerToProductMattress] start : request =", req.body);
    try {
        const newRecord = await customerToProductMattressService.addCustomerToProductMattress(req.body.newCustomerToProductMattress);
        res.status(200).json({ result: '200', newRecord });
    } catch (error) {
        console.error("[addCustomerToProductMattress] error:", error);
        res.status(500).json({ result: '500', error: error.message });
    }
};

/* 批量新增客戶購買床墊商品紀錄 */
exports.addMultipleCustomerToProductMattress = async (req, res) => {
    console.log("[addMultipleCustomerToProductMattress] start : request =", req.body);
    try {
        const { customerToProductMattressList } = req.body;
        if (!customerToProductMattressList || !Array.isArray(customerToProductMattressList)) {
            return res.status(400).json({ success: false, message: '請提供有效的購買紀錄列表' });
        }
        
        const results = await customerToProductMattressService.addMultipleCustomerToProductMattress(customerToProductMattressList);
        res.status(200).json({ success: true, results, message: `成功新增 ${results.length} 筆購買紀錄` });
    } catch (error) {
        console.error("[addMultipleCustomerToProductMattress] error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

/* 取得特定客戶購買床墊商品紀錄 */
exports.getCustomerToProductMattress = async (req, res) => {
    console.log("[getCustomerToProductMattress] start : id =", req.params.id);
    try {
        const record = await customerToProductMattressService.getCustomerToProductMattress(req.params.id);
        res.status(200).json({ result: '200', record });
    } catch (error) {
        console.error("[getCustomerToProductMattress] error:", error);
        res.status(500).json({ result: '500', error: error.message });
    }
};

/* 根據客戶ID取得購買床墊商品紀錄 */
exports.getCustomerToProductMattressByCustomerId = async (req, res) => {
    console.log("[getCustomerToProductMattressByCustomerId] start : customerId =", req.params.customerId);
    try {
        const records = await customerToProductMattressService.getCustomerToProductMattressByCustomerId(req.params.customerId);
        res.status(200).json({ result: '200', records });
    } catch (error) {
        console.error("[getCustomerToProductMattressByCustomerId] error:", error);
        res.status(500).json({ result: '500', error: error.message });
    }
};

/* 根據床墊商品ID取得購買紀錄 */
exports.getCustomerToProductMattressByProductMattressId = async (req, res) => {
    console.log("[getCustomerToProductMattressByProductMattressId] start : productMattressId =", req.params.productMattressId);
    try {
        const records = await customerToProductMattressService.getCustomerToProductMattressByProductMattressId(req.params.productMattressId);
        res.status(200).json({ result: '200', records });
    } catch (error) {
        console.error("[getCustomerToProductMattressByProductMattressId] error:", error);
        res.status(500).json({ result: '500', error: error.message });
    }
};

/* 更新客戶購買床墊商品紀錄 */
exports.updateCustomerToProductMattress = async (req, res) => {
    console.log("[updateCustomerToProductMattress] start : updateData =", req.body.updateCustomerToProductMattress);
    try {
        const updatedRecord = await customerToProductMattressService.updateCustomerToProductMattress(req.body.updateCustomerToProductMattress);
        res.status(200).json({ result: '200', updatedRecord });
    } catch (error) {
        console.error("[updateCustomerToProductMattress] error:", error);
        res.status(500).json({ result: '500', error: error.message });
    }
};

/* 刪除客戶購買床墊商品紀錄 */
exports.deleteCustomerToProductMattress = async (req, res) => {
    console.log("[deleteCustomerToProductMattress] start : id =", req.params.id);
    try {
        await customerToProductMattressService.deleteCustomerToProductMattress(req.params.id);
        res.status(200).json({ result: '200', message: '購買紀錄刪除成功' });
    } catch (error) {
        console.error("[deleteCustomerToProductMattress] error:", error);
        res.status(500).json({ result: '500', error: error.message });
    }
};

/* 搜尋客戶購買床墊商品紀錄 */
exports.searchCustomerToProductMattress = async (req, res) => {
    console.log("[searchCustomerToProductMattress] start : searchParam =", req.body.searchParam);
    try {
        const searchResult = await customerToProductMattressService.searchCustomerToProductMattress(
            req.body.searchParam || {},
            req.body.pagingParam || {}
        );
        res.status(200).json({ result: '200', searchResult });
    } catch (error) {
        console.error("[searchCustomerToProductMattress] error:", error);
        res.status(500).json({ result: '500', error: error.message });
    }
};

/* 取得客戶購買床墊商品統計 */
exports.getCustomerPurchaseStats = async (req, res) => {
    console.log("[getCustomerPurchaseStats] start : customerId =", req.params.customerId);
    try {
        const stats = await customerToProductMattressService.getCustomerPurchaseStats(req.params.customerId);
        res.status(200).json({ result: '200', stats });
    } catch (error) {
        console.error("[getCustomerPurchaseStats] error:", error);
        res.status(500).json({ result: '500', error: error.message });
    }
};
