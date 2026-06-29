/*
 * [api控制器] 負責 客戶分析結果 路由 API
 */

const customerAnalysisResultController = require('../customerAnalysisResult.controller');

/* get 取得所有客戶分析結果 */
const getCustomerAnalysisResultList = async (req, res) => {
    await customerAnalysisResultController.getAllCustomerAnalysisResult(req, res);
};

/* get 根據客戶ID取得分析結果 */
const getCustomerAnalysisResultsByCustomerId = async (req, res) => {
    await customerAnalysisResultController.getCustomerAnalysisResultsByCustomerId(req, res);
};

/* post 新增客戶分析結果 */
const postCustomerAnalysisResult = async (req, res) => {
    await customerAnalysisResultController.addCustomerAnalysisResult(req, res);
};

/* get 取得客戶分析結果 */
const getCustomerAnalysisResult = async (req, res) => {
    await customerAnalysisResultController.getCustomerAnalysisResult(req, res);
};

/* put 更新客戶分析結果 */
const updateCustomerAnalysisResult = async (req, res) => {
    await customerAnalysisResultController.updateCustomerAnalysisResult(req, res);
};

/* delete 刪除客戶分析結果 */
const deleteCustomerAnalysisResult = async (req, res) => {
    await customerAnalysisResultController.deleteCustomerAnalysisResult(req, res);
};

/* post 匯入客戶分析結果 */
const importCustomerAnalysisResult = async (req, res) => {
    await customerAnalysisResultController.importCustomerAnalysisResult(req, res);
};

module.exports = {
    getCustomerAnalysisResultList,
    getCustomerAnalysisResultsByCustomerId,
    postCustomerAnalysisResult,
    getCustomerAnalysisResult,
    updateCustomerAnalysisResult,
    deleteCustomerAnalysisResult,
    importCustomerAnalysisResult
};