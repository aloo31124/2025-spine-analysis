import axios from 'axios';

const HOST = process.env.REACT_APP_BASE_URL;
const CONTEXT = 'api/manager/payment';
const BASE_URL = HOST + CONTEXT;

/* get 方案列表 */
export const getPaymentList = async (searchParam, pagingParam) => {
    return axios.post(`${BASE_URL}/list`, {searchParam, pagingParam});
}

/* get 方案詳細 */
export const getPayment = async (id) => {
    return axios.get(`${BASE_URL}/${id}`);
}

/* post 新增方案 */
export const addPayment = async (newPayment) => {
    const token = localStorage.getItem('jwt');
    return axios.post(
        `${BASE_URL}/add`, 
        {newPayment},
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );
}

/* put 更新方案 */
export const updatePayment = async (updatePayment) => {
    return axios.patch(`${BASE_URL}/edit`, {updatePayment});
}

/* delete 刪除方案 */
export const deletePayment = async (id) => {
    return axios.delete(`${BASE_URL}/delete/${id}`);
}

/* 搜尋方案 */
export const searchPayment = async (searchParam, pagingParam) => {
    return axios.post(`${BASE_URL}/search`, {searchParam, pagingParam});
}

/* 匯出方案 */
export const exportPayment = async () => {
    return axios.get(`${BASE_URL}/export`);
}

/* 匯入方案 */
export const importPayment = async (paymentList) => {
    console.log('paymentList:', paymentList);
    return axios.post(`${BASE_URL}/import`, {paymentList});
}