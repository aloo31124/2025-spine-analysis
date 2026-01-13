import axios from 'axios';

const HOST = process.env.REACT_APP_BASE_URL;
const CONTEXT = 'api/manager/report-spine';
const BASE_URL = HOST + CONTEXT;

/**
 * 取得營收折線圖資料
 * @param {string} timeRange - 時間範圍 ('day', 'week', 'month', 'quarter')
 * @param {string} productPillowId - 商品ID ('all' 或特定ID)
 * @param {string} userId - 使用者ID
 * @returns {Promise} API回傳
 */
export const getRevenueLineChartData = async (timeRange = 'day', productPillowId = 'all', userId = '') => {
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
                userId
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
 */
export const getSalesLineChartData = async (timeRange = 'day', productPillowId = 'all', userId = '') => {
    const token = localStorage.getItem('jwt');
    if (!token) {
        throw new Error('未登入');
    }

    try {
        const response = await axios.post(
            `${BASE_URL}/sales-line-chart`,
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
        return response?.data?.result;
    } catch (error) {
        console.error('[reportSpine.js] getSalesLineChartData error:', error);
        throw error;
    }
};

/**
 * ���o�ӫ~�ﶵ�C���]�Ω�U�Կ��^
 * @returns {Promise} API�^��
 */
export const getProductPillowOptions = async () => {
    const token = localStorage.getItem('jwt');
    if (!token) {
        throw new Error('���n�J');
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
        return response?.data?.result;
    } catch (error) {
        console.error('[reportSpine.js] getProductPillowOptions error:', error);
        throw error;
    }
};
