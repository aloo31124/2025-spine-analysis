import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RegisterInfoPage from '../pages/auth/RegisterInfoPage';
import RegisterVerityPage from '../pages/auth/RegisterVerityPage';
import RegisterPasswordPage from '../pages/auth/RegisterPasswordPage';


function RegisterFlow() {
    const navigate = useNavigate();
    const statusList = {
      尚未開始: '尚未開始',
      使用者未創建_驗證碼未驗證: '使用者未創建_驗證碼未驗證',
      使用者已創建_密碼未更新: '使用者已創建_密碼未更新',
      使用者已創建_密碼已更新: '使用者已創建_密碼已更新',
    };
    const [status, setStatus] = useState(statusList.尚未開始);
    const [user, setUser] = useState({});

    switch (status) {
        case statusList.尚未開始:
          return <RegisterInfoPage 
                    setStatus={() => setStatus(statusList.使用者未創建_驗證碼未驗證)} 
                    setUser={(u) => setUser(u)}
                  />;
        case statusList.使用者未創建_驗證碼未驗證:
          return <RegisterVerityPage 
                    setStatus={() => setStatus(statusList.使用者已創建_密碼未更新)} 
                    setUser={(u) => setUser(u)}
                    getUser={() => {return {...user, status: statusList.使用者已創建_密碼未更新}}}
                  />;
        case statusList.使用者已創建_密碼未更新:
          return <RegisterPasswordPage 
                    setStatus={() => setStatus(statusList.使用者已創建_密碼已更新)} 
                    setUser={(u) => setUser(u)}
                    getUser={() => {return {...user, status: statusList.使用者已創建_密碼已更新}}}
                  />;
        case statusList.使用者已創建_密碼已更新:
          alert('帳號創建成功');
          navigate('/');
          return null;
        default:
          alert("註冊流程狀態錯誤，請稍後再試");
          navigate('/');
          return null;
    }
}
export default RegisterFlow;
