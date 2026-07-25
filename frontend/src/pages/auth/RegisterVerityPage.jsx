import React, {useState} from 'react';
import { verifyCode, postUser, updateUser } from '../../api/auth';

// 驗證碼頁
function RegisterVerityPage({ setStatus, setUser, getUser }) {
    const [code, setCode] = useState('');

    const submitCode = async () => {
        const newUser = getUser();
        const resVerify = await verifyCode({...newUser, code});
        if(!resVerify.data.verifyResult) {
            alert("驗證碼錯誤, 請重新輸入");
            console.log("驗證碼錯誤, 請重新輸入 status: " + resVerify.status);
            return;
        }
        alert("驗證成功");
        const resAddUser = await postUser(newUser);
        if(resAddUser.status !== 200) {
            alert("使用者建立失敗, 請稍後再試");
            return;
        }
        alert("使用者成功建立");
        const resUpdateUser = await updateUser(newUser);
        if(resUpdateUser.status !== 200) {
            alert("使用者更新失敗");
        }
        const _updateUser = resUpdateUser.data.newUser;
        setUser(_updateUser);
        setStatus(); // 成功後切換到下一狀態
    }

    return (
        <div className='Form'>
            <h1>驗證碼</h1>
            <input type="text" 
                value={code}
                onChange={(e) => setCode(e.target.value)}
            />
            <button onClick={submitCode}>送出</button>
        </div>
    );
}

export default RegisterVerityPage;
