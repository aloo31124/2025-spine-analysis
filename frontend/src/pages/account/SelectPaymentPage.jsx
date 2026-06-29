import React, { useState, useEffect, useRef } from "react";
import { searchPaymentAll, getECPaymSelectPage, postFreePayment } from "../../api/account";
import { useNavigate } from "react-router-dom";
import { verifyJwt } from '../../api/auth';

function SelectPaymentPage() {
    const [paymentList, setPaymentList] = useState([]);
    const [selectPaymentId, setSelectPaymentId] = useState("");
    const [ecpayHtml, setEcpayHtml] = useState("");
    const formContainerRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        getPaymentAll();
        if(formContainerRef.current) {
            // 確保form已被插入dom, 手動觸發 submit()
            const formElement = formContainerRef.current.querySelector("form");
            if(formElement) {
                formElement.submit();
            }
        }
    }, [ecpayHtml])
    
    const getPaymentAll = async () => {
        const req = await searchPaymentAll();
        setPaymentList(req.data.result);
    }

    const clickSendECpay = async () => {
        if(selectPaymentId?.length === 0) {
            alert("請選擇購買方案");
            return;
        }
        
        // 找到選中的方案
        const selectedPayment = paymentList.find(payment => payment.id === selectPaymentId);
        
        // 判斷是否為免費方案
        if (selectedPayment && selectedPayment.cost === 'free') {
            await handleFreePayment();
        } else {
            const ECpayHtmlPage = await getECPaymSelectPage(selectPaymentId);
            setEcpayHtml(ECpayHtmlPage.data);
        }
    }

    const handleFreePayment = async () => {
        try {
            const req = await verifyJwt(); // 若非 200, 會進入例外
            const payload = req?.data?.payload;
            
            if (!payload) {
                alert("請重新登入");
                navigate('/auth/login');
                return null;
            }
            
            const response = await postFreePayment({ userId: payload.userId, paymentId: selectPaymentId });
            console.log('免費方案開通成功:', response);
            
            if (response.data === "1|OK") {
                alert('免費方案開通成功！');
                navigate('/manager'); // 跳轉至後台管理
            } else {
                alert('開通失敗，請重試');
            }
        } catch (error) {
            console.error('免費方案開通失敗:', error);
            alert('開通失敗，請重試');
        }
    }


    return (
        <div className="pageContainer">
            <h1>選擇方案</h1>
            {
                paymentList.map(payment => 
                    <div key={payment.id}>
                        <h2>
                            <input type="radio" name="paymentList" id={payment.id} 
                                onClick={e => setSelectPaymentId(payment.id)}
                            />
                            {payment.name}
                        </h2>
                        <p>費用: {payment.cost === 'free' ? '免費' : `${payment.cost} TWD/${payment.interval}`}</p>
                        <p>方案說明: {payment.desc}</p>
                    </div>
                )
            }

            <button onClick={clickSendECpay}>
                {paymentList.find(p => p.id === selectPaymentId)?.cost === 'free' ? '免費開通' : '購買'}
            </button>

            {/* 渲染綠界HTML , 並使用 ref 手動提交表單 */}
            <div ref={formContainerRef} dangerouslySetInnerHTML={{__html: ecpayHtml}} />
        </div>
    );
}
export default SelectPaymentPage;