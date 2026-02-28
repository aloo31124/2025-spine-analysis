import React from 'react';

/**
 * 分析結果儲存用的 Modal 群組
 * 包含「儲存方式選擇」和「客戶列表選擇」兩個 Modal
 */
function AnalysisModals({
    showSaveOptions, showCustomerModal, customerList,
    onBindCustomer, onCreateNew, onSelectCustomer, onClose
}) {
    return (
        <>
            {/* 保存選項對話框 */}
            {showSaveOptions && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>選擇保存方式</h3>
                        <div className="modal-buttons">
                            <button onClick={onBindCustomer} className="action-btn">
                                綁定客戶
                            </button>
                            <button onClick={onCreateNew} className="action-btn">
                                新建客戶
                            </button>
                            <button onClick={onClose} className="cancel-btn">
                                取消
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 客戶選擇對話框 */}
            {showCustomerModal && (
                <div className="modal-overlay">
                    <div className="modal-content customer-modal">
                        <h3>選擇客戶</h3>
                        <div className="customer-list">
                            {customerList.map(customer => (
                                <div
                                    key={customer.id}
                                    className="customer-item"
                                    onClick={() => onSelectCustomer(customer)}
                                >
                                    <div className="customer-info">
                                        <div className="customer-name">{customer.name}</div>
                                        <div className="customer-details">
                                            {customer.phone && <span>電話: {customer.phone}</span>}
                                            {customer.email && <span>信箱: {customer.email}</span>}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="modal-buttons">
                            <button onClick={onClose} className="cancel-btn">
                                取消
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default AnalysisModals;
