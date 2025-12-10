import axios from 'axios';

const HOST = process.env.REACT_APP_BASE_URL;
const CONTEXT = 'api/manager/customer';
const BASE_URL = HOST + CONTEXT;

/* get 客戶列表 */
export const getCustomerList = async (searchParam, pagingParam) => {
    const token = localStorage.getItem('jwt');
    return axios.post(`${BASE_URL}/list`, {searchParam, pagingParam}, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
}

/* get 客戶詳細 */
export const getCustomer = async (id) => {
    return axios.get(`${BASE_URL}/${id}`);
}

/* post 新增客戶 */
export const addCustomer = async (newCustomer) => {
    const token = localStorage.getItem('jwt');
    return axios.post(
        `${BASE_URL}/add`, 
        {newCustomer},
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );
}

/* put 更新客戶 */
export const updateCustomer = async (updateCustomer) => {
    return axios.patch(`${BASE_URL}/edit`, {updateCustomer});
}

/* delete 刪除客戶 */
export const deleteCustomer = async (id) => {
    const token = localStorage.getItem('jwt');
    return axios.delete(`${BASE_URL}/delete/${id}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
}

/* 搜尋客戶 */
export const searchCustomer = async (searchParam, pagingParam) => {
    const token = localStorage.getItem('jwt');
    return axios.post(`${BASE_URL}/search`, {searchParam, pagingParam}, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
}

/* 匯入客戶 */
export const importCustomer = async (customerList) => {
    console.log('customerList:', customerList);
    return axios.post(`${BASE_URL}/import`, {customerList});
}