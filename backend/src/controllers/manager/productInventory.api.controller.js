/*
 * [控制層] 商品庫存處理
 *  - 取得枕頭商品庫存清單
 *  - 取得床墊商品庫存清單
 *  - 更新商品庫存
 */

const productInventoryService = require('../../services/productInventory.service');
const authService = require('../../services/auth.service');

const ERROR_HEADER = "[productInventory.api.controller.js]";

/**
 * 取得枕頭商品庫存清單
 * 依照當前使用者的 userId 取得該使用者所擁有的枕頭商品庫存
 */
exports.getPillowInventoryList = async (req, res) => {
    try {
        console.log("[getPillowInventoryList] start, query:", req.query);
        const payload = authService.verifyJwt(req);
        const { storeManagerId = '' } = req.query || {};
        const result = await productInventoryService.getPillowInventoryList(
            payload?.userId, 
            storeManagerId
        );
        res.status(200).json({ result });
    } catch (error) {
        console.error("[getPillowInventoryList] error :", error);
        res.status(500).json({ result: error.message });
    }
};

/**
 * 取得床墊商品庫存清單
 * 依照當前使用者的 userId 取得該使用者所擁有的床墊商品庫存
 */
exports.getMattressInventoryList = async (req, res) => {
    try {
        console.log("[getMattressInventoryList] start, query:", req.query);
        const payload = authService.verifyJwt(req);
        const { storeManagerId = '' } = req.query || {};
        const result = await productInventoryService.getMattressInventoryList(
            payload?.userId,
            storeManagerId
        );
        res.status(200).json({ result });
    } catch (error) {
        console.error("[getMattressInventoryList] error :", error);
        res.status(500).json({ result: error.message });
    }
};

/**
 * 更新枕頭商品庫存
 */
exports.updatePillowStock = async (req, res) => {
    try {
        console.log("[updatePillowStock] start : request =", req.body);
        const { productId, stock } = req.body;
        const result = await productInventoryService.updatePillowStock(productId, stock);
        res.status(200).json({ result: '200', data: result });
    } catch (error) {
        console.error("[updatePillowStock] error :", error);
        res.status(500).json({ result: '500', error: error.message });
    }
};

/**
 * 更新床墊商品庫存
 */
exports.updateMattressStock = async (req, res) => {
    try {
        console.log("[updateMattressStock] start : request =", req.body);
        const { productId, stock } = req.body;
        const result = await productInventoryService.updateMattressStock(productId, stock);
        res.status(200).json({ result: '200', data: result });
    } catch (error) {
        console.error("[updateMattressStock] error :", error);
        res.status(500).json({ result: '500', error: error.message });
    }
};
