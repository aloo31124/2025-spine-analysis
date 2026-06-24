import React, {useState, useEffect} from 'react';
import style from './Header.module.css';
import logo from '../../assets.spine/logo.png';
import { logout } from '../../api/auth';
import {useNavigate} from 'react-router-dom';
import { FaCog, FaUserTie } from 'react-icons/fa';
import { getStoreManagerList, checkCanViewStoreManagerList } from '../../api/manager/authPermission';
import { 
    getJwtToken, 
    getSelectedStoreManagerId, 
    setSelectedStoreManagerId, 
    clearUserData 
} from '../../utils/localStorage';

// 搜尋類別對應的導向列表頁
const SEARCH_TYPE_OPTIONS = [
    { value: 'customer', label: '客戶', path: '/manager/customer/list' },
    { value: 'pillow', label: '醫學枕', path: '/manager/product-pillow/list' },
    { value: 'mattress', label: '床墊', path: '/manager/product-mattress/list' },
];

function Header({ onToggleMenu }) {
    const navigate = useNavigate();
    const [hoveredMenu, setHoveredMenu] = useState(null); // 控制顯示選單
    const [searchType, setSearchType] = useState('customer'); // 搜尋類別: 客戶/醫學枕/床墊
    const [searchKeyword, setSearchKeyword] = useState(''); // 搜尋關鍵字
    const [isMobile, setIsMobile] = useState(window.innerWidth < 800); // 檢測是否為移動設備
    const [storeManagerList, setStoreManagerList] = useState([]); // 店長列表
    const [selectedStoreManager, setSelectedStoreManager] = useState(''); // 選中的店長
    const [showStoreManagerSelect, setShowStoreManagerSelect] = useState(false); // 是否顯示店長選單
    const [showStoreManagerMenu, setShowStoreManagerMenu] = useState(false); // 控制手機版店長選單顯示

    const handleMouseEnter = (menu) => setHoveredMenu(menu);
    const handleMouseLeave = () => setHoveredMenu(null);

    // 監聽螢幕尺寸變化
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 800);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // 載入店長列表 (僅總經理和系統管理員可用)
    useEffect(() => {
        const fetchStoreManagers = async () => {
            try {
                // 檢查是否有 JWT token，沒有則不執行（避免登出後重新觸發）
                const token = getJwtToken();
                if (!token) {
                    setShowStoreManagerSelect(false);
                    return;
                }

                // 先檢查使用者角色權限
                const hasPermission = await checkCanViewStoreManagerList();
                
                // 只有系統管理員(Admin)、總經理(GeneralManager)或區經理(DistrictManager)才能看到店長選單
                if (!hasPermission) {
                    setShowStoreManagerSelect(false);
                    return;
                }
                
                const response = await getStoreManagerList();
                if (response.success && response.data && response.data.length > 0) {
                    setStoreManagerList(response.data);
                    setShowStoreManagerSelect(true);
                    
                    // 優先使用 localStorage 中已選擇的店長
                    const savedManagerId = getSelectedStoreManagerId();
                    
                    if (savedManagerId) {
                        // 檢查已儲存的店長 ID 是否存在於列表中
                        const managerExists = response.data.some(m => m.userId === savedManagerId);
                        if (managerExists) {
                            setSelectedStoreManager(savedManagerId);
                        } else {
                            // 如果已儲存的店長不存在，使用第一個店長
                            const firstManager = response.data[0];
                            setSelectedStoreManager(firstManager.userId);
                            setSelectedStoreManagerId(firstManager.userId);
                        }
                    } else {
                        // 如果沒有儲存的店長，使用第一個店長
                        const firstManager = response.data[0];
                        setSelectedStoreManager(firstManager.userId);
                        setSelectedStoreManagerId(firstManager.userId);
                    }
                }
            } catch (error) {
                console.error('取得店長列表失敗:', error);
                // 如果是權限不符，不顯示店長選單
                setShowStoreManagerSelect(false);
            }
        };

        fetchStoreManagers();
    }, []);

    // 依選擇的類別導向對應列表頁, 並帶入搜尋關鍵字
    const handleSearch = () => {
        const option = SEARCH_TYPE_OPTIONS.find(o => o.value === searchType);
        if (!option) return;
        const keyword = searchKeyword.trim();
        const query = keyword ? `?keyword=${encodeURIComponent(keyword)}` : '';
        navigate(`${option.path}${query}`);
    };

    // Enter 鍵觸發搜尋
    const handleSearchKeyPress = (e) => {
        if (e.key === 'Enter') handleSearch();
    };

    const clickToManager = async () => {
        navigate('/manager/product/list');
    }

    const clickToAccount = async () => {
        navigate('/account/info');
    }

    const clickLogout = async () => {
        // 先清除店長相關的狀態
        setShowStoreManagerSelect(false);
        setShowStoreManagerMenu(false);
        setStoreManagerList([]);
        setSelectedStoreManager('');
        
        // 清除所有使用者相關的 localStorage 資料
        clearUserData();
        
        // 執行登出
        logout();
        
        // 顯示登出訊息
        alert('登出成功');
        
        // 導航到登入頁面
        navigate('/auth/login');
    }

    // 處理店長選擇變更
    const handleStoreManagerChange = (e) => {
        const selectedManagerId = e.target.value;
        setSelectedStoreManager(selectedManagerId);
        // 儲存到 localStorage 供其他頁面使用
        setSelectedStoreManagerId(selectedManagerId);
        // 提示使用者切換成功，建議刷新頁面
        if (window.confirm('已切換店長，是否重新載入頁面以更新資料？')) {
            window.location.reload();
        }
    };

    // 處理手機版店長選單項目點擊
    const handleStoreManagerMenuClick = (managerId) => {
        setSelectedStoreManager(managerId);
        setSelectedStoreManagerId(managerId);
        setShowStoreManagerMenu(false);
        // 提示使用者切換成功，建議刷新頁面
        if (window.confirm('已切換店長，是否重新載入頁面以更新資料？')) {
            window.location.reload();
        }
    };

    // 取得當前選中店長的名稱
    const getSelectedManagerName = () => {
        const manager = storeManagerList.find(m => m.userId === selectedStoreManager);
        return manager ? (manager.mail || manager.account || `店長${manager.userId}`) : '選擇店長';
    };

    return (
        <div className={style.headerContainer}>
            {/* 漢堡選單按鈕 */}
            <div className={style.hamburger} onClick={onToggleMenu}>
                <span></span>
                <span></span>
                <span></span>
            </div>
            
            <img className={style.headerLogo} 
                src={logo} 
            />

            <div className={style.headerSearchWrapper}>
                <select className={style.headerSearchType}
                    value={searchType}
                    onChange={e => setSearchType(e.target.value)}
                >
                    {SEARCH_TYPE_OPTIONS.map(o => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                </select>
                <input className={style.headerInputSearch}
                    type="text"
                    placeholder='輸入關鍵字搜尋'
                    value={searchKeyword}
                    onChange={e => setSearchKeyword(e.target.value)}
                    onKeyPress={handleSearchKeyPress}
                />
                <button className={style.headerSearchBtn} onClick={handleSearch}>
                    搜尋
                </button>
            </div>

            <div className={style.headerRightSection} >
                {/* 店長選單 (僅總經理和系統管理員可見) */}
                {showStoreManagerSelect && storeManagerList.length > 0 && (
                    <div className={style.storeManagerButtonWrapper}
                        onMouseEnter={() => !isMobile && setShowStoreManagerMenu(true)}
                        onMouseLeave={() => !isMobile && setShowStoreManagerMenu(false)}
                    >
                        {isMobile ? (
                            /* 手機版：顯示 icon 按鈕 */
                            <button 
                                className={`${style.headerButton} ${style.headerButtonMobile}`}
                                onClick={() => setShowStoreManagerMenu(!showStoreManagerMenu)}
                            >
                                <FaUserTie className={style.storeManagerIcon} />
                            </button>
                        ) : (
                            /* 桌面版：顯示文字和下拉選單 */
                            <div className={style.storeManagerSelectWrapper}>
                                <span className={style.storeManagerLabel}>店長列表：</span>
                                <select 
                                    className={style.storeManagerSelect}
                                    value={selectedStoreManager}
                                    onChange={handleStoreManagerChange}
                                >
                                    {storeManagerList.map(manager => (
                                        <option key={manager.userId} value={manager.userId}>
                                            {manager.mail || manager.account || `店長${manager.userId}`}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* 手機版店長選單 */}
                        {isMobile && showStoreManagerMenu && (
                            <div className={style.storeManagerMenu}>
                                <div className={style.storeManagerMenuTitle}>選擇店長</div>
                                {storeManagerList.map(manager => (
                                    <button
                                        key={manager.userId}
                                        className={`${style.storeManagerMenuItem} ${
                                            manager.userId === selectedStoreManager ? style.active : ''
                                        }`}
                                        onClick={() => handleStoreManagerMenuClick(manager.userId)}
                                    >
                                        {manager.mail || manager.account || `店長${manager.userId}`}
                                        {manager.userId === selectedStoreManager && (
                                            <span className={style.checkmark}>✓</span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* 動態選單 : 我的: 買家中心,賣家中心,登出 */}
                <div className={style.headerButtonWrapper}
                        onMouseEnter={() => handleMouseEnter("user")}
                        onMouseLeave={handleMouseLeave}
                    >
                    <button className={`${style.headerButton} ${isMobile ? style.headerButtonMobile : ''}`}>
                        {isMobile ? <FaCog className={style.settingsIcon} /> : '系統設定'}
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
