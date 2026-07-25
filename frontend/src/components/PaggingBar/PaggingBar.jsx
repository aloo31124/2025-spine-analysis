import React, {useState} from "react";
import style from "./PaggingBar.module.css";
import leftIcon from "../../assets/icon/left.svg";
import rightIcon from "../../assets/icon/right.svg";

function PaggingBar() {
    return (
        <div className={style.PaggingBar}>
            <img src={leftIcon} />
            <button>1</button>
            <button>2</button>
            <button>3</button>
            ...
            <button>9</button>
            <button>10</button>
            <img src={rightIcon} />
        </div>
    );
}

export default PaggingBar;
