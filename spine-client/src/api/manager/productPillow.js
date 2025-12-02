import axios from 'axios';

const HOST = process.env.REACT_APP_BASE_URL;
const CONTEXT = 'api/manager/product-pillow';
const BASE_URL = HOST + CONTEXT;

/* get 枕頭商品列表 */
export const getProductPillowList = async (searchParam, pagingParam) => {
    const token = localStorage.getItem('jwt');
    return axios.post(`${BASE_URL}/list`, { searchParam, pagingParam }, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
}

/* get 枕頭商品詳細 */
export const getProductPillow = async (id) => {
    return axios.get(`${BASE_URL}/${id}`);
}

/* post 新增枕頭商品 */
export const addProductPillow = async (newProductPillow) => {
    const token = localStorage.getItem('jwt');
    return axios.post(
        `${BASE_URL}/add`,
        { newProductPillow },
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );
}

/* patch 更新枕頭商品 */
export const updateProductPillow = async (updateProductPillow) => {
    const token = localStorage.getItem('jwt');
    return axios.patch(`${BASE_URL}/edit`, { updateProductPillow }, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
}

/* delete 刪除枕頭商品 */
export const deleteProductPillow = async (id) => {
    const token = localStorage.getItem('jwt');
    return axios.delete(`${BASE_URL}/delete/${id}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
}

/* 搜尋枕頭商品 */
export const searchProductPillow = async (searchParam, pagingParam) => {
    const token = localStorage.getItem('jwt');
    return axios.post(`${BASE_URL}/search`, { searchParam, pagingParam }, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
}

/* 匯入枕頭商品 */
export const importProductPillow = async (productPillowList) => {
    console.log('productPillowList:', productPillowList);
    const token = localStorage.getItem('jwt');
    return axios.post(`${BASE_URL}/import`, { productPillowList }, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
}
