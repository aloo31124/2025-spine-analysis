import React, { useState, useEffect, useRef } from "react";
import { getECpayHtmlPage, searchPaymentAll } from "../../api/pay";

function PaymentSelectPage() {
    const [ecpayHtml, setEcpayHtml] = useState("");
    const [paymentList, setPaymentList] = useState([]);
    const formContainerRef = useRef(null);

    const clickSendECpay = async () => {
        const ECpayHtmlPage = await getECpayHtmlPage();
        console.log(ECpayHtmlPage);
        setEcpayHtml(ECpayHtmlPage.data);
    }

    useEffect(() => {
        getPaymentAll();
        if(formContainerRef.current) {
            // 確保form已被插入dom, 手動觸發 submit()
            const formElement = formContainerRef.current.querySelector("form");
            if(formElement) {
                formElement.submit(); 
            }
        }
    }, [ecpayHtml]); // 當 ecpayHtml 更新時執行
    
    const getPaymentAll = async () => {
        const req = await searchPaymentAll();
        console.log(" getPaymentAll 取得方案 req.data.result : ", req.data.result);
        setPaymentList(req.data.result);
    }

    return (
        <div className="pageContainer">
            <h1>選擇方案</h1>

            {
                paymentList.map(payment => 
                    <div key={payment.id}>
                        <h3>{payment.name}</h3>
                        <p>費用: {payment.cost}TWD/{payment.interval}</p>
                        <p>方案說明: {payment.desc}</p>
                    </div>
                )
            }

            <button onClick={clickSendECpay}>購買</button>

            {/* 渲染綠界HTML , 並使用 ref 手動提交表單 */}
            <div ref={formContainerRef} dangerouslySetInnerHTML={{__html: ecpayHtml}} />
        </div>
    );
}

export default PaymentSelectPage;
