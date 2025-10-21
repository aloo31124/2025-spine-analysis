const userService = require("../../services/user.service");
const productService = require("../../services/product.service");
const productCategoryService = require("../../services/productCategory.service");
const customerService = require("../../services/customer.service");

/* 匯出所有 使用者 列表 */
exports.getUserExportList = async (req, res) => {
    try {
        res.status(200).send({result: await userService.getAllUserList()});
    } catch (error) {
        res.status(500).json({ error: "[getUserExportList] error" });
    }
}

/** 匯入 所有db表 */
exports.postAllDBTable = async (req, res) => {
    try {
        const resultUser = await userService.importAllUser(req.body.userList);
        const resultProduct = await productService.importAllProduct(req.body.productList);
        const resultProductCategory = await productCategoryService.importAllProductCategory(req.body.categoryList);
        const resultCustomer = await customerService.importAllCustomer(req.body.customerList);
        res.status(200).send({result: {resultUser, resultProduct, resultProductCategory, resultCustomer} });
    } catch (error) {
        res.status(500).json({ error: "[postAllDBTable] error" });
    }
} 


/* 匯出所有 商品資訊 列表 */
exports.getProductExportList = async (req, res) => {
    try {
        res.status(200).send({result: await productService.exportAllProductList()});
    } catch (error) {
        res.status(500).json({ error: "[getProductExportList] error" });
    }
}


/* 匯出所有 商品分類資訊 列表 */
exports.getProductCategoryExportList = async (req, res) => {
    try {
        res.status(200).send({result: await productCategoryService.exportAllProductCategoryList()});
    } catch (error) {
        res.status(500).json({ error: "[getProductCategoryExportList] error" });
    }
}

/* 匯出所有 客戶資訊 列表 */
exports.getCustomerExportList = async (req, res) => {
    try {
        res.status(200).send({result: await customerService.exportAllCustomerList()});
    } catch (error) {
        res.status(500).json({ error: "[getCustomerExportList] error" });
    }
}


