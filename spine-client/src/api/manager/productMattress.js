import axios from 'axios';

const HOST = process.env.REACT_APP_BASE_URL;
const CONTEXT = 'api/manager/product-mattress';
const BASE_URL = HOST + CONTEXT;

/* get 床墊商品列表 */
export const getProductMattressList = async (searchParam, pagingParam) => {
    const token = localStorage.getItem('jwt');
    return axios.post(`${BASE_URL}/list`, { searchParam, pagingParam }, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
}

/* get 床墊商品詳細 */
export const getProductMattress = async (id) => {
    return axios.get(`${BASE_URL}/${id}`);
}

/* post 新增床墊商品 */
export const addProductMattress = async (newProductMattress) => {
    const token = localStorage.getItem('jwt');
    return axios.post(
        `${BASE_URL}/add`,
        { newProductMattress },
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );
}

/* patch 更新床墊商品 */
export const updateProductMattress = async (updateProductMattress) => {
    const token = localStorage.getItem('jwt');
    return axios.patch(`${BASE_URL}/edit`, { updateProductMattress }, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
}

/* delete 刪除床墊商品 */
export const deleteProductMattress = async (id) => {
    const token = localStorage.getItem('jwt');
    return axios.delete(`${BASE_URL}/delete/${id}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
}

/* 搜尋床墊商品 */
export const searchProductMattress = async (searchParam, pagingParam) => {
    const token = localStorage.getItem('jwt');
    return axios.post(`${BASE_URL}/search`, { searchParam, pagingParam }, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
}

/* 匯入床墊商品 */
export const importProductMattress = async (productMattressList) => {
    console.log('productMattressList:', productMattressList);
    const token = localStorage.getItem('jwt');
    return axios.post(`${BASE_URL}/import`, { productMattressList }, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
}
