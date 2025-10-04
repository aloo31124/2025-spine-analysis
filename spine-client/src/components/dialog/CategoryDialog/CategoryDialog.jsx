import React from "react";
import style from "./CategoryDialog.module.css";

function CategoryDialog({ isOpen, onClose, onSelect, categoryList }) {
    if (!isOpen) return null; // Dialog 關閉時不渲染

    return (
        <div className={style.mask} onClick={onClose}>
            <div className={style.dialog} onClick={(e) => e.stopPropagation()}>
                <h3>選擇分類</h3>
                <div className={style.list}>
                    {categoryList.map((category) => (
                        <div
                            key={category.id}
                            className={style.item}
                            onClick={() => {
                                onSelect(category.id);
                                onClose();
                            }}
                        >
                            {category.name}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default CategoryDialog;
