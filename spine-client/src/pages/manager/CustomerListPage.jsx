import React, {useEffect, useState} from 'react';
import { withLoading } from '../../utils/loading';
import SearchBarCustomer from '../../components/manager/SearchBar/SearchBarCustomer';
import TopBtnBarCustomer from '../../components/manager/TopBtnBar/TopBtnBarCustomer';
import {useNavigate} from 'react-router-dom';
import {getCustomerList, deleteCustomer, searchCustomer} from '../../api/manager/customer';
import PaginationBar from '../../components/tools/PaginationBar/PaginationBar'
import userIcon from '../../assets/img/shoppingBag1.png';
import loadingGif from '../../assets/loading.gif';
import style from './manager.module.css';

function CustomerListPage() {
    const navigate = useNavigate();
    const [customerList, setCustomerList] = useState([]);
    const [pagingParam, setPagingParam] = useState({ pageIndex: 1, pageSize: 5, sort: 'keyword', pageTotal:-1, dataTotal:-1 });
    const [searchParam, setSearchParam] = useState({keyword:'', state:'', createDate:'', phone:'', email:''});
    const [isLoading, setIsLoading] = useState(false);

    // 初始時, 取得客戶列表
    useEffect(() => {
        fetchCustomerList();
    }, []);

    const fetchCustomerList = async () => {
        await withLoading(
            getCustomerList(searchParam, pagingParam),
            {
                min: 0,
                timeout: 5000,
                onLoading: () => setIsLoading(true),
                onLoaded: () => setIsLoading(false),
                onTimeout: () => alert('網路不穩, 請重新搜尋')
            }
        ).then(res => {
            setCustomerList(res.data.result.customerList);
            setPagingParam(res.data.result.pagingParam);
        }).catch(e => {
            if (e.message !== 'timeout') console.log('取得客戶列表發生錯誤', e);
        });
    }

    // 切換每頁顯示筆數
    const handlePageSizeChange = async (event) => {
        const newSize = parseInt(event.target.value, 10);
        const res = await searchCustomer(searchParam, { ...pagingParam, pageSize: newSize, pageIndex: 1 });
        setCustomerList(res.data.searchResult.customerList);
        setPagingParam({ ...pagingParam, pageSize: newSize, pageIndex: 1 }); // 變更 pageSize 時，重置 pageIndex
    };

    // 分頁切換處理
    const handlePageChange = async (pageIndex) => {
        if (pageIndex < 1 || pageIndex > pageIndex) return;
        await withLoading(
            searchCustomer(searchParam, {...pagingParam, pageIndex}),
            {
                min: 100,
                timeout: 5000,
                onLoading: () => setIsLoading(true),
                onLoaded: () => setIsLoading(false),
                onTimeout: () => alert('網路不穩, 請重新搜尋')
            }
        ).then(res => {
            setCustomerList(res.data.searchResult.customerList);
            setPagingParam({...pagingParam, pageIndex});
        }).catch(e => {
            if (e.message !== 'timeout') alert('網路不穩, 請重新搜尋');
        });
    };

    // 編輯客戶
    const handleEditCustomer = (customer) => {
        navigate(`/manager/customer/edit/${customer.id}`,{ state: { customer }});
    }

    // 搜尋客戶結果, 重新渲染客戶
    const handleSearchResult = async (_searchParam) => {
        let _pagingParam = { ...pagingParam, pageIndex: 1 }; // 重置頁碼
        await withLoading(
            searchCustomer(_searchParam, _pagingParam),
            {
                min: 0,
                timeout: 5000,
                onLoading: () => setIsLoading(true),
                onLoaded: () => setIsLoading(false),
                onTimeout: () => alert('網路不穩, 請重新搜尋')
            }
        ).then(res => {
            setSearchParam(_searchParam);
            setCustomerList(res.data.searchResult.customerList);
            setPagingParam(res.data.searchResult.pagingParam);
        }).catch(e => {
            if (e.message !== 'timeout') alert('網路不穩, 請重新搜尋');
        });
    }

    // 刪除客戶
    const handleDeleteCustomer = (customerId) => {
        if(!window.confirm('確定要刪除此客戶?')) return;
        deleteCustomer(customerId).then((res) => {
            alert('刪除客戶成功');
            const newCustomerList = customerList.filter((customer) => customer.id !== customerId);
            setCustomerList(newCustomerList);
        }).catch((error) => {
            console.log('刪除客戶發生錯誤', error);
        });
    }

    return (
        <div className={style.ManagerPage}>
            <TopBtnBarCustomer 
                customerList={customerList}
            />
            <SearchBarCustomer 
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
                                <th>頭像</th>
                                <th>姓名</th>
                                <th>電子郵件</th>
                                <th>電話</th>
                                <th>狀態</th>
                                <th>操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            {customerList.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className={style.NoData}>查無資料</td>
                                </tr>
                            ) : (
                                customerList.map((customer) => {
                                    return (
                                        <tr key={customer.id}>
                                            <td data-label="頭像"><img className={style.CustomerAvatar} src={customer.avatar || userIcon} alt="客戶頭像" /></td>
                                            <td data-label="姓名" className={style.ItemName}>{customer.name}</td>
                                            <td data-label="電子郵件">{customer.email}</td>
                                            <td data-label="電話">{customer.phone}</td>
                                            <td data-label="狀態">{customer.state}</td>
                                            <td data-label="操作" className={style.ActionButtons}>
                                                <button onClick={() => handleEditCustomer(customer)}>編輯</button>
                                                <button onClick={() => handleDeleteCustomer(customer.id)}>刪除</button>
                                            </td>
                                        </tr>
                                    )
                                })
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

export default CustomerListPage;