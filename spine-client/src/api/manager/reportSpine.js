import axios from 'axios';

const HOST = process.env.REACT_APP_BASE_URL;
const CONTEXT = 'api/manager/report-spine';
const BASE_URL = HOST + CONTEXT;

/**
 * 取得營收折線圖資料
 * @param {string} timeRange - 時間範圍 ('day', 'week', 'month', 'quarter')
 * @param {string} productPillowId - 商品ID ('all' 或特定ID)
 * @param {string} userId - 使用者ID
 * @param {string} productType - 商品類型 ('all', 'pillow', 'mattress')
 * @returns {Promise} API回傳
 */
export const getRevenueLineChartData = async (timeRange = 'day', productPillowId = 'all', userId = '', productType = 'all') => {
    const token = localStorage.getItem('jwt');
    if (!token) {
        throw new Error('未登入');
    }

    try {
        const response = await axios.post(
            `${BASE_URL}/revenue-line-chart`,
            {
                timeRange,
                productPillowId,
                userId,
                productType
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        return response?.data?.result;
    } catch (error) {
        console.error('[reportSpine.js] getRevenueLineChartData error:', error);
        throw error;
    }
};

/**
 * 取得銷量折線圖資料
 * @param {string} timeRange - 區間 ('day', 'week', 'month', 'quarter')
 * @param {string} productPillowId - 商品 ID ('all' 或特定 ID)
 * @param {string} userId - 使用者ID
 * @param {string} productType - 商品類型 ('all', 'pillow', 'mattress')
 */
export const getSalesLineChartData = async (timeRange = 'day', productPillowId = 'all', userId = '', productType = 'all') => {
    const token = localStorage.getItem('jwt');
    if (!token) {
        throw new Error('未登入');
    }

    try {
        const response = await axios.post(
            `${BASE_URL}/sales-line-chart`,
            {
                timeRange,
                productPillowId,
                userId,
                productType
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        return response?.data?.result;
    } catch (error) {
        console.error('[reportSpine.js] getSalesLineChartData error:', error);
        throw error;
    }
};

/**
 * 取得商品選項列表（用於下拉選單）
 * @param {string} productType - 商品類型 ('all', 'pillow', 'mattress')
 * @param {string} userId - 使用者ID（用於店長權限篩選）
 * @returns {Promise} API回傳
 */
export const getProductPillowOptions = async (productType = 'all', userId = '') => {
    const token = localStorage.getItem('jwt');
    if (!token) {
        throw new Error('未登入');
    }

    try {
        const response = await axios.get(
            `${BASE_URL}/product-options`,
            {
                params: {
                    productType,
                    userId
                },
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        return response?.data?.result;
    } catch (error) {
        console.error('[reportSpine.js] getProductPillowOptions error:', error);
        throw error;
    }
};
