import './App.css';
import { useEffect, useState } from 'react';
import {BrowserRouter, Routes, Route, useNavigate, Navigate} from 'react-router-dom';
import { verifyJwt, verifyRole, verifyPayment } from './api/auth';

/* 驗證路由 */
import AppRouterVerify from './AppRouterVerify';
/* 引入布局 */
import AccountLayout from './layout/AccountLayout';
import ManagerLayout from './layout/ManagerLayout';
import ShoppingLayout from './layout/ShoppingLayout';
/* 引入頁面 Page */
// 系統管理
import SystemPage from './pages/manager/SystemPage';
// 商品購買, 首頁
import HomePage from './pages/HomePage';
import Loading from './components/Loading';
import Header from './components/Header/Header';
import ShopSearchListPage from './pages/shopping/ShopSearchListPage';
import ShopContentPage from './pages/shopping/ShopContentPage';
// 註冊
import RegisterFlow from './flows/RegisterFlow';
import LoginPage from './pages/auth/LoginPage';
import RegisterInfoPage from './pages/auth/RegisterInfoPage';
import RegisterVerityPage from './pages/auth/RegisterVerityPage';
import RegisterPasswordPage from './pages/auth/RegisterPasswordPage';
import FogetPasswordPage from './pages/auth/FogetPasswordPage';
// 帳號 資訊, 購買(賣家)方案, 升級
import InfoPage from './pages/account/InfoPage';
import SelectPaymentPage from './pages/account/SelectPaymentPage';
import ShoppingOrder from './pages/account/ShoppingOrder';
// 商品管理頁
import ProductListPage from './pages/manager/ProductListPage';
import ProductAddPage from './pages/manager/ProductAddPage';
import ProductEditPage from './pages/manager/ProductEditPage';
import CategoryListPage from './pages/manager/CategoryListPage';
import CategoryAddPage from './pages/manager/CategoryAddPage';
import CategoryEditPage from './pages/manager/CategoryEditPage';
// 客戶管理頁
import CustomerListPage from './pages/manager/CustomerListPage';
import CustomerAddPage from './pages/manager/CustomerAddPage';
import CustomerEditPage from './pages/manager/CustomerEditPage';
// 方案管理頁
import PaymentListPage from './pages/manager/PaymentListPage';
import PaymentFormPage from './pages/manager/PaymentFormPage';


// 路由切換器
const AppRouter = () => (
  <Routes>
    <Route path="/test/backup" element={<SystemPage />} />
    <Route path="/" element={<Navigate to="/shopping/home" />} />
    <Route path="/auth/*" >
      <Route path="regist/flow" element={<RegisterFlow />} />
      <Route path="login" element={<LoginPage />} />
      <Route path="password/forget" element={<FogetPasswordPage />} />
    </Route>
    <Route path="/account/*" element={<AppRouterVerify element={AccountLayout} node={"buyer"} />}>
      <Route path="payment/select" element={<SelectPaymentPage/>}/>
      <Route path='info' element={<InfoPage/>}></Route>
      <Route path='shopping/order' element={<ShoppingOrder/>}></Route>
    </Route>
    <Route path='/shopping/*' element={<ShoppingLayout />} >
      <Route path='home' element={<HomePage />} />
      <Route path='product/search/list' element={<ShopSearchListPage />} />
      <Route path='product/content' element={<ShopContentPage />} />
    </Route>
    <Route path="/manager/*" element={<AppRouterVerify element={ManagerLayout} node={"seller"} />}>
      <Route path="product/list" element={<ProductListPage />} />
      <Route path="product/add" element={<ProductAddPage />} />
      <Route path="product/edit/:id" element={<ProductEditPage />} />
      <Route path="product/category/list" element={<CategoryListPage />} />
      <Route path="product/category/add" element={<CategoryAddPage />} />
      <Route path="product/category/edit/:id" element={<CategoryEditPage/>} />
      <Route path="customer/list" element={<CustomerListPage />} />
      <Route path="customer/add" element={<CustomerAddPage />} />
      <Route path="customer/edit/:id" element={<CustomerEditPage />} />
      <Route path="payment/list" element={<PaymentListPage />} />
      <Route path="payment/add" element={<PaymentFormPage />} />
      <Route path="payment/edit/:id" element={<PaymentFormPage />} />
      <Route path="system" element={<SystemPage />} />
    </Route>
  </Routes>
);
function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Header />
        <AppRouter />
      </div>
    </BrowserRouter>
  );
}

export default App;
