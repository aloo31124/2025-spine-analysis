/**
 * App.js - 專案入口,主應用程式路由配置
 * 
 * 功能說明：
 * - 配置整個應用的路由系統
 * - 整合身份驗證與權限控制
 * - 管理不同模組的頁面導航
 * 
 * 主要模組：
 * - 系統管理 (System Management)
 * - 帳戶管理 (Account Management) 
 * - 商品管理 (Product Management)
 * - 分類管理 (Category Management)
 * - 身份驗證 (Authentication)
 */
// === 樣式與核心函式庫 ===
import './App.css';
import { useEffect, useState } from 'react';
import {BrowserRouter, Routes, Route, useNavigate, Navigate} from 'react-router-dom';

// === 身份驗證 API ===
import { verifyJwt, verifyRole, verifyPayment } from './api/auth';
import AppRouterVerify from './AppRouterVerify';

// === 布局組件 ===
import AccountLayout from './layout.spine/AccountLayout';          // 帳戶布局
import ManagerLayout from './layout.spine/ManagerLayout';          // 管理者布局
import ShoppingLayout from './layout/ShoppingLayout';        // 購物布局 (已註解)

// === 共用組件 ===
import Loading from './components/Loading';                   // 載入動畫
import Header from './components.spine/Header/Header';              // 頁面標頭

// === 系統管理頁面 ===
import SystemPage from './pages/manager/SystemPage';         // 系統備份頁面

// === 商城相關頁面 (已註解) ===
import HomePage from './pages/HomePage';                      // 商城首頁
import ShopSearchListPage from './pages/shopping/ShopSearchListPage';  // 商品搜尋列表
import ShopContentPage from './pages/shopping/ShopContentPage';        // 商品內容頁

// === 身份驗證流程 ===
import RegisterFlow from './flows/RegisterFlow';             // 註冊流程
import LoginPage from './pages/auth/LoginPage';              // 登入頁面
import RegisterInfoPage from './pages/auth/RegisterInfoPage'; // 註冊資訊
import RegisterVerityPage from './pages/auth/RegisterVerityPage'; // 註冊驗證
import RegisterPasswordPage from './pages/auth/RegisterPasswordPage'; // 設定密碼
import FogetPasswordPage from './pages/auth/FogetPasswordPage'; // 忘記密碼

// === 付款相關 ===
import PaymentSelectPage from './pages/Payment/PaymentSelectPage'; // 付款方式選擇

// === 帳戶管理頁面 ===
import InfoPage from './pages.spine/account/InfoPage';             // 個人資訊
import SelectPaymentPage from './pages.spine/account/SelectPaymentPage'; // 選擇付費方案
import ShoppingOrder from './pages.spine/account/ShoppingOrder';   // 購物訂單

// === 商品管理頁面 ===
import ProductListPage from './pages.spine/manager/ProductListPage';     // 商品列表
import ProductListPageSpine from './pages.spine/manager/ProductListPageSpine'; // 商品列表脊椎版本
import ProductAddPage from './pages.spine/manager/ProductAddPage';       // 新增商品
import ProductEditPage from './pages.spine/manager/ProductEditPage';     // 編輯商品

// === 枕頭商品管理頁面 ===
import ProductPillowListPage from './pages.spine/manager/ProductPillowListPage';   // 枕頭商品列表
import ProductPillowAddPage from './pages.spine/manager/ProductPillowAddPage';     // 新增枕頭商品
import ProductPillowEditPage from './pages.spine/manager/ProductPillowEditPage';   // 編輯枕頭商品

// === 床墊商品管理頁面 ===
import ProductMattressListPage from './pages.spine/manager/ProductMattressListPage';   // 床墊商品列表
import ProductMattressAddPage from './pages.spine/manager/ProductMattressAddPage';     // 新增床墊商品
import ProductMattressEditPage from './pages.spine/manager/ProductMattressEditPage';   // 編輯床墊商品

