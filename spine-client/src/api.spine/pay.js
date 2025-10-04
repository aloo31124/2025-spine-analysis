import axios from "axios";

const HOST = process.env.REACT_APP_BASE_URL;
const CONTEXT = 'api/pay';
const BASE_URL = HOST + CONTEXT;

const CONTEXT_ACCOUNT = 'api/account';
const BASE_URL_ACCOUNT = HOST + CONTEXT_ACCOUNT;

export const getECpayHtmlPage = async () => {
    return axios.get(`${BASE_URL}/ecpay/pay/select/dGv2WtZWtFDUm6FcSDNm/Qxe0uOn2sLGicm7IQUqI`);
}

export const searchPaymentAll = async () => {
    return axios.post(`${BASE_URL_ACCOUNT}/payment/search`, {payment: {}});
}

