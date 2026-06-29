import axios from 'axios';

const HOST = process.env.REACT_APP_BASE_URL;
const CONTEXT = 'api/shop/product';
const BASE_URL = HOST + CONTEXT;

/* get 商品列表 */
export const searchProductList = async (searchParam, pagingParam) => {
    return axios.post(`${BASE_URL}/list`,{searchParam, pagingParam});
}

/* get 商品分類 */
export const getProductCategoryList = async () => {
    return axios.get(`${BASE_URL}/category/list`);
}

/* get 促銷方案 */
export const getPromotionList = async () => {
    return axios.get(`${BASE_URL}/promotion/list`);
}


