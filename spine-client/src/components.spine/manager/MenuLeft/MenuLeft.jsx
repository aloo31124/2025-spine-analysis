import React, {useState, useEffect} from "react";
import style from './MenuLeft.module.css'
import { useNavigate } from 'react-router-dom';


function MenuLeft({ isOpen, isHidden, onClose }) {
    const navigate = useNavigate();
    
    // 處理點擊外部區域關閉選單
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (window.innerWidth <= 800 && isOpen) {
                const menuLeft = e.target.closest(`.${style.MenuLeft}`);
                const hamburger = e.target.closest('[class*="hamburger"]');
                
                if (!menuLeft && !hamburger) {
                    onClose();
                }
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [isOpen, onClose]);

    return (
        <>
            {/* 遮罩層 (僅手機版使用) */}
            <div 
                className={`${style.overlay} ${isOpen ? style.active : ''}`}
                onClick={onClose}
            ></div>
            
            <div className={`${style.MenuLeft} ${isOpen ? style.open : ''} ${isHidden ? style.hidden : ''}`}>
                <h3 className={style.MenuTitle}>📋 脊椎分析系統</h3>
                <button className={style.MenuLeftButton}
                    onClick={e => navigate('/manager/analysis/spine') }
                >
                    頸部分析
                </button>
                {/*
                <button className={style.MenuLeftButton}
                    onClick={e => navigate('/manager/analysis/spine/test') }
                >
                    頸部分析(測試版)
                </button>
                 */}
                <button className={style.MenuLeftButton} onClick={e => alert('功能開發中')}>
                    客戶管理
                </button>
                <button className={style.MenuLeftButton}
                    onClick={e => navigate('/manager/product/list') }
                >
                    頸枕管理
                </button>
                <button className={style.MenuLeftButton}
                    onClick={e => navigate('/manager/system') }
                >
                    系統管理
                </button>
            </div>
        </>
    )
}

export default MenuLeft;
