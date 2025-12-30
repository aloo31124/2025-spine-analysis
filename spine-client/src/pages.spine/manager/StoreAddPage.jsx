import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { addStore } from '../../api/manager/store';
import { getStoreManagerList } from '../../api/manager/role';
import styles from './StoreFormPage.module.css';

const REGIONS = ['北區', '中區', '南區', '東區', '離島區'];

function StoreAddPage() {
    const navigate = useNavigate();
    const [storeManagers, setStoreManagers] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        region: '',
        address: '',
        phone: '',
        storeManagerId: '',
        notes: ''
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 取得店長列表
    useEffect(() => {
        fetchStoreManagers();
    }, []);

    const fetchStoreManagers = async () => {
        try {
            const res = await getStoreManagerList();
            setStoreManagers(res.data.storeManagers || []);
        } catch (error) {
            console.error('取得店長列表發生錯誤', error);
        }
    };

    // 驗證表單
    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = '請輸入店面名稱';
        }

        if (!formData.region) {
            newErrors.region = '請選擇所屬區域';
        }

        if (!formData.address.trim()) {
            newErrors.address = '請輸入店面地址';
        }

        if (!formData.phone.trim()) {
            newErrors.phone = '請輸入店面電話';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // 處理輸入變更
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
        // 清除該欄位的錯誤訊息
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: ''
            });
        }
    };

    // 提交表單
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            const newStore = {
                ...formData,
                storeManagerId: formData.storeManagerId || null
            };

            const res = await addStore(newStore);
            
            if (res.status === 200) {
                alert('店面新增成功');
                navigate('/manager/store/list');
            } else {
                alert('店面新增失敗');
            }
        } catch (error) {
            console.error('新增店面錯誤:', error);
            alert('店面新增失敗：' + (error.response?.data?.error || error.message));
        } finally {
            setIsSubmitting(false);
        }
    };

    // 取消
    const handleCancel = () => {
        if (window.confirm('確定要取消新增？未保存的資料將會遺失。')) {
            navigate('/manager/store/list');
        }
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.pageHeader}>
                <h1>新增店面</h1>
            </div>

            <form onSubmit={handleSubmit} className={styles.formContainer}>
                <div className={styles.formSection}>
                    <h2>基本資訊</h2>
                    
                    <div className={styles.formGroup}>
                        <label className={styles.required}>店面名稱</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="請輸入店面名稱"
                            className={errors.name ? styles.inputError : ''}
                        />
                        {errors.name && <span className={styles.errorText}>{errors.name}</span>}
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.required}>所屬區域</label>
                        <select
                            name="region"
                            value={formData.region}
                            onChange={handleInputChange}
                            className={errors.region ? styles.inputError : ''}
                        >
                            <option value="">請選擇區域</option>
                            {REGIONS.map((region) => (
                                <option key={region} value={region}>
                                    {region}
                                </option>
                            ))}
                        </select>
                        {errors.region && <span className={styles.errorText}>{errors.region}</span>}
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.required}>店面地址</label>
                        <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            placeholder="請輸入店面地址"
                            className={errors.address ? styles.inputError : ''}
                        />
                        {errors.address && <span className={styles.errorText}>{errors.address}</span>}
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.required}>店面電話</label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="請輸入店面電話"
                            className={errors.phone ? styles.inputError : ''}
                        />
                        {errors.phone && <span className={styles.errorText}>{errors.phone}</span>}
                    </div>

                    <div className={styles.formGroup}>
                        <label>所屬店長</label>
                        <select
                            name="storeManagerId"
                            value={formData.storeManagerId}
                            onChange={handleInputChange}
                        >
                            <option value="">請選擇店長（可不選）</option>
                            {storeManagers.map((manager) => (
                                <option key={manager.userId} value={manager.userId}>
                                    {manager.userName}
                                </option>
                            ))}
                        </select>
                        <div className={styles.infoText}>
                            <p>• 一個店長可設定多個店面</p>
                            <p>• 一個店面最多只能設定一個店長</p>
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label>備註</label>
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleInputChange}
                            placeholder="請輸入備註資訊"
                            rows="4"
                        />
                    </div>
                </div>

                <div className={styles.formActions}>
                    <button
                        type="button"
                        className={styles.cancelBtn}
                        onClick={handleCancel}
                        disabled={isSubmitting}
                    >
                        取消
                    </button>
                    <button
                        type="submit"
                        className={styles.submitBtn}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? '儲存中...' : '儲存'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default StoreAddPage;
