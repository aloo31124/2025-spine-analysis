/*
 * [控制層] 方案管理 CRUD 操作
 */
const paymentService = require("../../services/payment.service");

/* 取得所有方案列表 */
exports.getPaymentList = async (req, res) => {
    console.log("[getPaymentList] 開始", req.body);
    try {
        const { searchParam = {}, pagingParam = {} } = req.body;
        const result = await paymentService.search(searchParam);
        
        // 簡易分頁邏輯
        let { pageIndex = 1, pageSize = 5 } = pagingParam;
        const dataTotal = result.length;
        const pageTotal = Math.ceil(dataTotal / pageSize);
        const paymentList = result.slice((pageIndex - 1) * pageSize, pageIndex * pageSize);
        
        const response = {
            paymentList,
            pagingParam: {
                pageIndex,
                pageSize,
                pageTotal,
                dataTotal
            }
        };
        
        console.log("[getPaymentList] 結束", response);
        res.status(200).send({ result: response });
    } catch (error) {
        console.log("[getPaymentList] 失敗", error);
        res.status(500).json({ error: "[getPaymentList] 失敗" });
    }
}

/* 搜尋方案 */
exports.searchPayment = async (req, res) => {
    console.log("[searchPayment] 開始", req.body);
    try {
        const { searchParam = {}, pagingParam = {} } = req.body;
        const result = await paymentService.search(searchParam);
        
        // 簡易分頁邏輯
        let { pageIndex = 1, pageSize = 5 } = pagingParam;
        const dataTotal = result.length;
        const pageTotal = Math.ceil(dataTotal / pageSize);
        const paymentList = result.slice((pageIndex - 1) * pageSize, pageIndex * pageSize);
        
        const response = {
            paymentList,
            pagingParam: {
                pageIndex,
                pageSize,
                pageTotal,
                dataTotal
            }
        };
        
        console.log("[searchPayment] 結束", response);
        res.status(200).send({ searchResult: response });
    } catch (error) {
        console.log("[searchPayment] 失敗", error);
        res.status(500).json({ error: "[searchPayment] 失敗" });
    }
}

/* 取得單一方案詳細資料 */
exports.getPayment = async (req, res) => {
    console.log("[getPayment] 開始", req.params);
    try {
        const { id } = req.params;
        const result = await paymentService.find(id);
        console.log("[getPayment] 結束", result);
        res.status(200).send({ result });
    } catch (error) {
        console.log("[getPayment] 失敗", error);
        res.status(500).json({ error: "[getPayment] 失敗" });
    }
}

/* 新增方案 */
exports.addPayment = async (req, res) => {
    console.log("[addPayment] 開始", req.body);
    try {
        const { newPayment } = req.body;
        const result = await paymentService.add(newPayment);
        console.log("[addPayment] 結束", result);
        res.status(200).send({ result });
    } catch (error) {
        console.log("[addPayment] 失敗", error);
        res.status(500).json({ error: "[addPayment] 失敗" });
    }
}

/* 更新方案 */
exports.updatePayment = async (req, res) => {
    console.log("[updatePayment] 開始", req.body);
    try {
        const { updatePayment } = req.body;
        const result = await paymentService.update(updatePayment);
        console.log("[updatePayment] 結束", result);
        res.status(200).send({ result });
    } catch (error) {
        console.log("[updatePayment] 失敗", error);
        res.status(500).json({ error: "[updatePayment] 失敗" });
    }
}

/* 刪除方案 */
exports.deletePayment = async (req, res) => {
    console.log("[deletePayment] 開始", req.params);
    try {
        const { id } = req.params;
        const result = await paymentService.delete(id);
        console.log("[deletePayment] 結束", result);
        res.status(200).send({ result });
    } catch (error) {
        console.log("[deletePayment] 失敗", error);
        res.status(500).json({ error: "[deletePayment] 失敗" });
    }
}

/* 匯出方案 */
exports.exportPayment = async (req, res) => {
    console.log("[exportPayment] 開始");
    try {
        const result = await paymentService.getPaymentExportList();
        console.log("[exportPayment] 結束", result);
        res.status(200).send({ result });
    } catch (error) {
        console.log("[exportPayment] 失敗", error);
        res.status(500).json({ error: "[exportPayment] 失敗" });
    }
}

/* 匯入方案 */
exports.importPayment = async (req, res) => {
    console.log("[importPayment] 開始", req.body);
    try {
        const { paymentList } = req.body;
        const result = await paymentService.importAllPayment(paymentList);
        console.log("[importPayment] 結束", result);
        res.status(200).send({ result });
    } catch (error) {
        console.log("[importPayment] 失敗", error);
        res.status(500).json({ error: "[importPayment] 失敗" });
    }
}