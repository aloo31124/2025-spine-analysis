/*
 * [service層] 負責客戶購買商品關聯的商業邏輯
 */

const CustomerToProduct = require('../models/customerToProduct.model');
const Customer = require('../models/customer.model');
const Product = require('../models/product.model');

class CustomerToProductService {
    
    /* 取得所有客戶購買紀錄 */
    static async getAllCustomerToProductList() {
        try {
            const customerToProductList = await CustomerToProduct.getAllCustomerToProductList();
            return {
                success: true,
                message: '取得客戶購買紀錄列表成功',
                result: customerToProductList
            };
        } catch (error) {
            console.error('取得客戶購買紀錄列表發生錯誤:', error);
            return {
                success: false,
                message: '取得客戶購買紀錄列表失敗',
                error: error.message
            };
        }
    }

    /* 新增客戶購買紀錄 */
    static async addCustomerToProduct(customerToProductData) {
        try {
            // 驗證客戶是否存在
            const customer = await Customer.getCustomer(customerToProductData.customerId);
            if (!customer) {
                return {
                    success: false,
                    message: '客戶不存在'
                };
            }

            // 驗證商品是否存在
            const product = await Product.getProduct(customerToProductData.productId);
            if (!product) {
                return {
                    success: false,
                    message: '商品不存在'
                };
            }

            // 如果沒有提供價格，使用商品原價
            if (!customerToProductData.price) {
                customerToProductData.price = product.price;
            }

            const result = await CustomerToProduct.addCustomerToProduct(customerToProductData);
            return {
                success: true,
                message: '新增客戶購買紀錄成功',
                result: result
            };
        } catch (error) {
            console.error('新增客戶購買紀錄發生錯誤:', error);
            return {
                success: false,
                message: '新增客戶購買紀錄失敗',
                error: error.message
            };
        }
    }

    /* 批量新增客戶購買紀錄 */
    static async addMultipleCustomerToProduct(customerToProductList) {
        try {
            // 驗證所有客戶和商品是否存在
            for (const item of customerToProductList) {
                const customer = await Customer.getCustomer(item.customerId);
                if (!customer) {
                    return {
                        success: false,
                        message: `客戶 ${item.customerId} 不存在`
                    };
                }

                const product = await Product.getProduct(item.productId);
                if (!product) {
                    return {
                        success: false,
                        message: `商品 ${item.productId} 不存在`
                    };
                }

                // 如果沒有提供價格，使用商品原價
                if (!item.price) {
                    item.price = product.price;
                }
            }

            const result = await CustomerToProduct.addMultipleCustomerToProduct(customerToProductList);
            return {
                success: true,
                message: '批量新增客戶購買紀錄成功',
                result: result
            };
        } catch (error) {
            console.error('批量新增客戶購買紀錄發生錯誤:', error);
            return {
                success: false,
                message: '批量新增客戶購買紀錄失敗',
                error: error.message
            };
        }
    }

    /* 取得特定客戶購買紀錄 */
    static async getCustomerToProduct(id) {
        try {
            const customerToProduct = await CustomerToProduct.getCustomerToProduct(id);
            if (!customerToProduct) {
                return {
                    success: false,
                    message: '找無此購買紀錄'
                };
            }
            return {
                success: true,
                message: '取得客戶購買紀錄成功',
                result: customerToProduct
            };
        } catch (error) {
            console.error('取得客戶購買紀錄發生錯誤:', error);
            return {
                success: false,
                message: '取得客戶購買紀錄失敗',
                error: error.message
            };
        }
    }

    /* 根據客戶ID取得購買紀錄並包含商品資訊 */
    static async getCustomerToProductByCustomerId(customerId) {
        try {
            const customerToProductList = await CustomerToProduct.getCustomerToProductByCustomerId(customerId);
            
            // 取得商品詳細資訊
            const enrichedList = await Promise.all(
                customerToProductList.map(async (item) => {
                    const product = await Product.getProduct(item.productId);
                    return {
                        ...item,
                        productInfo: product
                    };
                })
            );

            return {
                success: true,
                message: '取得客戶購買紀錄成功',
                result: enrichedList
            };
        } catch (error) {
            console.error('取得客戶購買紀錄發生錯誤:', error);
            return {
                success: false,
                message: '取得客戶購買紀錄失敗',
                error: error.message
            };
        }
    }

