import axios from 'axios';

const HOST = process.env.REACT_APP_BASE_URL;
const CONTEXT = 'api/manager/customer-to-product';
const BASE_URL = HOST + CONTEXT;

/* get 所有客戶購買商品關聯列表 */
export const getAllCustomerToProductList = async () => {
    return axios.get(`${BASE_URL}/list`);
}

/* post 新增客戶購買商品關聯 */
export const addCustomerToProduct = async (newCustomerToProduct) => {
    const token = localStorage.getItem('jwt');
    return axios.post(
        `${BASE_URL}/add`, 
        {newCustomerToProduct},
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );
}

/* post 批量新增客戶購買商品關聯 */
export const addMultipleCustomerToProduct = async (customerToProductList) => {
    const token = localStorage.getItem('jwt');
    return axios.post(
        `${BASE_URL}/add-multiple`, 
        {customerToProductList},
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );
}

/* get 客戶購買商品關聯詳細 */
export const getCustomerToProduct = async (id) => {
    return axios.get(`${BASE_URL}/${id}`);
}

/* get 根據客戶ID取得購買商品關聯 */
export const getCustomerToProductByCustomerId = async (customerId) => {
    return axios.get(`${BASE_URL}/customer/${customerId}`);
}

/* get 根據商品ID取得購買商品關聯 */
export const getCustomerToProductByProductId = async (productId) => {
    return axios.get(`${BASE_URL}/product/${productId}`);
}

/* patch 更新客戶購買商品關聯 */
export const updateCustomerToProduct = async (updateCustomerToProduct) => {
    const token = localStorage.getItem('jwt');
    return axios.patch(
        `${BASE_URL}/edit`, 
        {updateCustomerToProduct},
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );
}

/* delete 刪除客戶購買商品關聯 */
export const deleteCustomerToProduct = async (id) => {
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

/* post 搜尋客戶購買商品關聯 */
export const searchCustomerToProduct = async (searchParam, pagingParam) => {
    return axios.post(`${BASE_URL}/search`, {searchParam, pagingParam});
}

/* get 取得客戶購買統計 */
export const getCustomerPurchaseStats = async (customerId) => {
    return axios.get(`${BASE_URL}/stats/${customerId}`);
}