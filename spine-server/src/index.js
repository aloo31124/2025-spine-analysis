/*
 *  伺服器入口, 處理路由, swagger
 */

// 引入套件
const express = require('express');
const cors = require('cors');
const path = require('path');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const functions = require('firebase-functions');

// 引入自訂的 logger
require('./utils/logger');  // 當應用啟動時，logger 就會生效

// api, 控制器 引入
const backupApiController = require('./controllers/manager/backup.api.controller');
const authApiController = require('./controllers/auth.api.controller');
const accountApiController = require('./controllers/account.api.controller');
const productApiController = require('./controllers/manager/product.api.controller');
const productCategoryApiController = require('./controllers/manager/productCategory.api.controller');
const customerApiController = require('./controllers/manager/customer.api.controller');
const customerAnalysisResultApiController = require('./controllers/manager/customerAnalysisResult.api.controller');
const customerToProductApiController = require('./controllers/manager/customerToProduct.api.controller');
const customerToProductPillowApiController = require('./controllers/manager/customerToProductPillow.api.controller');
const customerToProductMattressApiController = require('./controllers/manager/customerToProductMattress.api.controller');
const productPillowApiController = require('./controllers/manager/productPillow.api.controller');
const productMattressApiController = require('./controllers/manager/productMattress.api.controller');
const productInventoryApiController = require('./controllers/manager/productInventory.api.controller');
const reportSpineApiController = require('./controllers/manager/reportSpine.api.controller');
const storeApiController = require('./controllers/manager/store.api.controller');
const storeManagerToOperatorApiController = require('./controllers/manager/storeManagerToOperator.api.controller');
const authPermissionApiController = require('./controllers/manager/authPermission.api.controller');
const generalManagerApiController = require('./controllers/manager/generalManager.api.controller');
//const productImgApiController = require('./controllers/manager/productImg.api.controller')
const shopApiController = require('./controllers/shop/shop.api.controller');
const shopPayLogisticsApiController = require('./controllers/shop/shopPayLogistics.api.controller')
const ecpayApiController = require('./controllers/pay/ecpay.api.controller');
const paymentApiController = require('./controllers/pay/payment.api.controller');
//const upload = require('./utils/upload');
const upload = require('./utils/uploadFireStorage');
const productImgApiController = require('./controllers/manager/productImgFireStorage.api.controller');


// 設定 express app 相關設定
const app = express();
const PORT = 8083;
app.use(cors());

// 設定 Express 支援 JSON 和 URL Encoded 資料
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // 文件上傳



// Swagger 設定
const swaggerOptions = {
    swaggerDefinition: {
        info: {
            title: 'NewShop API',
            description: 'NewShop API Information',
            contact: {
                name: 'Amazing Developer'
            },
            servers: ['http://localhost:8083']
        }
    },
    apis: ['./controllers/*.js']
}
const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));


