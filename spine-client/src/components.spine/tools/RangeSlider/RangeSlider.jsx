import React, { useEffect, useState } from "react";
import style from "./RangeSlider.module.css";

function RangeSlider({
    minDefault = 0, maxDefault = 200, minLimit = 0, maxLimit = 500
    , _setRange
}) {
    const [min, setMin] = useState(minDefault);
    const [max, setMax] = useState(maxDefault);
    const [range, setRange] = useState([min, max]);

    useEffect(() => {
        _setRange({
            min: range[0],
            max: range[1],
        });
    }, [range]);

    const handleMinChange = (e) => {
        const value = Math.min(Number(e.target.value), range[1] - 1);
        setMin(value);
        setRange([value, range[1]]);
    };

    const handleMaxChange = (e) => {
        const value = Math.max(Number(e.target.value), range[0] + 1);
        setMax(value);
        setRange([range[0], value]);
    };

    const handleRangeChange = (index, value) => {
        const newRange = [...range];
        newRange[index] = value;
        if (newRange[0] < newRange[1]) {
            setRange(newRange);
            setMin(newRange[0]);
            setMax(newRange[1]);
        }
    };

    return (
        <div className={style.rangeSlider}>
            {/* 直接輸入數值 */}
            <div className={style.inputGroup}>
                <input type="number" value={min} onChange={handleMinChange} />
                <span>~</span>
                <input type="number" value={max} onChange={handleMaxChange} />
            </div>

            {/* 滑動範圍選擇器 */}
            <div className={style.sliderContainer}>
                <input
                    type="range"
                    min={minLimit}
                    max={maxLimit}
                    value={range[0]}
                    onChange={(e) => handleRangeChange(0, Number(e.target.value))}
                />
                <input
                    type="range"
                    min={minLimit}
                    max={maxLimit}
                    value={range[1]}
                    onChange={(e) => handleRangeChange(1, Number(e.target.value))}
                />
            </div>
        </div>
    );
}

export default RangeSlider;
