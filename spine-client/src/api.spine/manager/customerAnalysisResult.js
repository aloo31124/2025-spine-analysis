import axios from 'axios';

const HOST = process.env.REACT_APP_BASE_URL;
const CONTEXT = 'api/manager/customer-analysis-result';
const BASE_URL = HOST + CONTEXT;

/* get 所有客戶分析結果 */
export const getAllCustomerAnalysisResult = async () => {
    return axios.get(`${BASE_URL}`);
}

/* get 根據客戶ID取得分析結果 */
export const getCustomerAnalysisResultsByCustomerId = async (customerId) => {
    return axios.get(`${BASE_URL}/customer/${customerId}`);
}

/* get 取得客戶分析結果 */
export const getCustomerAnalysisResult = async (id) => {
    return axios.get(`${BASE_URL}/${id}`);
}

/* post 新增客戶分析結果 */
export const addCustomerAnalysisResult = async (analysisResultData) => {
    const token = localStorage.getItem('jwt');
    return axios.post(
        `${BASE_URL}`, 
        analysisResultData,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );
}

/* put 更新客戶分析結果 */
export const updateCustomerAnalysisResult = async (updateData) => {
    const token = localStorage.getItem('jwt');
    return axios.put(
        `${BASE_URL}/${updateData.id}`, 
        updateData,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );
}

/* delete 刪除客戶分析結果 */
export const deleteCustomerAnalysisResult = async (id) => {
    const token = localStorage.getItem('jwt');
    return axios.delete(
        `${BASE_URL}/${id}`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );
}

/* post 匯入客戶分析結果 */
export const importCustomerAnalysisResult = async (resultList) => {
    const token = localStorage.getItem('jwt');
    return axios.post(
        `${BASE_URL}/import`, 
        { resultList },
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );
}