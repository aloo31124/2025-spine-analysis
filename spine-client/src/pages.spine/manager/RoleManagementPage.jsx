import React, { useEffect, useState } from 'react';
import { getStoreManagerList, addStoreManagerByEmail, deleteUserToRole } from '../../api/manager/role';
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

    // 初始載入店長列表
    useEffect(() => {
        fetchStoreManagerList();
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
            setStoreManagerList(res.data.result || []);
        }).catch(e => {
            if (e.message !== 'timeout') {
                console.log('取得店長列表發生錯誤', e);
                alert('取得店長列表失敗');
            }
        });
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
        if (!window.confirm(`確定要移除 ${storeManager.email} 的店長角色嗎？`)) {
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
                                        <td>{manager.account || '-'}</td>
                                        <td>{manager.email}</td>
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
        </div>
    );
}

export default RoleManagementPage;
