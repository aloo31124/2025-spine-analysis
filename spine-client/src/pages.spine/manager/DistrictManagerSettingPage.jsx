import React, { useState, useEffect } from 'react';
import styles from './DistrictManagerSettingPage.module.css';
import loadingGif from '../../assets.spine/loading.gif';
import { withLoading } from '../../utils/loading';
import { 
    getDistrictManagerList, 
    addDistrictManagerByEmail, 
    deleteDistrictManager 
} from '../../api/manager/districtManager';
import {
    getAllDistrictList,
    addDistrict,
    updateDistrict,
    deleteDistrict,
    getDistrictWithStoreManagers,
    bindStoreManagerToDistrict,
    unbindStoreManagerFromDistrict,
    bindDistrictManagerToDistrict,
    unbindDistrictManagerFromDistrict
} from '../../api/manager/district';
import { getStoreManagerList } from '../../api/manager/authPermission';

/**
 * 區經理設定頁面
 * 只有系統管理員 Admin 和總經理 GeneralManager 可以訪問
 * 功能：管理區經理 DistrictManager 角色和區域 District
 */
function DistrictManagerSettingPage() {
    const [districtManagerList, setDistrictManagerList] = useState([]);
    const [districtList, setDistrictList] = useState([]);
    const [storeManagerList, setStoreManagerList] = useState([]);
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    
    // 區域編輯相關狀態
    const [showDistrictModal, setShowDistrictModal] = useState(false);
    const [editingDistrict, setEditingDistrict] = useState(null);
    const [districtName, setDistrictName] = useState('');
    const [selectedStoreManagers, setSelectedStoreManagers] = useState([]);
    const [currentDistrictStoreManagers, setCurrentDistrictStoreManagers] = useState([]);

    // 初始載入資料
    useEffect(() => {
        fetchAllData();
    }, []);

    // 取得所有資料
    const fetchAllData = async () => {
        await Promise.all([
            fetchDistrictManagerList(),
            fetchDistrictList(),
            fetchStoreManagerList()
        ]);
    };

    // 取得區經理列表
    const fetchDistrictManagerList = async () => {
        await withLoading(
            getDistrictManagerList(),
            {
                min: 0,
                timeout: 5000,
                onLoading: () => setIsLoading(true),
                onLoaded: () => setIsLoading(false),
                onTimeout: () => alert('網路不穩, 請重新載入')
            }
        ).then(res => {
            if (res.success && res.data) {
                setDistrictManagerList(res.data);
            }
        }).catch(e => {
            console.error('取得區經理列表失敗:', e);
            if (e.response?.data?.message) {
                alert(e.response.data.message);
            }
        });
    };

    // 取得區域列表
    const fetchDistrictList = async () => {
        await withLoading(
            getAllDistrictList(),
            {
                min: 0,
                timeout: 5000,
                onLoading: () => setIsLoading(true),
                onLoaded: () => setIsLoading(false),
                onTimeout: () => alert('網路不穩, 請重新載入')
            }
        ).then(res => {
            if (res.success && res.data) {
                setDistrictList(res.data);
            }
        }).catch(e => {
            console.error('取得區域列表失敗:', e);
            if (e.response?.data?.message) {
                alert(e.response.data.message);
            }
        });
    };

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
            if (res.success && res.data) {
                setStoreManagerList(res.data);
            }
        }).catch(e => {
            console.error('取得店長列表失敗:', e);
        });
    };

    // 新增區經理
    const handleAddDistrictManager = async (e) => {
        e.preventDefault();
        setError('');

        if (!email || !email.trim()) {
            setError('請輸入電子郵件');
            return;
        }

        await withLoading(
            addDistrictManagerByEmail(email),
            {
                min: 100,
                timeout: 5000,
                onLoading: () => setIsLoading(true),
                onLoaded: () => setIsLoading(false),
                onTimeout: () => alert('網路不穩, 請重試')
            }
        ).then(res => {
            alert('新增區經理成功');
            setEmail('');
            fetchDistrictManagerList();
        }).catch(e => {
            console.error('新增區經理失敗:', e);
            if (e.response?.data?.message) {
                setError(e.response.data.message);
            } else {
                setError('新增失敗，請稍後再試');
            }
        });
    };

    // 刪除區經理
    const handleDeleteDistrictManager = async (districtManager) => {
        if (!window.confirm(`確定要移除 ${districtManager.userEmail} 的區經理角色嗎？`)) {
            return;
        }

        await withLoading(
            deleteDistrictManager(districtManager.id),
            {
                min: 100,
                timeout: 5000,
                onLoading: () => setIsLoading(true),
                onLoaded: () => setIsLoading(false),
                onTimeout: () => alert('網路不穩, 請重試')
            }
        ).then(res => {
            alert('移除區經理成功');
            fetchDistrictManagerList();
        }).catch(e => {
            console.error('移除區經理失敗:', e);
            if (e.response?.data?.message) {
                alert(e.response.data.message);
            } else {
                alert('移除失敗，請稍後再試');
            }
        });
    };

    // 開啟新增區域對話框
    const handleOpenAddDistrict = () => {
        setEditingDistrict(null);
        setDistrictName('');
        setSelectedStoreManagers([]);
        setCurrentDistrictStoreManagers([]);
        setShowDistrictModal(true);
    };

    // 開啟編輯區域對話框
    const handleOpenEditDistrict = async (district) => {
        setEditingDistrict(district);
        setDistrictName(district.name);
        
        // 取得該區域綁定的店長
        setIsLoading(true);
        try {
            const res = await getDistrictWithStoreManagers(district.id);
            if (res.success && res.data) {
                const boundStoreManagers = res.data.storeManagers || [];
                setCurrentDistrictStoreManagers(boundStoreManagers);
                setSelectedStoreManagers(boundStoreManagers.map(sm => sm.userId));
            }
        } catch (e) {
            console.error('取得區域店長失敗:', e);
        }
        setIsLoading(false);
        setShowDistrictModal(true);
    };

    // 儲存區域（新增或編輯）
    const handleSaveDistrict = async () => {
        if (!districtName.trim()) {
            alert('請輸入區域名稱');
            return;
        }

        setIsLoading(true);
        try {
            let districtId;
            
            // 新增或更新區域
            if (editingDistrict) {
                const res = await updateDistrict(editingDistrict.id, districtName);
                districtId = editingDistrict.id;
            } else {
                const res = await addDistrict(districtName);
                districtId = res.data.id;
            }

            // 更新店長綁定
            // 先移除不在選中列表的綁定
            for (const boundSM of currentDistrictStoreManagers) {
                if (!selectedStoreManagers.includes(boundSM.userId)) {
                    await unbindStoreManagerFromDistrict(boundSM.bindingId);
                }
            }

            // 新增新選中的綁定
            const currentBoundUserIds = currentDistrictStoreManagers.map(sm => sm.userId);
            for (const userId of selectedStoreManagers) {
                if (!currentBoundUserIds.includes(userId)) {
                    await bindStoreManagerToDistrict(districtId, userId);
                }
            }

            alert(editingDistrict ? '更新區域成功' : '新增區域成功');
            setShowDistrictModal(false);
            fetchDistrictList();
        } catch (e) {
            console.error('儲存區域失敗:', e);
            alert(e.response?.data?.message || '儲存失敗，請稍後再試');
        }
        setIsLoading(false);
    };

    // 刪除區域
    const handleDeleteDistrict = async (district) => {
        if (!window.confirm(`確定要刪除區域 "${district.name}" 嗎？這將同時刪除所有相關綁定。`)) {
            return;
        }

        await withLoading(
            deleteDistrict(district.id),
            {
                min: 100,
                timeout: 5000,
                onLoading: () => setIsLoading(true),
                onLoaded: () => setIsLoading(false),
                onTimeout: () => alert('網路不穩, 請重試')
            }
        ).then(res => {
            alert('刪除區域成功');
            fetchDistrictList();
        }).catch(e => {
            console.error('刪除區域失敗:', e);
            alert(e.response?.data?.message || '刪除失敗，請稍後再試');
        });
    };

    // 切換店長選擇
    const toggleStoreManager = (userId) => {
        if (selectedStoreManagers.includes(userId)) {
            setSelectedStoreManagers(selectedStoreManagers.filter(id => id !== userId));
        } else {
            setSelectedStoreManagers([...selectedStoreManagers, userId]);
        }
    };

    return (
        <div className={styles.container}>
            <h2 className={styles.pageTitle}>區經理設定</h2>

            {/* 區域管理區塊 */}
            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h3 className={styles.sectionTitle}>區域管理</h3>
                    <button 
                        onClick={handleOpenAddDistrict} 
                        className={styles.addButton}
                        disabled={isLoading}
                    >
                        新增區域
                    </button>
                </div>

                {isLoading ? (
                    <div className={styles.loadingContainer}>
                        <img src={loadingGif} alt="Loading..." />
                    </div>
                ) : districtList.length === 0 ? (
                    <div className={styles.emptyState}>目前沒有區域</div>
                ) : (
                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>區域名稱</th>
                                    <th>操作</th>
                                </tr>
                            </thead>
                            <tbody>
                                {districtList.map((district) => (
                                    <tr key={district.id}>
                                        <td>{district.name}</td>
                                        <td>
                                            <button
                                                className={styles.editButton}
                                                onClick={() => handleOpenEditDistrict(district)}
                                                disabled={isLoading}
                                            >
                                                編輯
                                            </button>
                                            <button
                                                className={styles.deleteButton}
                                                onClick={() => handleDeleteDistrict(district)}
                                                disabled={isLoading}
                                            >
                                                刪除
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* 區經理管理區塊 */}
            <div className={styles.section}>
                <h3 className={styles.sectionTitle}>新增區經理</h3>
                <form onSubmit={handleAddDistrictManager} className={styles.addForm}>
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
                            新增區經理
                        </button>
                    </div>
                    {error && <p className={styles.errorMessage}>{error}</p>}
                </form>
            </div>

            {/* 區經理列表區塊 */}
            <div className={styles.section}>
                <h3 className={styles.sectionTitle}>區經理列表</h3>
                
                {isLoading ? (
                    <div className={styles.loadingContainer}>
                        <img src={loadingGif} alt="Loading..." />
                    </div>
                ) : districtManagerList.length === 0 ? (
                    <div className={styles.emptyState}>目前沒有區經理</div>
                ) : (
                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>帳號名稱</th>
                                    <th>電子郵件</th>
                                    <th>角色</th>
                                    <th>操作</th>
                                </tr>
                            </thead>
                            <tbody>
                                {districtManagerList.map((manager) => (
                                    <tr key={manager.id}>
                                        <td>{manager.userAccount || '-'}</td>
                                        <td>{manager.userEmail}</td>
                                        <td>
                                            <span className={styles.roleBadge}>
                                                區經理
                                            </span>
                                        </td>
                                        <td>
                                            <button
                                                className={styles.deleteButton}
                                                onClick={() => handleDeleteDistrictManager(manager)}
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

            {/* 區域編輯對話框 */}
            {showDistrictModal && (
                <div className={styles.modalOverlay} onClick={() => setShowDistrictModal(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <h3 className={styles.modalTitle}>
                            {editingDistrict ? '編輯區域' : '新增區域'}
                        </h3>
                        
                        <div className={styles.modalContent}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>區域名稱：</label>
                                <input
                                    type="text"
                                    value={districtName}
                                    onChange={(e) => setDistrictName(e.target.value)}
                                    placeholder="例如：北區、中區、南區"
                                    className={styles.emailInput}
                                    disabled={isLoading}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>綁定店長：</label>
                                <div className={styles.checkboxGroup}>
                                    {storeManagerList.map((sm) => (
                                        <label key={sm.userId} className={styles.checkboxLabel}>
                                            <input
                                                type="checkbox"
                                                checked={selectedStoreManagers.includes(sm.userId)}
                                                onChange={() => toggleStoreManager(sm.userId)}
                                                disabled={isLoading}
                                            />
                                            <span>{sm.mail} ({sm.account || '無帳號'})</span>
                                        </label>
                                    ))}
                                    {storeManagerList.length === 0 && (
                                        <div className={styles.emptyState}>目前沒有店長可綁定</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className={styles.modalActions}>
                            <button 
                                onClick={handleSaveDistrict} 
                                className={styles.saveButton}
                                disabled={isLoading}
                            >
                                儲存
                            </button>
                            <button 
                                onClick={() => setShowDistrictModal(false)} 
                                className={styles.cancelButton}
                                disabled={isLoading}
                            >
                                取消
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DistrictManagerSettingPage;
