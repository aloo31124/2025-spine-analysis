import React, {useEffect, useState} from 'react';
import { withLoading } from '../../utils/loading';
import SearchBarPayment from '../../components/manager/SearchBar/SearchBarPayment';
import TopBtnBarPayment from '../../components/manager/TopBtnBar/TopBtnBarPayment';
import {useNavigate} from 'react-router-dom';
import {getPaymentList, deletePayment, searchPayment} from '../../api/manager/payment';
import PaginationBar from '../../components/tools/PaginationBar/PaginationBar'
import loadingGif from '../../assets/loading.gif';
import style from './manager.module.css';

function PaymentListPage() {
    const navigate = useNavigate();
    const [paymentList, setPaymentList] = useState([]);
    const [pagingParam, setPagingParam] = useState({ pageIndex: 1, pageSize: 5, sort: 'name', pageTotal:-1, dataTotal:-1 });
    const [searchParam, setSearchParam] = useState({name:'', type:'', interval:'', createDate:'', costRange:{min:0, max:0}});
    const [isLoading, setIsLoading] = useState(false);

    // 初始時, 取得方案列表
    useEffect(() => {
        fetchPaymentList();
    }, []);

    const fetchPaymentList = async () => {
        await withLoading(
            getPaymentList(searchParam, pagingParam),
            {
                min: 0,
                timeout: 5000,
                onLoading: () => setIsLoading(true),
                onLoaded: () => setIsLoading(false),
                onTimeout: () => alert('網路不穩, 請重新搜尋')
            }
        ).then(res => {
            setPaymentList(res.data.result.paymentList);
            setPagingParam(res.data.result.pagingParam);
        }).catch(e => {
            if (e.message !== 'timeout') console.log('取得方案列表發生錯誤', e);
        });
    }

    // 切換每頁顯示筆數
    const handlePageSizeChange = async (event) => {
        const newSize = parseInt(event.target.value, 10);
        const res = await searchPayment(searchParam, { ...pagingParam, pageSize: newSize, pageIndex: 1 });
        setPaymentList(res.data.searchResult.paymentList);
        setPagingParam({ ...pagingParam, pageSize: newSize, pageIndex: 1 }); // 變更 pageSize 時，重置 pageIndex
    };

    // 分頁切換處理
    const handlePageChange = async (pageIndex) => {
        if (pageIndex < 1 || pageIndex > pagingParam.pageTotal) return;
        await withLoading(
            searchPayment(searchParam, {...pagingParam, pageIndex}),
            {
                min: 100,
                timeout: 5000,
                onLoading: () => setIsLoading(true),
                onLoaded: () => setIsLoading(false),
                onTimeout: () => alert('網路不穩, 請重新搜尋')
            }
        ).then(res => {
            setPaymentList(res.data.searchResult.paymentList);
            setPagingParam({...pagingParam, pageIndex});
        }).catch(e => {
            if (e.message !== 'timeout') alert('網路不穩, 請重新搜尋');
        });
    };

    // 編輯方案
    const handleEditPayment = (payment) => {
        navigate(`/manager/payment/edit/${payment.id}`,{ state: { payment }});
    }

    // 搜尋方案結果, 重新渲染方案
    const handleSearchResult = async (_searchParam) => {
        let _pagingParam = { ...pagingParam, pageIndex: 1 }; // 重置頁碼
        await withLoading(
            searchPayment(_searchParam, _pagingParam),
            {
                min: 0,
                timeout: 5000,
                onLoading: () => setIsLoading(true),
                onLoaded: () => setIsLoading(false),
                onTimeout: () => alert('網路不穩, 請重新搜尋')
            }
        ).then(res => {
            setSearchParam(_searchParam);
            setPaymentList(res.data.searchResult.paymentList);
            setPagingParam(res.data.searchResult.pagingParam);
        }).catch(e => {
            if (e.message !== 'timeout') alert('網路不穩, 請重新搜尋');
        });
    }

    // 刪除方案
    const handleDeletePayment = (paymentId) => {
        if(!window.confirm('確定要刪除此方案?')) return;
        deletePayment(paymentId).then((res) => {
            alert('刪除方案成功');
            const newPaymentList = paymentList.filter((payment) => payment.id !== paymentId);
            setPaymentList(newPaymentList);
        }).catch((error) => {
            console.log('刪除方案發生錯誤', error);
            alert('刪除方案失敗');
        });
    }

    // 格式化類型顯示
    const formatType = (type) => {
        const typeMap = {
            'basic': '基本版',
            'premium': '進階版',
            'enterprise': '企業版'
        };
        return typeMap[type] || type;
    }

    // 格式化週期顯示
    const formatInterval = (interval) => {
        const intervalMap = {
            'monthly': '月繳',
            'quarterly': '季繳',
            'yearly': '年繳'
        };
        return intervalMap[interval] || interval;
    }

    // 格式化費用顯示
    const formatCost = (cost) => {
        if (cost === 'free') {
            return '免費';
        }
        return `NT$ ${cost}`;
    }

    return (
        <div className={style.ManagerPage}>
            <TopBtnBarPayment 
                paymentList={paymentList}
            />
            <SearchBarPayment 
                getSearchParam={handleSearchResult}
                pagingParam={pagingParam}
            />
            
            <div className={style.TableContainer}>
                {isLoading ? (
                    <div className={style.LoadingContainer}>
                        <img src={loadingGif} alt="Loading..." />
                    </div>
                ) : (
                    <table className={style.ManagerTable}>
                        <thead>
                            <tr>
                                <th>方案名稱</th>
                                <th>類型</th>
                                <th>費用</th>
                                <th>週期</th>
                                <th>描述</th>
                                <th>操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paymentList.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className={style.NoData}>查無資料</td>
                                </tr>
                            ) : (
                                paymentList.map((payment) => (
                                    <tr key={payment.id}>
                                        <td data-label="方案名稱" className={style.ItemName}>{payment.name}</td>
                                        <td data-label="類型">{formatType(payment.type)}</td>
                                        <td data-label="費用" className={style.ItemCost}>{formatCost(payment.cost)}</td>
                                        <td data-label="週期">{formatInterval(payment.interval)}</td>
                                        <td data-label="描述" className={style.ItemDesc}>{payment.desc}</td>
                                        <td data-label="操作" className={style.ActionButtons}>
                                            <button onClick={() => handleEditPayment(payment)}>
                                                編輯
                                            </button>
                                            <button onClick={() => handleDeletePayment(payment.id)}>
                                                刪除
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>
            
            <PaginationBar 
                pagingParam={pagingParam} 
                clickPageChange={handlePageChange} 
                clickPageSizeChange={handlePageSizeChange}
            />
        </div>
    );
}

export default PaymentListPage;