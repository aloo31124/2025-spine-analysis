import axios from 'axios';

// API URL 設定
const HOST = process.env.REACT_APP_BASE_URL || 'http://localhost:8083/';
const CONTEXT = 'api/manager/customer-analysis-result';
const BASE_URL = HOST + CONTEXT;

/* 取得所有客戶分析結果 */
export const getAllCustomerAnalysisResult = () => {
    return axios.get(`${BASE_URL}`);
};

/* 根據客戶ID取得分析結果 */
export const getCustomerAnalysisResultsByCustomerId = (customerId) => {
    return axios.get(`${BASE_URL}/customer/${customerId}`);
};

/* 新增客戶分析結果 */
export const addCustomerAnalysisResult = (resultData) => {
    return axios.post(`${BASE_URL}`, resultData);
};

/* 取得客戶分析結果 */
export const getCustomerAnalysisResult = (id) => {
    return axios.get(`${BASE_URL}/${id}`);
};

/* 更新客戶分析結果 */
export const updateCustomerAnalysisResult = (resultData) => {
    return axios.put(`${BASE_URL}/${resultData.id}`, resultData);
};

/* 刪除客戶分析結果 */
export const deleteCustomerAnalysisResult = (id) => {
    return axios.delete(`${BASE_URL}/${id}`);
};

/* 匯入客戶分析結果 */
export const importCustomerAnalysisResult = (resultList) => {
    return axios.post(`${BASE_URL}/import`, { resultList });
};