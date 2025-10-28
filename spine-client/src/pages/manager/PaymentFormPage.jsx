import React, {useState, useEffect} from 'react';
import {useNavigate, useParams, useLocation} from 'react-router-dom';
import {addPayment, updatePayment, getPayment} from '../../api/manager/payment';
import style from './PaymentFormPage.module.css';

function PaymentFormPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const location = useLocation();
    const isEdit = Boolean(id);
    
    const [payment, setPayment] = useState({
        name: '',
        type: 'basic',
        cost: '',
        interval: 'monthly',
        desc: ''
    });
    
    const [costType, setCostType] = useState('paid'); // 'free' 或 'paid'
    
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 初始化數據
    useEffect(() => {
        if (isEdit) {
            // 編輯模式：從 location.state 或 API 獲取數據
            if (location.state?.payment) {
                const paymentData = location.state.payment;
                setPayment(paymentData);
                setCostType(paymentData.cost === 'free' ? 'free' : 'paid');
            } else {
                // 如果沒有從 location.state 獲取到數據，則從 API 獲取
                fetchPayment();
            }
        }
    }, [id, isEdit, location.state]);

    const fetchPayment = async () => {
        try {
            const res = await getPayment(id);
            if (res.data.result) {
                const paymentData = res.data.result;
                setPayment(paymentData);
                setCostType(paymentData.cost === 'free' ? 'free' : 'paid');
            }
        } catch (error) {
            console.error('獲取方案數據失敗:', error);
            alert('獲取方案數據失敗');
            navigate('/manager/payment/list');
        }
    };

    // 處理輸入變化
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setPayment(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // 處理費用類型變化
    const handleCostTypeChange = (e) => {
        const newCostType = e.target.value;
        setCostType(newCostType);
        
        if (newCostType === 'free') {
            setPayment(prev => ({
                ...prev,
                cost: 'free'
            }));
        } else {
            setPayment(prev => ({
                ...prev,
                cost: ''
            }));
        }
    };

    // 驗證表單
    const validateForm = () => {
        if (!payment.name.trim()) {
            alert('請輸入方案名稱');
            return false;
        }
        if (costType === 'paid' && (!payment.cost || payment.cost <= 0)) {
            alert('請輸入有效的費用');
            return false;
        }
        if (!payment.desc.trim()) {
            alert('請輸入方案描述');
            return false;
        }
        return true;
    };

    // 提交表單
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;
        
        setIsSubmitting(true);
        
        try {
            if (isEdit) {
                await updatePayment(payment);
                alert('更新方案成功！');
            } else {
                await addPayment(payment);
                alert('新增方案成功！');
            }
            navigate('/manager/payment/list');
        } catch (error) {
            console.error('提交失敗:', error);
            alert(isEdit ? '更新方案失敗' : '新增方案失敗');
        } finally {
            setIsSubmitting(false);
        }
    };

    // 取消操作
    const handleCancel = () => {
        navigate('/manager/payment/list');
    };

    return (
        <div className={style.PaymentFormPage}>
            <div className={style.FormContainer}>
                <h2 className={style.FormTitle}>
                    {isEdit ? '編輯方案' : '新增方案'}
                </h2>
                
                <form onSubmit={handleSubmit} className={style.PaymentForm}>
                    <div className={style.FormGroup}>
                        <label htmlFor="name" className={style.FormLabel}>
                            方案名稱 *
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={payment.name}
                            onChange={handleInputChange}
                            className={style.FormInput}
                            placeholder="請輸入方案名稱"
                            required
                        />
                    </div>

                    <div className={style.FormRow}>
                        <div className={style.FormGroup}>
                            <label htmlFor="type" className={style.FormLabel}>
                                方案類型 *
                            </label>
                            <select
                                id="type"
                                name="type"
                                value={payment.type}
                                onChange={handleInputChange}
                                className={style.FormSelect}
                                required
                            >
                                <option value="basic">基本版</option>
                                <option value="premium">進階版</option>
                                <option value="enterprise">企業版</option>
                            </select>
                        </div>

                        <div className={style.FormGroup}>
                            <label htmlFor="interval" className={style.FormLabel}>
                                計費週期 *
                            </label>
                            <select
                                id="interval"
                                name="interval"
                                value={payment.interval}
                                onChange={handleInputChange}
                                className={style.FormSelect}
                                required
                            >
                                <option value="monthly">月繳</option>
                                <option value="quarterly">季繳</option>
                                <option value="yearly">年繳</option>
                            </select>
                        </div>
                    </div>

                    <div className={style.FormGroup}>
                        <label className={style.FormLabel}>
                            費用類型 *
                        </label>
                        <div className={style.RadioGroup}>
                            <label className={style.RadioLabel}>
                                <input
                                    type="radio"
                                    name="costType"
                                    value="free"
                                    checked={costType === 'free'}
                                    onChange={handleCostTypeChange}
                                    className={style.RadioInput}
                                />
                                免費方案
                            </label>
                            <label className={style.RadioLabel}>
                                <input
                                    type="radio"
                                    name="costType"
                                    value="paid"
                                    checked={costType === 'paid'}
                                    onChange={handleCostTypeChange}
                                    className={style.RadioInput}
                                />
                                付費方案
                            </label>
                        </div>
                    </div>

                    {costType === 'paid' && (
                        <div className={style.FormGroup}>
                            <label htmlFor="cost" className={style.FormLabel}>
                                方案費用 (NT$) *
                            </label>
                            <input
                                type="number"
                                id="cost"
                                name="cost"
                                value={payment.cost}
                                onChange={handleInputChange}
                                className={style.FormInput}
                                placeholder="請輸入方案費用"
                                min="1"
                                required
                            />
                        </div>
                    )}

                    <div className={style.FormGroup}>
                        <label htmlFor="desc" className={style.FormLabel}>
                            方案描述 *
                        </label>
                        <textarea
                            id="desc"
                            name="desc"
                            value={payment.desc}
                            onChange={handleInputChange}
                            className={style.FormTextarea}
                            placeholder="請輸入方案詳細描述"
                            rows="4"
                            required
                        />
                    </div>

                    <div className={style.FormActions}>
                        <button
                            type="button"
                            onClick={handleCancel}
                            className={style.CancelButton}
                            disabled={isSubmitting}
                        >
                            取消
                        </button>
                        <button
                            type="submit"
                            className={style.SubmitButton}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? '處理中...' : (isEdit ? '更新方案' : '新增方案')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default PaymentFormPage;