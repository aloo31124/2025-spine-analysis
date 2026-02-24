import axios from 'axios';

const HOST = process.env.REACT_APP_BASE_URL;
const CONTEXT = 'api/manager/auth-permission';
const BASE_URL = HOST + CONTEXT;
const ERROR_HEADER = "[authPermission.js]";

/**
 * 檢查使用者角色權限
 * @returns {Promise} 回傳使用者角色資訊
 */
export const checkUserRole = async () => {
    console.log(`${ERROR_HEADER}[checkUserRole] 開始檢查使用者角色`);
    try {
        const token = localStorage.getItem('jwt');
        const response = await axios.get(`${BASE_URL}/check-role`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`${ERROR_HEADER}[checkUserRole] 成功:`, response.data);
        return response.data;
    } catch (error) {
        console.error(`${ERROR_HEADER}[checkUserRole] 失敗:`, error);
        throw error;
    }
};

/**
 * 取得所有店長列表 (僅總經理和系統管理員可使用)
 * @returns {Promise} 回傳店長列表
 */
export const getStoreManagerList = async () => {
    console.log(`${ERROR_HEADER}[getStoreManagerList] 開始取得店長列表`);
    try {
        const token = localStorage.getItem('jwt');
        const response = await axios.get(`${BASE_URL}/store-manager-list`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`${ERROR_HEADER}[getStoreManagerList] 成功:`, response.data);
        return response.data;
    } catch (error) {
        console.error(`${ERROR_HEADER}[getStoreManagerList] 失敗:`, error);
        throw error;
    }
};

/**
 * 檢查是否為總經理或系統管理員
 * @returns {Promise<boolean>} 是否有權限
 */
export const checkIsGeneralManagerOrAdmin = async () => {
    console.log(`${ERROR_HEADER}[checkIsGeneralManagerOrAdmin] 開始檢查權限`);
    try {
        const roleData = await checkUserRole();
        const roles = roleData.roles || [];
        const hasPermission = roles.some(r => r.role === 'GeneralManager' || r.role === 'Admin');
        console.log(`${ERROR_HEADER}[checkIsGeneralManagerOrAdmin] 結果:`, hasPermission);
        return hasPermission;
    } catch (error) {
        console.error(`${ERROR_HEADER}[checkIsGeneralManagerOrAdmin] 失敗:`, error);
        return false;
    }
};
/**
 * 檢查是否為區經理、總經理或系統管理員
 * @returns {Promise<boolean>} 是否有權限查看店長列表
 */
export const checkCanViewStoreManagerList = async () => {
    console.log(`${ERROR_HEADER}[checkCanViewStoreManagerList] 開始檢查權限`);
    try {
        const roleData = await checkUserRole();
        const roles = roleData.roles || [];
        const hasPermission = roles.some(r => 
            r.role === 'DistrictManager' || 
            r.role === 'GeneralManager' || 
            r.role === 'Admin'
        );
        console.log(`${ERROR_HEADER}[checkCanViewStoreManagerList] 結果:`, hasPermission);
        return hasPermission;
    } catch (error) {
        console.error(`${ERROR_HEADER}[checkCanViewStoreManagerList] 失敗:`, error);
        return false;
    }
};