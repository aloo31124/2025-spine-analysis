/*
 * [控制層] 購物 shopping 處理, 客戶搜尋商品, 加入購物車
 */
const productService = require('../../services/product.service');
const productCategoryService = require('../../services/productCategory.service');
const promotionService = require('../../services/promotion.service');

/* 取得商品列表 */
exports.searchProductList = async (req, res) => {
    try {
        console.log("[getProductList] start : ");
        const {searchParam, pagingParam} = req.body;
        const result = await productService.searchProductJoinCategoryPromotion(searchParam, pagingParam);
        res.status(200).json({ result });
    } catch (error) {
        console.error("[getProductList] error :", error);
        res.status(500).json({ error: error.message });
    }
};

/* 搜尋商品種類 */
exports.searchProductCategory = async (req, res) => {
    try {
        console.log("[searchProductCategory] start : ");
        const result = await productCategoryService.searchProductCategory({}, {});
        res.status(200).json({ result });
    } catch (error) {
        console.error("[searchProductCategory] error :", error);
        res.status(500).json({ error: error.message });
    }
};


/* 搜尋 促銷方案 */
exports.searchPromotion = async (req, res) => {
    try {
        console.log("[searchPromotion] start : ");
        const result = (await promotionService.searchPromotion({}, {})).promotionList;
        res.status(200).json({ result });
    } catch (error) {
        console.error("[searchPromotion] error :", error);
        res.status(500).json({ error: error.message });
    }
};


