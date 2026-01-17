import React, { useState, useEffect } from 'react';
import styles from './ManagerSettingPage.module.css';
import loadingGif from '../../assets.spine/loading.gif';
import { withLoading } from '../../utils/loading';
import { 
    getGeneralManagerList, 
    addGeneralManagerByEmail, 
    deleteGeneralManager 
} from '../../api/manager/generalManager';

/**
 * 經理設定頁面
 * 只有系統管理員 Admin 和總經理 GeneralManager 可以訪問
 * 功能：管理總經理 GeneralManager 角色
 */
function ManagerSettingPage() {
    const [generalManagerList, setGeneralManagerList] = useState([]);
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // 初始載入總經理列表
    useEffect(() => {
        fetchGeneralManagerList();
    }, []);

    // 取得總經理列表
    const fetchGeneralManagerList = async () => {
        await withLoading(
            getGeneralManagerList(),
            {
                min: 0,
                timeout: 5000,
                onLoading: () => setIsLoading(true),
                onLoaded: () => setIsLoading(false),
                onTimeout: () => alert('網路不穩, 請重新載入')
            }
        ).then(res => {
            if (res.success && res.data) {
                setGeneralManagerList(res.data);
            }
        }).catch(e => {
            console.error('取得總經理列表失敗:', e);
            if (e.response?.data?.message) {
                alert(e.response.data.message);
            }
        });
    };

    // 新增總經理
    const handleAddGeneralManager = async (e) => {
        e.preventDefault();
        setError('');

        if (!email || !email.trim()) {
            setError('請輸入電子郵件');
            return;
        }

        /*
        // 簡單的 email 格式驗證
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('請輸入有效的電子郵件格式');
            return;
        }
        */

        await withLoading(
            addGeneralManagerByEmail(email),
            {
                min: 100,
                timeout: 5000,
                onLoading: () => setIsLoading(true),
                onLoaded: () => setIsLoading(false),
                onTimeout: () => alert('網路不穩, 請重試')
            }
        ).then(res => {
            alert('新增總經理成功');
            setEmail('');
            fetchGeneralManagerList();
        }).catch(e => {
            console.error('新增總經理失敗:', e);
            if (e.response?.data?.message) {
                setError(e.response.data.message);
            } else {
                setError('新增失敗，請稍後再試');
            }
        });
    };

    // 刪除總經理
    const handleDeleteGeneralManager = async (generalManager) => {
        if (!window.confirm(`確定要移除 ${generalManager.userEmail} 的總經理角色嗎？`)) {
            return;
        }

        await withLoading(
            deleteGeneralManager(generalManager.id),
            {
                min: 100,
                timeout: 5000,
                onLoading: () => setIsLoading(true),
                onLoaded: () => setIsLoading(false),
                onTimeout: () => alert('網路不穩, 請重試')
            }
        ).then(res => {
            alert('移除總經理成功');
            fetchGeneralManagerList();
        }).catch(e => {
            console.error('移除總經理失敗:', e);
            if (e.response?.data?.message) {
                alert(e.response.data.message);
            } else {
                alert('移除失敗，請稍後再試');
            }
        });
    };

    return (
        <div className={styles.managerSettingContainer}>
            <h2 className={styles.pageTitle}>經理設定</h2>

            {/* 新增總經理區塊 */}
            <div className={styles.addSection}>
                <h3 className={styles.sectionTitle}>新增總經理</h3>
                <form onSubmit={handleAddGeneralManager} className={styles.addForm}>
                    <div className={styles.formGroup}>
                        <label htmlFor="email" className={styles.label}>
                            電子郵件：
                        </label>
                        <input
                            type="input"
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
                            新增總經理
                        </button>
                    </div>
                    {error && <p className={styles.errorMessage}>{error}</p>}
                </form>
            </div>

            {/* 總經理列表區塊 */}
            <div className={styles.listSection}>
                <h3 className={styles.sectionTitle}>總經理列表</h3>
                
                {isLoading ? (
                    <div className={styles.loadingContainer}>
                        <img src={loadingGif} alt="Loading..." />
                    </div>
                ) : generalManagerList.length === 0 ? (
                    <div className={styles.emptyState}>
                        目前沒有總經理
                    </div>
                ) : (
                    <div className={styles.tableWrapper}>
                        <table className={styles.generalManagerTable}>
                            <thead>
                                <tr>
                                    <th>帳號名稱</th>
                                    <th>電子郵件</th>
                                    <th>角色</th>
                                    <th>操作</th>
                                </tr>
                            </thead>
                            <tbody>
                                {generalManagerList.map((manager) => (
                                    <tr key={manager.id}>
                                        <td>{manager.userAccount || '-'}</td>
                                        <td>{manager.userEmail}</td>
                                        <td>
                                            <span className={styles.roleBadge}>
                                                總經理
                                            </span>
                                        </td>
                                        <td>
                                            <button
                                                className={styles.deleteButton}
                                                onClick={() => handleDeleteGeneralManager(manager)}
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

export default ManagerSettingPage;
