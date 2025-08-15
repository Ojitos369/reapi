import { useState, useEffect, useRef } from 'react';
import style from './styles/index.module.scss';

export const Test = () => {
    return (
        <div>
            <h1 className={`${style.h1Component}`}>Test Component</h1>
        </div>
    );
};