// === 脊椎分析頁面 ===
import AnalysisSpine from './pages.spine/manager/AnalysisSpine';   // 脊椎分析
import AnalysisTail from './pages.spine/manager/AnalysisTail';     // 尾椎分析
import AnalysisSpineTest from './pages.spine/manager/AnalysisSpineTest';   // 脊椎分析測試版
import PhotoCapture from './pages.spine/manager/PhotoCapture';     // 拍照上傳
import PhotoCaptureDrag from './pages.spine/manager/PhotoCaptureDrag';  // 攝影點位拖曳

// === 分類管理頁面 ===
import CategoryListPage from './pages.spine/manager/CategoryListPage';   // 分類列表
import CategoryAddPage from './pages.spine/manager/CategoryAddPage';     // 新增分類
import CategoryEditPage from './pages.spine/manager/CategoryEditPage';   // 編輯分類

// 方案管理頁
import PaymentListPage from './pages/manager/PaymentListPage';
import PaymentFormPage from './pages/manager/PaymentFormPage';

// 客戶管理頁
import CustomerListPage from './pages.spine/manager/CustomerListPage';
import CustomerAddPage from './pages.spine/manager/CustomerAddPage';
import CustomerEditPage from './pages.spine/manager/CustomerEditPage';
import ReportSpineRevenueLineChart from './pages.spine/manager/ReportSpineRevenueLineChart';
import ReportSpineSalesLineChart from './pages.spine/manager/ReportSpineSalesLineChart';

// 分權設定頁
import RoleManagementPage from './pages.spine/manager/RoleManagementPage';

/**
 * 路由配置器 - 管理整個應用的頁面導航
 * 
 * 路由結構：
 * - / → 重導向至管理者商品列表
 * - /test/backup → 系統備份頁面
 * - /auth/* → 身份驗證相關頁面
 * - /account/* → 帳戶管理頁面 (需買家權限)
 * - /manager/* → 商品/分類管理頁面 (需賣家權限)
 */
