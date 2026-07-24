import React, {useRef, useEffect, useState} from 'react';
import { login } from '../../api/auth';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // 引入眼睛圖標
import Loading from '../../components/Loading';
import styles from './LoginPage.module.css';

function LoginPage() {
    const navigate = useNavigate();
    const inputEMailRef = useRef('');
    const inputPasswordRef = useRef('');
    const [showPassword, setShowPassword] = useState(false); // 控制密碼顯示狀態
    const [isLoading, setIsLoading] = useState(false); // 登入中 loading 狀態

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
        setIsLoading(true);
        try {
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
        } finally {
            setIsLoading(false);
        }
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
        <main className={styles.loginPage}>
            {isLoading && <Loading text='登入中...' />}
            <section className={styles.introPanel} aria-label="系統介紹">
                <div className={styles.brandMark} aria-hidden="true"><span /></div>
                <p className={styles.eyebrow}>SPINE ANALYSIS SYSTEM</p>
                <h1>頸椎健康分析系統</h1>
                <p className={styles.introCopy}>以清晰的量測與分析流程，協助您提供更精準的頸椎照護建議。</p>
                <div className={styles.featureList}>
                    <span>精準量測</span>
                    <span>專業分析</span>
                    <span>安心管理</span>
                </div>
            </section>

            <section className={styles.loginPanel} aria-labelledby="login-title">
                <div className={styles.loginCard}>
                    <div className={styles.cardHeading}>
                        <p>歡迎回來</p>
                        <h2 id="login-title">登入您的帳戶</h2>
                        <span>請輸入帳號與密碼，繼續使用系統服務。</span>
                    </div>
                    <form className={styles.loginForm} onSubmit={(event) => { event.preventDefault(); clickLogin(); }}>
                        <label htmlFor="login-email">電子信箱</label>
                        <input id="login-email" type="email" autoComplete="email" placeholder="name@example.com" ref={inputEMailRef} />

                        <div className={styles.passwordLabelRow}>
                            <label htmlFor="login-password">密碼</label>
                            <button type="button" className={styles.forgotButton} onClick={clickForgetPassword}>忘記密碼？</button>
                        </div>
                        <div className={styles.passwordField}>
                            <input id="login-password" type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="請輸入密碼" ref={inputPasswordRef} />
                            <button type="button" className={styles.passwordToggle} onClick={togglePasswordVisibility} aria-label={showPassword ? '隱藏密碼' : '顯示密碼'}>
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                        <button className={styles.loginButton} type="submit" disabled={isLoading}>{isLoading ? '登入中...' : '登入系統'}</button>
                    </form>
                    <div className={styles.registerPrompt}>
                        <span>還沒有帳戶嗎？</span>
                        <button type="button" onClick={clickRegist}>立即註冊</button>
                    </div>
                </div>
                <p className={styles.version}>系統版本更新於 2026 年 6 月 28 日</p>
            </section>
        </main>
    );
}

export default LoginPage;
