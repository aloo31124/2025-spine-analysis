import React, { useState } from 'react';
import { postMail, findMail } from '../../api/auth';
import Loading from '../../components/Loading';

// 註冊帳號輸入資訊頁
function RegisterInfoPage({ setStatus, setUser }) {
    const [mail, setMail] = useState('');
    const [account, setAccount] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);


    const clickSendRegistInfo = async () => {
        setLoading(true);
        const newUser = { mail, account, phone };
        setUser(newUser);
        let alertShown = false;
    
        try {
          // 檢查信箱是否已註冊過
          const res = await findMail(mail);
          if(res.status ==! 200) {
            alert("檢查信件出錯, 請稍後再試");
            setLoading(false);
            return;
          }
          if(res.data.result && res.data.result.mail) {
            alert(res.data.result.mail + " 已註冊過, \n可直接登入或執行忘記密碼。");
            setLoading(false);
            return;
          }

          // 建立一個 10秒 的timeout promise
          const timeout = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('timeout')), 10000) 
          );
    
          // 用 Promise.race 同時競速
          await Promise.race([
            (async () => {
              const res = await postMail(mail);
              if (res.status === 200 && !alertShown) {
                alertShown = true;
                alert("信件成功送出, 請稍等");
              }
            })(),
            timeout,
          ]);
        } catch (err) {
          setLoading(false);
          if (err.message === 'timeout') {
            alertShown = true;
            alert("信件寄送中, 請稍等");
          } else {
            alert("送信失敗");
            setLoading(false);
            return;
          }
        }
        
        setLoading(false);
        setUser(newUser);
        setStatus(); // 成功後切換到下一狀態
      };

    if(loading) return <Loading/>
    return (
        <div className='Form'>
            <h1>註冊資訊</h1>
            <input type="text"
                placeholder="輸入驗證信箱"
                value={mail}
                onChange={(e) => setMail(e.target.value)}
            />
            <input type="text"
                placeholder='輸入帳號'
                value={account}
                onChange={(e) => setAccount(e.target.value)}
            />
            <input type="text"
                placeholder='輸入電話'
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
            />
            <button onClick={clickSendRegistInfo}>送出</button>
        </div>
    )
}

export default RegisterInfoPage;
