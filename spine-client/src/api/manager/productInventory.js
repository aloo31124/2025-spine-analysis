import axios from 'axios';

const HOST = process.env.REACT_APP_BASE_URL;
const CONTEXT = 'api/manager/product-inventory';
const BASE_URL = HOST + CONTEXT;

/**
 * 取得枕頭商品庫存清單
 * @param {string} userId - 使用者ID
 * @param {string} storeManagerId - 店長ID (總經理/Admin選擇的店長)
 * @returns {Promise} 枕頭商品庫存資料
 */
export const getPillowInventoryList = async (userId = '', storeManagerId = '') => {
    const token = localStorage.getItem('jwt');
    const params = {};
    if (userId) params.userId = userId;
    if (storeManagerId) params.storeManagerId = storeManagerId;
    return axios.get(`${BASE_URL}/pillow`, {
        headers: {
            Authorization: `Bearer ${token}`
        },
        params
    });
};

/**
 * 取得床墊商品庫存清單
 * @param {string} userId - 使用者ID
 * @param {string} storeManagerId - 店長ID (總經理/Admin選擇的店長)
 * @returns {Promise} 床墊商品庫存資料
 */
export const getMattressInventoryList = async (userId = '', storeManagerId = '') => {
    const token = localStorage.getItem('jwt');
    const params = {};
    if (userId) params.userId = userId;
    if (storeManagerId) params.storeManagerId = storeManagerId;
    return axios.get(`${BASE_URL}/mattress`, {
        headers: {
            Authorization: `Bearer ${token}`
        },
        params
    });
};

/**
 * 更新枕頭商品庫存
 * @param {string} productId - 商品ID
 * @param {number} stock - 新庫存數量
 * @returns {Promise} 更新結果
 */
export const updatePillowStock = async (productId, stock) => {
    const token = localStorage.getItem('jwt');
    return axios.patch(`${BASE_URL}/pillow/stock`, 
        { productId, stock }, 
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );
};

/**
 * 更新床墊商品庫存
 * @param {string} productId - 商品ID
 * @param {number} stock - 新庫存數量
 * @returns {Promise} 更新結果
 */
export const updateMattressStock = async (productId, stock) => {
    const token = localStorage.getItem('jwt');
    return axios.patch(`${BASE_URL}/mattress/stock`, 
        { productId, stock }, 
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );
};
