import React, {useState} from "react";
import style from './SocialIconBar.module.css';
import fb from '../../../assets/icon/fb.svg';
import message from '../../../assets/icon/message.svg';
import phone from '../../../assets/icon/phone.svg';

function SocialIconBar() {
    return (
        <div className={style.socialIconBar}>
            <img className={style.socialIcon} src={fb} />
            <img className={style.socialIcon} src={message} />
            <img className={style.socialIcon} src={phone} />
        </div>
    )
}

export default SocialIconBar;
