const authService = require('../services/auth.service');
const userToRoleService = require("../services/userToRole.service");
const userToOwnerService = require("../services/userToOwner.service");
const userToPaymentService = require("../services/userToPayment.service");
const paymentService = require("../services/payment.service");
const payEcpayService = require("../services/paymentEcpay.service");


/* 查詢 擁有者, 依照 email */
exports.getOwnerByEmail = async (req, res) => {
    console.log("[getOwnerByEmail] 開始", req.params);
    try {
        const result = await userToOwnerService.getOwnerByEmail(req.params.email);
        console.log("[getOwnerByEmail] 成功 : ", result);
        res.status(200).send({result});
    } catch (error) {
        console.log("[getOwnerByEmail] 失敗", error);
        res.status(500).json({ error: "[getOwnerByEmail] 失敗 發送驗證碼失敗" });
    }
};

/* 新增 預約者 對應 擁有者 */
exports.postUserToOwner = async (req, res) => {
    console.log("[postUserToOwner] 開始", req.body.userToOwner);
    try {
        const result = await userToOwnerService.addUserToOwner(req.body.userToOwner);
        console.log("[postUserToOwner] 成功 : ", result);
        res.status(200).send({result});
    } catch (error) {
        console.log("[postUserToOwner] 失敗", error);
        res.status(500).json({ error: "[postUserToOwner] 失敗 發送驗證碼失敗" });
    }
};

/* 新增 該使用者 對應之 角色 */
exports.postUserToRole = async (req, res) => {
    console.log("[postUserToRole] 開始", req.body.userToRole);
    try {
        const result = await userToRoleService.addUserToRole(req.body.userToRole);
        console.log("[postUserToRole] 成功 : ", result);
        res.status(200).send({result});
    } catch (error) {
        console.log("[postUserToRole] 失敗", error);
        res.status(500).json({ error: "[postUserToRole] 失敗 發送驗證碼失敗" });
    }
};

/* 搜尋 使用者對應角色, 依照 userId */
exports.getUserRoleByUserId = async (req, res) => {
    console.log("[getUserRoleByUserId] 開始", req.params);
    try {
        const result = await userToRoleService.getUserRoleByUserId(req.params.userId);
        console.log("[getUserRoleByUserId] 成功 : ", result);
        res.status(200).send({result});
    } catch (error) {
        console.log("[getUserRoleByUserId] 失敗", error);
        res.status(500).json({ error: "[getUserRoleByUserId] 失敗 發送驗證碼失敗" });
    }
};



/* 搜尋 使用者對應購買方案, 依照 userId */
exports.getUserPaymentByUserId = async (req, res) => {
    console.log("[getUserPaymentByUserId] 開始", req.params);
    try {
        const result = await userToPaymentService.getUserPaymentLastest(req.params.userId);
        console.log("[getUserPaymentByUserId] 成功 : ", result);
        res.status(200).send({result});
    } catch (error) {
        console.log("[getUserPaymentByUserId] 失敗", error);
        res.status(500).json({ error: "[getUserPaymentByUserId] 失敗 發送驗證碼失敗" });
    }
};


/* 搜尋 購買方案, 依照 paymentId */
exports.getPaymentByPaymentid = async (req, res) => {
    console.log("[getPaymentByPaymentid] 開始", req.params);
    try {
        const result = await paymentService.find(req.params.paymentId);
        console.log("[getPaymentByPaymentid] 成功 : ", result);
        res.status(200).send({result});
    } catch (error) {
        console.log("[getPaymentByPaymentid] 失敗", error);
        res.status(500).json({ error: "[getPaymentByPaymentid] 失敗 發送驗證碼失敗" });
    }
}


/* 搜尋 購買方案, 依照 paymentId */
exports.searchPayment = async (req, res) => {
    try {
        console.log("[searchPayment] 開始");
        const {payment} = req.body;
        const result = await paymentService.search(payment);
        console.log("[searchPayment] 成功 : ", result);
        res.status(200).send({result});
    } catch (error) {
        console.log("[searchPayment] 失敗", error);
        res.status(500).json({ error: "[searchPayment] 失敗 發送驗證碼失敗" });
    }
}

/** 取得 綠界付款方案選擇 */
exports.getPaySelectPageHtml = async (req, res) => {
    try {
        console.log(' [getPaySelectPageHtml] 開始 :', req.body, req.query, req.params);
        const { paymentId } = req.params;
        const userId = (authService.verifyJwt(req))?.userId;
        if(!userId) {
            console.error("[getPaySelectPageHtml] 缺少使用者資訊  : ", userId);
            res.status(200).json({ error: "[getPaySelectPageHtml] 缺少使用者資訊  : " + userId});
            return;
        }
        payEcpayService.addPaymentHistory({userId, paymentId, message: "選擇方案 req.body : " + JSON.stringify(req.body, null, 2)});
        const payment = await payEcpayService.find(paymentId);
        res.status(200).send(await payEcpayService.getPaySelectPageHtml(payment, userId));
    } catch (error) {
        console.error("[getPaySelectPageHtml] 失敗 : ", error);
        res.status(500).json({ error: "[getPaySelectPageHtml]  失敗 : " + error });
    }
}


