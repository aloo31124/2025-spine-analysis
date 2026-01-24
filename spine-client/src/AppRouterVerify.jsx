import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Loading from './components/Loading';
import { verifyJwt, verifyRole, verifyPayment } from './api/auth';

/* 驗證路由 */
function AppRouterVerify({ element: Component, node="" }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // 檢查 jwt 和角色
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        // 檢查是否登入 jwt token 驗證
        const user = await verifyJwtToken();
        if(!user) return;

        //if(node === "buyer") return;

        // 檢查 使用者 角色權限(賣家)
        const userToRoleList = await verifyUserRole(user);
        if(!userToRoleList) return;

        // 檢查當前頁面的角色權限
        /*
        const hasPermission = checkNodePermission(node, userToRoleList);
        if(!hasPermission) {
          // alert('您沒有權限訪問此頁面');
          navigate('/manager/customer/list');
          return;
        }
        */

        // 系統管理員, 不檢查 方案
        if(userToRoleList.some(u2r => u2r.role === 'Admin')) return;

        // 檢查 該角色(賣家)方案
        await verifyUserPayment(user);

      } catch (error) {
        console.error('驗證過程出錯:', error);
        navigate('/auth/login'); // 會覆蓋 上列非同步之函數路由
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();
  }, [navigate, node]);

  // 檢查登入
  const verifyJwtToken = async () => {
    try {
      const req = await verifyJwt(); // 若非 200, 會進入例外
      const payload = req?.data?.payload;
      
      if (!payload) {
        alert("請重新登入");
        navigate('/auth/login');
        return null;
      }
      
      return { userId: payload.userId, email: payload.email }; 
    } catch (error) {
      alert(`請重新登入`);
      console.error('JWT 驗證錯誤:', error);
      navigate('/auth/login');
      return null;
    }
  };

  // 檢查角色(賣家)是否存在
  const verifyUserRole = async (user) => {
    try {
      const req = await verifyRole(user);
      const userToRoleList = req?.data?.result;
      
      if (!userToRoleList) {
        alert("沒有(角色)權限，請購買方案。");
        navigate('/account/payment/select');
        return null;
      }

      // 將角色信息存儲到 localStorage 以供 MenuLeft 使用
      localStorage.setItem('userRoles', JSON.stringify(userToRoleList));

      /* 隱藏 新商城 原本 卡控設計
      if (userToRoleList.some(u2r => u2r.role === 'seller' || u2r.role === 'system')) {
        return userToRoleList;
      }

      alert("角色(權限)不足，請購買方案。");
      navigate('/account/payment/select');
      */
      return null;

    } catch (error) {
      alert('角色驗證錯誤:' + error);
      console.error('角色驗證錯誤:', error);
      navigate('/');
      return null;
    }
  };

  const verifyUserPayment = async (user) => {
    try {
      const req = await verifyPayment(user);
      const userToPayment = req?.data?.result;

      if(!userToPayment) {
        alert("該賣家尚未購買方案，請購買方案。");
        navigate('/account/payment/select');
        return null;
      }

      if((new Date()) > (new Date(userToPayment.expiryDate))) {
        alert("該方案已過期，請重新購買。");
        navigate('/account/payment/select');
        return null;
      }

    } catch (error) {
      alert('賣家方案驗證錯誤:' + error);
      console.error('賣家方案驗證錯誤:', error);
      navigate('/');
      return null;
    }
  }

  // 白名單機制：檢查當前頁面的角色權限
  /**
   * 判斷失敗，後續改在後端判斷。
   */
  const checkNodePermission = (node, userToRoleList) => {
    // 如果沒有指定 node，允許訪問（用於一般頁面）
    if (!node) return true;

    // 管理員 Admin 可以訪問所有頁面
    if (userToRoleList.some(u2r => u2r.role === 'Admin')) return true;

    // 店長 StoreManager 的白名單頁面（node 值）
    const storeManagerWhitelist = [
      'photo-capture',    // 拍照上傳
      'analysis-spine',   // 頸部分析
      'analysis-tail',    // 尾椎分析
      'customer',         // 客戶管理
      'product-pillow',   // 枕頭商品
      'revenue'           // 營收管理
    ];

    // 如果是店長，檢查是否在白名單內
    const isStoreManager = userToRoleList.some(u2r => u2r.role === 'StoreManager');
    if (isStoreManager) {
      return storeManagerWhitelist.includes(node);
    }

    // 沒有任何有效角色，不允許訪問
    return false;
  };

  if (loading) {
    return <Loading />;
  }
  
  return <Component />;
}
export default AppRouterVerify;

