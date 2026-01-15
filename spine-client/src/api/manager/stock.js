/**
 * 庫存 API
 * 處理店面商品庫存的相關請求
 */
import axios from 'axios';

const HOST = process.env.REACT_APP_BASE_URL;
const CONTEXT = 'api/manager/stock';
const BASE_URL = HOST + CONTEXT;

/**
 * 取得枕頭商品庫存列表
 * 根據當前使用者（店長）取得其管理的所有店面的枕頭庫存
 */
export const getPillowInventory = async () => {
    const token = localStorage.getItem('jwt');
    return axios.get(`${BASE_URL}/pillow`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};

/**
 * 取得床墊商品庫存列表
 * 根據當前使用者（店長）取得其管理的所有店面的床墊庫存
 */
export const getMattressInventory = async () => {
    const token = localStorage.getItem('jwt');
    return axios.get(`${BASE_URL}/mattress`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};

/**
 * 更新單一店面的商品庫存
 * @param {Object} stockData - { productId, productType, storeId, stock }
 */
export const updateStoreStock = async (stockData) => {
    const token = localStorage.getItem('jwt');
    return axios.patch(`${BASE_URL}/update`, stockData, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};

/**
 * 批量更新商品在多個店面的庫存
 * @param {Object} data - { productId, productType, storeStockList: [{ storeId, stock }] }
 */
export const batchUpdateProductStock = async (data) => {
    const token = localStorage.getItem('jwt');
    return axios.post(`${BASE_URL}/batch-update`, data, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};

/**
 * 取得商品在指定店面的庫存資訊
 * @param {string} productId - 商品 ID
 * @param {string} productType - 商品類型 (Pillow/Mattress)
 */
export const getProductStock = async (productId, productType) => {
    const token = localStorage.getItem('jwt');
    return axios.get(`${BASE_URL}/product`, {
        params: { productId, productType },
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};

/**
 * 刪除商品的所有庫存紀錄
 * @param {string} productId - 商品 ID
 */
export const deleteProductStock = async (productId) => {
    const token = localStorage.getItem('jwt');
    return axios.delete(`${BASE_URL}/product/${productId}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};
