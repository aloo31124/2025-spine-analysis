import axios from 'axios';

const HOST = process.env.REACT_APP_BASE_URL;
const CONTEXT = 'api/manager/district';
const BASE_URL = HOST + CONTEXT;
const ERROR_HEADER = "[district.js]";

/**
 * 取得所有區域列表
 * @returns {Promise} 回傳區域列表
 */
export const getAllDistrictList = async () => {
    console.log(`${ERROR_HEADER}[getAllDistrictList] 開始取得區域列表`);
    try {
        const token = localStorage.getItem('jwt');
        const response = await axios.get(`${BASE_URL}/list`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`${ERROR_HEADER}[getAllDistrictList] 成功:`, response.data);
        return response.data;
    } catch (error) {
        console.error(`${ERROR_HEADER}[getAllDistrictList] 失敗:`, error);
        throw error;
    }
};

/**
 * 新增區域
 * @param {string} name - 區域名稱
 * @returns {Promise} 回傳新增結果
 */
export const addDistrict = async (name) => {
    console.log(`${ERROR_HEADER}[addDistrict] 開始新增區域:`, name);
    try {
        const token = localStorage.getItem('jwt');
        const response = await axios.post(
            `${BASE_URL}/add`,
            { name },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log(`${ERROR_HEADER}[addDistrict] 成功:`, response.data);
        return response.data;
    } catch (error) {
        console.error(`${ERROR_HEADER}[addDistrict] 失敗:`, error);
        throw error;
    }
};

/**
 * 更新區域
 * @param {string} id - 區域 ID
 * @param {string} name - 區域名稱
 * @returns {Promise} 回傳更新結果
 */
export const updateDistrict = async (id, name) => {
    console.log(`${ERROR_HEADER}[updateDistrict] 開始更新區域:`, { id, name });
    try {
        const token = localStorage.getItem('jwt');
        const response = await axios.patch(
            `${BASE_URL}/update`,
            { id, name },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log(`${ERROR_HEADER}[updateDistrict] 成功:`, response.data);
        return response.data;
    } catch (error) {
        console.error(`${ERROR_HEADER}[updateDistrict] 失敗:`, error);
        throw error;
    }
};

/**
 * 刪除區域
 * @param {string} districtId - 區域 ID
 * @returns {Promise} 回傳刪除結果
 */
export const deleteDistrict = async (districtId) => {
    console.log(`${ERROR_HEADER}[deleteDistrict] 開始刪除區域:`, districtId);
    try {
        const token = localStorage.getItem('jwt');
        const response = await axios.delete(`${BASE_URL}/delete/${districtId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`${ERROR_HEADER}[deleteDistrict] 成功:`, response.data);
        return response.data;
    } catch (error) {
        console.error(`${ERROR_HEADER}[deleteDistrict] 失敗:`, error);
        throw error;
    }
};

/**
 * 取得區域詳細資訊（包含綁定的店長列表）
 * @param {string} districtId - 區域 ID
 * @returns {Promise} 回傳區域詳情
 */
export const getDistrictWithStoreManagers = async (districtId) => {
    console.log(`${ERROR_HEADER}[getDistrictWithStoreManagers] 開始取得區域詳情:`, districtId);
    try {
        const token = localStorage.getItem('jwt');
        const response = await axios.get(`${BASE_URL}/${districtId}/store-managers`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`${ERROR_HEADER}[getDistrictWithStoreManagers] 成功:`, response.data);
        return response.data;
    } catch (error) {
        console.error(`${ERROR_HEADER}[getDistrictWithStoreManagers] 失敗:`, error);
        throw error;
    }
};

/**
 * 綁定店長到區域
 * @param {string} districtId - 區域 ID
 * @param {string} storeManagerUserId - 店長用戶 ID
 * @returns {Promise} 回傳綁定結果
 */
export const bindStoreManagerToDistrict = async (districtId, storeManagerUserId) => {
    console.log(`${ERROR_HEADER}[bindStoreManagerToDistrict] 開始綁定:`, { districtId, storeManagerUserId });
    try {
        const token = localStorage.getItem('jwt');
        const response = await axios.post(
            `${BASE_URL}/bind-store-manager`,
            { districtId, storeManagerUserId },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log(`${ERROR_HEADER}[bindStoreManagerToDistrict] 成功:`, response.data);
        return response.data;
    } catch (error) {
        console.error(`${ERROR_HEADER}[bindStoreManagerToDistrict] 失敗:`, error);
        throw error;
    }
};

/**
 * 解除店長與區域的綁定
 * @param {string} bindingId - 綁定關係 ID
 * @returns {Promise} 回傳解除綁定結果
 */
export const unbindStoreManagerFromDistrict = async (bindingId) => {
    console.log(`${ERROR_HEADER}[unbindStoreManagerFromDistrict] 開始解除綁定:`, bindingId);
    try {
        const token = localStorage.getItem('jwt');
        const response = await axios.delete(`${BASE_URL}/unbind-store-manager/${bindingId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`${ERROR_HEADER}[unbindStoreManagerFromDistrict] 成功:`, response.data);
        return response.data;
    } catch (error) {
        console.error(`${ERROR_HEADER}[unbindStoreManagerFromDistrict] 失敗:`, error);
        throw error;
    }
};

/**
 * 綁定區經理到區域
 * @param {string} districtId - 區域 ID
 * @param {string} districtManagerUserId - 區經理用戶 ID
 * @returns {Promise} 回傳綁定結果
 */
export const bindDistrictManagerToDistrict = async (districtId, districtManagerUserId) => {
    console.log(`${ERROR_HEADER}[bindDistrictManagerToDistrict] 開始綁定:`, { districtId, districtManagerUserId });
    try {
        const token = localStorage.getItem('jwt');
        const response = await axios.post(
            `${BASE_URL}/bind-district-manager`,
            { districtId, districtManagerUserId },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log(`${ERROR_HEADER}[bindDistrictManagerToDistrict] 成功:`, response.data);
        return response.data;
    } catch (error) {
        console.error(`${ERROR_HEADER}[bindDistrictManagerToDistrict] 失敗:`, error);
        throw error;
    }
};

/**
 * 解除區經理與區域的綁定
 * @param {string} bindingId - 綁定關係 ID
 * @returns {Promise} 回傳解除綁定結果
 */
export const unbindDistrictManagerFromDistrict = async (bindingId) => {
    console.log(`${ERROR_HEADER}[unbindDistrictManagerFromDistrict] 開始解除綁定:`, bindingId);
    try {
        const token = localStorage.getItem('jwt');
        const response = await axios.delete(`${BASE_URL}/unbind-district-manager/${bindingId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`${ERROR_HEADER}[unbindDistrictManagerFromDistrict] 成功:`, response.data);
        return response.data;
    } catch (error) {
        console.error(`${ERROR_HEADER}[unbindDistrictManagerFromDistrict] 失敗:`, error);
        throw error;
    }
};
