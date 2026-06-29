import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { withLoading } from '../../utils/loading';
import { getStoreList, deleteStore, searchStore } from '../../api/manager/store';
import { getStoreManagerList } from '../../api/manager/role';
import PaginationBar from '../../components/tools/PaginationBar/PaginationBar';
import loadingGif from '../../assets/loading.gif';
import styles from './StoreListPage.module.css';

function StoreListPage() {
    const navigate = useNavigate();
    const [storeList, setStoreList] = useState([]);
    const [pagingParam, setPagingParam] = useState({ pageIndex: 1, pageSize: 10, sort: 'name', pageTotal: -1, dataTotal: -1 });
    const [searchParam, setSearchParam] = useState({ keyword: '', region: '', storeManagerId: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [storeManagers, setStoreManagers] = useState([]);

    // 初始時，取得店面列表和店長列表
    useEffect(() => {
        fetchStoreList();
        fetchStoreManagers();
    }, []);

    // 取得店長列表
    const fetchStoreManagers = async () => {
        try {
            const res = await getStoreManagerList();
            setStoreManagers(res.data.storeManagers || []);
        } catch (error) {
            console.error('取得店長列表發生錯誤', error);
        }
    };

    // 取得店面列表
    const fetchStoreList = async () => {
        await withLoading(
            getStoreList(searchParam, pagingParam),
            {
                min: 0,
                timeout: 5000,
                onLoading: () => setIsLoading(true),
                onLoaded: () => setIsLoading(false),
                onTimeout: () => alert('網路不穩，請重新搜尋')
            }
        ).then(res => {
            setStoreList(res.data.result.storeList);
            setPagingParam(res.data.result.pagingParam);
        }).catch(e => {
            if (e.message !== 'timeout') console.log('取得店面列表發生錯誤', e);
        });
    };

    // 切換每頁顯示筆數
    const handlePageSizeChange = async (event) => {
        const newSize = parseInt(event.target.value, 10);
        const res = await searchStore(searchParam, { ...pagingParam, pageSize: newSize, pageIndex: 1 });
        setStoreList(res.data.searchResult.storeList);
        setPagingParam({ ...pagingParam, pageSize: newSize, pageIndex: 1 });
    };

    // 分頁切換處理
    const handlePageChange = async (pageIndex) => {
        if (pageIndex < 1 || pageIndex > pagingParam.pageTotal) return;
        await withLoading(
            searchStore(searchParam, { ...pagingParam, pageIndex }),
            {
                min: 100,
                timeout: 5000,
                onLoading: () => setIsLoading(true),
                onLoaded: () => setIsLoading(false),
                onTimeout: () => alert('網路不穩，請重新搜尋')
            }
        ).then(res => {
            setStoreList(res.data.searchResult.storeList);
            setPagingParam({ ...pagingParam, pageIndex });
        }).catch(e => {
            if (e.message !== 'timeout') alert('網路不穩，請重新搜尋');
        });
    };

    // 搜尋店面
    const handleSearch = async () => {
        let _pagingParam = { ...pagingParam, pageIndex: 1 };
        await withLoading(
            searchStore(searchParam, _pagingParam),
            {
                min: 0,
                timeout: 5000,
                onLoading: () => setIsLoading(true),
                onLoaded: () => setIsLoading(false),
                onTimeout: () => alert('網路不穩，請重新搜尋')
            }
        ).then(res => {
            setStoreList(res.data.searchResult.storeList);
            setPagingParam(res.data.searchResult.pagingParam);
        }).catch(e => {
            if (e.message !== 'timeout') alert('網路不穩，請重新搜尋');
        });
    };

    // 編輯店面
    const handleEditStore = (store) => {
        navigate(`/manager/store/edit/${store.id}`, { state: { store } });
    };

    // 刪除店面
    const handleDeleteStore = (storeId) => {
        if (!window.confirm('確定要刪除此店面？')) return;
        deleteStore(storeId).then(() => {
            alert('刪除店面成功');
            const newStoreList = storeList.filter((store) => store.id !== storeId);
            setStoreList(newStoreList);
        }).catch((error) => {
            console.log('刪除店面發生錯誤', error);
            alert('刪除店面失敗');
        });
    };

    // 取得店長名稱
    const getStoreManagerName = (storeManagerId) => {
        if (!storeManagerId) return '未設定';
        const manager = storeManagers.find(m => m.userId === storeManagerId);
        return manager ? (manager.userName || manager.userAccount || '未知') : '未知';
    };

    // 渲染桌面版表格
    const renderDesktopTable = () => (
        <table className={styles.storeTable}>
            <thead>
                <tr>
                    <th>店面名稱</th>
                    <th>所屬區域</th>
                    <th>店面地址</th>
                    <th>店面電話</th>
                    <th>所屬店長</th>
                    <th>備註</th>
                    <th>操作</th>
                </tr>
            </thead>
            <tbody>
                {isLoading ? (
                    <tr>
                        <td colSpan="7" className={styles.loadingContainer}>
                            <img src={loadingGif} alt="Loading..." />
                        </td>
                    </tr>
                ) : storeList.length === 0 ? (
                    <tr>
                        <td colSpan="7" className={styles.emptyState}>
                            查無資料
                        </td>
                    </tr>
                ) : (
                    storeList.map((store) => (
                        <tr key={store.id}>
                            <td>{store.name}</td>
                            <td>{store.region}</td>
                            <td>{store.address}</td>
                            <td>{store.phone}</td>
                            <td>{getStoreManagerName(store.storeManagerId)}</td>
                            <td className={styles.notesCell}>{store.notes || '-'}</td>
                            <td>
                                <button
                                    className={`${styles.actionBtn} ${styles.editBtn}`}
                                    onClick={() => handleEditStore(store)}
                                >
                                    編輯
                                </button>
                                <button
                                    className={`${styles.actionBtn} ${styles.deleteBtn}`}
                                    onClick={() => handleDeleteStore(store.id)}
                                >
                                    刪除
                                </button>
                            </td>
                        </tr>
                    ))
                )}
            </tbody>
        </table>
    );

    // 渲染手機版卡片
    const renderMobileCards = () => (
        <div className={styles.mobileCardsContainer}>
            {isLoading ? (
                <div className={styles.loadingContainer}>
                    <img src={loadingGif} alt="Loading..." />
                </div>
            ) : storeList.length === 0 ? (
                <div className={styles.emptyState}>查無資料</div>
            ) : (
                storeList.map((store) => (
                    <div key={store.id} className={styles.storeCard}>
                        <div className={styles.cardHeader}>
                            <h3>{store.name}</h3>
                            <span className={styles.regionBadge}>{store.region}</span>
                        </div>
                        <div className={styles.cardBody}>
                            <div className={styles.cardRow}>
                                <span className={styles.label}>地址：</span>
                                <span>{store.address}</span>
                            </div>
                            <div className={styles.cardRow}>
                                <span className={styles.label}>電話：</span>
                                <span>{store.phone}</span>
                            </div>
                            <div className={styles.cardRow}>
                                <span className={styles.label}>店長：</span>
                                <span>{getStoreManagerName(store.storeManagerId)}</span>
                            </div>
                            {store.notes && (
                                <div className={styles.cardRow}>
                                    <span className={styles.label}>備註：</span>
                                    <span>{store.notes}</span>
                                </div>
                            )}
                        </div>
                        <div className={styles.cardActions}>
                            <button
                                className={`${styles.actionBtn} ${styles.editBtn}`}
                                onClick={() => handleEditStore(store)}
                            >
                                編輯
                            </button>
                            <button
                                className={`${styles.actionBtn} ${styles.deleteBtn}`}
                                onClick={() => handleDeleteStore(store.id)}
                            >
                                刪除
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>
    );

    return (
        <div className={styles.pageContainer}>
            <div className={styles.pageHeader}>
                <h1>店面管理</h1>
                <button
                    className={styles.addBtn}
                    onClick={() => navigate('/manager/store/add')}
                >
                    + 新增店面
                </button>
            </div>

            {/* 搜尋區域 */}
            <div className={styles.searchSection}>
                <div className={styles.searchInputGroup}>
                    <input
                        type="text"
                        placeholder="搜尋店面名稱、地址、電話"
                        value={searchParam.keyword}
                        onChange={(e) => setSearchParam({ ...searchParam, keyword: e.target.value })}
                        className={styles.searchInput}
                    />
                    <select
                        value={searchParam.region}
                        onChange={(e) => setSearchParam({ ...searchParam, region: e.target.value })}
                        className={styles.searchSelect}
                    >
                        <option value="">全部區域</option>
                        <option value="北區">北區</option>
                        <option value="中區">中區</option>
                        <option value="南區">南區</option>
                        <option value="東區">東區</option>
                        <option value="離島區">離島區</option>
                    </select>
                    <select
                        value={searchParam.storeManagerId}
                        onChange={(e) => setSearchParam({ ...searchParam, storeManagerId: e.target.value })}
                        className={styles.searchSelect}
                    >
                        <option value="">全部店長</option>
                        {storeManagers.map((manager) => (
                            <option key={manager.userId} value={manager.userId}>
                                {manager.userName || manager.userAccount}
                            </option>
                        ))}
                    </select>
                    <button onClick={handleSearch} className={styles.searchBtn}>
                        搜尋
                    </button>
                </div>
            </div>

            {/* 桌面版表格 */}
            <div className={styles.desktopView}>
                {renderDesktopTable()}
            </div>

            {/* 手機版卡片 */}
            <div className={styles.mobileView}>
                {renderMobileCards()}
            </div>

            {/* 分頁 */}
            <div className={styles.paginationSection}>
                <div className={styles.pageSizeSelector}>
                    <label>每頁顯示：</label>
                    <select value={pagingParam.pageSize} onChange={handlePageSizeChange}>
                        <option value={5}>5 筆</option>
                        <option value={10}>10 筆</option>
                        <option value={20}>20 筆</option>
                        <option value={50}>50 筆</option>
                    </select>
                </div>
                <PaginationBar
                    pageIndex={pagingParam.pageIndex}
                    pageTotal={pagingParam.pageTotal}
                    onPageChange={handlePageChange}
                />
            </div>
        </div>
    );
}

export default StoreListPage;
