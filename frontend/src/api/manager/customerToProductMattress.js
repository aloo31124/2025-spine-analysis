import axios from 'axios';

const HOST = process.env.REACT_APP_BASE_URL;
const CONTEXT = 'api/manager/customer-to-product-mattress';
const BASE_URL = HOST + CONTEXT;

/* get 所有客戶購買床墊商品關聯列表 */
export const getAllCustomerToProductMattressList = async () => {
    return axios.get(`${BASE_URL}/list`);
}

/* post 新增客戶購買床墊商品關聯 */
export const addCustomerToProductMattress = async (newCustomerToProductMattress) => {
    const token = localStorage.getItem('jwt');
    return axios.post(
        `${BASE_URL}/add`, 
        { newCustomerToProductMattress },
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );
}

/* post 批量新增客戶購買床墊商品關聯 */
export const addMultipleCustomerToProductMattress = async (customerToProductMattressList) => {
    const token = localStorage.getItem('jwt');
    return axios.post(
        `${BASE_URL}/add-multiple`, 
        { customerToProductMattressList },
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );
}

/* get 客戶購買床墊商品關聯詳細 */
export const getCustomerToProductMattress = async (id) => {
    return axios.get(`${BASE_URL}/${id}`);
}

/* get 根據客戶ID取得購買床墊商品關聯 */
export const getCustomerToProductMattressByCustomerId = async (customerId) => {
    return axios.get(`${BASE_URL}/customer/${customerId}`);
}

/* get 根據床墊商品ID取得購買關聯 */
export const getCustomerToProductMattressByProductMattressId = async (productMattressId) => {
    return axios.get(`${BASE_URL}/product-mattress/${productMattressId}`);
}

/* patch 更新客戶購買床墊商品關聯 */
export const updateCustomerToProductMattress = async (updateCustomerToProductMattress) => {
    const token = localStorage.getItem('jwt');
    return axios.patch(
        `${BASE_URL}/edit`, 
        { updateCustomerToProductMattress },
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );
}

/* delete 刪除客戶購買床墊商品關聯 */
export const deleteCustomerToProductMattress = async (id) => {
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
