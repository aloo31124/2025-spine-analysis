import React, { useState } from "react";
import style from "./CalendarPicker.module.css";

const weekDays = ["日", "一", "二", "三", "四", "五", "六"];

function CalendarPicker({onSelectDate}) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectDate, setSelectDate] = useState(null);

    // 取得當月資訊
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth(); // 0-11
    const firstDay = new Date(year, month, 1).getDay(); // 當月 1 號是星期幾
    const daysInMonth = new Date(year, month + 1, 0).getDate(); // 當月總天數

    // 切換月份
    const changeMonth = (step) => {
        setCurrentDate(new Date(year, month + step, 1));
    };

    // 選擇日期
    const handleDateClick = (day) => {
        setSelectDate(new Date(year, month, day));
        onSelectDate(new Date(year, month, day));
    };

    return (
        <div className={style.calendarContainer}>
            {/* 標題區: 年份 & 月份切換 */}
            <div className={style.header}>
                <button onClick={() => changeMonth(-1)}>{"<"}</button>
                <span>{year} 年 {month + 1} 月</span>
                <button onClick={() => changeMonth(1)}>{">"}</button>
            </div>

            {/* 星期標題 */}
            <div className={style.weekDays}>
                {weekDays.map((day) => (
                    <div key={day} className={style.weekDay}>{day}</div>
                ))}
            </div>

            {/* 日期顯示 */}
            <div className={style.daysGrid}>
                {/* 補齊前面空格 */}
                {Array(firstDay).fill(null).map((_, index) => (
                    <div key={`empty-${index}`} className={style.emptyDay}></div>
                ))}
                {/* 當月日期 */}
                {Array.from({ length: daysInMonth }, (_, i) => {
                    const day = i + 1;
                    return (
                        <div 
                            key={day} 
                            className={`${style.day} ${selectDate?.getDate() === day ? style.selected : ""}`} 
                            onClick={() => handleDateClick(day)}
                        >
                            {day}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default CalendarPicker;
