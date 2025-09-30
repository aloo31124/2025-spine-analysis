/*
 * [控制層] 商品購物, 串接綠界金流 ecpay
 */
const payEcpayService = require("../../services/paymentEcpay.service");
const userToRoleService = require("../../services/userToRole.service");
const UserToRole = require("../../models/userToRole.model");
const UserToPayment = require("../../models/userToPayment.model");

/* 取得所有購買方案 */
exports.getPaymentAll = async (req, res) => {
    console.log("[getPaymentAll] 開始", req.params);
    try {
        const result = await payEcpayService.getAllPaymentList();
        console.log("[getPaymentAll] 結束", result);
        res.status(200).send({result});
    } catch (error) {
        console.log("[getPaymentAll] 失敗", error);
        res.status(500).json({ error: "[getPaymentAll] 失敗" });
    }
}


/** 取得 綠界付款方案選擇 */
exports.getPaySelectPageHtml = async (req, res) => {
    try {
        console.log(' [getPaySelectPageHtml] 開始 :', req.body, req.query, req.params);
        const { paymentId, userId } = req.params;
        payEcpayService.addPaymentHistory({userId: userId, paymentId: paymentId, message: "選擇方案 req.body : " + JSON.stringify(req.body, null, 2)});
        const payment = await payEcpayService.find(paymentId);
        res.status(200).send(await payEcpayService.getPaySelectPageHtml(payment, userId));
    } catch (error) {
        console.error("[getPaySelectPageHtml] 失敗 : ", error);
        res.status(500).json({ error: "[getPaySelectPageHtml]  失敗 : " + error });
    }
}

/** 取得 綠界 付款結果 */
exports.postResultServer = async (req, res) => {
    try {
        console.log(' [postResultServer] :', req.body, req.query, req.params);
        const {CustomField1, CustomField2} = req.body;
        // 新增紀錄
        const result1 = await payEcpayService.addPaymentHistory({userId: CustomField1, paymentId: CustomField2, message: "付款伺服器結果 req.body : " + JSON.stringify(req.body, null, 2)});
        console.log(' [postResultServer] addPaymentHistory :', result1);
        // 更新(新增) 使用者 購買方案
        const result2 = await payEcpayService.addUserToPayment(CustomField1, CustomField2);
        console.log(' [postResultServer] addUserToPayment :', result2);
        // 檢查是否已有 [擁有者] owner 角色, 已有角色為 [續約],  若無 角色為首次購買, 新增角色
        const result3 = await userToRoleService.getUserRoleByUserId(CustomField1);
        if(result3?.length > 0) { // 續約
            console.log(' [postResultServer] getUserRoleByUserId  續約成功 ', result3);
        } else { // 首次建立帳號
            console.log(' [postResultServer] getUserRoleByUserId 轉創建帳號 result3 : :', result3);
            const result4 = await userToRoleService.addUserToRole({userId: CustomField1, role: 'seller'});
            console.log(' [postResultServer] addUserToRole 首次建立帳號 result4 :', result4);
        }
        // 回傳結果
        res.status(200).send("1|OK");
    } catch (error) {
        console.error("[postResultServer] 失敗 : ", error);
        res.status(500).json({ error: "[postResultServer] 失敗 : " + error });
    }
}

/** 付款結果畫面 */
exports.getResultClientPageHtml = async (req, res) => {
    try {
        console.log(' [getResultClientPageHtml] :', req.body, req.query, req.params);
        const history = payEcpayService.addPaymentHistory({userId: "userId02", paymentId:"paymentId02", message: "付款客戶結果 req.body : " + JSON.stringify(req.body, null, 2)});
        if(!history) {
            res.status(200).json({ error: "[getResultClientPageHtml] 失敗 : " + error });
            return;
        }

        res.send("<h1> 綠界付款中,請回到原畫面 </h1>");
    } catch (error) {
        console.error("[getResultClientPageHtml] 失敗 : ", error);
        res.status(500).json({ error: "[getResultClientPageHtml]  失敗 : " + error });
    }
}



