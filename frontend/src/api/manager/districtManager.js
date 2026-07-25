import axios from 'axios';

const HOST = process.env.REACT_APP_BASE_URL;
const CONTEXT = 'api/manager/district-manager';
const BASE_URL = HOST + CONTEXT;
const ERROR_HEADER = "[districtManager.js]";

/**
 * 取得區經理列表
 * @returns {Promise} 回傳區經理列表
 */
export const getDistrictManagerList = async () => {
    console.log(`${ERROR_HEADER}[getDistrictManagerList] 開始取得區經理列表`);
    try {
        const token = localStorage.getItem('jwt');
        const response = await axios.get(`${BASE_URL}/list`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`${ERROR_HEADER}[getDistrictManagerList] 成功:`, response.data);
        return response.data;
    } catch (error) {
        console.error(`${ERROR_HEADER}[getDistrictManagerList] 失敗:`, error);
        throw error;
    }
};

/**
 * 透過 email 新增區經理
 * @param {string} email - 使用者 email
 * @returns {Promise} 回傳新增結果
 */
export const addDistrictManagerByEmail = async (email) => {
    console.log(`${ERROR_HEADER}[addDistrictManagerByEmail] 開始新增區經理:`, email);
    try {
        const token = localStorage.getItem('jwt');
        const response = await axios.post(
            `${BASE_URL}/add`,
            { email },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log(`${ERROR_HEADER}[addDistrictManagerByEmail] 成功:`, response.data);
        return response.data;
    } catch (error) {
        console.error(`${ERROR_HEADER}[addDistrictManagerByEmail] 失敗:`, error);
        throw error;
    }
};

/**
 * 刪除區經理
 * @param {string} roleId - 角色 ID
 * @returns {Promise} 回傳刪除結果
 */
export const deleteDistrictManager = async (roleId) => {
    console.log(`${ERROR_HEADER}[deleteDistrictManager] 開始刪除區經理:`, roleId);
    try {
        const token = localStorage.getItem('jwt');
        const response = await axios.delete(`${BASE_URL}/delete/${roleId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`${ERROR_HEADER}[deleteDistrictManager] 成功:`, response.data);
        return response.data;
    } catch (error) {
        console.error(`${ERROR_HEADER}[deleteDistrictManager] 失敗:`, error);
        throw error;
    }
};
