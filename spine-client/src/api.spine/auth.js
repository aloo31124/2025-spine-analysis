import axios from 'axios';

const HOST = process.env.REACT_APP_BASE_URL;
const CONTEXT = 'api/auth';
const BASE_URL = HOST + CONTEXT;

/* 送出註冊信箱 */
export const postMail = async (mail) => {
    return axios.post(`${BASE_URL}/regist/mail`, {mail});
}

/* 取得使用者資訊, 依mail */
export const findMail = async (mail) => {
    return axios.get(`${BASE_URL}/user/exits/${mail}`);
}

/* 信箱新建使用者 */
export const postUser = async (newUser) => {
    return axios.post(`${BASE_URL}/regist/user/add`, {newUser});
}

/* 更新使用者註冊資訊 */
export const updateUser = async (newUser) => {
    return axios.post(`${BASE_URL}/regist/user/info`, {newUser});
}

/* 驗證註冊碼 */
export const verifyCode = async (newUser) => {
    return axios.post(`${BASE_URL}/regist/verify/code`, {newUser});
}

/* 註冊更新密碼 */
export const updatePassword = async (newUser) => {
    return axios.post(`${BASE_URL}/regist/user/password`, {newUser});
}

/* 登入 */
export const login = async (email, password) => {
    // 只接收 http status 200
    const res = await axios.post(`${BASE_URL}/login`, {email, password});
    const token = res.data.token;
    localStorage.setItem('jwt', token);
    return res;
}

/* 登出 */
export const logout = async () => {
    const token = localStorage.getItem('jwt');
    if(!token || token.length === 0) return null;
    await axios.post(
        `${BASE_URL}/logout`,
        {}, // request body 空白
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );
    localStorage.removeItem('jwt');
}

/* 驗證 jwt token */
export const verifyJwt = async () => {
    const token = localStorage.getItem('jwt');
    if(!token || token.length === 0) return null;
    return await axios.post(
        `${BASE_URL}/verify/jwt`,
        {}, // request body 空白
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );
}

/* 檢查角色(賣家)是否存在 */
export const verifyRole = async (user) => {
    return axios.post(`${BASE_URL}/verify/role`, {user});
}

/* 檢查角色(賣家)方案是否過期 */
export const verifyPayment = async (user) => {
    return axios.post(`${BASE_URL}/verify/payment/lastest`, {user});
}


