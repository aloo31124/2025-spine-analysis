const authService = require('../services/auth.service');
const userService = require('../services/user.service');
const userToRole = require('../services/userToRole.service');
const userToPayment = require('../services/userToPayment.service');

const logger = (message, data) => {
    console.log(`[${new Date().toISOString()}] ${message}`, data);
};

const errorLogger = (message, error) => {
    console.error(`[${new Date().toISOString()}] ${message}`, error);
};

exports.findUserByEmail = async (req, res) => {
    logger("[findUserByEmail] 開始 req.params: ", req.params.email);
    try {
        const result = await userService.getUserByEmail(req.params.email);
        logger("[findUserByEmail] 成功", result);
        res.status(200).send({result});
    } catch (error) {
        errorLogger("[findUserByEmail] 失敗", error);
        res.status(500).json({ error: "發送驗證碼失敗" });
    }
}

/* 寄送驗證碼 */
exports.registMail = async (req, res) => {
    logger("[registMail] 開始", req.body);
    try {
        const result = await authService.sendVerifyCode(req.body.mail);
        logger("[registMail] 成功", result);
        res.status(200).send({result});
    } catch (error) {
        errorLogger("[registMail] 失敗", error);
        res.status(500).json({ error: "發送驗證碼失敗" });
    }
};

/* 註冊建立使用者 */
exports.registAddUser = async (req, res) => {
    logger("[registAddUser] 開始", req.body);
    try {
        const newUser = await authService.addAccount(req.body.newUser);
        logger("[registAddUser] 成功", newUser);
        res.status(200).json({ newUser });
    } catch (error) {
        errorLogger("[registAddUser] 失敗", error);
        res.status(500).json({ error: "註冊失敗" });
    }
};

/* 註冊使用者更新資訊 */
exports.registUserUpdateInfot = async (req, res) => {
    logger("[registUserUpdateInfot] 開始", req.body);
    try {
        const newUser = await authService.updateAccount(req.body.newUser);
        logger("[registUserUpdateInfot] 成功", newUser);
        res.status(200).json({ newUser });
    } catch (error) {
        errorLogger("[registUserUpdateInfot] 失敗", error);
        res.status(500).json({ error: "更新使用者資訊失敗" });
    }
};

/* 註冊輸入驗證碼 */
exports.registVerityCode = async (req, res) => {
    logger("[registVerityCode] 開始", req.body);
    try {
        const verifyResult = authService.verifyCode(req.body.newUser);
        logger("[registVerityCode] 成功", verifyResult);
        res.status(200).json({ verifyResult });
    } catch (error) {
        errorLogger("[registVerityCode] 失敗", error);
        res.status(500).json({ error: "驗證碼錯誤" });
    }
};

/* 註冊使用者更新密碼 */
exports.registUserUpdatePassword = async (req, res) => {
    logger("[registUserUpdatePassword] 開始", req.body);
    try {
        const newUser = await authService.updateAccount(req.body.newUser);
        logger("[registUserUpdatePassword] 成功", newUser);
        res.status(200).json({ newUser });
    } catch (error) {
        errorLogger("[registUserUpdatePassword] 失敗", error);
        res.status(500).json({ error: "密碼更新失敗" });
    }
};

/* 登入 */
exports.login = async (req, res) => {
    logger("[login] 開始", req.body);
    try {
        const { email, password } = req.body;
        const isSuccess = await authService.login(email, password);
        if (!isSuccess) {
            logger("[login] 失敗, 帳密錯誤", email);
            return res.status(200).json({ isSuccess, message: "登入失敗, 帳密錯誤" });
        }
        const token = await authService.createJwtToken(req);
        logger("[login] 成功", { email, token });
        res.status(200).json({ isSuccess, message: "帳密登入成功", token });
    } catch (error) {
        errorLogger("[login] 錯誤", error);
        res.status(500).json({ error: "登入錯誤" });
    }
};

/* 登出, 清除 token */
exports.logout = async (req, res) => {
    logger("[logout] 開始", req.headers.authorization);
    try {
        const success = authService.logout(req);
        logger("[logout] 成功", success);
        res.status(200).json({ success, message: "已成功登出" });
    } catch (error) {
        errorLogger("[logout] 錯誤", error);
        res.status(500).json({ error, message:  "登出錯誤" });
    }
};

/* 驗證 jwt */
exports.verifyJwt = async (req, res) => {
    logger("[verifyJwt] 開始", req.headers.authorization);
    try {
        const payload = authService.verifyJwt(req);
        if (!payload) {
            logger("[verifyJwt] 失敗, 無效或過期 token", null);
            return res.status(401).json({ payload, error: '無效或過期之 token' });
        }
        logger("[verifyJwt] 成功", payload);
        res.status(200).json({ payload, message: "成功訪問資源" });
    } catch (error) {
        errorLogger("[verifyJwt] 失敗", error);
        res.status(500).json({ error, message:  "JWT 驗證失敗" });
    }
};

/* 驗證 使用者身分 */
exports.verifyRole = async (req, res) => {
    try {
        logger("[verifyRole] 開始");
        const { user } = req.body;
        const result = await userToRole.getUserRoleByUserId(user.userId);
        logger("[verifyRole] 成功");
        res.status(200).json({ result, message: "成功訪問資源" });
    } catch (error) {
        errorLogger("[verifyRole] 失敗", error);
        res.status(500).json({ error, message:  "JWT 驗證失敗" });
    }
};

/* 驗證 使用者方案 */
exports.verifyPayment = async (req, res) => {
    try {
        logger("[verifyPayment] 開始");
        const { user } = req.body;
        const result = await userToPayment.getUserPaymentLastest(user.userId);
        logger("[verifyPayment] 成功");
        res.status(200).json({ result, message: "成功訪問資源" });
    } catch (error) {
        errorLogger("[verifyPayment] 失敗", error);
        res.status(500).json({ error, message:  "JWT 驗證失敗" });
    }
};


