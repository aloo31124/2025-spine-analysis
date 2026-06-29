import axios from 'axios';

const HOST = process.env.REACT_APP_BASE_URL;
const CONTEXT = 'api/manager/backup';
const BASE_URL = HOST + CONTEXT;

/* get 商品 列表 */
export const getProductList = async () => {
    return axios.get(`${BASE_URL}/export/product`);
}

/* get 商品分類 列表 */
export const getProductCategoryList = async () => {
    return axios.get(`${BASE_URL}/export/product/category`);
}

/* get 使用者 列表 */
export const getUserList = async () => {
    return axios.get(`${BASE_URL}/export/user`);
}

/** 匯入 db所有表 */
export const importAllDBTable = async (userList, productList, categoryList) => {
    return axios.post(`${BASE_URL}/import/all/db`, {userList, productList, categoryList});
}


