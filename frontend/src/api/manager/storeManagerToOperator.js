import axios from 'axios';

const HOST = process.env.REACT_APP_BASE_URL;
const CONTEXT = 'api/account/store-manager-to-operator';
const BASE_URL = HOST + CONTEXT;

/**
 * 取得店長綁定的操作員列表
 */
export const getOperatorList = async () => {
    const token = localStorage.getItem('jwt');
    return axios.get(`${BASE_URL}/list`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
}

/**
 * 根據 email 新增操作員（店長綁定操作員）
 */
export const addOperatorByEmail = async (email) => {
    const token = localStorage.getItem('jwt');
    return axios.post(`${BASE_URL}/add`, { email }, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
}

/**
 * 刪除操作員綁定
 */
export const deleteOperator = async (bindingId) => {
    const token = localStorage.getItem('jwt');
    return axios.delete(`${BASE_URL}/delete/${bindingId}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
}

/**
 * 搜尋綁定關係（支援分頁）
 */
export const searchBinding = async (searchParam, pagingParam) => {
    const token = localStorage.getItem('jwt');
    return axios.post(`${BASE_URL}/search`, { searchParam, pagingParam }, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
}

/**
 * 取得當前操作員綁定的店長資訊
 * 操作員專用 API - 用於在設定頁顯示所屬店長
 */
export const getStoreManagerInfo = async () => {
    const token = localStorage.getItem('jwt');
    return axios.get(`${BASE_URL}/store-manager-info`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
}
