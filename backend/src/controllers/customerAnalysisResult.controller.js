/*
 * [controller層] 負責 客戶分析結果 路由邏輯
 */

const CustomerAnalysisResultService = require('../services/customerAnalysisResult.service');

/* 取得所有客戶分析結果 */
const getAllCustomerAnalysisResult = async (req, res) => {
    try {
        const resultList = await CustomerAnalysisResultService.getAllCustomerAnalysisResult();
        res.status(200).json(resultList);
    } catch (error) {
        console.error('取得客戶分析結果列表錯誤:', error);
        res.status(500).json({ error: '取得客戶分析結果列表失敗' });
    }
};

/* 根據客戶ID取得分析結果 */
const getCustomerAnalysisResultsByCustomerId = async (req, res) => {
    try {
        const { customerId } = req.params;
        const resultList = await CustomerAnalysisResultService.getCustomerAnalysisResultsByCustomerId(customerId);
        res.status(200).json(resultList);
    } catch (error) {
        console.error('根據客戶ID取得分析結果錯誤:', error);
        res.status(500).json({ error: '取得分析結果失敗' });
    }
};

/* 新增客戶分析結果 */
const addCustomerAnalysisResult = async (req, res) => {
    try {
        const { customerId, userId, analysisType, analysisData, points, lines, intersectionPoints, calculationResults, backgroundImage } = req.body;
        
        // 驗證必要欄位
        if (!customerId || !userId || !analysisData) {
            return res.status(400).json({ error: '缺少必要欄位' });
        }

        const result = await CustomerAnalysisResultService.addCustomerAnalysisResult({
            customerId,
            userId,
            analysisType: analysisType || "spine",
            analysisData,
            points: points || [],
            lines: lines || [],
            intersectionPoints: intersectionPoints || [],
            calculationResults: calculationResults || [],
            backgroundImage: backgroundImage || ""
        });
        
        res.status(200).json(result);
    } catch (error) {
        console.error('新增客戶分析結果錯誤:', error);
        res.status(500).json({ error: '新增客戶分析結果失敗' });
    }
};

/* 取得客戶分析結果 */
const getCustomerAnalysisResult = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await CustomerAnalysisResultService.getCustomerAnalysisResult(id);
        if (!result) {
            return res.status(404).json({ error: '找不到客戶分析結果' });
        }
        res.status(200).json(result);
    } catch (error) {
        console.error('取得客戶分析結果錯誤:', error);
        res.status(500).json({ error: '取得客戶分析結果失敗' });
    }
};

/* 更新客戶分析結果 */
const updateCustomerAnalysisResult = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = { id, ...req.body };
        const result = await CustomerAnalysisResultService.updateCustomerAnalysisResult(updateData);
        res.status(200).json(result);
    } catch (error) {
        console.error('更新客戶分析結果錯誤:', error);
        res.status(500).json({ error: '更新客戶分析結果失敗' });
    }
};

/* 刪除客戶分析結果 */
const deleteCustomerAnalysisResult = async (req, res) => {
    try {
        const { id } = req.params;
        await CustomerAnalysisResultService.deleteCustomerAnalysisResult(id);
        res.status(200).json({ message: '刪除客戶分析結果成功', id });
    } catch (error) {
        console.error('刪除客戶分析結果錯誤:', error);
        res.status(500).json({ error: '刪除客戶分析結果失敗' });
    }
};

/* 匯入客戶分析結果 */
const importCustomerAnalysisResult = async (req, res) => {
    try {
        const { resultList } = req.body;
        const result = await CustomerAnalysisResultService.importCustomerAnalysisResult(resultList);
        res.status(200).json(result);
    } catch (error) {
        console.error('匯入客戶分析結果錯誤:', error);
        res.status(500).json({ error: '匯入客戶分析結果失敗' });
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