const UserToPayment = require('../models/userToPayment.model');
const User = require('../models/user.model');
const Payment = require('../models/payment.model');

/* 匯出 全部 使用擁有者 */
exports.getAllUserToPaymentList = async () => {
    try {
        return await UserToPayment.getAllUserToPaymentList();
    } catch (error) {
        console.error("[getAllUserToPaymentList] Error:", error);
    }
}

/* 使用者購買方案, 依照 userId, 取 expiryDate [到期日期] 最大(最久之後) */
exports.getUserPaymentLastest = async (userId) => {
    try {
        console.log(`[getUserPaymentLastest] 開始`);
        const userToPaymentList = await UserToPayment.findByUserId(userId);
        const paymentNews = userToPaymentList.reduce((max, payment) => {
            return new Date(payment.expiryDate) > new Date(max.expiryDate) ? payment : max; 
        });
        console.log(`[getUserPaymentLastest] 運算結果 paymentNews : ${paymentNews}`);
        return paymentNews;
    } catch (error) {
        console.error("[getUserPaymentLastest] Error:", error);
    }
}

/* 搜尋 [使用者方案] */
exports.joinUserPayment = async (email, paymentName) => {
    try {
        console.log(`[joinUserRole] 開始  email: ${email} , paymentName: ${paymentName}`);
        const pagingParam = { pageIndex: 1, pageSize: 1000, sort: "asc", pageTotal:-1, dataTotal:-1 };

        // 篩選 使用者
        const userList = (await User.search({email}, pagingParam)).userList;

        // 篩選 方案
        const paymentList = await Payment.search(paymentName, 'all', 'all');

        // 使用者 方案
        const userToPaymentList = await UserToPayment.getAllUserToPaymentList();
        // 合併 表
        return userToPaymentList.map((userToPayment) => {
            const user = userList.find((user) => user.id === userToPayment.userId);
            const payment = paymentList.find((payment) => payment.id === userToPayment.paymentId);
            if(!user || !payment) return null;
            return {
                email: user.email,
                ...payment,
                ...userToPayment,
            }
        })
        .filter((userToPayment) => userToPayment !== null);
    } catch (error) {
        console.error("[joinUserRole] Error:", error);
    }
}

