import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { addCustomer } from '../../api/manager/customer';
import { updateCustomerAnalysisResult } from '../../api/manager/customerAnalysisResult';
import CreateEditCustomer from '../../components/manager/CreateEdit/CreateEditCustomer';

/* 客戶新增 */
function CustomerAddPage() {
    // 路由
    const navigate = useNavigate();
    // 新增客戶資訊
    const [customerParam, setCustomerParam] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        birthday: '',
        gender: '',
        state: '正常',
        notes: ''
    });

    /* post 新增客戶 */
    const handleAddCustomer = async (customer) => {
        console.log(" handleAddCustomer : ", customer)
        try {
            const res = await addCustomer(customer);
            if(res.status === 200) {
                // 檢查是否有待更新的分析結果
                const pendingAnalysisResultId = localStorage.getItem('pendingAnalysisResultId');
                if (pendingAnalysisResultId) {
                    try {
                        // 更新分析結果的客戶ID
                        await updateCustomerAnalysisResult({
                            id: pendingAnalysisResultId,
                            customerId: res.data.id
                        });
                        localStorage.removeItem('pendingAnalysisResultId');
                        console.log('分析結果已成功綁定到新客戶');
                    } catch (error) {
                        console.error('綁定分析結果到新客戶失敗:', error);
                    }
                }
                
                alert("客戶新增成功");
                navigate('/manager/customer/list');
            } else {
                alert("客戶新增失敗");
            }
        } catch (error) {
            console.error('新增客戶錯誤:', error);
            alert("客戶新增失敗");
        }
    }

    return (
        <div className='pageContainer'>
            <CreateEditCustomer 
                customer={customerParam}
                handleAddCustomer={handleAddCustomer}
                typePage='CREATE'
            />
        </div>
    );

}
export default CustomerAddPage;