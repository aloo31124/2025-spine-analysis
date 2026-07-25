
const mailService = require('./mail.service');
const userService = require('../services/user.service');
const utils = require('../utils/jwt');
const User = require('../models/user.model');

/* 送出驗證碼 */
exports.sendVerifyCode = async (mail) => {
    try {
        return await mailService.sendMailVerifyCode(mail);
    } catch (error) {
        console.error("[sendVerifyCode] error:", error);
        return null;
    }
};

/* 信箱, 建立新的帳號 */
exports.addAccount = async (newUser) => {
    try {
        const userData = new User(newUser);
        const userObj = userData.toPlainObject();
        return await userService.addUser(userObj);
    } catch (error) {
        console.error("[addAccount] error:", error);
        return null;
    }
};

/* 更新使用者資訊 */
exports.updateAccount = async (user) => {
    try {
        return await userService.updateUser(user);
    } catch (error) {
        console.error("[updateAccount] error:", error);
        return null;
    }
};

/* 比對驗證碼 */
exports.verifyCode = (user) => {
    try {
        return mailService.verifyCode(user);
    } catch (error) {
        console.error("[verifyCode] error:", error);
        return null;
    }
};

/* 登入 */
exports.login = async (email, password) => {
    try {
        return await userService.login(email, password);
    } catch (error) {
        console.error("[login] error:", error);
        return null;
    }
};

/* 登出, 清除 token */
exports.logout = (req) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return false;
        return utils.logoutToken(token);
    } catch (error) {
        console.error("[logout] error:", error);
        return false;
    }
};

/* 產生 jwt token */
exports.createJwtToken = async (req) => {
    try {
        const { email } = req.body;
        const user = await userService.getUserByEmail(email);
        if (!user) throw new Error("User not found");
        const userAgent = req.headers['user-agent'];
        return utils.createToken({ userId: user.id, email, userAgent }, '30m');
    } catch (error) {
        console.error("[createJwtToken] error:", error);
        return null;
    }
};

/* 驗證 jwt token */
exports.verifyJwt = (req) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
        const token = authHeader.split(' ')[1];
        return utils.verifyToken(token);
    } catch (error) {
        console.error("[verifyJwt] error:", error);
        return null;
    }
};
