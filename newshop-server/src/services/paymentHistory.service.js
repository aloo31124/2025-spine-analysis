const User = require('../models/user.model');
const Payment = require('../models/payment.model');
const PaymentHistory = require('../models/paymentHistory.model');

/* [系統管理] 搜尋 [金流紀錄], join 使用者,方案 */
exports.searchPaymentHistoryInfo = async (email, paymentName) => {
    try {
        console.log(" [searchPaymentHistoryInfo] 開始 email, paymentName: ", email, paymentName);
        const pagingParam = { pageIndex: 1, pageSize: 1000, sort: "asc", pageTotal:-1, dataTotal:-1 };

        // 篩選 使用者
        const userList = (await User.search({email}, pagingParam)).userList;

        // 篩選 方案
        const paymentList = await Payment.search(paymentName, "all", "all");

        // 搜尋 [金流紀錄]
        const historyList = (await PaymentHistory.search({}, pagingParam)).historyList;

        // [金流紀錄] join 使用者, 方案
        return historyList.map((history) => {
            const user = userList.find((user) => user.id === history.userId);
            const payment = paymentList.find((payment) => payment.id === history.paymentId);
            // 使用者, 方案 已被篩選掉, 則 return;
            if(!user || !payment) return null;
            // join 使用者, 方案
            return {
                email: user ? user.email : "無 email",
                planName : payment ? payment.planName  : "無 planName ",
                ...history,
            }
        })
        .filter((history) => history !== null);
    } catch (error) {
        console.error("[searchPaymentHistoryInfo] Error:", error);
    }
}
