import axios from "axios";

const HOST = process.env.REACT_APP_BASE_URL;
const CONTEXT = 'api/account';
const BASE_URL = HOST + CONTEXT;

/* 取得所有 方案列表 */
export const searchPaymentAll = async () => {
    return axios.post(`${BASE_URL}/payment/search`, {payment: {}});
}

/* 取得 導向 綠界金流 購買頁 */
export const getECPaymSelectPage = async (paymentId) => {
    const token = localStorage.getItem('jwt');
    if(!token) return null;
    return axios.get(
        `${BASE_URL}/payment/select/${paymentId}`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }     
    );
}

/* 免費方案開通 */
export const postFreePayment = async (data) => {
    const token = localStorage.getItem('jwt');
    if(!token) return null;
    return axios.post(
        `${BASE_URL}/payment/free`,
        data,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );
}

