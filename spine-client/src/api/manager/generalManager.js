import axios from 'axios';

const HOST = process.env.REACT_APP_BASE_URL;
const CONTEXT = 'api/manager/general-manager';
const BASE_URL = HOST + CONTEXT;
const ERROR_HEADER = "[generalManager.js]";

/**
 * 取得總經理列表
 * @returns {Promise} 回傳總經理列表
 */
export const getGeneralManagerList = async () => {
    console.log(`${ERROR_HEADER}[getGeneralManagerList] 開始取得總經理列表`);
    try {
        const token = localStorage.getItem('jwt');
        const response = await axios.get(`${BASE_URL}/list`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`${ERROR_HEADER}[getGeneralManagerList] 成功:`, response.data);
        return response.data;
    } catch (error) {
        console.error(`${ERROR_HEADER}[getGeneralManagerList] 失敗:`, error);
        throw error;
    }
};

/**
 * 透過 email 新增總經理
 * @param {string} email - 使用者 email
 * @returns {Promise} 回傳新增結果
 */
export const addGeneralManagerByEmail = async (email) => {
    console.log(`${ERROR_HEADER}[addGeneralManagerByEmail] 開始新增總經理:`, email);
    try {
        const token = localStorage.getItem('jwt');
        const response = await axios.post(
            `${BASE_URL}/add`,
            { email },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log(`${ERROR_HEADER}[addGeneralManagerByEmail] 成功:`, response.data);
        return response.data;
    } catch (error) {
        console.error(`${ERROR_HEADER}[addGeneralManagerByEmail] 失敗:`, error);
        throw error;
    }
};

/**
 * 刪除總經理
 * @param {number} roleId - UserToRole 表的 id
 * @returns {Promise} 回傳刪除結果
 */
export const deleteGeneralManager = async (roleId) => {
    console.log(`${ERROR_HEADER}[deleteGeneralManager] 開始刪除總經理 roleId:`, roleId);
    try {
        const token = localStorage.getItem('jwt');
        const response = await axios.delete(
            `${BASE_URL}/delete/${roleId}`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log(`${ERROR_HEADER}[deleteGeneralManager] 成功:`, response.data);
        return response.data;
    } catch (error) {
        console.error(`${ERROR_HEADER}[deleteGeneralManager] 失敗:`, error);
        throw error;
    }
};
