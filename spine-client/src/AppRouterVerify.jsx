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

        if(node === "buyer") return;

        // 檢查 使用者 角色權限(賣家)
        const userToRoleList = await verifyUserRole(user);
        if(!userToRoleList) return;

        // 系統管理員, 不檢查 方案
        if(userToRoleList.some(u2r => u2r.role === 'system')) return;

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
  }, [navigate]);

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

      if (userToRoleList.some(u2r => u2r.role === 'seller' || u2r.role === 'system')) {
        return userToRoleList;
      }

      alert("角色(權限)不足，請購買方案。");
      navigate('/account/payment/select');
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

  if (loading) {
    return <Loading />;
  }
  
  return <Component />;
}
export default AppRouterVerify;

