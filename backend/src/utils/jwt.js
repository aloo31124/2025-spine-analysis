/*
 * jwt token 產生
 */
const jwt = require('jsonwebtoken');
const SECRET_KEY = 'SECRET_KEY';

/* 黑名單存儲登出的 token */
const tokenBlacklist = new Set();

/* 產生 jwt token */
exports.createToken = (payload, expiresIn = '30m') => {
    return jwt.sign(payload, SECRET_KEY, {expiresIn});
}

/* 驗證 jwt token */
exports.verifyToken = (token) => {
    if(!token) return;
    try {
        // 檢查 token 是否在黑名單中
        if (tokenBlacklist.has(token)) {
            console.log("Token 已失效（黑名單）。");
            return null;
        }
        return jwt.verify(token, SECRET_KEY);
    } catch (err) {
        console.log("驗證 jwt token err : ", err);
        return null
    }
}

/* 註銷（將 token 添加到黑名單） */
exports.logoutToken = (token) => {
    if (token) {
        tokenBlacklist.add(token); // 添加到黑名單
        console.log("Token 已加入黑名單：", token);
        return true;
    }
    return false;
};
