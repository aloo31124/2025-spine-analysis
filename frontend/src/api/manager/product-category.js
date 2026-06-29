import axios from "axios";

const HOST = process.env.REACT_APP_BASE_URL;
const CONTEXT = 'api/manager/product/category';
const BASE_URL = HOST + CONTEXT;

/* get 商品類別列表 */
export const getProductCategoryList = async () => {
    return axios.get(`${BASE_URL}/list`);
}

/* get 商品類別詳細 */
export const getProductCategory = async (id) => {
    return axios.get(`${BASE_URL}/${id}`);
}

/* post 新增商品類別 */
export const addProductCategory = async (newProductCategory) => {
    const token = localStorage.getItem('jwt');
    return axios.post(
        `${BASE_URL}/add`, 
        {newProductCategory},
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );
}

/* put 更新商品類別 */
export const updateProductCategory = async (updateProductCategory) => {
    return axios.patch(`${BASE_URL}/edit`, {updateProductCategory});
}

/* delete 刪除商品類別 */
export const deleteProductCategory = async (id) => {
    return axios.delete(`${BASE_URL}/delete/${id}`);
}

/* 搜尋商品類別 */
export const searchProductCategory = async (searchParam) => {
    return axios.post(`${BASE_URL}/search`, searchParam);
}

