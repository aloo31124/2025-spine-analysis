import React from 'react';
import styles from './Loading.module.css';

function Loading({ text = '載入中...' }) {
    return (
        <div className={styles.Overlay}>
            <div className={styles.Spinner}></div>
            {text && <p className={styles.Text}>{text}</p>}
        </div>
    )
}

export default Loading;
