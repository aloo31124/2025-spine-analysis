import React, {useRef, useEffect, useState} from 'react';
import { login } from '../../api/auth';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // 引入眼睛圖標

function LoginPage() {
    const navigate = useNavigate();
    const inputEMailRef = useRef('');
    const inputPasswordRef = useRef('');
    const [showPassword, setShowPassword] = useState(false); // 控制密碼顯示狀態

    useEffect(() => {
        getTempEMail();
    }, []);

    /** 從 localStorage 讀取 暫存信箱 */
    const getTempEMail = () => {
        const savedEmail = localStorage.getItem('savedEmail');
        const savedTime = localStorage.getItem('savedEmailTime');
        // 檢查是否在5天有效期內
        if(!savedEmail || !savedTime) return;
        const currentTime = new Date().getTime();
        const savedTimeValue = parseInt(savedTime, 10);
        const fiveDaysInMs = 5 * 24 * 60 * 60 * 1000; // 5天的毫秒數
        if (currentTime - savedTimeValue <= fiveDaysInMs) {
            inputEMailRef.current.value = savedEmail;
        } else {
            // 超過5天則清除
            localStorage.removeItem('savedEmail');
            localStorage.removeItem('savedEmailTime');
        }
    }

    /* 登入 */
    const clickLogin = async () => {
        const email = inputEMailRef.current.value;
        const password = inputPasswordRef.current.value;
        if(!email || !password) {
            alert("帳號密碼不可空白");
            return;
        }
        const res = await login(email, password); 
        const {isSuccess} = res.data;
        if(!isSuccess) {
            alert('登入失敗');
            return;
        }
        alert('登入成功');

        // 儲存 暫存信箱 到 localStorage (包含當前時間戳記)
        if (email) {
            localStorage.setItem('savedEmail', email);
            localStorage.setItem('savedEmailTime', new Date().getTime().toString());
        }

        navigate('/manager/analysis/spine')
    }

    /* 註冊 */
    const clickRegist = () => {
        navigate('/auth/regist/flow');
    }

    /* 忘記密法 */
    const clickForgetPassword = () => {
        navigate('/auth/password/forget');
    }

    /* 切換密碼可見性 */
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className='Form'>
            <h1>登入頁</h1>
            <input type="text" 
                placeholder='信箱'
                ref={inputEMailRef} 
            />
            
            <div className="password-input-wrapper">
                <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder='密碼'
                    ref={inputPasswordRef}
                    className="password-input" 
                />
                <button 
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
            </div>
            <div className='btnBar'>
                <button onClick={clickLogin}>登入</button>
                <button onClick={clickForgetPassword}>忘記密碼</button>
            </div>
            <button onClick={clickRegist}>註冊</button>

            {/** 更新版本 */}
            <div style={{
                position: 'fixed',
                bottom: '10px',
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: '12px',
                color: '#999',
                textAlign: 'center',
                padding: '5px',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                borderRadius: '5px'
            }}>
                更新版本: 
                <br />
                Date: 2026年6月14日 08:04:00
                <br />
                git commit: 32cd2ea
            </div>
        </div>
    );
}

export default LoginPage;
