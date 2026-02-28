import { useState, useRef, useEffect } from 'react';
import { addCustomerAnalysisResult } from '../api/manager/customerAnalysisResult';
import { getCustomerList } from '../api/manager/customer';

/**
 * 分析結果儲存 Hook
 * 封裝「綁定客戶 / 新建客戶 / 選擇客戶」的共用流程
 *
 * @param {Object}   options
 * @param {Function} options.buildPayloadFn - 回傳頁面專屬的 payload 資料（不含 customerId / userId / createdAt）
 * @param {Function} options.navigate       - React Router navigate
 */
export function useAnalysisSave({ buildPayloadFn, navigate }) {
    const [showSaveOptions, setShowSaveOptions] = useState(false);
    const [showCustomerModal, setShowCustomerModal] = useState(false);
    const [customerList, setCustomerList] = useState([]);

    // 用 ref 確保 buildPayloadFn 永遠取到最新版本
    const buildPayloadRef = useRef(buildPayloadFn);
    useEffect(() => { buildPayloadRef.current = buildPayloadFn; });

    const handleSaveResult = () => setShowSaveOptions(true);

    const handleBindCustomer = async () => {
        try {
            const searchParam = {};
            const pagingParam = { pageIndex: 1, pageSize: 1000 };
            const response = await getCustomerList(searchParam, pagingParam);
            if (response.status === 200) {
                setCustomerList(response.data.result.customerList || []);
                setShowSaveOptions(false);
                setShowCustomerModal(true);
            }
        } catch (error) {
            console.error('取得客戶列表錯誤:', error);
            alert('取得客戶列表失敗');
        }
    };

    const handleCreateNewCustomer = () => {
        try {
            const userId = localStorage.getItem('userId') || 'default_user';
            const pendingAnalysisData = {
                ...buildPayloadRef.current(),
                userId,
                createdAt: new Date().toISOString()
            };
            localStorage.setItem('pendingAnalysisData', JSON.stringify(pendingAnalysisData));
            setShowSaveOptions(false);
            navigate('/manager/customer/add');
        } catch (error) {
            console.error('處理新建客戶錯誤:', error);
            alert('處理新建客戶失敗');
        }
    };

    const handleSelectCustomer = async (customer) => {
        try {
            const userId = localStorage.getItem('userId') || 'default_user';
            const payload = {
                customerId: customer.id,
                userId,
                ...buildPayloadRef.current()
            };
            const response = await addCustomerAnalysisResult(payload);
            if (response.status === 200) {
                setShowCustomerModal(false);
                navigate('/manager/customer/edit/' + customer.id, { state: { customer } });
            }
        } catch (error) {
            console.error('保存分析結果錯誤:', error);
            alert('保存分析結果失敗');
        }
    };

    const handleCloseModals = () => {
        setShowSaveOptions(false);
        setShowCustomerModal(false);
    };

    return {
        showSaveOptions,
        showCustomerModal,
        customerList,
        handleSaveResult,
        handleBindCustomer,
        handleCreateNewCustomer,
        handleSelectCustomer,
        handleCloseModals
    };
}