    /* 根據商品ID取得購買紀錄並包含客戶資訊 */
    static async getCustomerToProductByProductId(productId) {
        try {
            const customerToProductList = await CustomerToProduct.getCustomerToProductByProductId(productId);
            
            // 取得客戶詳細資訊
            const enrichedList = await Promise.all(
                customerToProductList.map(async (item) => {
                    const customer = await Customer.getCustomer(item.customerId);
                    return {
                        ...item,
                        customerInfo: customer
                    };
                })
            );

            return {
                success: true,
                message: '取得商品購買紀錄成功',
                result: enrichedList
            };
        } catch (error) {
            console.error('取得商品購買紀錄發生錯誤:', error);
            return {
                success: false,
                message: '取得商品購買紀錄失敗',
                error: error.message
            };
        }
    }

    /* 更新客戶購買紀錄 */
    static async updateCustomerToProduct(customerToProductData) {
        try {
            const existingRecord = await CustomerToProduct.getCustomerToProduct(customerToProductData.id);
            if (!existingRecord) {
                return {
                    success: false,
                    message: '找無此購買紀錄'
                };
            }

            const result = await CustomerToProduct.updateCustomerToProduct(customerToProductData);
            return {
                success: true,
                message: '更新客戶購買紀錄成功',
                result: result
            };
        } catch (error) {
            console.error('更新客戶購買紀錄發生錯誤:', error);
            return {
                success: false,
                message: '更新客戶購買紀錄失敗',
                error: error.message
            };
        }
    }

    /* 刪除客戶購買紀錄 */
    static async deleteCustomerToProduct(id) {
        try {
            const existingRecord = await CustomerToProduct.getCustomerToProduct(id);
            if (!existingRecord) {
                return {
                    success: false,
                    message: '找無此購買紀錄'
                };
            }

            const result = await CustomerToProduct.deleteCustomerToProduct(id);
            return {
                success: true,
                message: '刪除客戶購買紀錄成功',
                result: result
            };
        } catch (error) {
            console.error('刪除客戶購買紀錄發生錯誤:', error);
            return {
                success: false,
                message: '刪除客戶購買紀錄失敗',
                error: error.message
            };
        }
    }

    /* 搜尋客戶購買紀錄 */
    static async searchCustomerToProduct(searchParam, pagingParam) {
        try {
            const result = await CustomerToProduct.searchCustomerToProduct(searchParam, pagingParam);
            
            // 取得商品和客戶詳細資訊
            const enrichedList = await Promise.all(
                result.customerToProductList.map(async (item) => {
                    const [product, customer] = await Promise.all([
                        Product.getProduct(item.productId),
                        Customer.getCustomer(item.customerId)
                    ]);
                    return {
                        ...item,
                        productInfo: product,
                        customerInfo: customer
                    };
                })
            );

            return {
                success: true,
                message: '搜尋客戶購買紀錄成功',
                result: {
                    customerToProductList: enrichedList,
                    pagingParam: result.pagingParam
                }
            };
        } catch (error) {
            console.error('搜尋客戶購買紀錄發生錯誤:', error);
            return {
                success: false,
                message: '搜尋客戶購買紀錄失敗',
                error: error.message
            };
        }
    }

    /* 取得客戶購買統計 */
    static async getCustomerPurchaseStats(customerId) {
        try {
            const stats = await CustomerToProduct.getCustomerPurchaseStats(customerId);
            return {
                success: true,
                message: '取得客戶購買統計成功',
                result: stats
            };
        } catch (error) {
            console.error('取得客戶購買統計發生錯誤:', error);
            return {
                success: false,
                message: '取得客戶購買統計失敗',
                error: error.message
            };
        }
    }
}

module.exports = CustomerToProductService;