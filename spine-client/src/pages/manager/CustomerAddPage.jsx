import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { addCustomer } from '../../api/manager/customer';
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
        const res = await addCustomer(customer);
        if(res.status === 200) {
            alert("客戶新增成功");
            navigate('/manager/customer/list');
        } else {
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