/* 路由設定 */
// [系統管理] 備份功能, 匯出備份資料
app.get('/api/manager/backup/export/user', backupApiController.getUserExportList);
app.get('/api/manager/backup/export/product', backupApiController.getProductExportList);
app.get('/api/manager/backup/export/product/category', backupApiController.getProductCategoryExportList);
app.get('/api/manager/backup/export/customer', backupApiController.getCustomerExportList);
app.post('/api/manager/backup/import/all/db', backupApiController.postAllDBTable);
// [註冊登入] 驗證 api
app.get('/api/auth/user/exits/:email', authApiController.findUserByEmail);
app.post('/api/auth/login', authApiController.login);
app.post('/api/auth/logout', authApiController.logout);
app.post('/api/auth/verify/jwt', authApiController.verifyJwt);
app.post('/api/auth/verify/role', authApiController.verifyRole);
app.post('/api/auth/verify/payment/lastest', authApiController.verifyPayment);
app.post('/api/auth/regist/mail', authApiController.registMail);
app.post('/api/auth/regist/user/add', authApiController.registAddUser);
app.post('/api/auth/regist/user/info', authApiController.registUserUpdateInfot);
app.post('/api/auth/regist/user/password', authApiController.registUserUpdatePassword);
app.post('/api/auth/regist/verify/code', authApiController.registVerityCode);
// [註冊] 後 帳號 升級, 付款
app.get('/api/account/owner/:email', accountApiController.getOwnerByEmail);
app.post('/api/account/owner/add', accountApiController.postUserToOwner);
app.post('/api/account/role/add', accountApiController.postUserToRole);
app.get('/api/account/role/:userId', accountApiController.getUserRoleByUserId);
app.delete('/api/account/role/delete/:id', accountApiController.deleteUserToRole);
app.post('/api/account/role/store-manager/add', accountApiController.addStoreManagerByEmail);
app.get('/api/account/role/store-manager/list', accountApiController.getStoreManagerList);
// [操作員管理] 店長綁定操作員 api
app.get('/api/account/store-manager-to-operator/list', storeManagerToOperatorApiController.getOperatorList);
app.post('/api/account/store-manager-to-operator/add', storeManagerToOperatorApiController.addOperator);
app.delete('/api/account/store-manager-to-operator/delete/:id', storeManagerToOperatorApiController.deleteOperator);
app.post('/api/account/store-manager-to-operator/search', storeManagerToOperatorApiController.searchBinding);
// [權限管理] 檢查角色權限、取得店長列表 api
app.get('/api/manager/auth-permission/check-role', authPermissionApiController.checkUserRole);
app.get('/api/manager/auth-permission/store-manager-list', authPermissionApiController.getStoreManagerList);
// [總經理管理] 總經理增刪查 api
app.get('/api/manager/general-manager/list', generalManagerApiController.getGeneralManagerList);
app.post('/api/manager/general-manager/add', generalManagerApiController.addGeneralManagerByEmail);
app.delete('/api/manager/general-manager/delete/:roleId', generalManagerApiController.deleteGeneralManager);
app.get('/api/account/payment/userId/:userId', accountApiController.getUserPaymentByUserId);
app.get('/api/account/payment/paymentId/:paymentId', accountApiController.getPaymentByPaymentid);
app.post('/api/account/payment/search', accountApiController.searchPayment);
app.get('/api/account/payment/select/:paymentId', accountApiController.getPaySelectPageHtml);
app.post('/api/account/payment/free', accountApiController.postFreePayment);
// 後台管理 商品 api
app.post('/api/manager/product/list', productApiController.getProductList);
app.get('/api/manager/product/:id', productApiController.getProduct);
app.post('/api/manager/product/add', productApiController.postProduct);
app.patch('/api/manager/product/edit', productApiController.updateProduct);
app.delete('/api/manager/product/delete/:id', productApiController.deleteProduct);
app.post('/api/manager/product/search', productApiController.searchProduct);
app.post('/api/manager/product/import', productApiController.importProduct);
// 後台商品圖片
app.post('/api/manager/product/img/upload/:id', upload.uploadMiddleware, productImgApiController.uploadFile);
app.get('/api/manager/product/img/list/:id', productImgApiController.getProductImgList);
app.delete('/api/manager/product/img/delete/all', productImgApiController.deleteProductImgAll);
app.delete('/api/manager/product/img/delete/:productId/:storedName', productImgApiController.deleteProductImg);
// 提供靜態圖片服務 (讓前端可以透過 URL 訪問圖片)
//app.use('/api/manager/product/img/', express.static(upload.getProductImgBasePath()));
// 後台管理 枕頭商品 api
app.post('/api/manager/product-pillow/list', productPillowApiController.getProductPillowList);
app.get('/api/manager/product-pillow/:id', productPillowApiController.getProductPillow);
app.post('/api/manager/product-pillow/add', productPillowApiController.postProductPillow);
app.patch('/api/manager/product-pillow/edit', productPillowApiController.updateProductPillow);
app.delete('/api/manager/product-pillow/delete/:id', productPillowApiController.deleteProductPillow);
app.post('/api/manager/product-pillow/search', productPillowApiController.searchProductPillow);
app.post('/api/manager/product-pillow/import', productPillowApiController.importProductPillow);
// 後台管理 床墊商品 api
app.post('/api/manager/product-mattress/list', productMattressApiController.getProductMattressList);
app.get('/api/manager/product-mattress/:id', productMattressApiController.getProductMattress);
app.post('/api/manager/product-mattress/add', productMattressApiController.postProductMattress);
app.patch('/api/manager/product-mattress/edit', productMattressApiController.updateProductMattress);
app.delete('/api/manager/product-mattress/delete/:id', productMattressApiController.deleteProductMattress);
app.post('/api/manager/product-mattress/search', productMattressApiController.searchProductMattress);
app.post('/api/manager/product-mattress/import', productMattressApiController.importProductMattress);
// 後台管理 商品庫存 api
app.get('/api/manager/product-inventory/pillow', productInventoryApiController.getPillowInventoryList);
app.get('/api/manager/product-inventory/mattress', productInventoryApiController.getMattressInventoryList);
app.patch('/api/manager/product-inventory/pillow/stock', productInventoryApiController.updatePillowStock);
app.patch('/api/manager/product-inventory/mattress/stock', productInventoryApiController.updateMattressStock);
// 後台管理 商品分類 api
app.get('/api/manager/product/category/list', productCategoryApiController.getProductCategoryList);
app.get('/api/manager/product/category/:id', productCategoryApiController.getProductCategory);
app.post('/api/manager/product/category/add', productCategoryApiController.addProductCategory);
app.patch('/api/manager/product/category/edit', productCategoryApiController.updateProductCategory);
app.delete('/api/manager/product/category/delete/:id', productCategoryApiController.deleteProductCategory);
app.post('/api/manager/product/category/search', productCategoryApiController.searchProductCategory);
// 後台管理 客戶 api
app.post('/api/manager/customer/list', customerApiController.getCustomerList);
app.get('/api/manager/customer/:id', customerApiController.getCustomer);
app.post('/api/manager/customer/add', customerApiController.postCustomer);
app.patch('/api/manager/customer/edit', customerApiController.updateCustomer);
app.delete('/api/manager/customer/delete/:id', customerApiController.deleteCustomer);
app.post('/api/manager/customer/search', customerApiController.searchCustomer);
app.post('/api/manager/customer/import', customerApiController.importCustomer);
// 後台管理 客戶分析結果 api
app.get('/api/manager/customer-analysis-result', customerAnalysisResultApiController.getCustomerAnalysisResultList);
app.get('/api/manager/customer-analysis-result/customer/:customerId', customerAnalysisResultApiController.getCustomerAnalysisResultsByCustomerId);
app.post('/api/manager/customer-analysis-result', customerAnalysisResultApiController.postCustomerAnalysisResult);
app.get('/api/manager/customer-analysis-result/:id', customerAnalysisResultApiController.getCustomerAnalysisResult);
app.put('/api/manager/customer-analysis-result/:id', customerAnalysisResultApiController.updateCustomerAnalysisResult);
app.delete('/api/manager/customer-analysis-result/:id', customerAnalysisResultApiController.deleteCustomerAnalysisResult);
app.post('/api/manager/customer-analysis-result/import', customerAnalysisResultApiController.importCustomerAnalysisResult);
// 後台管理 客戶購買商品關聯 api
app.get('/api/manager/customer-to-product/list', customerToProductApiController.getAllCustomerToProductList);
app.post('/api/manager/customer-to-product/add', customerToProductApiController.addCustomerToProduct);
app.post('/api/manager/customer-to-product/add-multiple', customerToProductApiController.addMultipleCustomerToProduct);
app.get('/api/manager/customer-to-product/:id', customerToProductApiController.getCustomerToProduct);
app.get('/api/manager/customer-to-product/customer/:customerId', customerToProductApiController.getCustomerToProductByCustomerId);
app.get('/api/manager/customer-to-product/product/:productId', customerToProductApiController.getCustomerToProductByProductId);
app.patch('/api/manager/customer-to-product/edit', customerToProductApiController.updateCustomerToProduct);
app.delete('/api/manager/customer-to-product/delete/:id', customerToProductApiController.deleteCustomerToProduct);
app.post('/api/manager/customer-to-product/search', customerToProductApiController.searchCustomerToProduct);
app.get('/api/manager/customer-to-product/stats/:customerId', customerToProductApiController.getCustomerPurchaseStats);
// 後台管理 客戶購買枕頭商品關聯 api
app.get('/api/manager/customer-to-product-pillow/list', customerToProductPillowApiController.getAllCustomerToProductPillowList);
app.post('/api/manager/customer-to-product-pillow/add', customerToProductPillowApiController.addCustomerToProductPillow);
app.post('/api/manager/customer-to-product-pillow/add-multiple', customerToProductPillowApiController.addMultipleCustomerToProductPillow);
app.get('/api/manager/customer-to-product-pillow/:id', customerToProductPillowApiController.getCustomerToProductPillow);
app.get('/api/manager/customer-to-product-pillow/customer/:customerId', customerToProductPillowApiController.getCustomerToProductPillowByCustomerId);
app.get('/api/manager/customer-to-product-pillow/product-pillow/:productPillowId', customerToProductPillowApiController.getCustomerToProductPillowByProductPillowId);
app.patch('/api/manager/customer-to-product-pillow/edit', customerToProductPillowApiController.updateCustomerToProductPillow);
app.delete('/api/manager/customer-to-product-pillow/delete/:id', customerToProductPillowApiController.deleteCustomerToProductPillow);
app.post('/api/manager/customer-to-product-pillow/search', customerToProductPillowApiController.searchCustomerToProductPillow);
app.get('/api/manager/customer-to-product-pillow/stats/:customerId', customerToProductPillowApiController.getCustomerPurchaseStats);
// 後台管理 客戶購買床墊商品關聯 api
app.get('/api/manager/customer-to-product-mattress/list', customerToProductMattressApiController.getAllCustomerToProductMattressList);
app.post('/api/manager/customer-to-product-mattress/add', customerToProductMattressApiController.addCustomerToProductMattress);
app.post('/api/manager/customer-to-product-mattress/add-multiple', customerToProductMattressApiController.addMultipleCustomerToProductMattress);
app.get('/api/manager/customer-to-product-mattress/:id', customerToProductMattressApiController.getCustomerToProductMattress);
app.get('/api/manager/customer-to-product-mattress/customer/:customerId', customerToProductMattressApiController.getCustomerToProductMattressByCustomerId);
app.get('/api/manager/customer-to-product-mattress/product-mattress/:productMattressId', customerToProductMattressApiController.getCustomerToProductMattressByProductMattressId);
app.patch('/api/manager/customer-to-product-mattress/edit', customerToProductMattressApiController.updateCustomerToProductMattress);
app.delete('/api/manager/customer-to-product-mattress/delete/:id', customerToProductMattressApiController.deleteCustomerToProductMattress);
app.post('/api/manager/customer-to-product-mattress/search', customerToProductMattressApiController.searchCustomerToProductMattress);
app.get('/api/manager/customer-to-product-mattress/stats/:customerId', customerToProductMattressApiController.getCustomerPurchaseStats);
// 後台管理 報表 api
app.post('/api/manager/report-spine/revenue-line-chart', reportSpineApiController.getRevenueLineChartData);
app.post('/api/manager/report-spine/sales-line-chart', reportSpineApiController.getSalesLineChartData);
app.get('/api/manager/report-spine/product-options', reportSpineApiController.getProductPillowOptions);
// 後台管理 店面 api
app.post('/api/manager/store/list', storeApiController.getStoreList);
app.get('/api/manager/store/:id', storeApiController.getStore);
app.post('/api/manager/store/add', storeApiController.postStore);
app.patch('/api/manager/store/edit', storeApiController.updateStore);
app.delete('/api/manager/store/delete/:id', storeApiController.deleteStore);
app.post('/api/manager/store/search', storeApiController.searchStore);
app.get('/api/manager/store/store-manager/:storeManagerId', storeApiController.getStoresByStoreManagerId);
app.post('/api/manager/store/import', storeApiController.importStore);
// 購物 api
app.post('/api/shop/product/list', shopApiController.searchProductList);
app.get('/api/shop/product/category/list', shopApiController.searchProductCategory);
app.get('/api/shop/product/promotion/list', shopApiController.searchPromotion);
app.get('/api/shop/test', shopPayLogisticsApiController.test);

