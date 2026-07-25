const Payment = require('../models/payment.model');

/* [系統管理] 搜尋 [方案] */
exports.search = async (payment) => {
    try {
        return await Payment.search(payment);
    } catch (error) {
        console.error("[search] Error:", error);
    }
}

/* 查詢方案, 依照 paymentid */
exports.find = async (paymentId) => {
    try {
        return await Payment.find(paymentId);
    } catch (error) {
        console.error("[find] Error:", error);
    }
}

/* [系統管理] 新增 [方案] */
exports.add = async (payment) => {
    try {
        return await Payment.add(payment);
    } catch (error) {
        console.error(" [add] Error:", error);
    }
}

/* [系統管理] 更新 [方案] */
exports.update = async (payment) => {
    try {
        return await Payment.update(payment);
    } catch (error) {
        console.error(" [update] Error:", error);
    }
}

/* [系統管理] 刪除 [方案] */
exports.delete = async (id) => {
    try {
        return await Payment.delete(id);
    } catch (error) {
        console.error(" [delete] Error:", error);
    }
}

/* 取得 全部 購買方案 */
exports.getAllPaymentList = async () => {
    try {
        return await Payment.getAllPaymentList();
    } catch (error) {
        console.error("[getAllPaymentList] Error:", error);
    }
}

/* 匯出 全部 使用者 */
exports.getPaymentExportList = async () => {
    try {
        return await Payment.getAllPaymentList();
    } catch (error) {
        console.error("[getPaymentExportList] Error:", error);
    }
}

/* 匯入 全部 方案 */
exports.importAllPayment = async (paymentList) => {
    try {
        return await Payment.importAllPayment(paymentList);
    } catch (error) {
        console.error("[importAllPayment] Error:", error);
    }
}


