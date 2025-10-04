import React from "react";
import { useDropzone } from "react-dropzone";
import style from "./DropzoneDialog.module.css";

function DropzoneDialog({ onClose, files, onDrop, onUpload }) {
    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        accept: "image/*,video/*,.doc,.docx,.pdf,.csv",
        multiple: true
    });

    return (
        <div className={style.dialog}>
            {/* 遮罩層，點擊關閉 */}
            <div className={style.overlay} onClick={onClose}></div>

            <div className={style.dialogContent}>
                <h3>拖曳檔案至此，或點擊選擇檔案</h3>
                <div {...getRootProps()} className={style.dropzone}>
                    <input {...getInputProps()} />
                    <p>拖曳檔案到這裡，或點擊選擇檔案</p>
                </div>

                {/* 顯示選擇的檔案 */}
                <ul className={style.fileList}>
                    {files.map((file, index) => (
                        <li key={index}>{file.name}</li>
                    ))}
                </ul>

                <div className={style.dialogFooter}>
                    <button onClick={onClose}>取消</button>
                    <button onClick={onUpload} disabled={files.length === 0}>送出</button>
                </div>
            </div>
        </div>
    );
}

export default DropzoneDialog;
