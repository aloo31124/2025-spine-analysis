import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { addCustomer } from '../../api/manager/customer';
import { 
    addCustomerAnalysisResult, 
    updateCustomerAnalysisResult, 
    getCustomerAnalysisResult, 
    getPendingAnalysisData, 
    clearPendingAnalysisData 
} from '../../api/manager/customerAnalysisResult';
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
        notes: '',
        age: '',
        height: '',
        weight: ''
    });
    // 待綁定的分析結果
    const [pendingAnalysisResult, setPendingAnalysisResult] = useState(null);

    // 檢查是否有待綁定的分析結果
    useEffect(() => {
        const pendingAnalysisData = getPendingAnalysisData();
        if (pendingAnalysisData) {
            setPendingAnalysisResult(pendingAnalysisData);
        }
    }, []);

    /* 刷新分析結果 */
    const handleRefreshAnalysisResults = () => {
        // 重新從localStorage獲取待綁定的分析結果
        const pendingAnalysisData = getPendingAnalysisData();
        setPendingAnalysisResult(pendingAnalysisData);
    };

    /* post 新增客戶 */
    const handleAddCustomer = async (customer) => {
        console.log(" handleAddCustomer : ", customer)
        try {
            const res = await addCustomer(customer);
            if(res.status === 200) {
                const createdCustomerId = res.data?.newCustomer?.id;
                if (!createdCustomerId) {
                    console.error('新增客戶成功，但回傳資料缺少 newCustomer.id');
                }
                // 檢查是否有待保存的分析結果
                const pendingAnalysisData = getPendingAnalysisData();
                if (pendingAnalysisData) {
                    try {
                        if (!createdCustomerId) {
                            throw new Error('無法取得新客戶 ID，分析結果無法綁定');
                        }
                        // 將分析結果與新創建的客戶ID一起保存到資料庫
                        const analysisResultData = {
                            customerId: createdCustomerId,
                            userId: pendingAnalysisData.userId,
                            analysisType: pendingAnalysisData.analysisType,
                            analysisData: pendingAnalysisData.analysisData,
                            points: pendingAnalysisData.points,
                            lines: pendingAnalysisData.lines,
                            intersectionPoints: pendingAnalysisData.intersectionPoints,
                            calculationResults: pendingAnalysisData.calculationResults,
                            backgroundImage: pendingAnalysisData.backgroundImage
                        };
                        
                        await addCustomerAnalysisResult(analysisResultData);
                        clearPendingAnalysisData();
                        console.log('分析結果已成功保存並綁定到新客戶');
                    } catch (error) {
                        console.error('保存分析結果到新客戶失敗:', error);
                        // 即使分析結果保存失敗，客戶已創建成功，不影響整體流程
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
                analysisResults={pendingAnalysisResult ? [pendingAnalysisResult] : []}
                handleAddCustomer={handleAddCustomer}
                onRefreshAnalysisResults={handleRefreshAnalysisResults}
                typePage='CREATE'
            />
        </div>
    );

}
export default CustomerAddPage;