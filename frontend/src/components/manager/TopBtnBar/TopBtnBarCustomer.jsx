import React from 'react';
import { useNavigate } from 'react-router-dom';
import style from './TopBtnBar.module.css';

function TopBtnBarCustomer({ customerList }) {
    const navigate = useNavigate();

    // 新增客戶
    const handleAddCustomer = () => {
        navigate('/manager/customer/add');
    };

    // 匯出客戶資料
    const handleExportCustomers = () => {
        if (!customerList || customerList.length === 0) {
            alert('沒有客戶資料可匯出');
            return;
        }
        
        // 簡單的CSV匯出功能
        const csvContent = [
            ['姓名', '電子郵件', '電話', '地址', '生日', '性別', '狀態', '備註'].join(','),
            ...customerList.map(customer => [
                customer.name || '',
                customer.email || '',
                customer.phone || '',
                customer.address || '',
                customer.birthday || '',
                customer.gender || '',
                customer.state || '',
                customer.notes || ''
            ].join(','))
        ].join('\n');

        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `客戶資料_${new Date().toLocaleDateString()}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // 重新整理
    const handleRefresh = () => {
        window.location.reload();
    };

    return (
        <div className={style.TopBtnBarContainer}>
            <div className={style.TopBtnBarRow}>
                <h2>客戶管理</h2>
            </div>
            <div className={style.TopBtnBarRow}>
                <button onClick={handleAddCustomer} className={style.primaryBtn}>
                    新增客戶
                </button>
                <button onClick={handleExportCustomers} className={style.secondaryBtn}>
                    匯出客戶
                </button>
                <button onClick={handleRefresh} className={style.secondaryBtn}>
                    重新整理
                </button>
            </div>
        </div>
    );
}

export default TopBtnBarCustomer;