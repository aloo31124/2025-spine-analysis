import axios from 'axios';

const HOST = process.env.REACT_APP_BASE_URL;
const CONTEXT = 'api/manager/customer-to-product-pillow';
const BASE_URL = HOST + CONTEXT;

/* get 所有客戶購買枕頭商品關聯列表 */
export const getAllCustomerToProductPillowList = async () => {
    return axios.get(`${BASE_URL}/list`);
}

/* post 新增客戶購買枕頭商品關聯 */
export const addCustomerToProductPillow = async (newCustomerToProductPillow) => {
    const token = localStorage.getItem('jwt');
    return axios.post(
        `${BASE_URL}/add`, 
        { newCustomerToProductPillow },
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );
}

/* post 批量新增客戶購買枕頭商品關聯 */
export const addMultipleCustomerToProductPillow = async (customerToProductPillowList) => {
    const token = localStorage.getItem('jwt');
    return axios.post(
        `${BASE_URL}/add-multiple`, 
        { customerToProductPillowList },
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );
}

/* get 客戶購買枕頭商品關聯詳細 */
export const getCustomerToProductPillow = async (id) => {
    return axios.get(`${BASE_URL}/${id}`);
}

/* get 根據客戶ID取得購買枕頭商品關聯 */
export const getCustomerToProductPillowByCustomerId = async (customerId) => {
    return axios.get(`${BASE_URL}/customer/${customerId}`);
}

/* get 根據枕頭商品ID取得購買關聯 */
export const getCustomerToProductPillowByProductPillowId = async (productPillowId) => {
    return axios.get(`${BASE_URL}/product-pillow/${productPillowId}`);
}

/* patch 更新客戶購買枕頭商品關聯 */
export const updateCustomerToProductPillow = async (updateCustomerToProductPillow) => {
    const token = localStorage.getItem('jwt');
    return axios.patch(
        `${BASE_URL}/edit`, 
        { updateCustomerToProductPillow },
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );
}

/* delete 刪除客戶購買枕頭商品關聯 */
export const deleteCustomerToProductPillow = async (id) => {
    const token = localStorage.getItem('jwt');
    return axios.delete(
        `${BASE_URL}/delete/${id}`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );
}

/* post 搜尋客戶購買枕頭商品關聯 */
export const searchCustomerToProductPillow = async (searchParam, pagingParam) => {
    return axios.post(`${BASE_URL}/search`, { searchParam, pagingParam });
}

/* get 取得客戶購買枕頭商品統計 */
export const getCustomerPurchasePillowStats = async (customerId) => {
    return axios.get(`${BASE_URL}/stats/${customerId}`);
}
