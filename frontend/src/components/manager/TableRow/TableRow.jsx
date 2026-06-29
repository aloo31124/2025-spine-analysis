import React, {useState} from "react";
import style from './TableRow.module.css'

function TableRow({ obj, onEdit, onDelete }) {
    // 遍歷 obj對象，動態生成欄位
    const renderFields = () => {
        return Object.entries(obj).map(([key, value]) => {
            if (key === 'id') return null; // 忽略id
            return (
                <div key={key} className={style.field}>
                    {value}
                </div>
            );
        });
    };
    return (
        <div className={style.TableRow}>
            {renderFields()}
            {onEdit && <button onClick={() => onEdit(obj)}>編輯</button>}
            {onDelete && <button onClick={() => onDelete(obj.id)}>刪除</button>}
        </div>
    )
}

export default TableRow;
