import React, {useState} from 'react';
import style from './Header.module.css';
import logo from '../../assets.spine/logo.png';
import { logout } from '../../api/auth';
import {useNavigate} from 'react-router-dom';

function Header() {
    const navigate = useNavigate();
    const [hoveredMenu, setHoveredMenu] = useState(null); // 控制顯示選單

    const handleMouseEnter = (menu) => setHoveredMenu(menu);
    const handleMouseLeave = () => setHoveredMenu(null);

    const clickToManager = async () => {
        navigate('/manager/product/list');
    }

    const clickToAccount = async () => {
        navigate('/account/info');
    }

    const clickLogout = async () => {
        logout();
        navigate('/auth/login');
        alert('登出成功');
    }

    return (
        <div className={style.headerContainer}>
            <img className={style.headerLogo} 
                src={logo} 
            />
            <input className={style.headerInputSearch}
                type="text" 
                placeholder='客戶,頸枕搜尋'
            />
            <div className={style.headerRightSection} >

                {/* 動態選單 : 我的: 買家中心,賣家中心,登出 */}
                <div className={style.headerButtonWrapper}
                        onMouseEnter={() => handleMouseEnter("user")}
                        onMouseLeave={handleMouseLeave}
                    >
                    <button className={style.headerButton}>
                        系統設定
                    </button>

                    {hoveredMenu === "user" && (
                        <div className={style.headerMenu}>
                            <button onClick={clickToAccount}>帳號管理</button>
                            <button onClick={clickToManager}>管理頁面</button>
                            <button onClick={clickLogout}>登出</button>
                        </div>
                    )}
                </div>

                
            </div>
        </div>
    )
}

export default Header;
