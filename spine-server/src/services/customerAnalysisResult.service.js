/*
 * [service層] 負責 客戶分析結果 業務邏輯
 */

const CustomerAnalysisResult = require('../models/customerAnalysisResult.model');

/* 取得所有客戶分析結果 */
const getAllCustomerAnalysisResult = async () => {
    try {
        const resultList = await CustomerAnalysisResult.getAllCustomerAnalysisResultList();
        return resultList;
    } catch (error) {
        console.error('[getAllCustomerAnalysisResult] error:', error);
        throw error;
    }
};

/* 根據客戶ID取得分析結果 */
const getCustomerAnalysisResultsByCustomerId = async (customerId) => {
    try {
        const resultList = await CustomerAnalysisResult.getCustomerAnalysisResultsByCustomerId(customerId);
        return resultList;
    } catch (error) {
        console.error('[getCustomerAnalysisResultsByCustomerId] error:', error);
        throw error;
    }
};

/* 新增客戶分析結果 */
const addCustomerAnalysisResult = async (resultData) => {
    try {
        // 數據驗證
        if (!resultData.customerId || !resultData.userId) {
            throw new Error('客戶ID和用戶ID為必填項');
        }

        const result = await CustomerAnalysisResult.addCustomerAnalysisResult(resultData);
        return result;
    } catch (error) {
        console.error('[addCustomerAnalysisResult] error:', error);
        throw error;
    }
};

/* 取得客戶分析結果 */
const getCustomerAnalysisResult = async (id) => {
    try {
        const result = await CustomerAnalysisResult.getCustomerAnalysisResult(id);
        return result;
    } catch (error) {
        console.error('[getCustomerAnalysisResult] error:', error);
        throw error;
    }
};

/* 更新客戶分析結果 */
const updateCustomerAnalysisResult = async (resultData) => {
    try {
        // 檢查分析結果是否存在
        const existingResult = await CustomerAnalysisResult.getCustomerAnalysisResult(resultData.id);
        if (!existingResult) {
            throw new Error('客戶分析結果不存在');
        }

        const result = await CustomerAnalysisResult.updateCustomerAnalysisResult(resultData);
        return result;
    } catch (error) {
        console.error('[updateCustomerAnalysisResult] error:', error);
        throw error;
    }
};

/* 刪除客戶分析結果 */
const deleteCustomerAnalysisResult = async (id) => {
    try {
        // 檢查分析結果是否存在
        const existingResult = await CustomerAnalysisResult.getCustomerAnalysisResult(id);
        if (!existingResult) {
            throw new Error('客戶分析結果不存在');
        }

        const result = await CustomerAnalysisResult.deleteCustomerAnalysisResult(id);
        return result;
    } catch (error) {
        console.error('[deleteCustomerAnalysisResult] error:', error);
        throw error;
    }
};

/* 匯入客戶分析結果 */
const importCustomerAnalysisResult = async (resultList) => {
    try {
        if (!Array.isArray(resultList) || resultList.length === 0) {
            throw new Error('匯入的分析結果列表不能為空');
        }

        const result = await CustomerAnalysisResult.importCustomerAnalysisResult(resultList);
        return result;
    } catch (error) {
        console.error('[importCustomerAnalysisResult] error:', error);
        throw error;
    }
};

module.exports = {
    getAllCustomerAnalysisResult,
    getCustomerAnalysisResultsByCustomerId,
    addCustomerAnalysisResult,
    getCustomerAnalysisResult,
    updateCustomerAnalysisResult,
    deleteCustomerAnalysisResult,
    importCustomerAnalysisResult
};