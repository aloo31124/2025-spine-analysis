import React, { useState } from "react";
import style from "./ClockPicker.module.css";

function ClockPicker() {
    const [selectTime, setSelectTime] = useState({ hour: 9, minute: 30 });
    const [mode, setMode] = useState("hour"); // "hour" or "minute"

    const handleTimeSelect = (value) => {
        if (mode === "hour") {
            setSelectTime((prev) => ({ ...prev, hour: value }));
            setMode("minute"); // 選完小時後切換到分鐘
        } else {
            setSelectTime((prev) => ({ ...prev, minute: value }));
        }
    };

    const renderClockNumbers = () => {
        const numbers = mode === "hour" ? [...Array(12).keys()].map(i => i + 1) : [...Array(12).keys()].map(i => i * 5);
        return numbers.map((num, index) => {
            const angle = (index * 30) * (Math.PI / 180); // 12 格，30° 間距
            const x = 50 + 40 * Math.sin(angle);
            const y = 50 - 40 * Math.cos(angle);
            return (
                <div 
                    key={num} 
                    className={style.clockNumber}
                    style={{ left: `${x}%`, top: `${y}%` }}
                    onClick={() => handleTimeSelect(num)}
                >
                    {num}
                </div>
            );
        });
    };

    return (
        <div className={style.clockPicker}>
            {/* 時間選擇欄 */}
            <div className={style.timeBar}>
                <span 
                    className={mode === "hour" ? style.active : ""} 
                    onClick={() => setMode("hour")}
                >
                    {String(selectTime.hour).padStart(2, "0")}
                </span>
                :
                <span 
                    className={mode === "minute" ? style.active : ""} 
                    onClick={() => setMode("minute")}
                >
                    {String(selectTime.minute).padStart(2, "0")}
                </span>
            </div>

            {/* 圓形時鐘 */}
            <div className={style.clockFace}>
                <div className={style.clockCenter}></div>
                {renderClockNumbers()}
            </div>
        </div>
    );
}

export default ClockPicker;
