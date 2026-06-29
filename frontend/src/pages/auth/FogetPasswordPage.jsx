import React, {useState} from "react";
import { useNavigate } from 'react-router-dom';
import { postMail, verifyCode, updatePassword } from "../../api/auth";

function FogetPasswordPage() {
    const navigate = useNavigate();
    // 忘記密碼流程 StepList
    const StepList = Object.freeze({
        SetMail: "setMail",
        VerifyCode: "verifyCode",
        UpdatePassword: "updatePassword"
    });
    // 流程步驟
    const [step, setStep] = useState(StepList.SetMail);

    // 驗證信箱, 驗證碼, 新密碼, 新密碼檢查 參數如下
    const [verifyMail, setVerifyMail] = useState('');
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newPasswordCheck, setNewPasswordCheck] = useState('');

    // 輸入驗證信箱, 輸入驗證碼, 更新密碼 相關操作 
    const clickSendMail = async () => {
        const res = await postMail(verifyMail);
        if(res.status === 200) {
            alert("信件成功寄送");
            setStep(StepList.VerifyCode);
        } else {
            alert("信件寄送失敗");
        }
    }
    const clickSendCode = async () => {
        const res = await verifyCode({mail: verifyMail, code});
        if(res.data.verifyResult) {
            alert("驗證成功");
            setStep(StepList.UpdatePassword);
        } else {
            alert("驗證碼錯誤!");
        }
    }
    const clickSendNewPassword = async () => {
        if(!newPassword || !newPasswordCheck) {
            alert("密碼與密碼檢查不可空白");
            return;
        }
        if(newPassword !== newPasswordCheck) {
            alert("請確認密碼與密碼檢查需一致");
            return;
        }
        const res = await updatePassword({mail: verifyMail, password: newPassword});
        if(res.status === 200) {
            alert("密碼更新成功");
            navigate('/');
        } else {
            alert("密碼更新失敗, 請稍後再試");
        }
    }

    // 依照 忘記密碼流程 StepList, 切換頁面, UI Flow
    if(step === StepList.SetMail) {
        return (
            <div className='Form'>
                <h1>驗證信箱</h1>
                <p>請輸入註冊時該帳號信箱</p>
                <input type="text" 
                    placeholder="輸入驗證信箱"
                    value={verifyMail}
                    onChange={e => setVerifyMail(e.target.value)}
                />
                <button onClick={clickSendMail}>送出</button>
            </div>
        );
    } else if(step === StepList.VerifyCode) {
        return (
            <div className='Form'>
                <h1>輸入驗證碼</h1>
                <p>稍等信箱取得驗證碼後, 輸入驗證碼</p>
                <input type="text" 
                    placeholder="輸入驗證碼"
                    value={code}
                    onChange={e => setCode(e.target.value)}
                />
                <button onClick={clickSendCode}>送出</button>
            </div>
        );
    } else if(step === StepList.UpdatePassword) {
        return (
            <div className='Form'>
                <h1>更新密碼</h1>
                <p>請輸入新密碼</p>
                <input type="text" 
                    placeholder="輸入新密碼"
                    value={newPassword}
                    onChange={e => {setNewPassword(e.target.value)}}
                />
                <input type="text" 
                    placeholder="輸入新密碼"
                    value={newPasswordCheck}
                    onChange={e => {setNewPasswordCheck(e.target.value)}}
                />
                <button onClick={clickSendNewPassword}>送出</button>
            </div>
        );
    } else {
        return (
            <div className='Form'>
                <h1>狀態錯誤, 請重整頁面</h1>
            </div>
        );
    }
}

export default FogetPasswordPage;
