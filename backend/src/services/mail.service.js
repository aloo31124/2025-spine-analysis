/*
 * [服務層] 送信, 信件驗證碼, 等業務邏輯
 */

const nodemailer = require('nodemailer');
const {createVerifyCode, verifyEmail} = require('../utils/verify');
require("dotenv").config();

/* 設定 nodemailer, 使用 gmail 送信 */
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    }
});
// 信件驗證碼列表
let mailVerifyList = [];

/* 使用nodemailer 送出註冊碼 */
exports.sendMailVerifyCode = (mail) => {
    const code = createVerifyCode(5)
    mailVerifyList.push({mail, code});
    console.log(" mailVerifyList : ", mailVerifyList);
    return new Promise((resolve, reject) => {
        // 設定送出信件內容
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: mail,
            subject: "新商城 - 信箱驗證碼",
            text: "您的驗證碼是:" + code,
        };
        // 送出信件
        transporter.sendMail(mailOptions, async (error, info) => {
            if(error) {
                console.log("nodemailer 信件寄送失敗: ", error);
                reject("nodemailer 信件寄送失敗: " + error.message);
                return;
            }
            if(info && info.response) {
                console.log("信件寄送成功: ", info.response);
                resolve("信件寄送成功: " + info.response.toString());
            } else {
                console.log("信件寄送成功，但沒有回應資訊");
                resolve("信件寄送成功");
            }
        });
    });
}

/* 比對驗證碼 */
exports.verifyCode = (user) => {
    return mailVerifyList.filter(item => item.mail === user.mail && item.code === user.code).length > 0;
}

