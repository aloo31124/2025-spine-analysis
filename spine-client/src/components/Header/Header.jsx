import React, {useState} from 'react';
import style from './Header.module.css';
import logo from '../../assets/logo.png';
import cart from '../../assets/icon/cart.svg';
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
    
    const clickSelectPayment = () => {
        navigate('/auth/pay/select');
        alert("購買商品");
    }

    return (
        <div className={style.headerContainer}>
            <img className={style.headerLogo} 
                src={logo} 
            />
            <input className={style.headerInputSearch}
                type="text" 
                placeholder='搜尋商品'
            />
            <div className={style.headerRightSection} >

                <button className={style.headerButton}>
                    拍賣
                </button>

                <button className={style.headerButton}>
                    募資
                </button>

                {/* 動態選單 : 我的: 買家中心,賣家中心,登出 */}
                <div className={style.headerButtonWrapper}
                        onMouseEnter={() => handleMouseEnter("user")}
                        onMouseLeave={handleMouseLeave}
                    >
                    <button className={style.headerButton}>
                        我的
                    </button>

                    {hoveredMenu === "user" && (
                        <div className={style.headerMenu}>
                            <button onClick={clickToAccount}>買家中心</button>
                            <button onClick={clickToManager}>賣家中心</button>
                            <button onClick={clickLogout}>登出</button>
                        </div>
                    )}
                </div>

                
                {/* 動態選單 : 購物車 */}
                <div className={style.headerButtonWrapper}
                    onMouseEnter={() => handleMouseEnter("cart")}
                    onMouseLeave={handleMouseLeave}
                >
                    <img className={style.headerIcon}
                        src={cart}
                    />

                    {hoveredMenu === "cart" && (
                        <div className={style.headerMenu}>
                            目前无购买商品
                            <button onClick={clickSelectPayment}>直接購買</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Header;
