const Promotion = require('../models/promotion.model');

/* 搜尋 促銷 */
exports.searchPromotion = async (searchParam, pagingParam) => {
    pagingParam = { pageIndex: 1, pageSize: 1000, sort:'', pageTotal:-1, dataTotal:-1 };
    return await Promotion.searchPromotion(searchParam, pagingParam);
}


