import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { getCustomer, updateCustomer } from '../../api/manager/customer';
import { getCustomerAnalysisResultsByCustomerId } from '../../api/manager/customerAnalysisResult';
import CreateEditCustomer from '../../components/manager/CreateEdit/CreateEditCustomer';

/* 客戶編輯 */
function CustomerEditPage() {
    // 編輯客戶id
    const { id } = useParams();
    const { state } = useLocation();
    const customer = state?.customer;
    // 編輯客戶資訊
    const [customerParam, setCustomerParam] = useState({});
    // 分析結果列表
    const [analysisResults, setAnalysisResults] = useState([]);
    // 路由
    const navigate = useNavigate();

    /* 編輯客戶, 取得客戶資訊 */
    useEffect(() => {
        console.log(" CustomerEditPage useEffect ");
        // 取得 客戶編輯資訊
        const fetchEditCustomer = async  () => {
            try {
                // 設定 編輯客戶資訊
                const id = customer.id;
                const name = customer.name;
                const email = customer.email;
                const phone = customer.phone;
                const address = customer.address || '';
                const birthday = customer.birthday || '';
                const gender = customer.gender || '';
                const state = customer.state || "正常";
                const notes = customer.notes || '';
                const age = customer.age || '';
                
                setCustomerParam({
                    id,
                    name,
                    email,
                    phone,
                    address,
                    birthday,
                    gender,
                    state,
                    notes,
                    age
                });
                
                // 取得客戶分析結果
                await fetchCustomerAnalysisResults();
            } catch (error) {
                alert("取得客戶資訊錯誤");
            }
        }
        fetchEditCustomer();
    }, [customer]);

    /* 取得客戶分析結果 */
    const fetchCustomerAnalysisResults = async () => {
        try {
            const response = await getCustomerAnalysisResultsByCustomerId(id);
            if (response.status === 200) {
                setAnalysisResults(response.data);
            }
        } catch (error) {
            console.error("取得分析結果錯誤:", error);
        }
    };

    /* 編輯客戶, 更新編輯客戶 */
    const handleUpdateCustomer = async (customer) => {
        try {
            await updateCustomer({id, ...customer});
            alert('更新成功');
            navigate('/manager/customer/list');
        } catch (error) {
            alert('更新失敗:', error);
        }
    }

    return (
        <div className='pageContainer'>
            <CreateEditCustomer 
                customer={customerParam}
                analysisResults={analysisResults}
                handleUpdateCustomer={handleUpdateCustomer}
                onRefreshAnalysisResults={fetchCustomerAnalysisResults}
                typePage='EDIT'
            />
        </div>
    );
}
export default CustomerEditPage;