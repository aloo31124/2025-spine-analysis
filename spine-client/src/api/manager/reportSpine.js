import axios from 'axios';

const HOST = process.env.REACT_APP_BASE_URL;
const CONTEXT = 'api/manager/report-spine';
const BASE_URL = HOST + CONTEXT;

/**
 * 取得營收折線圖資料
 * @param {string} timeRange - 時間範圍 ('day', 'week', 'month', 'quarter')
 * @param {string} productPillowId - 商品ID ('all' 或特定ID)
 * @returns {Promise} API回應
 */
export const getRevenueLineChartData = async (timeRange = 'day', productPillowId = 'all') => {
    const token = localStorage.getItem('jwt');
    if (!token) {
        throw new Error('未登入');
    }

    try {
        const response = await axios.post(
            `${BASE_URL}/revenue-line-chart`,
            {
                timeRange,
                productPillowId
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        return response;
    } catch (error) {
        console.error('[reportSpine.js] getRevenueLineChartData error:', error);
        throw error;
    }
};

/**
 * 取得商品選項列表（用於下拉選單）
 * @returns {Promise} API回應
 */
export const getProductPillowOptions = async () => {
    const token = localStorage.getItem('jwt');
    if (!token) {
        throw new Error('未登入');
    }

    try {
        const response = await axios.get(
            `${BASE_URL}/product-options`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        return response;
    } catch (error) {
        console.error('[reportSpine.js] getProductPillowOptions error:', error);
        throw error;
    }
};