const AppRouter = () => (
  <Routes>
    {/* === 系統測試路由 === */}
    <Route path="/test/backup" element={<SystemPage />} />
    
    {/* === 首頁重導向 === */}
    {/* 原本導向商城首頁，現改為導向管理者商品列表 */}
    <Route path="/" element={<Navigate to="/manager/analysis/spine" />} />

    {/* === 身份驗證路由群組 (無需登入) === */}
    <Route path="/auth/*">
      <Route path="regist/flow" element={<RegisterFlow />} />        {/* 註冊流程 */}
      <Route path="login" element={<LoginPage />} />                 {/* 登入頁面 */}
      <Route path="password/forget" element={<FogetPasswordPage />} /> {/* 忘記密碼 */}
      <Route path="pay/select" element={<PaymentSelectPage />} />    {/* 付款選擇 */}
    </Route>

    {/* === 帳戶管理路由群組 (買家權限) === */}
    <Route path="/account/*" element={<AppRouterVerify element={AccountLayout} node={"buyer"} />}>
      <Route path="payment/select" element={<SelectPaymentPage />} />  {/* 選擇付費方案 */}
      <Route path="info" element={<InfoPage />} />                     {/* 個人資訊 */}
      <Route path="shopping/order" element={<ShoppingOrder />} />      {/* 購物訂單 */}
    </Route>

    {/* === 商城頁面路由群組 (已停用) === */}
    {/*
    <Route path="/shopping/*" element={<ShoppingLayout />}>
      <Route path="home" element={<HomePage />} />                     // 商城首頁
      <Route path="product/search/list" element={<ShopSearchListPage />} /> // 商品搜尋
      <Route path="product/content" element={<ShopContentPage />} />   // 商品詳情
    </Route>
    */}

    {/* === 管理者路由群組 (賣家權限) === */}
    <Route path="/manager/*" element={<AppRouterVerify element={ManagerLayout} node={"seller"} />}>
      {/* 脊椎分析 */}
      <Route path="analysis/spine" element={<AppRouterVerify element={AnalysisSpine} node="analysis-spine" />} />
      <Route path="analysis/tail" element={<AppRouterVerify element={AnalysisTail} node="analysis-tail" />} />
      <Route path="photo/capture" element={<AppRouterVerify element={PhotoCapture} node="photo-capture" />} />
      <Route path="photo/capture-drag" element={<AppRouterVerify element={PhotoCaptureDrag} node="photo-capture" />} />
      
      {/* 商品管理 */}
      <Route path="product/list" element={<ProductListPage />} />      {/* 商品列表 */}
      <Route path="product/add" element={<ProductAddPage />} />        {/* 新增商品 */}
      <Route path="product/edit/:id" element={<ProductEditPage />} />  {/* 編輯商品 */}
      <Route path="product-spine" element={<ProductListPageSpine />} />     {/* 商品列表脊椎版本 */}
      
      {/* 枕頭商品管理 */}
      <Route path="product-pillow/list" element={<AppRouterVerify element={ProductPillowListPage} node="product-pillow" />} />
      <Route path="product-pillow/add" element={<AppRouterVerify element={ProductPillowAddPage} node="product-pillow" />} />
      <Route path="product-pillow/edit/:id" element={<AppRouterVerify element={ProductPillowEditPage} node="product-pillow" />} />
      
      {/* 床墊商品管理 */}
      <Route path="product-mattress/list" element={<AppRouterVerify element={ProductMattressListPage} node="product-mattress" />} />
      <Route path="product-mattress/add" element={<AppRouterVerify element={ProductMattressAddPage} node="product-mattress" />} />
      <Route path="product-mattress/edit/:id" element={<AppRouterVerify element={ProductMattressEditPage} node="product-mattress" />} />
      
      {/* 分類管理 */}
      <Route path="product/category/list" element={<CategoryListPage />} />    {/* 分類列表 */}
      <Route path="product/category/add" element={<CategoryAddPage />} />      {/* 新增分類 */}
      <Route path="product/category/edit/:id" element={<CategoryEditPage />} /> {/* 編輯分類 */}

      {/* 客戶管理 */}
      <Route path="customer/list" element={<AppRouterVerify element={CustomerListPage} node="customer" />} />
      <Route path="customer/add" element={<AppRouterVerify element={CustomerAddPage} node="customer" />} />
      <Route path="customer/edit/:id" element={<AppRouterVerify element={CustomerEditPage} node="customer" />} />

      {/* 方案管理 */}
      <Route path="payment/list" element={<AppRouterVerify element={PaymentListPage} node="payment" />} />
      <Route path="payment/add" element={<AppRouterVerify element={PaymentFormPage} node="payment" />} />
      <Route path="payment/edit/:id" element={<AppRouterVerify element={PaymentFormPage} node="payment" />} />

      {/* 營收報表 */}
      <Route path="report/revenue-line-chart" element={<AppRouterVerify element={ReportSpineRevenueLineChart} node="revenue" />} />
      <Route path="report/sales-line-chart" element={<AppRouterVerify element={ReportSpineSalesLineChart} node="revenue" />} />
      
      {/* 分權設定 */}
      <Route path="role-management" element={<AppRouterVerify element={RoleManagementPage} node="role-management" />} />
      
      {/* 系統管理 */}
      <Route path="system" element={<AppRouterVerify element={SystemPage} node="system" />} />
    </Route>
  </Routes>
);
/**
 * App 主組件 - 應用程式進入點
 * 
 * 結構說明：
 * - BrowserRouter: 提供路由功能的容器
 * - Header: 全域頁面標頭組件
 * - AppRouter: 路由配置與頁面切換邏輯
 * 
 * @returns {JSX.Element} 應用程式主要結構
 */
function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Header />        {/* 全域標頭 */}
        <AppRouter />     {/* 路由系統 */}
      </div>
    </BrowserRouter>
  );
}

export default App;
