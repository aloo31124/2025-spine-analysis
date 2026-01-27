import React, { useEffect, useState } from 'react';
import { getOperatorList, addOperatorByEmail, deleteOperator } from '../../api/manager/storeManagerToOperator';
import { withLoading } from '../../utils/loading';
import loadingGif from '../../assets/loading.gif';
import styles from './RoleManagementPage.module.css';

/**
 * 操作員設定頁面
 * 只有店長 StoreManager 可以訪問
 * 功能：管理操作員 Operator 角色
 */
function OperatorManagementPage() {
    const [operatorList, setOperatorList] = useState([]);
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // 初始載入操作員列表
    useEffect(() => {
        fetchOperatorList();
    }, []);

    // 取得操作員列表
    const fetchOperatorList = async () => {
        await withLoading(
            getOperatorList(),
            {
                min: 0,
                timeout: 5000,
                onLoading: () => setIsLoading(true),
                onLoaded: () => setIsLoading(false),
                onTimeout: () => alert('網路不穩, 請重新載入')
            }
        ).then(res => {
            setOperatorList(res.data.operatorList || []);
        }).catch(e => {
            if (e.message !== 'timeout') {
                console.log('取得操作員列表發生錯誤', e);
                alert('取得操作員列表失敗');
            }
        });
    };

    // 新增操作員
    const handleAddOperator = async (e) => {
        e.preventDefault();
        setError('');

        if (!email || !email.trim()) {
            setError('請輸入電子郵件');
            return;
        }

        /* 暫時移除檢查
        // 簡單的 email 格式驗證
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('請輸入有效的電子郵件格式');
            return;
        }
        */

        await withLoading(
            addOperatorByEmail(email),
            {
                min: 100,
                timeout: 5000,
                onLoading: () => setIsLoading(true),
                onLoaded: () => setIsLoading(false),
                onTimeout: () => alert('網路不穩, 請重試')
            }
        ).then(res => {
            alert('操作員新增成功');
            setEmail('');
            fetchOperatorList(); // 重新載入列表
        }).catch(e => {
            if (e.message !== 'timeout') {
                const errorMsg = e.response?.data?.error || '新增操作員失敗';
                setError(errorMsg);
                alert(errorMsg);
            }
        });
    };

    // 刪除操作員
    const handleDeleteOperator = async (operator) => {
        if (!window.confirm(`確定要移除 ${operator.userEmail} 的操作員角色嗎？`)) {
            return;
        }

        await withLoading(
            deleteOperator(operator.id),
            {
                min: 100,
                timeout: 5000,
                onLoading: () => setIsLoading(true),
                onLoaded: () => setIsLoading(false),
                onTimeout: () => alert('網路不穩, 請重試')
            }
        ).then(res => {
            alert('操作員移除成功');
            fetchOperatorList(); // 重新載入列表
        }).catch(e => {
            if (e.message !== 'timeout') {
                console.log('刪除操作員發生錯誤', e);
                alert('刪除操作員失敗');
            }
        });
    };

    return (
        <div className={styles.roleManagementContainer}>
            <h2 className={styles.pageTitle}>操作員設定</h2>

            {/* 新增操作員表單 */}
            <div className={styles.addSection}>
                <h3 className={styles.sectionTitle}>新增操作員</h3>
                <form onSubmit={handleAddOperator} className={styles.addForm}>
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
                            新增操作員
                        </button>
                    </div>
                    {error && <p className={styles.errorMessage}>{error}</p>}
                </form>
            </div>

            {/* 操作員列表 */}
            <div className={styles.listSection}>
                <h3 className={styles.sectionTitle}>操作員列表</h3>
                
                {isLoading ? (
                    <div className={styles.loadingContainer}>
                        <img src={loadingGif} alt="Loading..." />
                    </div>
                ) : operatorList.length === 0 ? (
                    <div className={styles.emptyState}>
                        目前沒有操作員
                    </div>
                ) : (
                    <div className={styles.tableWrapper}>
                        <table className={styles.storeManagerTable}>
                            <thead>
                                <tr>
                                    <th>帳號名稱</th>
                                    <th>電子郵件</th>
                                    <th>綁定店長</th>
                                    <th>操作員ID</th>
                                    <th>操作</th>
                                </tr>
                            </thead>
                            <tbody>
                                {operatorList.map((operator) => (
                                    <tr key={operator.id}>
                                        <td>{operator.userAccount || '-'}</td>
                                        <td>{operator.userEmail}</td>
                                        <td>
                                            <span title={operator.boundStoreManagerEmail || ''}>
                                                {operator.boundStoreManagerName || '-'}
                                            </span>
                                        </td>
                                        <td>{operator.userId}</td>
                                        <td>
                                            <button
                                                className={styles.deleteButton}
                                                onClick={() => handleDeleteOperator(operator)}
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

            {/* 說明區 */}
            <div className={styles.bindingSection}>
                <div className={styles.bindingInfo}>
                    <h3 className={styles.sectionTitle}>操作員權限說明</h3>
                    <p>• 操作員只能新增、修改、刪除商品</p>
                    <p>• 操作員無法檢視營收與庫存</p>
                    <p>• 操作員可以訪問：拍照上傳、頸部分析、尾椎分析、客戶管理、枕頭商品、床墊管理</p>
                    <p>• 操作員新增的商品會綁定到店長帳號</p>
                </div>
            </div>
        </div>
    );
}

export default OperatorManagementPage;