// 金流物流 api
app.post('/api/pay/ecpay/pay/result/server', ecpayApiController.postResultServer);
app.get('/api/pay/ecpay/pay/result/client', ecpayApiController.getResultClientPageHtml);

// 後台管理 方案 api
app.post('/api/manager/payment/list', paymentApiController.getPaymentList);
app.get('/api/manager/payment/:id', paymentApiController.getPayment);
app.post('/api/manager/payment/add', paymentApiController.addPayment);
app.patch('/api/manager/payment/edit', paymentApiController.updatePayment);
app.delete('/api/manager/payment/delete/:id', paymentApiController.deletePayment);
app.post('/api/manager/payment/search', paymentApiController.searchPayment);
app.get('/api/manager/payment/export', paymentApiController.exportPayment);
app.post('/api/manager/payment/import', paymentApiController.importPayment);

// ========================================
// Docker 部署: 提供前端靜態檔案服務
// ========================================
const publicPath = path.join(__dirname, '..', 'public');
app.use(express.static(publicPath));

// 處理找無 API 路由 (僅針對 /api 路徑)
app.use('/api', (req, res) => {
    res.status(404).json({ error: '404 Not Found', message: '找無此 API 路由' });
});

// SPA Fallback: 所有非 API 請求導向 React 前端
app.get('*', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
});

// 啟動伺服器
app.listen(PORT, '0.0.0.0', () => {
    console.log(`[頸椎分析系統]伺服器啟動 http://0.0.0.0:${PORT}`);
    console.log(`環境: ${process.env.NODE_ENV || 'development'}`);
})

exports.api = functions.https.onRequest(app);
