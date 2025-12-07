import axios from 'axios';

const HOST = process.env.REACT_APP_BASE_URL;
const CONTEXT = 'api/manager/report-spine';
const BASE_URL = HOST + CONTEXT;

/**
 * ���o�禬��u�ϸ��
 * @param {string} timeRange - �ɶ��d�� ('day', 'week', 'month', 'quarter')
 * @param {string} productPillowId - �ӫ~ID ('all' �ίS�wID)
 * @returns {Promise} API�^��
 */
export const getRevenueLineChartData = async (timeRange = 'day', productPillowId = 'all') => {
    const token = localStorage.getItem('jwt');
    if (!token) {
        throw new Error('���n�J');
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
        return response?.data?.result;
    } catch (error) {
        console.error('[reportSpine.js] getRevenueLineChartData error:', error);
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
