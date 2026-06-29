import axios from "axios";

const HOST = process.env.REACT_APP_BASE_URL;
const CONTEXT = 'api/pay';
const BASE_URL = HOST + CONTEXT;

const CONTEXT_ACCOUNT = 'api/account';
const BASE_URL_ACCOUNT = HOST + CONTEXT_ACCOUNT;

export const getECpayHtmlPage = async (paymentId) => {
    return axios.get(`${BASE_URL_ACCOUNT}/payment/select/${paymentId}`);
}

export const searchPaymentAll = async () => {
    return axios.post(`${BASE_URL_ACCOUNT}/payment/search`, {payment: {}});
}

export const postFreePayment = async (data) => {
    return axios.post(`${BASE_URL_ACCOUNT}/payment/free`, data);
}

