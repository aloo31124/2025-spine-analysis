/*
 * [controller層] 負責客戶購買商品關聯的 API 路由控制
 */

const CustomerToProductService = require('../../services/customerToProduct.service');

class CustomerToProductController {

    /* GET 取得所有客戶購買紀錄 */
    static async getAllCustomerToProductList(req, res) {
        try {
            const result = await CustomerToProductService.getAllCustomerToProductList();
            if (result.success) {
                res.status(200).json({
                    success: true,
                    message: result.message,
                    result: result.result
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: result.message,
                    error: result.error
                });
            }
        } catch (error) {
            console.error('取得客戶購買紀錄列表 API 錯誤:', error);
            res.status(500).json({
                success: false,
                message: '內部伺服器錯誤',
                error: error.message
            });
        }
    }

    /* POST 新增客戶購買紀錄 */
    static async addCustomerToProduct(req, res) {
        try {
            const { newCustomerToProduct } = req.body;
            if (!newCustomerToProduct) {
                return res.status(400).json({
                    success: false,
                    message: '缺少必要參數: newCustomerToProduct'
                });
            }

            const result = await CustomerToProductService.addCustomerToProduct(newCustomerToProduct);
            if (result.success) {
                res.status(200).json({
                    success: true,
                    message: result.message,
                    result: result.result
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: result.message,
                    error: result.error
                });
            }
        } catch (error) {
            console.error('新增客戶購買紀錄 API 錯誤:', error);
            res.status(500).json({
                success: false,
                message: '內部伺服器錯誤',
                error: error.message
            });
        }
    }

    /* POST 批量新增客戶購買紀錄 */
    static async addMultipleCustomerToProduct(req, res) {
        try {
            const { customerToProductList } = req.body;
            if (!customerToProductList || !Array.isArray(customerToProductList)) {
                return res.status(400).json({
                    success: false,
                    message: '缺少必要參數: customerToProductList (須為陣列)'
                });
            }

            const result = await CustomerToProductService.addMultipleCustomerToProduct(customerToProductList);
            if (result.success) {
                res.status(200).json({
                    success: true,
                    message: result.message,
                    result: result.result
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: result.message,
                    error: result.error
                });
            }
        } catch (error) {
            console.error('批量新增客戶購買紀錄 API 錯誤:', error);
            res.status(500).json({
                success: false,
                message: '內部伺服器錯誤',
                error: error.message
            });
        }
    }

    /* GET 取得特定客戶購買紀錄 */
    static async getCustomerToProduct(req, res) {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: '缺少必要參數: id'
                });
            }

            const result = await CustomerToProductService.getCustomerToProduct(id);
            if (result.success) {
                res.status(200).json({
                    success: true,
                    message: result.message,
                    result: result.result
                });
            } else {
                res.status(404).json({
                    success: false,
                    message: result.message,
                    error: result.error
                });
            }
        } catch (error) {
            console.error('取得客戶購買紀錄 API 錯誤:', error);
            res.status(500).json({
                success: false,
                message: '內部伺服器錯誤',
                error: error.message
            });
        }
    }

    /* GET 根據客戶ID取得購買紀錄 */
    static async getCustomerToProductByCustomerId(req, res) {
        try {
            const { customerId } = req.params;
            if (!customerId) {
                return res.status(400).json({
                    success: false,
                    message: '缺少必要參數: customerId'
                });
            }

            const result = await CustomerToProductService.getCustomerToProductByCustomerId(customerId);
            if (result.success) {
                res.status(200).json({
                    success: true,
                    message: result.message,
                    result: result.result
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: result.message,
                    error: result.error
                });
            }
        } catch (error) {
            console.error('根據客戶ID取得購買紀錄 API 錯誤:', error);
            res.status(500).json({
                success: false,
                message: '內部伺服器錯誤',
                error: error.message
            });
        }
    }

    /* GET 根據商品ID取得購買紀錄 */
    static async getCustomerToProductByProductId(req, res) {
        try {
            const { productId } = req.params;
            if (!productId) {
                return res.status(400).json({
                    success: false,
                    message: '缺少必要參數: productId'
                });
            }

            const result = await CustomerToProductService.getCustomerToProductByProductId(productId);
            if (result.success) {
                res.status(200).json({
                    success: true,
                    message: result.message,
                    result: result.result
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: result.message,
                    error: result.error
                });
            }
        } catch (error) {
            console.error('根據商品ID取得購買紀錄 API 錯誤:', error);
            res.status(500).json({
                success: false,
                message: '內部伺服器錯誤',
                error: error.message
            });
        }
    }

    /* PATCH 更新客戶購買紀錄 */
    static async updateCustomerToProduct(req, res) {
        try {
            const { updateCustomerToProduct } = req.body;
            if (!updateCustomerToProduct || !updateCustomerToProduct.id) {
                return res.status(400).json({
                    success: false,
                    message: '缺少必要參數: updateCustomerToProduct.id'
                });
            }

            const result = await CustomerToProductService.updateCustomerToProduct(updateCustomerToProduct);
            if (result.success) {
                res.status(200).json({
                    success: true,
                    message: result.message,
                    result: result.result
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: result.message,
                    error: result.error
                });
            }
        } catch (error) {
            console.error('更新客戶購買紀錄 API 錯誤:', error);
            res.status(500).json({
                success: false,
                message: '內部伺服器錯誤',
                error: error.message
            });
        }
    }

    /* DELETE 刪除客戶購買紀錄 */
    static async deleteCustomerToProduct(req, res) {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: '缺少必要參數: id'
                });
            }

            const result = await CustomerToProductService.deleteCustomerToProduct(id);
            if (result.success) {
                res.status(200).json({
                    success: true,
                    message: result.message,
                    result: result.result
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: result.message,
                    error: result.error
                });
            }
        } catch (error) {
            console.error('刪除客戶購買紀錄 API 錯誤:', error);
            res.status(500).json({
                success: false,
                message: '內部伺服器錯誤',
                error: error.message
            });
        }
    }

    /* POST 搜尋客戶購買紀錄 */
    static async searchCustomerToProduct(req, res) {
        try {
            const { searchParam, pagingParam } = req.body;
            if (!searchParam || !pagingParam) {
                return res.status(400).json({
                    success: false,
                    message: '缺少必要參數: searchParam, pagingParam'
                });
            }

            const result = await CustomerToProductService.searchCustomerToProduct(searchParam, pagingParam);
            if (result.success) {
                res.status(200).json({
                    success: true,
                    message: result.message,
                    result: result.result
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: result.message,
                    error: result.error
                });
            }
        } catch (error) {
            console.error('搜尋客戶購買紀錄 API 錯誤:', error);
            res.status(500).json({
                success: false,
                message: '內部伺服器錯誤',
                error: error.message
            });
        }
    }

    /* GET 取得客戶購買統計 */
    static async getCustomerPurchaseStats(req, res) {
        try {
            const { customerId } = req.params;
            if (!customerId) {
                return res.status(400).json({
                    success: false,
                    message: '缺少必要參數: customerId'
                });
            }

            const result = await CustomerToProductService.getCustomerPurchaseStats(customerId);
            if (result.success) {
                res.status(200).json({
                    success: true,
                    message: result.message,
                    result: result.result
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: result.message,
                    error: result.error
                });
            }
        } catch (error) {
            console.error('取得客戶購買統計 API 錯誤:', error);
            res.status(500).json({
                success: false,
                message: '內部伺服器錯誤',
                error: error.message
            });
        }
    }
}

module.exports = CustomerToProductController;