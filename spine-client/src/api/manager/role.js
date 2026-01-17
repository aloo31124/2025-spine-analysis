import axios from 'axios';

const HOST = process.env.REACT_APP_BASE_URL;
const CONTEXT = 'api/account/role';
const BASE_URL = HOST + CONTEXT;

/* 取得所有店長列表 */
export const getStoreManagerList = async () => {
    const token = localStorage.getItem('jwt');
    return axios.get(`${BASE_URL}/store-manager/list`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
}

/* 根據 email 新增店長角色 */
export const addStoreManagerByEmail = async (email) => {
    const token = localStorage.getItem('jwt');
    return axios.post(`${BASE_URL}/store-manager/add`, { email }, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
}

/* 刪除使用者角色對應關係 */
export const deleteUserToRole = async (id) => {
    const token = localStorage.getItem('jwt');
    return axios.delete(`${BASE_URL}/delete/${id}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
}
