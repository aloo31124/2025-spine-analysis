import axios from 'axios';

const HOST = process.env.REACT_APP_BASE_URL;
const CONTEXT = 'api/manager/product';
const BASE_URL = HOST + CONTEXT;

/* get 商品列表 */
export const getProductList = async (searchParam, pagingParam) => {
    return axios.post(`${BASE_URL}/list`, {searchParam, pagingParam});
}

/* get 商品分類 */
export const getProductCategoryList = async () => {
    return axios.get(`${BASE_URL}/category/list`);
}

/* get 商品詳細 */
export const getProduct = async (id) => {
    return axios.get(`${BASE_URL}/${id}`);
}

/* post 新增商品 */
export const addProduct = async (newProduct) => {
    const token = localStorage.getItem('jwt');
    return axios.post(
        `${BASE_URL}/add`, 
        {newProduct},
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );
}

/* put 更新商品 */
export const updateProduct = async (updateProduct) => {
    return axios.patch(`${BASE_URL}/edit`, {updateProduct});
}

/* delete 刪除商品 */
export const deleteProduct = async (id) => {
    return axios.delete(`${BASE_URL}/delete/${id}`);
}

/* 搜尋商品 */
export const searchProduct = async (searchParam, pagingParam) => {
    return axios.post(`${BASE_URL}/search`, {searchParam, pagingParam});
}

/* 匯入商品 */
export const importProduct = async (productList) => {
    console.log('productList:', productList);
    return axios.post(`${BASE_URL}/import`, {productList});
}

/* 批次上傳商品圖片 */
export const uploadImg = async (formData, id) => {
    try {
            const res = await axios.post(`${BASE_URL}/img/upload/${id}`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            alert("上傳成功！");
        } catch (error) {
            alert("上傳失敗！");
            console.error("Upload Error:", error);
    }
}

/* 取得該商品圖片 */
export const getProductImgList = async (id) => {
    try {
        return await axios.get(`${BASE_URL}/img/list/${id}`);
    } catch (error) {
        // alert("取得失敗");
        console.error("取得失敗");
    }
}

/* 刪除商品圖片 */
export const deleteProductImg = async (id, storedName) => {
    try {
        return await axios.delete(`${BASE_URL}/img/delete/${id}/${storedName}`);
    } catch (error) {
        alert("刪除失敗");
        console.error("刪除失敗");
    }
}

