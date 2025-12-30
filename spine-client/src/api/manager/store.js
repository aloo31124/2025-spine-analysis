import axios from 'axios';

const HOST = process.env.REACT_APP_BASE_URL;
const CONTEXT = 'api/manager/store';
const BASE_URL = HOST + CONTEXT;

/** 取得店面列表 */
export const getStoreList = async (searchParam, pagingParam) => {
    const token = localStorage.getItem('jwt');
    return axios.post(`${BASE_URL}/list`, { searchParam, pagingParam }, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};

/** 取得單一店面 */
export const getStore = async (id) => {
    const token = localStorage.getItem('jwt');
    return axios.get(`${BASE_URL}/${id}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};

/** 新增店面 */
export const addStore = async (newStore) => {
    const token = localStorage.getItem('jwt');
    return axios.post(
        `${BASE_URL}/add`,
        { newStore },
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );
};

/** 更新店面 */
export const updateStore = async (updateStore) => {
    const token = localStorage.getItem('jwt');
    return axios.patch(`${BASE_URL}/edit`, { updateStore }, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};

/** 刪除店面 */
export const deleteStore = async (id) => {
    const token = localStorage.getItem('jwt');
    return axios.delete(`${BASE_URL}/delete/${id}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};

/** 搜尋店面 */
export const searchStore = async (searchParam, pagingParam) => {
    const token = localStorage.getItem('jwt');
    return axios.post(`${BASE_URL}/search`, { searchParam, pagingParam }, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};

/** 根據店長 ID 取得管理的店面 */
export const getStoresByStoreManagerId = async (storeManagerId) => {
    const token = localStorage.getItem('jwt');
    return axios.get(`${BASE_URL}/store-manager/${storeManagerId}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};

/** 匯入店面 */
export const importStore = async (storeList) => {
    const token = localStorage.getItem('jwt');
    return axios.post(`${BASE_URL}/import`, { storeList }, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};
