import React, {useState} from 'react';
import { updatePassword } from '../../api/auth';

// 註冊更新密碼頁
function RegisterPasswordPage({ setStatus, setUser, getUser }) {
    const [password, setPassword] = useState('');
    const [password2, setPassword2] = useState('');

    const submitPassword = async () => {
        const newUser = getUser();
        if(!password || !password2) {
            alert("密碼與密碼驗證不可空白");
            return;
        }
        if(password !== password2) {
            alert("請確認密碼與驗證密碼需一致");
            return;
        }
        const res = await updatePassword({...newUser, password});
        if(res.status === 200) {
            alert("密碼更新成功");
        } else {
            alert("密碼更新失敗, 請稍後再試");
        }
        setUser(newUser);
        setStatus();
    }

    return (
        <div className='Form'>
            <h1>更新密碼</h1>
            <input type="text" 
                placeholder='請輸入密碼'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <input type="text" 
                placeholder='請再次驗證密碼'
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
            />
            <button onClick={submitPassword}>送出</button>
        </div>
    );
}

export default RegisterPasswordPage;
