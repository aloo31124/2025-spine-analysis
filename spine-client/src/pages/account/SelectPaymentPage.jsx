import React, { useState, useEffect, useRef } from "react";
import { searchPaymentAll, getECPaymSelectPage } from "../../api/account";

function SelectPaymentPage() {
    const [paymentList, setPaymentList] = useState([]);
    const [selectPaymentId, setSelectPaymentId] = useState("");
    const [ecpayHtml, setEcpayHtml] = useState("");
    const formContainerRef = useRef(null);

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
        const ECpayHtmlPage = await getECPaymSelectPage(selectPaymentId);
        setEcpayHtml(ECpayHtmlPage.data);
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
                        <p>費用: {payment.cost} TWD/{payment.interval}</p>
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
export default SelectPaymentPage;