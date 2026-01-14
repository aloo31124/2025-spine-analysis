import React, { useEffect, useState } from 'react';
import { getStoreManagerList, addStoreManagerByEmail, deleteUserToRole } from '../../api/manager/role';
import { getStoreList, updateStore } from '../../api/manager/store';
import { withLoading } from '../../utils/loading';
import loadingGif from '../../assets/loading.gif';
import styles from './RoleManagementPage.module.css';

/**
 * 分權設定頁面
 * 只有管理員 Admin 可以訪問
 * 功能：管理店長 StoreManager 角色
 */
function RoleManagementPage() {
    const [storeManagerList, setStoreManagerList] = useState([]);
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [storeList, setStoreList] = useState([]);
    const [showStoreBinding, setShowStoreBinding] = useState(false);

    // 初始載入店長列表和店面列表
    useEffect(() => {
        fetchStoreManagerList();
        fetchStoreList();
    }, []);

    // 取得店長列表
    const fetchStoreManagerList = async () => {
        await withLoading(
            getStoreManagerList(),
            {
                min: 0,
                timeout: 5000,
                onLoading: () => setIsLoading(true),
                onLoaded: () => setIsLoading(false),
                onTimeout: () => alert('網路不穩, 請重新載入')
            }
        ).then(res => {
            setStoreManagerList(res.data.storeManagers || []);
        }).catch(e => {
            if (e.message !== 'timeout') {
                console.log('取得店長列表發生錯誤', e);
                alert('取得店長列表失敗');
            }
        });
    };

    // 取得店面列表
    const fetchStoreList = async () => {
        try {
            const searchParam = { keyword: '', region: '', storeManagerId: '' };
            const pagingParam = { pageIndex: 1, pageSize: 1000 };
            const res = await getStoreList(searchParam, pagingParam);
            setStoreList(res.data.result.storeList || []);
        } catch (error) {
            console.error('取得店面列表發生錯誤', error);
        }
    };

    // 新增店長
    const handleAddStoreManager = async (e) => {
        e.preventDefault();
        setError('');

        if (!email || !email.trim()) {
            setError('請輸入電子郵件');
            return;
        }

        // 簡單的 email 格式驗證
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('請輸入有效的電子郵件格式');
            return;
        }

        await withLoading(
            addStoreManagerByEmail(email),
            {
                min: 100,
                timeout: 5000,
                onLoading: () => setIsLoading(true),
                onLoaded: () => setIsLoading(false),
                onTimeout: () => alert('網路不穩, 請重試')
            }
        ).then(res => {
            alert('店長新增成功');
            setEmail('');
            fetchStoreManagerList(); // 重新載入列表
        }).catch(e => {
            if (e.message !== 'timeout') {
                const errorMsg = e.response?.data?.error || '新增店長失敗';
                setError(errorMsg);
                alert(errorMsg);
            }
        });
    };

    // 刪除店長
    const handleDeleteStoreManager = async (storeManager) => {
        if (!window.confirm(`確定要移除 ${storeManager.userEmail} 的店長角色嗎？`)) {
            return;
        }

        await withLoading(
            deleteUserToRole(storeManager.id),
            {
                min: 100,
                timeout: 5000,
                onLoading: () => setIsLoading(true),
                onLoaded: () => setIsLoading(false),
                onTimeout: () => alert('網路不穩, 請重試')
            }
        ).then(res => {
            alert('店長角色移除成功');
            fetchStoreManagerList(); // 重新載入列表
        }).catch(e => {
            if (e.message !== 'timeout') {
                console.log('刪除店長角色發生錯誤', e);
                alert('刪除店長角色失敗');
            }
        });
    };

    // 處理店面店長變更
    const handleStoreManagerChange = async (store, newManagerId) => {
        const oldManager = storeManagerList.find(m => m.userId === store.storeManagerId);
        const newManager = storeManagerList.find(m => m.userId === newManagerId);
        
        // 如果原本有店長，需要確認
        if (store.storeManagerId && oldManager) {
            const confirmMsg = `${store.name} 店面 是否要將 ${oldManager.userName} 修改為 ${newManager ? newManager.userName : '無店長'}？`;
            if (!window.confirm(confirmMsg)) {
                return;
            }
        }

        // 執行更新
        try {
            setIsLoading(true);
            const updateData = {
                ...store,
                storeManagerId: newManagerId || null
            };
            await updateStore(updateData);
            alert('店長綁定更新成功');
            await fetchStoreList(); // 重新載入店面列表
        } catch (error) {
            console.error('更新店長綁定失敗', error);
            alert('更新店長綁定失敗：' + (error.response?.data?.error || error.message));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.roleManagementContainer}>
            <h2 className={styles.pageTitle}>分權設定</h2>

            {/* 新增店長表單 */}
            <div className={styles.addSection}>
                <h3 className={styles.sectionTitle}>新增店長</h3>
                <form onSubmit={handleAddStoreManager} className={styles.addForm}>
                    <div className={styles.formGroup}>
                        <label htmlFor="email" className={styles.label}>
                            電子郵件：
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                setError('');
                            }}
                            placeholder="請輸入用戶的電子郵件"
                            className={styles.emailInput}
                            disabled={isLoading}
                        />
                        <button 
                            type="submit" 
                            className={styles.addButton}
                            disabled={isLoading}
                        >
                            新增店長
                        </button>
                    </div>
                    {error && <p className={styles.errorMessage}>{error}</p>}
                </form>
            </div>

            {/* 店長列表 */}
            <div className={styles.listSection}>
                <h3 className={styles.sectionTitle}>店長列表</h3>
                
                {isLoading ? (
                    <div className={styles.loadingContainer}>
                        <img src={loadingGif} alt="Loading..." />
                    </div>
                ) : storeManagerList.length === 0 ? (
                    <div className={styles.emptyState}>
                        目前沒有店長
                    </div>
                ) : (
                    <div className={styles.tableWrapper}>
                        <table className={styles.storeManagerTable}>
                            <thead>
                                <tr>
                                    <th>帳號名稱</th>
                                    <th>電子郵件</th>
                                    <th>角色</th>
                                    <th>操作</th>
                                </tr>
                            </thead>
                            <tbody>
                                {storeManagerList.map((manager) => (
                                    <tr key={manager.id}>
                                        <td>{manager.userAccount || '-'}</td>
                                        <td>{manager.userEmail}</td>
                                        <td>
                                            <span className={styles.roleBadge}>
                                                {manager.role}
                                            </span>
                                        </td>
                                        <td>
                                            <button
                                                className={styles.deleteButton}
                                                onClick={() => handleDeleteStoreManager(manager)}
                                                disabled={isLoading}
                                            >
                                                移除
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* 綁定店面 */}
            <div className={styles.bindingSection}>
                <div className={styles.bindingHeader}>
                    <h3 className={styles.sectionTitle}>綁定店面</h3>
                    <button 
                        className={styles.toggleButton}
                        onClick={() => setShowStoreBinding(!showStoreBinding)}
                    >
                        {showStoreBinding ? '收合' : '展開'}
                    </button>
                </div>
                
                <div className={styles.bindingInfo}>
                    <p>• 一個店長可設定多個店面</p>
                    <p>• 一個店面最多只能設定一個店長</p>
                </div>

                {showStoreBinding && (
                    <div className={styles.storeBindingContainer}>
                        {isLoading ? (
                            <div className={styles.loadingContainer}>
                                <img src={loadingGif} alt="Loading..." />
                            </div>
                        ) : storeList.length === 0 ? (
                            <div className={styles.emptyState}>
                                目前沒有店面
                            </div>
                        ) : (
                            <div className={styles.tableWrapper}>
                                <table className={styles.storeBindingTable}>
                                    <thead>
                                        <tr>
                                            <th>店面名稱</th>
                                            <th>所屬區域</th>
                                            <th>店面地址</th>
                                            <th>目前店長</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {storeList.map((store) => {
                                            const currentManager = storeManagerList.find(
                                                m => m.userId === store.storeManagerId
                                            );
                                            return (
                                                <tr key={store.id}>
                                                    <td>{store.name}</td>
                                                    <td>{store.region}</td>
                                                    <td>{store.address}</td>
                                                    <td>
                                                        <select
                                                            className={styles.managerSelect}
                                                            value={store.storeManagerId || ''}
                                                            onChange={(e) => handleStoreManagerChange(store, e.target.value)}
                                                            disabled={isLoading}
                                                        >
                                                            <option value="">未指定店長</option>
                                                            {storeManagerList.map((manager) => (
                                                                <option key={manager.userId} value={manager.userId}>
                                                                    {manager.userName}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default RoleManagementPage;
